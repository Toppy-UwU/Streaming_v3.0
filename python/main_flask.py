from functools import wraps
import io
import random
import secrets
import shutil
import string
from flask import Flask, json, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from ffmpeg_streaming import Formats
from PIL import Image
import ffmpeg_streaming
import jwt
from jwt.exceptions import ExpiredSignatureError, DecodeError
from datetime import datetime, timedelta
import base64
import cv2
import threading
import subprocess
import bcrypt
import psutil
from psutil import net_io_counters
import os
import time
import sys
import glob
from conn import create_conn


KB = float(1024)
MB = float(KB**2)  # 1,048,576
GB = float(KB**3)  # 1,073,741,824
TB = float(KB**4)  # 1,099,511,627,776

server_ip = os.getenv("SERVER_IP", "localhost")

ipf = 'http://' + server_ip + ':8900' #flask
ipw = 'http://' + server_ip + ':80' #web


def size(B):
    B = float(B)
    if B < KB:
        return f"{B} Bytes"
    elif KB <= B < MB:
        return f"{B/KB:.2f} KB"
    elif MB <= B < GB:
        return f"{B/MB:.2f} MB"
    elif GB <= B < TB:
        return f"{B/GB:.2f} GB"
    elif TB <= B:
        return f"{B/TB:.2f} TB"


last_upload, last_download, upload_speed, down_speed = 0, 0, 0, 0


def update_network_stats():
    global last_upload, last_download, upload_speed, down_speed
    counter = net_io_counters()

    upload = counter.bytes_sent
    download = counter.bytes_recv
    total = upload + download

    if last_upload > 0:
        if upload < last_upload:
            upload_speed = 0
        else:
            upload_speed = upload - last_upload

    if last_download > 0:
        if download < last_download:
            down_speed = 0
        else:
            down_speed = download - last_download

    last_upload = upload
    last_download = download

    return (
        size(upload),
        size(download),
        size(total),
        size(upload_speed),
        size(down_speed),
    )


def create_app(test_config=None):
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "Hgdb5eJeRbldC/wVIU1ee/NvnY8WaMGajNOBXGtuM0KfM6kzvFB84mDNnCY/tJcQ" #change on product for jwt

    CORS(app)
    app.config["CORS_ORIGINS"] = [server_ip]
    app.config["CORS_METHODS"] = ["GET", "POST", "OPTIONS"]
    app.config["CORS_HEADERS"] = ["Content-Type"]

    # function section
    # use to gen new video name for store in db
    def genFileName(name):
        ran_text = os.urandom(8).hex()
        name += ran_text
        random.seed(name)
        characters = string.ascii_letters + string.digits
        new_name = "".join(random.choices(characters, k=12))
        encode = new_name
        return encode

    def monitor(ffmpeg, duration, time_, time_left, process, encode):
        last_per = -1

        per = int(round(time_ / duration * 100))
        if per % 10 == 0 and per != 0 and per != last_per:
            updateVidData(per, encode)
            last_per = per

    def updateVidData(per, encode):
        if type(per) == int:
            per = str(per) + "%"

        conn = create_conn()

        cursor = conn.cursor()
        cursor.execute(
            "UPDATE videos SET V_permit=%s WHERE V_encode = %s", (per, encode)
        )
        conn.commit()
        cursor.close()
        conn.close()

    def insertVidData(data):
        try:
            path = "../upload/" + data.get("path") + "/" + data.get("encode")
            conn = create_conn()

            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO videos (V_title, V_view, V_length, V_size, V_pic, U_id, V_permit, V_encode, V_quality, V_desc) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (
                    data.get("videoName"),
                    0,
                    data.get("videoDuration"),
                    data.get("videoSize"),
                    data.get("videoThumbnail"),
                    data.get("videoOwner"),
                    "0%",
                    data.get("encode"),
                    data.get("height"),
                    data.get("videoDesc"),
                ),
            )

            if data.get("tags") is not None:
                for tag in data.get("tags"):
                    cursor.execute(
                        "INSERT INTO tag_video (V_ID, T_ID) VALUES ((SELECT V_ID FROM videos WHERE V_encode = %s ), %s) ",
                        (data.get("encode"), tag["T_ID"]),
                    )

            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            print("error:", e)
            shutil.rmtree(path)

    def convert(path, vidData):
        # print(vidData.get('height'))
        try:
            print("convert" + path)

            if (
                vidData.get("videoThumbnail") == ""
                or vidData.get("videoThumbnail") == None
            ):
                b64 = getThumbnail(path)
                vidData["videoThumbnail"] = b64
            
            video = ffmpeg_streaming.input(path)
            # print(video)

            insertVidData(vidData)

            hls = video.hls(Formats.h264())
            hls.encryption(
                "../upload/" + vidData['path'] + "/" + vidData["encode"] + '/' + vidData["encode"] + ".bin",
                ipf + "/hls/key/" + vidData["path"] + "/" + vidData["encode"],
            )  # encrypt key maybe can change into api
            hls.auto_generate_representations()
            hls.output(
                "../upload/"
                + vidData.get("path")
                + "/"
                + vidData.get("encode")
                + "/"
                + vidData.get("encode")
                + ".m3u8",
                monitor=lambda ffmpeg, duration, time_, time_left, process: monitor(
                    ffmpeg, duration, time_, time_left, process, vidData["encode"]
                ),
            )
            updateVidData(vidData["videoPermit"], vidData["encode"])
            os.remove(path)


            folder_name = vidData.get("path")
            folder_path = "../upload/" + folder_name
            size = 0

            for path, dirs, files in os.walk(folder_path):
                for f in files:
                    fp = os.path.join(path, f)
                    size += os.path.getsize(fp)

            size = round(size / (1048576))  # bytes to mb

            conn = create_conn()
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE users SET U_storage = %s, U_update = %s WHERE U_folder = %s", (size, 1, vidData.get("path"))
            )
            conn.commit()
            cursor.close()
            conn.close()


        except Exception as e:
            try:
                os.remove(path)
                conn = create_conn()
                cursor = conn.cursor()
                
                cursor.execute("DELETE FROM videos WHERE V_encode = %s", (vidData["encode"],))
                
                conn.commit()
                cursor.close()
                conn.close()    
            except:
                pass
            pass

    def getThumbnail(path):
        video = cv2.VideoCapture(path)
        frame_count = int(video.get(cv2.CAP_PROP_FRAME_COUNT))

        video.set(cv2.CAP_PROP_POS_FRAMES, int(frame_count * 0.3))
        flag, frame = video.read()
        video.release()

        re_frame = cv2.resize(frame, (1280, 720))
        flag, img = cv2.imencode(".jpg", re_frame)
        b64_img = base64.b64encode(img.tobytes())
        return b64_img

    def verify(raw_token):
        if raw_token is None or not raw_token.startswith("Bearer "):
            # invalid token
            return False

        token = raw_token.split(" ")[-1]
        try:
            payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])

            return True
        except jwt.ExpiredSignatureError:
            # return jsonify({'message': 'Token has expired'}), 401
            return False
        except jwt.InvalidTokenError:
            # return jsonify({'message': 'Invalid token'}), 401
            return False

    def imgResize(file, w, h):
        # pro 400x400
        # banner 820x312
        img = Image.open(file)
        img_resize = img.resize((w, h))
        img_resize = img_resize.convert("RGB")

        buffer = io.BytesIO()
        img_resize.save(buffer, format="JPEG")
        b64 = base64.b64encode(buffer.getvalue())
        # clear buffer
        buffer.seek(0)
        buffer.truncate()
        return b64

    def token_required(f):
        @wraps(f)
        def jwt_decode(*args, **kwargs):
            tmp = request.headers.get("Authorization")
            token = tmp.split(" ")

            if not tmp:
                # print("Token is missing")
                return jsonify({"message": "Token is missing"}), 401

            try:
                # Verify and decode the token
                # print("working...")
                payload = jwt.decode(
                    token[-1], app.config["SECRET_KEY"], algorithms=["HS256"]
                )
                # print("yes")
            except ExpiredSignatureError:
                # print("Token has expired")
                return jsonify({"message": "Token has expired"}), 401
            except DecodeError:
                # print("Token is invalid")
                return jsonify({"message": "Token is invalid"}), 401

            return f(*args, **kwargs)

        return jwt_decode

    # api section

