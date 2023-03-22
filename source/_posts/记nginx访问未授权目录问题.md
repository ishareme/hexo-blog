---
cover: 'https://source.unsplash.com/random/?javascript'
title: 记 nginx 访问未授权目录问题
description: >-
  之前都是在云服务器折腾Nginx，并且代码放置的位置在Nginx授权的范围内，没有出现问题，今天在自己的 mac 电脑下，出现访问 (13:
  Permission denied) 的问题
tags:
  - Macos
  - Nginx
  - 运维
categories:
  - 技术分享
swiper_index: 5
sticky: 1
abbrlink: 77fc8e60
date: 2023-02-28 22:38:42
---

之前都是在云服务器折腾Nginx，并且代码放置的位置在Nginx授权的范围内，没有出现问题，今天在自己的 mac 电脑下，出现访问 (13: Permission denied) 的问题。

# 问题
```
open() "/Desktop/xxx/event.png" failed (13: Permission denied), client: 127.0.0.1, server: xx, request: "GET /event.png?1231 HTTP/1.1", host: "localhost:8083"
```

# 分析
应该是代码放置的位置不是在 Nginx 默认配置用户的权限范围下，所以出现如上问题，那么就开始解决权限问题。

# 权限问题

将 Nginx 配置下的  user 配置改成了
```
user hmz;
```

报了一个新的错误
```
[emerg]: getgrnam("hmz") failed in /usr/local/nginx/conf/nginx.conf:1
```

参考 Nginx 的配置文档
```
Syntax:	user user [group];
Default: user nobody nobody;

Defines user and group credentials used by worker processes. If group is omitted, a group whose name equals that of user is used.
```

才知道，在 group 省略的情况下，group 默认等于 user 名。然后，ls -la 了一下 web 目录
```
hmz $ ls -la
total 104
drwxr-xr-x   19 hmz  staff   646  3 23 22:22 .
drwxr-xr-x   68 hmz  staff  2312  3 21 21:28 ..
drwxr-xr-x   16 hmz  staff   544  3 31 19:28 .git
```

我日，group 居然是 staff 这个鸟名字。。。 于是改成
```
user hmz staff;
```

之后一切工作正常。

```
 "GET /event.png?1231 HTTP/1.1" 200 5233 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36" "-"
```

# 附

## 安装 Nginx

yum 安装 nginx 非常简单，就输入一条命令即可。

```bash
$ sudo yum -y install nginx   # 安装 nginx
$ sudo yum remove nginx  # 卸载 nginx
```

使用 yum 进行 Nginx 安装时，Nginx 配置文件在 `/etc/nginx` 目录下。

## 配置 Nginx 服务
```bash
nginx -t 测试配置文件语法 查看配置文件位置
nginx 启动
nginx -s reload 重启
nginx -s stop 停止
nginx -c xxx.conf 修改配置文件位置
```
or
```bash
$ sudo systemctl enable nginx # 设置开机启动 
$ sudo service nginx start # 启动 nginx 服务
$ sudo service nginx stop # 停止 nginx 服务
$ sudo service nginx restart # 重启 nginx 服务
$ sudo service nginx reload # 重新加载配置，一般是在修改过 nginx 配置文件时使用。
```











