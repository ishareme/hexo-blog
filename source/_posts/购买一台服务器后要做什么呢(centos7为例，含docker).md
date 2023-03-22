---
cover: 'https://source.unsplash.com/random/?javascript'
title: 购买一台服务器后要做什么呢(centos7为例，含docker)
description: >-
  当我们购买一台云服务器之后，我们应该做什么呢，本文详细介绍了购买服务器之后，通过docker容器部署，Github Action 做 CI/CD，
  持续集成交付，做到前端后端过程中的自动化部署。
tags:
  - Centos
  - Docker
  - Docker-compose
  - Github Action
  - CI/CD
  - 后端
  - 前端
categories:
  - 技术分享
swiper_index: 5
sticky: 1
abbrlink: ed05e433
date: 2023-02-10 23:11:56
---

当我们购买一台云服务器之后，我们应该做什么呢，本文详细介绍了购买服务器之后，通过docker容器部署，Github Action 做 CI/CD， 持续集成交付，做到前端后端过程中的自动化部署。

# 登录
第一步当然先登录啦
```bash
ssh root@xxx.xxx.xx.xx
```

# 创建 work 账号

出于安全考虑，日常不会用 root 账号登录，权限太高了。

用 root 账号登录，创建 work 账号（另一个用户）

```bash
adduser work
passwd work
```

添加 work 的 `sudo` 权限

```bash
whereis sudoers #找到文件位置 /etc/sudoers

chmod u+w /etc/sudoers #修改权限 u表示所有者 w表示写权限 +表示添加

vim /etc/sudoers #编辑该权限
# 找到        `root     ALL=(ALL)    ALL`
# 再添加一行   `work     ALL=(ALL)    ALL`

chmod u-w /etc/sudoers #还原
```

然后使用work登录机器，输入 `su`，再输入root账号的密码，即可拥有超级权限

# 登录信任
使用 work 登录机器，创建 ~/.ssh/authorized_keys 文件

服务器输入
```bash
#修改文件权限
chmod 700 ~/.ssh
```
在本机输入 将本机的 `id_rsa.pub` 内容粘贴进来
```bash
scp .ssh/id_rsa.pub hmz@43.136.15.201:/home/hmz/.ssh/authorized_keys
```
服务器输入
```
chmod 600 ~/.ssh/authorized_keys
```
退出重新用 `work` 登录，将不用再输入密码

在本机的 `.zshrc` 中设置加入简短输入
```bash
vim ~/.zshrc

alias sshser="ssh work@xx.xx.xx.xx"
```
保存退出后，输入 `source ~/.zshrc` 重新执行。

之后就可以直接在本机命令行中输入 `sshser`， 从此不用输入ip地址和密码了，美滋滋~

# 安装必备软件

以下都需要 `su` 权限

## git
```bash
yum -y install git
git --version
```

## docker

### 安装docker 

  - 卸载可能存在的docker
      ```bash
      sudo yum remove docker  docker-common docker-selinux docker-engine
      ```

  - 安装需要的软件包， yum-util 提供yum-config-manager功能，另两个是devicemapper驱动依赖
      ```bash
      sudo yum install -y yum-utils device-mapper-persistent-data lvm2
      ```
  - 设置 yum 源 下面两个都可用
      ```bash
      sudo yum-config-manager --add-repo http://download.docker.com/linux/centos/docker-ce.repo（中央仓库）

      sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo（阿里仓库）
      ```
  - 选择docker版本并安装
   （1）查看可用版本有哪些
      ```bash
      sudo yum list docker-ce --showduplicates | sort -r
      ```
      （2）选择一个版本并安装：`yum install docker-ce-版本号`
      ```bash
      sudo yum -y install docker-ce-18.06.3.ce
      ```
  - 启动 Docker 并设置开机自启
      ```bash
      systemctl start docker
      systemctl enable docker

      # 启动 docker
      sudo systemctl start docker
      # 停止 docker
      sudo systemctl stop docker
      # 重启 docker
      sudo systemctl restart docker
      # 设置开机启动
      sudo systemctl enable docker
      # 查看 docker 状态
      sudo systemctl status docker
      # 查看 docker 内容器的运行状态
      sudo docker stats
      # 查看 docker 概要信息
      sudo docker info
      # 查看 docker 帮助文档
      sudo docker --help
      # 卸载docker
      yum -y remove docker-ce
      # 强制卸载docker
      rm -rf /var/lib/docker
      ```