#--------------------- UTILITIES --------------------------#

    @app.route("/")
    def welcome():
        return "hello this is flask python"

    @app.route("/register", methods=["POST"])
    def register():
        try:
            # Get the data from the request
            data = request.get_json()
            # create connection
            conn = create_conn()

            username = data.get("username")
            email = data.get("email")
            password = data.get("password")

            encode_password = str(password).encode("utf-8")
            hashed_password = bcrypt.hashpw(encode_password, bcrypt.gensalt())
            file_name = genFileName(username)

            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (U_name, U_mail, U_pass, U_type, U_vid, U_permit, U_folder) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (username, email, hashed_password, "user", 0, 1, file_name),
            )
            conn.commit()
            cursor.close()
            conn.close()

            folder_path = "../upload/" + file_name  # create folder for uploaded videos
            os.makedirs(folder_path)
            return ({"status": "success", "data": {}}), 200
        except Exception as e:
            print(e)
            return ({"message": "error"}), 400

    @app.route("/login", methods=["POST"])
    def login():
        try:
            data = request.get_json()

            conn = create_conn()

            email = data.get("email")
            plain_password = data.get("password")
            check = data.get("check")

            # get password
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE U_mail=%s", (email,))
            # print('select success')
            data = cursor.fetchone()
            # print('get hashed')

            # print(hashed_password)
            if data is not None:
                hashed_password = data[3]

                if bcrypt.checkpw(
                    plain_password.encode("utf-8"), hashed_password.encode("utf-8")
                ):
                    conn.commit()
                    cursor.close()
                    conn.close()

                    if check == 1 or check == "1":
                        
                        payload = {
                            "U_id": data[0],
                            "U_type": data[4],
                            "U_permit": data[8],
                            "exp": datetime.utcnow() + timedelta(days=30),
                        }
                    else:
                        
                        payload = {
                            "U_id": data[0],
                            "U_type": data[4],
                            "U_permit": data[8],
                            "exp": datetime.utcnow() + timedelta(days=1),
                        }

                    token = jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")
                    tmp = str(data[6])
                    return (
                        {
                            "status": "success",
                            "token": token,
                            "data": {
                                "U_id": data[0],
                                "username": data[1],
                                "email": data[2],
                                "U_type": data[4],
                                "vid": data[5],
                                "U_pro_pic": tmp[2:-1],
                                "U_permit": data[8],
                                "U_folder": data[9],
                                "U_storage": data[11]
                            },
                        }
                    ), 200
                else:
                    # print('not correct')
                    conn.commit()
                    cursor.close()
                    conn.close()
                    return ({"status": "fail", "data": {}}), 200
            else:
                return ({"message": "no user"}), 400
        except:
            return ({"message": "query fail"}), 500

    @app.route("/get/mostWatch", methods=["GET"])
    def mostWatch():
        try:
            u = request.args.get("u")
            conn = create_conn()

            cursor = conn.cursor()
            cursor.execute(
                "SELECT v.*, u.U_name, u.U_folder \
                FROM histories as h \
                JOIN videos as v ON v.V_ID = h.V_ID \
                JOIN users as u ON u.U_ID = V.U_ID \
                WHERE h.U_ID = %s \
                GROUP BY h.V_ID \
                ORDER BY COUNT(h.V_ID) \
                DESC LIMIT 10",
                (u,),
            )
            datas = cursor.fetchall()
            conn.commit()
            cursor.close()
            conn.close()

            videos = []
            for data in datas:
                tmp = str(data[6])
                video = {
                        "V_ID": data[0],
                        "V_title": data[1],
                        "V_view": data[2],
                        "V_length": data[3],
                        "V_size": data[4],
                        "V_upload": data[5],
                        "V_pic": tmp[2:-1],
                        "U_ID": data[7],
                        "V_encode": data[9],
                        "V_quality": data[10],
                        "V_desc": data[11],
                        "U_name": data[12],
                        "U_folder": data[13],
                    }
                videos.append(video)

            return jsonify(videos), 200
        except:
            return ({"message": "query fail"}), 500

    @app.route("/get/mostView", methods=["GET"])
    def mostView():
        try:
            u = request.args.get("u")
            conn = create_conn()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT v.*, u.U_name, u.U_folder \
                FROM videos as v \
                JOIN users as u ON u.U_ID = v.U_ID \
                WHERE v.U_ID = %s \
                ORDER BY v.V_view DESC LIMIT 10",
                (u,),
            )
            datas = cursor.fetchall()
            conn.commit()
            cursor.close()
            conn.close()

            videos = []
            for data in datas:
                tmp = str(data[6])
                video = {
                        "V_ID": data[0],
                        "V_title": data[1],
                        "V_view": data[2],
                        "V_length": data[3],
                        "V_size": data[4],
                        "V_upload": data[5],
                        "V_pic": tmp[2:-1],
                        "U_ID": data[7],
                        "V_encode": data[9],
                        "V_quality": data[10],
                        "V_desc": data[11],
                        "U_name": data[12],
                        "U_folder": data[13],
                    }
                videos.append(video)

            return jsonify(videos), 200
        except:
            return ({"message": "query fail"}), 500

    @app.route("/verify", methods=["POST"])
    def verify_token():
        raw_token = request.headers.get("Authorization")

        if raw_token is None or not raw_token.startswith("Bearer "):
            return "Invalid token", 401

        token = raw_token.split(" ")[-1]
        try:
            payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])

            # Additional verification or processing can be done here
            return jsonify(payload), 200
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

    @app.route("/upload", methods=["POST"])
    def upload():
        try:
            token = request.headers.get("Authorization")

            if verify(token):
                tmp = token.split(" ")[-1]
                payload = jwt.decode(tmp, app.config["SECRET_KEY"], algorithms=["HS256"])

                conn = create_conn()
                cursor = conn.cursor()
                cursor.execute("SELECT U_permit FROM users WHERE U_ID = %s",
                               (payload.get("U_id"),))
                permit = cursor.fetchone()
                conn.commit()
                cursor.close()
                conn.close()

                if permit[0] == 1:
                    file = request.files["video"]
                    data = request.form["data"]

                    vid_data = json.loads(data)
                    vidName = file.filename
                    new_name = genFileName(vidName.split(".")[0])

                    vid_data["encode"] = new_name

                    # print(vid_data)

                    if file:
                        save_path = (
                            "../upload/"
                            + vid_data["path"]
                            + "/"
                            + new_name
                            + "."
                            + vid_data["videoType"]
                        )
                        file.save(save_path)

                        # Wait until the file is successfully saved
                        while not os.path.exists(save_path):
                            time.sleep(1)

                        thread = threading.Thread(
                            target=convert, args=(save_path, vid_data)
                        )
                        thread.start()
                        # convert(save_path, vid_data)
                        time.sleep(0.8)
                        return ({"message": "upload success, converting"}), 200
                    else:
                        return ({"message": "upload/convert error"}), 500
                else:
                    return ({"message": "No Permission"}), 406
            else:
                return ({"message": "token invalid"}), 401
        except Exception as e:
            print(e)
            return ({"message": "query fail"}), 500

    @app.route("/cancle_convert", methods=["POST"])
    @token_required
    def cancle_convert():
        try:
            data = request.get_json()
            print(data)
            V_encode = data["V_encode"]
            U_folder = data["U_folder"]

            path = "../upload/" + U_folder + "/" + V_encode
            try:
                shutil.rmtree(path)
                print('delete folder:', path)
                try:
                    conn = create_conn()
                    cursor = conn.cursor()
                    
                    cursor.execute("DELETE FROM videos WHERE V_encode = %s", (V_encode,))
                    
                    conn.commit()
                    cursor.close()
                    conn.close()    
                except:
                    pass
            except:
                return ({'message': 'delete fail'}), 500
            
            return ({'message': 'deleted'}), 200
        except:
            return ({'message': 'delete fail'}), 500
    
    @app.route("/download", methods=["GET"])
    def download():
        try:
            video = request.args.get("v")
            user = request.args.get("u")

            video_url = (
                "../upload/"
                + user + "/"
                + video + "/"
                + video + ".m3u8"
            )

            output = "../output/" + user + "_" + video + ".mp4"

            subprocess.run(["ffmpeg", "-protocol_whitelist", "file,http,https,tcp,tls,crypto", "-i", video_url, output, "-y"])

            response = send_file(output, as_attachment=True)

            return response
        except Exception as e:
            #print("this is error: ", e)
            return ({"message": "download fail"}), 500

    @app.route("/delete/download", methods=["GET"])
    def deleteDownload():
        try:
            video = request.args.get("v")
            user = request.args.get("u")

            output = "../output/" + user + "_" + video + ".mp4"

            os.remove(output)
            return ""
        except:
            return ({"message": "no path"}), 500

    @app.route("/getPermit", methods=["GET"])
    def getPermit():
        try:
            U_id = request.args.get("id")

            conn = create_conn()

            cursor = conn.cursor()
            cursor.execute("SELECT U_type, U_permit FROM users WHERE U_id=%s", (U_id,))
            data = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()

            return (
                {"status": "success", "data": {"U_type": data[0], "U_permit": data[1]}}
            ), 200    
        except:
            return ({"message": "query fail"}), 500

    @app.route("/get/user/permit", methods=["GET"])
    def get_user_permit():
        try:
            conn = create_conn()
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM users WHERE U_permit = 1")
            data = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()

            return jsonify(data), 200
        except:
            return ({"message": "query fail"}), 500

    @app.route("/password/reset", methods=["POST"])
    @token_required
    def passwd_reset():
        try:
            data = request.get_json()

            conn = create_conn()

            email = data.get("email")
            U_id = data.get("U_ID")
            old_password = data.get("old_password")
            new_password = data.get("new_password")

            # get password
            cursor = conn.cursor()
            cursor.execute("SELECT U_pass FROM users WHERE U_mail = %s AND U_ID = %s", (email, U_id))
            # print('select success')
            data = cursor.fetchone()
            # print('get hashed')

            # print(hashed_password)
            if data is not None:
                hashed_password = data[0]
                if bcrypt.checkpw(
                    old_password.encode("utf-8"), hashed_password.encode("utf-8")
                ):
                    

                    encode_password = str(new_password).encode("utf-8")
                    hashed_password = bcrypt.hashpw(encode_password, bcrypt.gensalt())

                    cursor.execute(
                        "UPDATE users SET U_pass = %s WHERE U_mail = %s AND U_ID = %s",
                        (hashed_password, email, U_id),
                    )
                    
                    conn.commit()
                    cursor.close()
                    conn.close()

                    return ({"message": "password reset"}), 200
                else:
                    # print('not correct')
                    conn.commit()
                    cursor.close()
                    conn.close()
                    return ({"message": "invalid password"}), 400
        except Exception as e:
            print(e)
            return ({"message": "query fail"}), 500

    @app.route("/checkUpdate", methods=['POST'])
    @token_required
    def checkUpdate():
        try:
            input_data = request.get_json()
            conn = create_conn()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE U_ID = %s",
                           (input_data['U_ID'],))
            data = cursor.fetchone()

            if data[12] == 1:
                cursor.execute("UPDATE users SET U_update = %s WHERE U_ID = %s",
                            (0, input_data['U_ID'],))
                conn.commit()
                cursor.close()
                conn.close()
                payload = {
                            "U_id": data[0],
                            "U_type": data[4],
                            "U_permit": data[8],
                            "exp": datetime.utcnow() + timedelta(days=30),
                        }
                token = jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")                
                tmp = str(data[6])
                update = {
                    "token": token,
                    "update": data[12],
                    "data": {
                        "U_id": data[0],
                        "username": data[1],
                        "email": data[2],
                        "U_type": data[4],
                        "vid": data[5],
                        "U_pro_pic": tmp[2:-1],
                        "U_permit": data[8],
                        "U_folder": data[9],
                        "U_storage": data[11]
                    },
                }
                
                return jsonify(update), 200
            else:
                conn.commit()
                cursor.close()
                conn.close()
                return ({'update': data[12]})
        except Exception as e:
            return ({"message": 'query fail'}), 500
            
