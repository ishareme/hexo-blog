# Dockerfile
FROM nginx

# 将 dist 文件中的内容复制到 /usr/share/nginx/html/ 这个目录下面
# 所以，之前必须执行 npm run build 来打包出 dist 目录，重要！！！
COPY public/  /usr/share/nginx/html/

# 拷贝 nginx 配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 设置时区
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone

# 创建 /admin-fe-access.log ，对应到 nginx.conf
CMD touch /hmz-blog-access.log && nginx && tail /hmz-blog-access.log -f