### docker 镜像加速
  - 编辑文件 `daemon.json`
    ```bash
    vim /etc/docker/daemon.json
    ```
  - 在文件中输入以下内容并保存。
    ```bash
    {
      "registry-mirrors": [
          "https://mn58m7xz.mirror.aliyuncs.com"
        ]
    }
    ```
  - 重新加载配置信息及重启 Docker 服务。
    ```bash
    # 重新加载某个服务的配置文件
    systemctl daemon-reload
    # 重新启动 docker
    systemctl restart docker
​
    ```

### 安装 docker-compose
使用curl将Compose文件下载到/usr/local/bin目录中。下载完成后，使用chmod修改docker-compose文件可执行权限。
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.23.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```


**验证 docker 和 docker-compose 是否安装正确**
```bash
docker version
docker-compose --version
```

# 开放端口
开放需要的端口，否则外网无法访问该端口，当然线上的环境，不会开放那么多端口，而是用 `nginx` 反向代理

# docker 使用

## 常用命令

### image 镜像

  - 下载镜像 `docker pull <image-name>:<tag>`
  - 查看所有镜像 `docker images`
  - 删除镜像 `docker rmi <image-id>`
  - 上传镜像 `docker push <username>/<repository>:<tag>`， 要注册 [hub.docker.com](hub.docker.com '欢迎访问')

PS: 如果 `docker images` 出现 repository 是 `<none>` 的情况，可以运行 `docker image prune` 删除

```bash
sudo docker pull node:14
sudo docker pull nginx 
sudo docker pull redis
sudo docker pull mongo
sudo docker pull mysql
```

### container

  - 启动容器 `docker run -p xxx:xxx -v=hostPath:containerPath -d --name <container-name> <image-name>`
    * `-p` 端口映射
    * `-v` 数据卷，文件映射
    * `-d` 后台运行
    * `-name` 定义容器名称
  - 查看所有容器 `docker ps`，加 `-a` 显示隐藏的容器
  - 停止容器 `docker stop <container-id>`
  - 删除容器 `docker rm <container-id>`， 加 `-f` 是强制删除
  - 查看容器信息，如 IP 信息 `docker inspect <container-id>`
  - 查看容器日志 `docker logs <container-id>`
  - 进入容器控制台 `docker exec -it <container-id> /bin/sh`

## 功能演示
以 Nginx 为例
```bash
docker run -p 81:80 -d --name nginx1 nginx
docker ps

# 访问 localhost:81 并查看log

docker exec -it <container-id> /bin/sh
cd /usr/share/nginx/html
#修改代码
#重新访问 localhost:81 强制刷新

#本地文件映射到 Nginx容器
docker run -p 81:80 -d -v /User/xx/index.html:/usr/share/nginx/html --name nginx2 nginx
docker ps

docker stop <container-id>
docker rm <container-id>
```

## Dockerfile
一个简单的配置文件，描述如何构建一个新的image镜像
注意：必须是 `Dockerfile` 这个文件名，必须在项目的根目录

### 语法

```bash
# Dockerfile
# 基于哪个镜像做构建
FROM node:14
# 创建一个目录
WORKDIR /app
# 拷贝当前目录下的所有文件
COPY . /app

# 设置时区
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone
# 安装  构建镜像时，一般用于做一些系统配置，安装必要的软件，可以有多个RUN
RUN npm set registry https://registry.npm.taobao.org
RUN npm i

# 启动容器时 只能有一个 CMD
CMD echo $SERVER_NAME && echo $AUTHOR_NAME && npm run prd-dev && npx pm2 log  # 阻塞控制台的出现

# 环境变量
ENV SERVER_NAME="app-server"
ENV AUTHOR_NAME="beheroto"

```

### 构建
```bash
docker build -t app-server .  # 最后的`.` 指 Dockerfile在当前目录下

docker images

docker run -p 8081:3000 -d --name server1 app-server #创建容器，端口映射
docker ps
docker logs <container-id>
#服务localhost:8081 查看 docker logs