#--------------------- USER --------------------------#
    
    @app.route("/getUsers")
    def getUsers():
        try:
            conn = create_conn()

            cursor = conn.cursor()
            cursor.execute(
                "SELECT U_id, U_name, U_mail, U_vid, U_type, U_permit, U_storage, U_folder FROM users WHERE U_ID > 0"
            )
            data = cursor.fetchall()
            conn.commit()
            cursor.close()
            conn.close()

            users = []
            for row in data:
                user = {
                    "U_id": row[0],
                    "U_name": row[1],
                    "U_mail": row[2],
                    "U_vid": row[3],
                    "U_type": row[4],
                    "U_permit": row[5],
                    "U_storage": row[6],
                    "U_folder": row[7],
                }
                users.append(user)

            return jsonify(users), 200
        except:
            return ({"message": "query fail"}), 500

    @app.route("/getUser/id", methods=["GET"])
    def getUser():
        try:
            u_id = request.args.get("u")
            if(isinstance(int(u_id), int)):

                conn = create_conn()

                cursor = conn.cursor()
                cursor.execute("SELECT * FROM users WHERE U_ID = %s", (u_id,))
                data = cursor.fetchone()

                folder_name = data[9]
                folder_path = "../upload/" + folder_name
                size = 0

                for path, dirs, files in os.walk(folder_path):
                    for f in files:
                        fp = os.path.join(path, f)
                        size += os.path.getsize(fp)

                size = round(size / (1048576))  # bytes to mb

                cursor.execute(
                    "UPDATE users SET U_storage = %s WHERE U_ID = %s", (size, data[0])
                )
                conn.commit()
                cursor.close()
                conn.close()
                tmp = str(data[6])
                tmp2 = str(data[10])
                user = {
                    "U_ID": data[0],
                    "U_name": data[1],
                    "U_mail": data[2],
                    "U_type": data[4],
                    "U_vid": data[5],
                    "U_storage": size,
                    "U_pro_pic": tmp[2:-1],
                    "U_banner": tmp2[2:-1],
                }

                return jsonify(user), 200
            else:
               return({"message": "no user"}), 500
        except Exception as e:
            return({"message": "query fail"}), 500

    @app.route("/get/users/search", methods=["GET"])
    def searchUsers():
        try:
            user = request.args.get("u")
            conn = create_conn()
            user = "%" + user + "%"

            cursor = conn.cursor()
            cursor.execute(
                "SELECT U_ID, U_name, U_mail, U_vid, U_pro_pic, U_folder FROM users WHERE U_name LIKE %s",
                (user,),
            )
            data = cursor.fetchall()
            conn.commit()
            cursor.close()
            conn.close()

            users = []
            for row in data:
                tmp = str(row[4])
                user = {
                    "U_id": row[0],
                    "U_name": row[1],
                    "U_mail": row[2],
                    "U_vid": row[3],
                    "U_pro_pic": tmp[2:-1],
                    "U_folder": row[5],
                }
                users.append(user)

            return jsonify(users), 200
        except:
            return ({"message": "query fail"}), 500

    @app.route("/insert/user/admin", methods=["POST"])
    def insertUser_admin():
        try:
            data = request.get_json()
            print(data)
            conn = create_conn()
            cursor = conn.cursor()
            for user in data:
                encode_password = str(user["U_pass"]).encode("utf-8")
                hashed_password = bcrypt.hashpw(encode_password, bcrypt.gensalt())
                file_name = genFileName(user["U_name"])

                cursor.execute(
                    "INSERT INTO users (U_name, U_mail, U_pass, U_type, U_vid, U_permit, U_folder) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    (
                        user["U_name"],
                        user["U_mail"],
                        hashed_password,
                        user["U_type"],
                        0,
                        user["U_permit"],
                        file_name,
                    ),
                )
                folder_path = (
                    "../upload/" + file_name
                )  # create folder for uploaded videos
                os.makedirs(folder_path)
            conn.commit()
            cursor.close()
            conn.close()

            return "", 200
        except Exception as e:
            return ({"message": e}), 500
    
    @app.route("/update/user/user", methods=["POST"])
    def updateUser_User():
        try:
            token = request.headers.get("Authorization")
            if verify(token):
                tmp = token.split(" ")[-1]
                payload = jwt.decode(tmp, app.config["SECRET_KEY"], algorithms=["HS256"])
                tmp = request.form.get("data")
                data = json.loads(tmp)

                if payload.get("U_id") == data["U_id"]:
                    pro = request.files.get("pro")
                    banner = request.files.get("banner")
                    f1, f2 = False, False

                    if pro is not None:
                        pro64 = imgResize(pro, 400, 400)
                        f1 = True

                    if banner is not None:
                        banner64 = imgResize(banner, 820, 312)
                        f2 = True

                    conn = create_conn()

                    cursor = conn.cursor()

                    if f1 and f2:
                        cursor.execute(
                            "UPDATE users SET U_name = %s, U_mail=%s, U_pro_pic=%s, U_banner=%s, U_update=%s WHERE U_ID = %s",
                            (
                                data["username"],
                                data["email"],
                                pro64,
                                banner64,
                                1,
                                data["U_id"],
                            ),
                        )

                    elif f1 and not f2:
                        cursor.execute(
                            "UPDATE users SET U_name = %s, U_mail=%s, U_pro_pic=%s, U_update=%s WHERE U_ID = %s",
                            (data["username"], data["email"], pro64, 1, data["U_id"]),
                        )

                    elif not f1 and f2:
                        cursor.execute(
                            "UPDATE users SET U_name = %s, U_mail=%s, U_banner=%s, U_update=%s WHERE U_ID = %s",
                            (data["username"], data["email"], banner64, 1, data["U_id"]),
                        )

                    elif not f1 and not f2:
                        cursor.execute(
                            "UPDATE users SET U_name = %s, U_mail=%s, U_update=%s WHERE U_ID = %s",
                            (data["username"], data["email"], 1, data["U_id"]),
                        )

                    conn.commit()
                    cursor.close()
                    conn.close()

                    return ({"message": "success"}), 200
                else:
                    return {"message": "no permission"}
            else:
                return ({"message": "token invalid"}), 401
        except:
            return ({"message": "query fail"}), 500

    @app.route("/update/user/admin", methods=["POST"])
    def updateUser_admin():
        try:
            token = request.headers.get("Authorization")

            if verify(token):
                tmp = token.split(" ")[-1]
                payload = jwt.decode(tmp, app.config["SECRET_KEY"], algorithms=["HS256"])

                if payload.get("U_type") == "admin":
                    data = request.get_json()
                    print(data)
                    conn = create_conn()
                    cursor = conn.cursor()

                    cursor.execute(
                        "UPDATE users SET U_name=%s, U_mail=%s, U_permit=%s, U_type=%s, U_update=%s WHERE U_ID=%s",
                        (
                            data.get("U_name"),
                            data.get("U_mail"),
                            data.get("U_permit"),
                            data.get("U_type"),
                            1,
                            data.get("U_id"),
                        ),
                    )

                    conn.commit()
                    cursor.close()
                    conn.close()

                    return ({"message": "success"}), 200
                else:
                    return ({"message": "have no permission"}), 400
            else:
                return ({"message": "token invalid"}), 400
        except:
            return ({"message": "query fail"}), 500

    @app.route("/delete/user", methods=["POST"])
    def delete_user():
        try:
            data = request.get_json()

            path = "../upload/" + data["U_folder"]
            shutil.rmtree(path)

            conn = create_conn()
            cursor = conn.cursor()

            cursor.execute(
                "DELETE FROM users WHERE U_ID=%s AND U_folder=%s",
                (data["U_ID"], data["U_folder"]),
            )

            conn.commit()
            cursor.close()
            conn.close()

            return ({"message": "success"}), 200
        except OSError as e:
            return ({"message": "server error"}), 500

