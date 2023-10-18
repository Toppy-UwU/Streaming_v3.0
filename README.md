## Streaming project V3.0
--- 
Streaming project V3.0
<h4>
⚠ Just a college project still working on it.
the code is so messed up and has poor front-end design. ⚠
</h4>
<hr><br>
the project is a YouTube-like platform. with the help of FFmpeg on python flask, it can convert any video format file into hls format for able to streaming through HTTP easily.
in final it'll be deployed on the container to make it easy to use and install.

---

### How to install
#### New Linux machine
- `apt-get update`
- `ufw allow 80, 8900, 3306`

#### needed software
- docker
  - `apt install docker.io`
- docker compose
  - `apt install docker-compose`
- docker buildx
  - `apt install docker-buildx`
  - `docker buildx install`
- nodejs
  - `apt install nodejs`
- npm
  - `apt install npm`

config file (host ip)
- react app
  - go to `react-app/src/config.js`
  - change `server_ip` into current hosting ip
- docker-compose.yml
  - change these 
   
```
mariadb:
    image: mariadb:10.4.27
    container_name: my-mariadb-container
    environment:
      MYSQL_ROOT_PASSWORD: [root password]
      MYSQL_DATABASE: [maria db table]
      MYSQL_USER: [maria db user]
      MYSQL_PASSWORD: [maria db password]
    ports:
      - "3306:3306"
    volumes:
      - ./streaming.sql:/docker-entrypoint-initdb.d/init.sql
```

```
flaskapp:
    build: ./python
    environment:
	  SERVER_IP: [host ip]
      MYSQL_HOST: [host ip]
      MYSQL_USER: [maria db user]
      MYSQL_DATABASE: [maria db table]
      MYSQL_PASSWORD: [maria db password]
    ports:
      - "8900:8900"
    volumes:
      - ./python:/app
```

- ### Start the project
	- first build react app
		- go to root of react app
			- `npm install`
			- `npm install bootstrap-icons` *just in case*
			- `npm run build`
		- after react finish build `cd` back to main directory
		- use command `docker-compose build` to create image
		- after docker-compose finish build 
			- `docker-compose up` `-d(optional)` 
		- now everything ready 

---

