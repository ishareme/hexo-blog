---
cover: https://source.unsplash.com/random/?macos
title: 在MacOS中如何让MongoDB在开机时自动启动
description: >-
  每次当我必须启动我的 node 应用程序时，我经常忘记运行我的 MongoDB 服务，这有点烦人，所以必须找到一种方法从我的 Mac OS X
  上的启动项运行它。
tags:
  - Node
  - MongoDB
  - 后端工程
categories:
  - 学习笔记
abbrlink: ca2c7d55
date: 2022-10-20 22:15:32
---

每次当我必须启动我的 node 应用程序时，我经常忘记运行我的 MongoDB 服务，这有点烦人，所以必须找到一种方法从我的 Mac OS X 上的启动项运行它。

**具体方法如下：**

1. 创建一个文件，名称为 `org.mongo.mongod.plist` 在 `/Library/LaunchDaemons/` 目录下

2. 如果你使用 `vim` 你可以这样做：

```bash
sudo vim /Library/LaunchDaemons/org.mongo.mongod.plist
```

3. 复制并粘贴下面代码

```bash
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>org.mongo.mongod</string>
    <key>RunAtLoad</key>
    <true/>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/mongod</string>
        <string>--dbpath</string>
        <string>/var/lib/mongodb/</string>
        <string>--logpath</string>
        <string>/var/log/mongodb.log</string>
    </array>
</dict>
</plist>
```

4. 此外，您还需要为日志创建一个文件并为数据库创建一个目录。

```bash
sudo touch /var/log/mongodb.log
sudo mkdir /var/lib/mongodb
```

5. 并在您的终端中分别运行：

```bash
sudo chown root:wheel /Library/LaunchDaemons/org.mongo.mongod.plist
sudo launchctl load /Library/LaunchDaemons/org.mongo.mongod.plist
sudo launchctl start org.mongo.mongod
```

就是这样！现在，每次打开 Mac 并开始工作时，您都不必担心再次运行它！