#--------------------- VIDIO --------------------------#
    
    @app.route("/getVideos/public")
    def getVideos():
        try:
            conn = create_conn()

            cursor = conn.cursor()
            cursor.execute(
                "SELECT videos.*, users.U_name, users.U_folder FROM videos, users WHERE users.U_ID = videos.U_ID AND V_permit=%s ORDER BY RAND ( ) LIMIT 10 ",
                ("public",),
            )
            data = cursor.fetchall()
            conn.commit()
            cursor.close()
            conn.close()

            videos = []
            for row in data:
                tmp = str(row[6])
                video = {
                    "V_ID": row[0],
                    "V_title": row[1],
                    "V_view": row[2],
                    "V_length": row[3],
                    "V_size": row[4],
                    "V_upload": row[5],
                    "V_pic": tmp[2:-1],
                    "U_ID": row[7],
                    "V_encode": row[9],
                    "V_quality": row[10],
                    "V_desc": row[11],
                    "U_name": row[12],
                    "U_folder": row[13],
                }
                videos.append(video)

            return jsonify(videos), 200
        except Exception as e:
            print(e)
            return ({"message": "Get Videos Fail"}), 500

    @app.route("/get/videos/upload", methods=["GET"])
    def getVideosUpload():
        try:
            U_id = request.args.get("u")
            conn = create_conn()

            cursor = conn.cursor()
            cursor.execute(
                "SELECT V_pic, V_encode, V_title, V_permit FROM videos WHERE V_permit NOT IN (%s, %s, %s) AND U_ID = %s",
                ("public", "private", "unlisted", U_id),
            )
            data = cursor.fetchall()
            conn.commit()
            cursor.close()
            conn.close()

            videos = []
            for row in data:
                tmp = str(row[0])
                video = {
                    "V_pic": tmp[2:-1],
                    "V_encode": row[1],
                    "V_title": row[2],
                    "V_permit": row[3],
                }
                videos.append(video)

            return jsonify(videos), 200
        except Exception as e:
            print(e)
            return ({"message": "Get Videos Fail"}), 500

    @app.route("/get/videos/tag", methods=["GET"])
    def getVideos_tag():
        try:
            data = request.args.get("tag")
            conn = create_conn()

            cursor = conn.cursor()
            cursor.execute(
                "SELECT videos.*, users.U_name, users.U_folder \
                FROM videos, users \
                WHERE users.U_ID = videos.U_ID \
                AND V_permit=%s AND videos.V_ID IN ( \
                SELECT V_ID FROM tag_video WHERE T_ID = (\
                    SELECT T_ID FROM tags WHERE T_name = %s)) \
                ORDER BY V_upload DESC LIMIT 10",
                ("public", data),
            )
            data = cursor.fetchall()
            conn.commit()
            cursor.close()
            conn.close()

            videos = []
            for row in data:
                tmp = str(row[6])
                video = {
                    "V_ID": row[0],
                    "V_title": row[1],
                    "V_view": row[2],
                    "V_length": row[3],
                    "V_size": row[4],
                    "V_upload": row[5],
                    "V_pic": tmp[2:-1],
                    "U_ID": row[7],
                    "V_encode": row[9],
                    "V_quality": row[10],
                    "V_desc": row[11],
                    "U_name": row[12],
                    "U_folder": row[13],
                }
                videos.append(video)

            return jsonify(videos), 200
        except Exception as e:
            print(e)
            return ({"message": "Get Videos Fail"}), 500

    @app.route("/get/videos/search", methods=["GET"])
    def getVideos_search():
        try:
            data = request.args.get("s")
            data = "%" + data + "%"

            conn = create_conn()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT videos.*, users.U_name, users.U_folder \
                FROM videos, users \
                WHERE users.U_ID = videos.U_ID \
                AND V_permit=%s \
                AND V_title LIKE %s \
                ORDER BY V_upload DESC LIMIT 10",
                ("public", data),
            )
            data = cursor.fetchall()
            conn.commit()
            cursor.close()
            conn.close()

            videos = []
            for row in data:
                tmp = str(row[6])
                video = {
                    "V_ID": row[0],
                    "V_title": row[1],
                    "V_view": row[2],
                    "V_length": row[3],
                    "V_size": row[4],
                    "V_upload": row[5],
                    "V_pic": tmp[2:-1],
                    "U_ID": row[7],
                    "V_encode": row[9],
                    "V_quality": row[10],
                    "V_desc": row[11],
                    "U_name": row[12],
                    "U_folder": row[13],
                }
                videos.append(video)

            return jsonify(videos), 200
        except Exception as e:
            print(e)
            return ({"message": "Get Videos Fail"}), 500

    @app.route("/getVideos/profile")
    def getVideosProfile():
        try:
            permit = request.args.get("p")
            user = request.args.get("u")

            conn = create_conn()

            cursor = conn.cursor()

            if permit != "all":
                cursor.execute(
                    "SELECT videos.*, users.U_name, users.U_folder FROM videos, users WHERE users.U_ID = videos.U_ID AND videos.U_ID = %s AND V_permit = %s ORDER BY videos.V_upload",
                    (user, permit),
                )
            else:
                cursor.execute(
                    "SELECT videos.*, users.U_name, users.U_folder FROM videos, users WHERE users.U_ID = videos.U_ID AND videos.U_ID = %s ORDER BY videos.V_upload",
                    (user,),
                )

            data = cursor.fetchall()
            conn.commit()
            cursor.close()
            conn.close()

            videos = []
            for row in data:
                tmp = str(row[6])
                video = {
                    "V_ID": row[0],
                    "V_title": row[1],
                    "V_view": row[2],
                    "V_length": row[3],
                    "V_size": row[4],
                    "V_upload": row[5],
                    "V_pic": tmp[2:-1],
                    "U_ID": row[7],
                    "V_permit": row[8],
                    "V_encode": row[9],
                    "V_quality": row[10],
                    "V_desc": row[11],
                    "U_name": row[12],
                    "U_folder": row[13],
                }
                videos.append(video)

            return jsonify(videos), 200
        except Exception as e:
            print(e)
            return ({"message": "Get Videos Fail"}), 500

    @app.route("/get/video/info", methods=["GET"])
    def getVideo():
        try:
            V_encode = request.args.get("v")
            u = request.args.get("u")

            conn = create_conn()

            cursor = conn.cursor()
            cursor.execute(
                "SELECT v.*, u.U_name, u.U_folder, u.U_pro_pic, COALESCE(h.H_watchTime, 0) AS H_watchTime \
                FROM videos AS v  \
                JOIN users AS u ON u.U_ID = v.U_ID \
                LEFT JOIN histories AS h ON h.U_ID = %s AND h.V_ID = v.V_ID \
                WHERE u.U_ID = v.U_ID \
                AND v.V_encode = %s \
                ORDER BY h.H_watchdata DESC LIMIT 1",
                (
                    u,
                    V_encode,
                ),
            )
            data = cursor.fetchone()

            cursor.execute(
                "SELECT * FROM tags WHERE T_ID IN \
                    (SELECT T_ID FROM tag_video WHERE V_ID = \
                        (SELECT V_ID FROM videos WHERE V_encode = %s))",
                (V_encode,),
            )
            data2 = cursor.fetchall()

            conn.commit()
            cursor.close()
            conn.close()

            tags = []
            for row in data2:
                tag = {"T_ID": row[0], "T_name": row[1]}
                tags.append(tag)

            tmp = str(data[6])
            tmp2 = str(data[14])
            video = {
                "V_ID": data[0],
                "V_title": data[1],
                "V_view": data[2],
                "V_length": data[3],
                "V_size": data[4],
                "V_upload": data[5],
                "V_pic": tmp[2:-1],
                "U_ID": data[7],
                "V_permit": data[8],
                "V_encode": data[9],
                "V_quality": data[10],
                "V_desc": data[11],
                "U_name": data[12],
                "U_folder": data[13],
                "U_pro_pic": tmp2[2:-1],
                "watchTime": data[15],
                "tags": tags,
            }

            return jsonify(video), 200
        except Exception as e:
            print(e)
            return ({"message": "Get Videos Fail"}), 500

    @app.route("/update/video/user", methods=["POST"])
    def updateVideo_user():
        try:
            token = request.headers.get("Authorization")
            if verify(token):
                tmp = token.split(" ")[-1]
                payload = jwt.decode(tmp, app.config["SECRET_KEY"], algorithms=["HS256"])
                data = request.get_json()

                if payload.get("U_id") == data["U_id"] or payload.get("U_type") == "admin":
                    conn = create_conn()
                    cursor = conn.cursor()

                    cursor.execute(
                        "UPDATE videos SET V_title=%s, V_desc=%s, V_permit=%s WHERE V_encode=%s",
                        (data["title"], data["desc"], data["permit"], data["encode"]),
                    )

                    cursor.execute(
                        "SELECT * FROM tag_video WHERE V_ID = %s", (data["V_id"],)
                    )
                    exist_data = cursor.fetchall()

                    exist_row = {(row[0], row[1]) for row in exist_data}
                    new_row = {(data["V_id"], row["T_ID"]) for row in data["tag"]}

                    insert_row = new_row - exist_row
                    delete_row = exist_row - new_row

                    insert_q = "INSERT INTO tag_video (V_ID, T_ID) VALUES (%s, %s)"
                    delete_q = "DELETE FROM tag_video WHERE V_ID = %s AND T_ID = %s"

                    for row in insert_row:
                        cursor.execute(insert_q, row)

                    for row in delete_row:
                        cursor.execute(delete_q, row)

                    conn.commit()
                    cursor.close()
                    conn.close()

                    return ({"message": "success"}), 200
                else:
                    return ({"message": "no permission"}), 400
            else:
                return ({"message": "token invalid"}), 401
        except:
            return ({"message": "query fail"}), 500

    @app.route("/delete/video/user", methods=["POST"])
    def deleteVideo_user():
        try:
            token = request.headers.get("Authorization")
            if verify(token):
                tmp = token.split(" ")[-1]
                payload = jwt.decode(tmp, app.config["SECRET_KEY"], algorithms=["HS256"])
                data = request.get_json()

                if payload.get("U_id") == data["U_id"] or payload.get("U_type") == "admin":
                    conn = create_conn()
                    cursor = conn.cursor()
                    path = "../upload/" + data["U_folder"] + "/" + data["V_encode"]

                    cursor.execute(
                        "DELETE FROM tag_video WHERE V_ID = \
                            (SELECT V_encode \
                            FROM videos \
                            WHERE V_encode = %s)",
                        (data["V_encode"],),
                    )
                    conn.commit()

                    cursor.execute(
                        "DELETE FROM videos WHERE U_ID=%s AND V_encode=%s",
                        (data["U_id"], data["V_encode"]),
                    )
                    conn.commit()

                    try:
                        shutil.rmtree(path)
                        folder_name = data["U_folder"]
                        folder_path = "../upload/" + folder_name
                        size = 0

                        for f_path, dirs, f_files in os.walk(folder_path):
                            for f in f_files:
                                fp = os.path.join(f_path, f)
                                size += os.path.getsize(fp)

                        size = round(size / (1048576))  # bytes to mb

                        cursor.execute(
                            "UPDATE users SET U_storage = %s, U_update = %s WHERE U_folder = %s", (size, 1, data["U_folder"])
                        )
                        conn.commit()
                        cursor.close()
                        conn.close()
                    except OSError as e:
                        pass

                    return ({"message": "success"}), 200
                else:
                    return ({"message": "no permission"}), 400
            else:
                return ({"message": "token invalid"}), 401
        except:
            return ({"message": "query fail"}), 500

