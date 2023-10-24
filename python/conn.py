import mysql.connector
import os

def create_conn():
    # host = os.getenv("MYSQL_HOST", "localhost")
    # port = os.getenv("MYSQL_PORT", "3306")
    # user = os.getenv("MYSQL_USER", "streaming_user")
    # password = os.getenv("MYSQL_PASSWORD", "p@ss")
    # database = os.getenv("MYSQL_DATABASE", "streaming")

    conn = mysql.connector.connect(
        host='localhost',
        port=3306,
        user='potty',
        password='p@ss',
        database='streaming'
    )
    return conn