docker stop <container-id>
docker rm <container-id>
docker rmi <image-id>
```

# Docker-compose

软件设计和开发，有单一职责原则。Docker也一样，每个容器都只负责一个服务。
如果开发环境需要多个服务（nodejs mysql mongodb redis），就需要启动多个 Docker 容器
要连同这多个 Docker 容器，就需要 `Docker-compose`


基于 `Docker` 和 `Docker-compose`
通过一个配置文件，就可以让你的系统一键启动所有的运行环境： nodejs mysql mongodb redis

## 配置文件
```bash
version: '3'
services:
  app-server: # service name
    build:
      context: . # 当前目录
      dockerfile: Dockerfile # 基于 Dockerfile 构建
    image: app-server # 依赖于当前 Dockerfile 创建出来的镜像
    container_name: app-server
    ports:
      - 8081:3000 # 宿主机通过 8081 访问
  app-redis: # service name，重要！
    image: redis # 引用官网 redis 镜像
    container_name: app-redis
    ports:
      # 宿主机，可以用 127.0.0.1:6378 即可连接容器中的数据库 `redis-cli -h 127.0.0.1 -p 6378`
      # 但是，其他 docker 容器不能，因为此时 其他 docker 容器 127.0.0.1 是 docker 容器本身，而不是宿主机
      - 6378:6379
    environment:
      - TZ=Asia/Shanghai # 设置时区
```

## 命令

- 构建容器 `docker-compose build <service-name>`
- 启动所有服务器 `docker-compose up -d`，后台启动 （.yml里面的服务器）
- 停止所有服务器 `docker-compose down`
- 查看服务 `docker-compose ps`
- 查看服务日志 `docker-compose logs`

## 功能演示
```bash
#修改代码
#比如 prod-dev.js
// 修改 redis 连接配置  这个就在ducker-compose 中 app-server这个服务跟 app-redis 这个服务链接
Object.assign(devConf.redisConf, {
    // 和 docker-compose 中配置的 service 名字一致
    // 【注意】端口依然是 6379 ，而不是 6378 ，后者是宿主机的端口
    host: 'app-redis',
});
```

构建
```bash
docker-compose build app-server #配置文件中的 service name
docker-compose up -d

docker-compose ps

# 访问localhost:8081 docker log 查看日志

docker-compose down
```

## Docker-compose 连接 Mysql 和 MongoDB

### 区别
- redis 无数据库，而 MySQL 和 MongoDB 需要创建数据库
- redis 是缓存，无需数据持久化，而 MySQL 和 MongoDB 需要

### 配置
```bash
version: '3'
services:
  app-server: # service name
    build:
      context: . # 当前目录
      dockerfile: Dockerfile # 基于 Dockerfile 构建
    image: app-server # 依赖于当前 Dockerfile 创建出来的镜像
    container_name: app-server
    ports:
      - 8081:3000 # 宿主机通过 8081 访问
  app-redis: # service name，重要！
    image: redis # 引用官网 redis 镜像
    container_name: app-redis
    ports:
      # 宿主机，可以用 127.0.0.1:6378 即可连接容器中的数据库
      # 但是，其他 docker 容器不能，因为此时 127.0.0.1 是 docker 容器本身，而不是宿主机
      - 6378:6379
    environment:
      - TZ=Asia/Shanghai # 设置时区
    depends_on:      ###### 一定要加这个依赖 mysql mongo redis 服务启动完 在启动 node 不然会报错
      - divify-mysql
      - divify-mongo
      - divify-redis
  app-mysql:
    image: mysql # 引用官网 mysql 镜像
    container_name: app-mysql
    restart: always # 出错则重启
    privileged: true # 高权限，执行下面的 mysql/init
    command: --default-authentication-plugin=mysql_native_password # 远程访问
    ports:
      - 3305:3306 # 宿主机可以用 127.0.0.1:3305 即可连接容器中的数据库，和 redis 一样
    volumes: #文件映射
      - .docker-volumes/mysql/log:/var/log/mysql # 记录日志
      - .docker-volumes/mysql/data:/var/lib/mysql # 数据持久化
      - ./mysql/init:/docker-entrypoint-initdb.d/ # 初始化 sql
    environment:
      - MYSQL_DATABASE=app-server # 初始化容器时创建数据库
      - MYSQL_ROOT_PASSWORD=xxxxx
      - TZ=Asia/Shanghai # 设置时区
  app-mongo:
    image: mongo # 引用官网 mongo 镜像
    container_name: app-mongo
    restart: always
    volumes:
      - '.docker-volumes/mongo/data:/data/db' # 数据持久化  本机:容器
    environment:
      - MONGO_INITDB_DATABASE=app-server  # 初始化容器时创建数据库
      - TZ=Asia/Shanghai # 设置时区
    ports:
      - '27016:27017' # 宿主机可以用 127.0.0.1:27016 即可连接容器中的数据库