#--------------------- HISTORIES --------------------------#

    @app.route("/insert/history", methods=["POST"])
    def insertHistory():
        try:
            data = request.get_json()
            conn = create_conn()
            cursor = conn.cursor()

            cursor.execute(
                "INSERT INTO histories (U_ID, V_ID, H_watchtime) \
                    SELECT %s, %s, COALESCE((SELECT H_watchTime FROM histories WHERE U_ID = %s AND V_ID = %s ORDER BY H_watchData DESC LIMIT 1), 0) \
                    WHERE %s != ( \
                        SELECT V_ID FROM histories \
                        WHERE U_ID = %s \
                        ORDER BY H_watchData DESC LIMIT 1) \
                        OR NOT EXISTS ( \
                            SELECT V_ID FROM histories WHERE U_ID = %s)",
                (
                    data["U_id"],
                    data["V_id"],
                    data["U_id"],
                    data["V_id"],
                    data["V_id"],
                    data["U_id"],
                    data["U_id"],
                ),
            )

            conn.commit()
            cursor.close()
            conn.close()
            return ({"message": "success"}), 200
        except:
            return ({"message": "query fail"}), 500

    @app.route("/update/history/user", methods=["POST"])
    def updateHistory():
        try:
            data = request.get_json()
            conn = create_conn()
            cursor = conn.cursor()

            cursor.execute(
                "UPDATE histories SET H_watchtime = %s \
                    WHERE U_ID = %s AND V_ID = %s AND H_watchData = ( \
                        SELECT MAX(H_watchData) \
                        FROM histories \
                        WHERE U_ID = %s AND V_ID = %s \
                    )",
                (data["watchTime"], data["U_id"], data["V_id"], data["U_id"], data["V_id"]),
            )

            conn.commit()
            cursor.close()
            conn.close()
            return ({"message": "success"}), 200
        except:
            return ({"message": "query fail"}), 500

    @app.route("/get/histories", methods=["GET"])
    def getHistories():
        try:
            u = request.args.get("u")
            conn = create_conn()

            cursor = conn.cursor()
            cursor.execute(
                "SELECT h.H_ID, h.H_watchData, v.V_ID, v.V_title, v.V_encode, v.V_pic, u.U_ID, u.U_name, u.U_folder \
                FROM histories AS h \
                JOIN videos AS v ON v.V_ID = h.V_ID \
                JOIN users AS u ON u.U_ID = h.U_ID \
                WHERE h.U_ID = %s \
                ORDER BY h.H_watchData DESC \
                LIMIT 10",
                (u,),
            )
            data = cursor.fetchall()
            conn.commit()
            cursor.close()
            conn.close()

            histories = []
            for row in data:
                tmp = str(row[5])
                history = {
                    "H_ID": row[0],
                    "H_watchDate": row[1],
                    "V_ID": row[2],
                    "V_title": row[3],
                    "V_encode": row[4],
                    "V_pic": tmp[2:-1],
                    "U_ID": row[6],
                    "U_name": row[7],
                    "U_folder": row[8],
                }
                histories.append(history)

            return jsonify(histories), 200
        except:
            return ({"message": "query fail"}), 500

    @app.route("/delete/histories", methods=["POST"])
    @token_required
    def deleteHistories():
        try:
            data = request.get_json()

            conn = create_conn()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM histories WHERE U_ID = %s", (data["user"],))
            conn.commit()
            cursor.close()
            conn.close()

            return ({"message": "success"}), 200
        except:
            return ({"message": "query fail"}), 500

    @app.route("/get/histories/lastWatch", methods=["GET"])
    def getLastWatch():
        try:
            u = request.args.get("u")
            v = request.args.get("v")
            conn = create_conn()

            cursor = conn.cursor()
            cursor.execute(
                "SELECT H_watchTime \
                FROM histories \
                WHERE V_ID = %s AND U_ID = %s \
                ORDER BY H_watchdata DESC LIMIT 1",
                (v, u),
            )
            data = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()

            watch = {"watchTime": data[0]}

            return jsonify(watch), 200
        except:
            return ({"message": "query fail"}), 500

