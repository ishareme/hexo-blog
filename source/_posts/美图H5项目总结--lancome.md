---
title: 美图H5项目总结--lancome
comments: true
tags:
    - H5
    - 移动端
    - 前端
    - 美图秀秀
categories:
    - [技术分享]
    - [学习笔记]
abbrlink: bf39d346
date: 2018-01-05 17:01:01
---

对 lancome 的小项目做个小结

<!-- more -->

这是项目的时间花点有点长。或多或少还是有学到一点东西。

## 问题

### 1. 写到有重复的代码逻辑就要想着如何去优化代码

### 2. 为了适配各种端，可以采用上下固定，中部居中布局

### 3. 在 ios 的 safari 中，有些系统不支持 flexbox，以下面方式兼容

```bash
父容器
display: flex;
justify-content: center;
align-items: center;

子 （水平垂直居中）
position: absolute;
left: 0;
top: 0;
right: 0;
bottom: 0;
margin: auto;
```

### 4. mapp 中 upload 可以使用下面这种方式

```bsh

$('.js-upload-home').on('change', function () {
            app.loading.show();
            app.emit('uploadSuccess', this.files[0]);
            //上传同一张的情况
            $(this).val('');
            gtag('event', 'completeUpload');
        });

        app.on('uploadSuccess', function(file) {
            app.upload(file).then(data => {
                self.onSuccess(data);
            }).catch(app.catchErr.upload);
        });

```

### 5. 对于形如一致的模块，最好单独写个模块

```bash

let firstModal = true;
this.modal = (options) =>{
    options = $.extend(true,{
        type: ``,
        delay: 100,
        head: ``,
        body: ``,
        txtCancel: `取 消`,
        txtConfirm: `确 认`,
        onCancle: () =>{
            $('.js-modal').removeClass('show');
        },
        onConfirm: ()=>{

        },
    },options);
    setTimeout( ()=>{
        $('.js-modal').addClass('show');
        $('.js-modal .js-image-share') && $('.js-modal .js-image-share').attr('src', this.image.share || '');
    },options.delay);
    if (options.type === 'fb'){
        $('.js-modal .js-head').addClass('fb');
    }
    $('.js-modal .js-head').text(options.head);
    $('.js-modal .js-body').html(options.body);
    $('.js-modal .js-cancel').text(options.txtCancel);
    $('.js-modal .js-confirm').text(options.txtConfirm);
    if (firstModal){
        $('.js-modal').off().on('tap', (event) => {
            let target = event.target.dataset.target;
            switch (target) {
                case 'cancel':
                    options.onCancle();
                    break;
                case 'confirm':
                    options.onConfirm();
                    break;
                default:
                    break;
            }
        });
    }
};

```

### 6. 可以自己单独扩展模块

```bash

export default {
    name: '_share_',
    main: Share,
    init() {
        this.$share = new this._share_(this.options.shareData, this);
        this.$webShare = new WebShare();
        this.setShare = data => {
            this.$share.setShare(data);
            this.$webShare.setShare(data);
        };
    },
};


function WebShare() {

}

WebShare.prototype.setShare = function (data) {

    this.data = $.extend(true, {
        title: '',
        imageUrl: '',
        description: '',
        link: '',
        copydata: '',
    }, data);
};

```

### 6. facebook 带图片分享问题

使用后端返回链接http://makeup.sea.channet.com/expre/lancome/handle2

```bash

//http://makeup.sea.channet.com/expre/lancome/handle2

<!DOCTYPE html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>Lancôme邀您即時製作唇色美照</title>
    <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0" name="viewport">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="format-detection" content="telephone=no">
    <meta property="fb:app_id" content="344854949231285">
    <meta property="og:image" content="">
    <meta property="og:title" content="一按擁有 您的瑰麗唇色美照">
    <meta property="og:type" content="website">
    <meta property="og:url" content="http://makeup.sea.channet.com/expre/lancome/handle2?imageurl=">
 </head>
 <body>
 <script>
        (function () {
            location.href = "http://makeup.sea.channet.com/lancome/hk";
        })();
</script>
  </body>
</html>

```

```bash

WebShare.prototype.facebook = function (callback) {
    // FB.ui({
    //     method: 'share',
    //     mobile_iframe: true,
    //     href:  getHomePage(),
    //     name: this.data.title,
    //     display: 'popup',
    //     description: ``,
    //     picture: this.data.pic,
    //     frictionlessRequests: 'false',
    //     hashtag: this.data.hashtag,
    // }, function (response) {
    //     console.log(response);
    // });
    const data = {
        appID: '201122177111171',
        href: getURL(this.data.pic),
        hashtag: this.data.hashtag,
    };
    window.open([
        'https://www.facebook.com/v2.10/dialog/share?',
        'href=' + encodeURIComponent(data.href),
        '&app_id=' + data.appID,
        '&hashtag=' + encodeURIComponent(data.hashtag),
    ].join(''), 'newwindow', 'toolbar=no, menubar=no, scrollbars=yes, resizable=no, location=no, status=no');

    function getURL(imageURL) {
        return 'http://makeup.sea.channet.com/expre/lancome/handle2?imageurl=' + encodeURIComponent(imageURL);
    }

    callback && callback(this.data);
};

```

### 7. weibo 分享问题

```bash

WebShare.prototype.weibo = function () {
    const shareData = {
        title: this.data.title,
        pic: this.data.pic,
        url: this.data.url,
        // appkey: '1895078391',
    };

    // encode url
    shareData.title = encodeURIComponent(shareData.title);
    shareData.url = encodeURIComponent(shareData.url);
    // shareData.pic = encodeURIComponent(shareData.pic);

    // location.href = `http://v.t.sina.com.cn/share/share.php?${querify(shareData)}`;
    window.open(`http://v.t.sina.com.cn/share/share.php?${querify(shareData)}`);
};

```

### 8. 复制面板

```bash

import CB from 'clipboard';

WebShare.prototype.copy = function (data) {
    new CB('body',{
        text: () => {
            return data;
        },
    });
};


```

### 9. 事件绑定最好绑定一次，写在 Once 中

### 10. 在 ios 的 safari 中，transition 和 animation 同时使用可能会出问题

### 11. 唤起 app 的情况，ios 用 window.location.href 的方式唤起比较合适，Android 用 iframe 唤起比较合适。

### 12. 使用'mcanvas'放大缩小问题;

```bash
竖
mc.add(image, {
    width: '100%',
    pos: {
        // x: (-disX + (app.canvasLeft * rateH)),
        x: (app.canvasLeft * rateW),
        y: (app.canvasTop * rateW),
        scale: app.canvasScale,
        rotate: 0,
    },
})


横
mc.add(image, {
    width: image.width * (750 / image.height),
    pos: {
        x: (app.canvasLeft * rateH),
        y: (app.canvasTop * rateH),
        // x: 0,
        // y: 0,
        scale: app.canvasScale,
        rotate: 0,
    },
})

```

### 结语

在写放大缩小功能的时候，问的问题事后想想有点傻逼，啊哈哈哈哈哈哈哈，个人感觉自己有时候依赖性有点强，一遇到问题就想问，要改要改！！！自己想先办法解决，解决不了在问！！！！！就酱紫吧。
