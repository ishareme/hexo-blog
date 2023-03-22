---
title: 美图H5项目总结--bplus_halloween
tags:
    - H5
    - 移动端
    - 前端
    - 美图秀秀
categories:
    - [技术分享]
    - [学习笔记]
abbrlink: 337cf447
date: 2017-10-29 20:41:01
---

昨天对项目 m8s_strut 做了个小结(详见=>[m8s_strut](https://blog.huangmingzhao.cn/meitu-item-one.html))，今天就继续对项目二 bplus_halloween 做个总结吧，嘿嘿...技术很渣，看官勿喷。。

<!-- more -->

这个项目是海外版的，接到项目他们说 B+，B+，听不懂 B+是什么东西，哈哈，后来才知道原来 B+是美图海外版的一个 App--BeautyPlus。这个项目是多语言版本，突然就不知道多语言怎么处理，问了伟程师傅说直接在 url 后面加参数，在代码中直接获取，哈哈，原来是这样处理多语言哈~~

## 开发中

### 1. 各个字体大小不一致问题

各个字体大小不一致忘记考虑了，而是直接统一设置字体大小，导致各文案显示有点奇怪。这个问题应该开发的时候就应该注意到，以至于在测试的时候花了不少时间去调一些字体细节问题。谨以此为记，希望下次能够有所优化。

**解决：** 不同的文案字体应该要不同处理

### 2. 文案间歇性滚动

文案的间歇性滚动之前想用 CSS3 来处理，后来发现处理不了间歇性，就改用了 js 来处理。

```bash
var timer=setInterval(function () {
        if (scrollVal < $wrapDis){
            scrollUp()
        }
        else {
            clearInterval(timer)
        }
    },50);

function scrollUp(){
     if(scrollVal % $pHeight === 0){
         clearInterval(timer)
        setTimeout(startScroll,2000);
    }else{
        scrollVal++
        // scrollEle.style.transform=`translateY(-${scrollVal}px)`
        scrollEle.style.marginTop=`-${scrollVal}px`
    }
}

setTimeout(startScroll,4000)

```

在苹果 5 中之前用的 transform 来处理滚动处理不了，改为 marginTop 就可以，所以就索性用 marginTop 来，虽然它会一直的回流和重绘性能不好，CSS3 动画可以开启硬件加速。

### 3. 需求变动，文案滚动完，可以先上查看

**解决：**

在内容的父元素上设置

```bash
    max-height: 50px; /*no*/
    overflow-y:scroll;

```

在内容元素上不设置高度，自动撑开

为了使内容可以滚动，在滚动结束的时候瞬间给内容元素移除掉 style 属性，给父元素加上 scrollTop，scrollTop 为他滚动的多少即 marginTop 的值，这样便可滚动，最终代码如下

```bash
var timer=setInterval(function () {
        if (scrollVal < $wrapDis){
            scrollUp()
        }
        else {

            //结束时内容元素移除掉style属性
            $('.js-home-word-wrap').removeAttr('style')
            //父元素加上scrollTop
            $('.js-home-word')[0].scrollTop = $wrapDis
            clearInterval(timer)
        }
    },50);

function scrollUp(){
     if(scrollVal % $pHeight === 0){
         clearInterval(timer)
        setTimeout(startScroll,2000);
    }else{
        scrollVal++
        // scrollEle.style.transform=`translateY(-${scrollVal}px)`
        scrollEle.style.marginTop=`-${scrollVal}px`
    }
}

setTimeout(startScroll,4000)

```

## 测试中的问题

### 1. ios 中客户端 facebook 机制会吊起 facebook 客户端主页，分享完毕后屏幕变空白

facebook 分享[facebook 分享链接](https://developers.facebook.com/docs/sharing/reference/share-dialog)

**解决：**

在末尾添加初始化脚本

```bash
<script>
    //初始化FB，appid要去申请
    window.fbAsyncInit = function() {
        FB.init({
//            appId            : '2052125608344073',
            appId: '928616713878249',
            autoLogAppEvents : true,
            xfbml            : true,
            version          : 'v2.10'
        });
        FB.AppEvents.logPageView();
    };


    //载入facebook网页JavaScript版分享机制sdk
    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
</script>
```

需要的地方调用 FB.UI

```bash
FB.ui({
    //默认调用的是网页page形式，使他形式为dialog形式
    method: 'share',
    mobile_iframe: true,
    href:  `${u}`,
    name: textVal.titleText[lang],
    display: 'popup',
    description: textVal.titleText[lang],
    picture: '',
    frictionlessRequests: 'false'
    }, function (response) {
        let reloadURL=u = getHomePage() + '?lang=' +lang + '#num=' + pageNum + '&page=result'
        location.href=`${reloadURL}`
    });
```

今晚问了同事说 ios 中 facebook 分享后是白屏的问题，定位到了问题所在，但还是不能解决，记得之前他跟师傅谈论的时候好像可以解决，改天问问看。(之后再做补充...)

## 结尾

这个项目相对没什么逻辑，不过我还是花了挺长时间，啊啊啊啊，感觉很不应该啦~。这个项目感觉大部分时间都在文案的修改上面，挺坑的说实话，文案没有一次性给好，陆续给就算了还各种变动，嘿嘿，算是小吐槽吧，不过这个项目让我跟设计跟产品有了交流的机会，也慢慢的明白开发中应该要注意些，像沟通呀，不要一开始拿到 psd 就开始切，刚开始就要多沟通，不然会做很多无用功。代码写的还不是很规范，希望接下来可以有所改进啦。明天要去参加新员工训练营，不知道怎么样，今天就这样吧~嘿，睡觉咯·······

于 厦门前埔 自己的小屋

本文首发于个人博客　>> [黄明照--一个在路上慢慢行走的前端人](http://www.huangmingzhao.cn/)