#--------------------- LOG --------------------------#

    @app.route("/get/uploadLog")
    def getUploadLog():
        try:
            conn = create_conn()

            cursor = conn.cursor()
            cursor.execute(
                "SELECT v.V_pic, v.V_title, v.V_encode, v.U_ID, u.U_name, v.V_upload, v.V_permit, u.U_folder\
                        FROM videos AS v \
                        JOIN users AS u \
                        WHERE u.U_ID = v.U_ID \
                        ORDER BY v.V_upload DESC"
            )
            data = cursor.fetchall()
            conn.commit()
            cursor.close()
            conn.close()

            logs = []
            for row in data:
                tmp = str(row[0])
                log = {
                    "V_pic": tmp[2:-1],
                    "V_title": row[1],
                    "V_encode": row[2],
                    "U_ID": row[3],
                    "U_name": row[4],
                    "V_upload": row[5],
                    "V_permit": row[6],
                    "U_folder": row[7],
                }
                logs.append(log)

            return jsonify(logs), 200
        except:
            return ({"message": "query fail"}), 500

    @app.route("/insert/log", methods=["POST"])
    def insertLog():
        try:
            data = request.get_json()

            conn = create_conn()
            cursor = conn.cursor()

            cursor.execute(
                "INSERT INTO system_logs(U_ID, action) VALUES (%s, %s)",
                (data["U_id"], data["action"]),
            )

            conn.commit()
            cursor.close()
            conn.close()

            return ({"message": "success"}), 200
        except:
            return ({"message": "query fail"}), 500

    @app.route("/get/userLog", methods=["GET"])
    def getLog():
        try:
            conn = create_conn()
            u = request.args.get("u")
            cursor = conn.cursor()
            if u == "all":
                cursor.execute(
                    "SELECT L_ID , U_ID , action , created_at\
                        FROM system_logs \
                        ORDER BY created_at DESC",
                )
            else:
                cursor.execute(
                    "SELECT L_ID , U_ID , action , created_at\
                        FROM system_logs \
                        WHERE U_ID = %s \
                        ORDER BY created_at DESC",
                    (u,),
                )
            data = cursor.fetchall()
            conn.commit()
            cursor.close()
            conn.close()

            logs = []
            for row in data:
                log = {
                    "U_ID": row[1],
                    "action": row[2],
                    "created_at": row[3],
                }
                logs.append(log)

            return jsonify(logs), 200
        except:
            return ({"message": "query fail"}), 500