```

### 功能演示
- 修改 `ducker-compose.yml` , 代码如上
- 增加 `mysql/init/init.sql`，初始化mysql
- 修改 config 中 prd-dev.js 增加 mysql 和 mongodb 的配置
```bash
#修改代码
#比如 prod-dev.js
// 修改 mongodb 连接配置  这个就在ducker-compose 中 app-server这个服务跟 app-mongo 这个服务链接
Object.assign(devConf.mongodbConf, {
    host: 'editor-mongo', // 和 docker-compose 中配置的 service 名字一致
});

// 修改 mysql 连接配置
Object.assign(devConf.mysqlConf, {
    host: 'editor-mysql', // 和 docker-compose 中配置的 service 名字一致
});
```
volumes 相当于之前 docker run -v xx:xx ...
做一层文件映射，来达到数据持久化，不然每次重新build docker 数据库数据都丢失，因此需要文件映射到本地宿主电脑
```bash
volumes: #文件映射
  - .docker-volumes/mysql/log:/var/log/mysql # 记录日志
  - .docker-volumes/mysql/data:/var/lib/mysql # 数据持久化
  - ./mysql/init:/docker-entrypoint-initdb.d/ # 初始化 sql
```

构建
```bash
docker-compose build app-server #配置文件中的 service name 存在的话可以被覆盖
docker-compose up -d

docker-compose ps

# 访问localhost:8081 docker log 查看日志

docker-compose down
```

# 发布代码到服务器

- 使用 `github action` 监听 master 分支的 push
- 登录服务器，获取最新的 master 分支代码
- 重新构建镜像 `docker-compose build app-server`
- 重启所有容器 `docker-compose up -d`

```bash
# This workflow will do a clean install of node dependencies, build the source code and run tests across different versions of node
# For more information see: https://help.github.com/actions/language-and-framework-guides/using-nodejs-with-github-actions
# github actions 中文文档 https://docs.github.com/cn/actions/getting-started-with-github-actions

name: deploy for dev

on:
    push:
        branches:
            - 'dev' # 只针对 dev 分支
        paths:
            - '.github/workflows/*'
            # - '__test__/**' # dev 不需要立即测试
            - 'src/**'
            - 'Dockerfile'
            - 'docker-compose.yml'
            - 'bin/*'

jobs:
    deploy-dev:
        runs-on: ubuntu-latest

        steps:
            - uses: actions/checkout@v2
            - name: set ssh key # 临时设置 ssh key
              run: |
                  mkdir -p ~/.ssh/
                  echo "${{secrets.MAC_ID_RSA}}" > ~/.ssh/id_rsa 
                  chmod 600 ~/.ssh/id_rsa
                  ssh-keyscan "182.92.xxx.xxx" >> ~/.ssh/known_hosts
            - name: deploy # 部署
              run: |
                  ssh work@182.92.xxx.xxx "
                    # 【注意】用 work 账号登录，手动创建 /home/work/app 目录
                    # 然后 git clone https://username:password@github.com/app/app-server.git -b dev （私有仓库，使用 github 用户名和密码）
                    # git clone https://userName:token@github.com/app/app-server.git
                    # 记得删除 origin ，否则会暴露 github 密码 git remote remove origin

                    cd /home/work/app/app-server;
                    git remote add origin https://wangfupeng1988:${{secrets.WFP_PASSWORD}}@github.com/app/app-server.git;
                    git checkout dev;
                    git pull origin dev; # 重新下载最新代码
                    git remote remove origin; # 删除 origin ，否则会暴露 github 密码
                    # 启动 docker
                    docker-compose build editor-server; # 和 docker-compose.yml service 名字一致
                    docker-compose up -d;
                  "
            - name: delete ssh key # 删除 ssh key
              run: rm -rf ~/.ssh/id_rsa

```


# 如何通过 docker-host 操作数据库
```bash
# 启动（宿主机 ip 指向 docker-host ，以方便 docker 内部访问宿主机）
# Dockerfile
CMD /sbin/ip route|awk '/default/ { print $3,"\tdocker-host" }' >> /etc/hosts && npm run prd-dev && npx pm2 log
```

# bug

docker-compose中 遇到 mysql 更改了 root 密码后，一直报错 `ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: YES)`

修复
```bash
sudo docker-compose down -v
sudo rm -rf .docker-volumes/    //有数据映射  一定要删除
```