#--------------------- TAG --------------------------#

    @app.route("/get/tags")
    def getTag():
        try:
            conn = create_conn()

            cursor = conn.cursor()
            cursor.execute(
                "SELECT tg.T_ID, tg.T_name, COUNT(tv.V_ID) AS count \
                        FROM tags AS tg \
                        LEFT JOIN tag_video AS tv ON tv.T_ID = tg.T_ID \
                        GROUP BY tg.T_ID, tg.T_name"
            )
            data = cursor.fetchall()
            conn.commit()
            cursor.close()
            conn.close()

            tags = []
            for row in data:
                tag = {"T_ID": row[0], "T_name": row[1], "count": row[2]}
                tags.append(tag)

            return jsonify(tags), 200
        except:
            return ({"message": "query fail"}), 500

    @app.route("/insert/tag", methods=["POST"])
    @token_required
    def insertNewTag():
        try:
            data = request.get_json()

            conn = create_conn()
            cursor = conn.cursor()

            for tag in data:
                cursor.execute("INSERT INTO tags (T_name) VALUES (%s)", (tag,))

            conn.commit()
            cursor.close()
            conn.close()

            return ({"message": "success"}), 200
        except:
            return ({"message": "query fail"}), 500

    @app.route("/delete/tag", methods=["GET"])
    @token_required
    def deleteTag():
        try:
            t = request.args.get("t")
            conn = create_conn()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM tags WHERE T_ID = %s", (t,))
            conn.commit()
            cursor.close()
            conn.close()

            return ({"message": "success"}), 200
        except:
            return ({"message": "query fail"}), 500

    @app.route("/get/tags/search", methods=["GET"])
    def searchTag():
        try:
            tag = request.args.get("t")
            conn = create_conn()
            tag = "%" + tag + "%"

            cursor = conn.cursor()
            cursor.execute(
                "SELECT tg.T_ID, tg.T_name, COUNT(tv.V_ID) AS count \
                        FROM tags AS tg \
                        LEFT JOIN tag_video AS tv ON tv.T_ID = tg.T_ID \
                        WHERE tg.T_name LIKE %s\
                        GROUP BY tg.T_ID, tg.T_name",
                (tag,),
            )
            data = cursor.fetchall()
            conn.commit()
            cursor.close()
            conn.close()

            tags = []
            for row in data:
                tag = {"T_ID": row[0], "T_name": row[1], "count": row[2]}
                tags.append(tag)

            return jsonify(tags), 200
        except:
            return ({"message": "query fail"}), 500

    @app.route("/update/tag", methods=["POST"])
    @token_required
    def updateTag():
        try:
            data = request.get_json()
            print(data)
            conn = create_conn()

            cursor = conn.cursor()
            cursor.execute(
                "UPDATE tags SET T_name = %s WHERE T_ID = %s",
                (data["update_name"], data["T_ID"]),
            )
            conn.commit()
            cursor.close()
            conn.close()

            return ({"message": "updated"}), 200
        except:
            return ({"message": "query fail"}), 500

#--------------------- hls api --------------------------#

    @app.route("/get/hls/token", methods=['POST']) # request on api
    def hls_authen():
        try:
            data = request.get_json()

            email = data.get("email")
            plain_password = data.get("password")

            conn = create_conn()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE U_mail=%s", (email,))
            data = cursor.fetchone()

            if data is not None:
                hashed_password = data[3]
                if bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8")):
                    cursor.execute("SELECT url_token FROM url_token WHERE U_ID = %s", (data[0], ))
                    token = cursor.fetchone()
                    
                    if token is not None:
                        conn.commit()
                        cursor.close()
                        conn.close()
                        return ({'message': 'developer token for get access to hls file on server',
                             'url_token': token[0]}), 200
                    else:
                        token = genFileName(data[9] + '-' + secrets.token_hex(16))
                        cursor.execute("INSERT INTO url_token(url_token, U_ID) VALUES (%s, %s)",
                                    (token, data[0]))
                        conn.commit()
                        cursor.close()
                        conn.close()
                        return ({'message': 'developer token for get access to hls file on server',
                             'url_token': token}), 200


                else:
                    return ({'message': 'password not match'}), 400
            else:
                return ({'message': 'no data'}), 400
        except:
            return ({'message': 'query fail'}), 500
        
    @app.route("/get/hls/token/jwt", methods=['POST']) # request on web
    @token_required
    def hls_authen_jwt():
        try:
            token = request.headers.get("Authorization")
            tmp = token.split(' ')[-1]
            payload = jwt.decode(tmp, app.config["SECRET_KEY"], algorithms=["HS256"])

            conn = create_conn()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE U_ID=%s", (payload.get('U_id'),))
            data = cursor.fetchone()

            if data is not None:
                cursor.execute("SELECT url_token FROM url_token WHERE U_ID = %s", (data[0], ))
                token = cursor.fetchone()
                
                if token is not None:
                    conn.commit()
                    cursor.close()
                    conn.close()
                    return ({'message': 'developer token for get access to hls file on server',
                            'url_token': token[0]}), 200
                else:
                    token = genFileName(data[9] + '-' + secrets.token_hex(16))
                    cursor.execute("INSERT INTO url_token(url_token, U_ID) VALUES (%s, %s)",
                                (token, data[0]))
                    conn.commit()
                    cursor.close()
                    conn.close()
                    return ({'message': 'developer token for get access to hls file on server',
                            'url_token': token}), 200
            
            else:
                return ({'message': 'password not match'}), 400
        except Exception as e:
            print(e) 
            return ({'message': 'query fail'}), 500

    @app.route("/upload/hls/<path:token>", methods=['POST']) # for dev
    def upload_hls(token):
        try:
            conn = create_conn()

            if 'video' not in request.files:
                return ({'message': 'No file part'}), 400

            # get password
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE U_ID=(SELECT U_ID FROM url_token WHERE url_token=%s)", (token,))
            data = cursor.fetchone()
            
            
            if data is not None:
                if data[8] == 1:
                    file = request.files['video']
                    vidName = file.filename
                    
                    new_name = genFileName(vidName.split(".")[0])

                    if file:
                        save_path = (
                            "../upload/"
                            + data[9]
                            + "/"
                            + new_name
                            + "."
                            + vidName.split('.')[-1]
                        )
                        file.save(save_path)

                        # Wait until the file is successfully saved
                        while not os.path.exists(save_path):
                            time.sleep(1)

                        cap = cv2.VideoCapture(save_path)
                        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                        video_duration = float(cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS))
                        video_size = int(os.path.getsize(save_path) / (1024))

                        vid_data = {
                            "videoName": file.filename,
                            "videoDuration": video_duration,
                            "videoSize": video_size,
                            "videoThumbnail": '',
                            "videoOwner": data[0],
                            "encode": new_name,
                            "videoDesc": '',
                            "videoOriginName": file.name,
                            "videoPermit": 'public',
                            "path": data[9],
                            "width": width,
                            "height": height,
                        }
                        thread = threading.Thread(
                            target=convert, args=(save_path, vid_data)
                        )
                        thread.start()


                        cursor.execute("SELECT url_token FROM url_token WHERE U_ID = %s",
                                    (data[0], ))
                        token = cursor.fetchone()

                        if token is None:
                            token = genFileName(data[9] + '-' + secrets.token_hex(16))
                            cursor.execute("INSERT INTO url_token(url_token, U_ID) VALUES (%s, %s)",
                                    (token, data[0]))

                        conn.commit()
                        cursor.close()
                        conn.close()
                        return({'message': 'Upload success. use this token to access hls video when convert complate',
                                'url_token': token}), 200
                    else:
                        return ({'message': 'no file'}), 400    
                else:
                    return ({'message': 'no upload permission'}), 400
            
            else:
                conn.commit()
                cursor.close()
                conn.close()
                return ({'message': 'No data'}), 400

        except Exception as e:
            print(e)
            return ({'message': 'query fail'}), 400
    
    @app.route("/get/hls/<path:u>/<path:v>") #for web app
    def get_hls_url(u, v):
        try:
            if ".m3u8" in v:
                hls = v.split(".")
                res = hls[0].split("_")
                if os.path.exists(
                    "../upload/" + u + "/" + res[0] + "/" + hls[0] + ".m3u8"
                ):
                    path = "./../upload/" + u + "/" + res[0] + "/"
                    vid = hls[0] + ".m3u8"
                    return send_from_directory(path, vid), 200
                else:
                    return ({"message": "file not found"}), 500
            if ".ts" in v:
                hls = v.split(".")
                res = hls[0].split("_")
                if os.path.exists(
                    "../upload/" + u + "/" + res[0] + "/" + hls[0] + ".ts"
                ):
                    path = "./../upload/" + u + "/" + res[0] + "/"
                    vid = hls[0] + ".ts"
                    return send_from_directory(path, vid), 200
                else:
                    return ({"message": "file not found"}), 500
            else:
                if os.path.exists("../upload/" + u + "/" + v + "/" + v + ".m3u8"):
                    path = "./../upload/" + u + "/" + v + "/"
                    vid = v + ".m3u8"
                    return send_from_directory(path, vid), 200
                else:
                    return ({"message": "file not found"}), 500

        except:
            return ({'message': 'query fail'}), 500

    @app.route("/get/hls/file/<path:url_token>/<path:u>/<path:v>") #for dev
    def get_hls_file(url_token, u, v):
        try:
            conn = create_conn()
            cursor = conn.cursor()

            cursor.execute("SELECT * FROM url_token WHERE url_token = %s", (url_token,))
            data = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()

            if data is not None:

                if ".m3u8" in v:
                    hls = v.split(".")
                    res = hls[0].split("_")
                    if os.path.exists(
                        "../upload/" + u + "/" + res[0] + "/" + hls[0] + ".m3u8"
                    ):
                        path = "./../upload/" + u + "/" + res[0] + "/"
                        vid = hls[0] + ".m3u8"
                        return send_from_directory(path, vid), 200
                    else:
                        return ({"message": "file not found"}), 500
                if ".ts" in v:
                    hls = v.split(".")
                    res = hls[0].split("_")
                    if os.path.exists(
                        "../upload/" + u + "/" + res[0] + "/" + hls[0] + ".ts"
                    ):
                        path = "./../upload/" + u + "/" + res[0] + "/"
                        vid = hls[0] + ".ts"
                        return send_from_directory(path, vid), 200
                    else:
                        return ({"message": "file not found"}), 500
                else:
                    if os.path.exists("../upload/" + u + "/" + v + "/" + v + ".m3u8"):
                        path = "./../upload/" + u + "/" + v + "/"
                        vid = v + ".m3u8"
                        return send_from_directory(path, vid), 200
                    else:
                        return ({"message": "file not found"}), 500

            else:
                return ({"message": "content unavarible"}), 403
        except:
            return ({"message": "query fail"}), 500

    @app.route("/get/hls/list/<path:url_token>") # for fev get video list
    def get_hls_list(url_token):
        try:
            conn = create_conn()
            cursor = conn.cursor()

            cursor.execute(
                "SELECT videos.*, users.U_name, users.U_folder \
                    FROM videos, users \
                    WHERE users.U_ID = (SELECT U_ID FROM url_token WHERE url_token = %s) \
                    AND videos.U_ID = (SELECT U_ID FROM url_token WHERE url_token = %s)",
                (url_token, url_token),
            )
            data = cursor.fetchall()
            conn.commit()
            cursor.close()
            conn.close()
            
            videos = []
            for row in data:
                tmp = str(row[6])
                video = {
                    "V_ID": row[0],
                    "V_title": row[1],
                    "V_view": row[2],
                    "V_length": row[3],
                    "V_size": row[4],
                    "V_upload": row[5],
                    # "V_pic": tmp[2:-1],
                    "U_ID": row[7],
                    "V_encode": row[9],
                    "V_quality": row[10],
                    "V_desc": row[11],
                    "U_name": row[12],
                    "U_folder": row[13],
                    "url": ipf + '/get/hls/file/' + url_token + '/' + row[13] + '/' + row[9] + '.m3u8'
                }
                print(video)
                videos.append(video)

            return jsonify(videos), 200

            return (), 200
        except Exception as e:
            print(e)
            return ({'message': 'query fail'}), 500
    
    @app.route("/hls/key/<path:u>/<path:v>") # for get key
    def getKey(u,v):
        try:
            path = "../upload/"+u+"/"+v+"/"+v+".bin"
            return send_file(path)
        except:
            return({"message": "no key"}), 500

#--------------------- SERVER --------------------------#

    @app.route("/server_resource")
    def server():
        # CPU INFO
        cpu_used = psutil.cpu_percent()

        # Memory INFO [Ram Used]
        mem = psutil.virtual_memory().percent

        # Disk INFO
        disk_usage = psutil.disk_usage(os.getcwd())
        disk_total = round(disk_usage.total / (1024 * 1024 * 1024), 2)
        disk_used = round(disk_usage.used / (1024 * 1024 * 1024), 2)
        disk_free = round(disk_usage.free / (1024 * 1024 * 1024), 2)
        disk_used_percent = round(disk_usage.percent, 2)

        # Network INFO
        upload, download, total, upload_speed, down_speed = update_network_stats()

        return (
            jsonify(
                {
                    "CPU_Used": str(cpu_used),
                    "Memory_Used": str(mem),
                    "Disk_Total": str(disk_total),
                    "Disk_Used": str(disk_used),
                    "Disk_Free": str(disk_free),
                    "Disk_Used_Percent": str(disk_used_percent),
                    "Network_Download": str(download),
                    "Network_Upload": str(upload),
                    "Network_Total": str(total),
                    "Network_Upload_Speed": str(upload_speed),
                    "Network_Download_Speed": str(down_speed),
                }
            ),
            200,
        )

    return app


APP = create_app()

if __name__ == "__main__":
    APP.run(host="0.0.0.0", port=8900, debug=True)
    # APP.run(debug=True)
