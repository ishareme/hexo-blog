---
cover: https://source.unsplash.com/random/?mobile

title: Video标签移动端兼容性问题总结
tags:
    - H5
    - 移动端
    - 前端
    - 美图秀秀
categories:
    - [技术分享]
    - [学习笔记]
abbrlink: zw0c9c32
date: 2019-01-12 22:31:01

---

#### 微信下内置的播放器

```
<video class="js-video"
        loop
        airplay="allow"
        x5-playsinline /**/
        playsinline /*IOS微信浏览器支持小播放*/
        webkit-playsinline /*这个属性是ios 10中设置可以让视频在小窗内播放，也就是不是全屏播放*/
        preload="auto" /*预加载*/
>
</video>
```

#### 安卓微信下不能自动播放

安卓微信下 autoplay 无效，不能自动播放，可以通过**用户交互进行手动播放**。

```
//在安卓微信下
$('body').one('touchstart', function () {
    //ios微信下可以自动播放
    if (is.iOS) {
         return;

    $('.video-icon').hide()
    $('.js-video')[0].play();
});
```

#### safari 下无法自动播放

在 safari 下，autoplay 也无效，在 iphone 上做测试，发现 autoplay 属性在 safari 里无效，苹果对 video 标签的 autoplay 属性做了如下规定：

> In Safari on iOS (for all devices, including iPad), where the user may be on a cellular network and be charged per data unit, preload and autoplay are disabled.

其实 safari 的并不是 autoplay 的问题，而是视频有声音导致于 safari 不能自动播放，**给 video 的 muted[是否静音]设置为 true**，视频便会自动播放，但是视频没有声音(降级处理)

safari 下，设置 muted 为 true

```
//safari下
if(is.safari){
   $('.js-video')[0].play();
    $('.js-video')[0].muted = true;
}
```

#### video 的 poster 的问题

-   在安卓的有些机子下，给 video 增加了 poster，但是还是没有效果，poster 在 android 兼容的并不好，不如在视频上层加个 div 铺张图片
-   iPhoneX 的 video 在有 poster 的情况下，播放视频 poster 不会自动去掉，要自己逻辑手动去掉 poster(之前测到过)

#### 黑屏问题

部分环境中视频从开始播到能展现画面会有短暂的黑屏（处理视频源数据的时间），为了避免这个黑屏，可以在视频上加个浮层或设置容器背景并在播放前隐藏 video，然后监听相关事件，开始播放或认为有画面的时候再切换到 Video 界面。

解决方案
微信下，通过用户交互进行播放，最好给他一个播放小 icon

#### 微博下的视频问题

对于小视频为了美观，一般都是把 control 属性拿掉，而在微博下视频默认是全屏播放的，点击返回视频在没有控制条 control 的情况下会不能再次播放，因此在 weibo 下要加上 control

解决方案：

```
if(is.Weibo){
    $('.js-video')[0].control = true;
}
```

## 全屏

视频全屏的 H5 专题十分收到业界喜欢, 虽然 iOS 下全屏自动播放并没有太大问题, 然而在安卓手机上，video 组件全屏的时候会在顶层，好像"漂浮"在整个浏览器上面, 体验起来非常差. 除此之外, 即便采用 JS 给 video 设定为容器的宽高这方案, 也会出现难看的播放器控件,这时候不得不人为给视频底部加空白,在通过 JS 计算适合的高度以挡掉丑陋的播放器控件, 实在苦恼.

偶然发现 JSMpeg 这个项目,能解决安卓全屏 video 漂浮问题问题.
它的原理就是 JS 解码视频, 用 WebGL & Canvas2D 渲染出来,于是达到避免 Video 控件在安卓微信浏览器下产生的问题, 不过有一个需要说明的地方就是, 你需要用将你的视频文件(通常是 mp4)转换成 ts 格式的视频文件, 并且 ,在 iOS 下的微信浏览器下, 使用 jsmpeg 播放 ts 文件, 是没有声音的. (iOS 我们直接使用 video+mp4 的方式,也用不到这个插件).
你可以使用 convertio.co/zh/mp4-ts/在线转换, 不过更推荐使用 ffmpeg.org/,至于怎么安装就不再赘述.

### 生产 ts 视频文件命令：

```
    $ ffmpeg -i 你的源文件.mp4 -f mpegts -codec:v mpeg1video -codec:a mp2 -b 0 输出文件.ts

```

JSMpeg 调用

```
	<canvas id = "canvas"></canvas>
	<script>
 	 var player = new JSMpeg.Player('video.ts', {
     	canvas: canvas,
        loop: false,
        autoplay:true
     });  
  </script>
```

当然你也直接在 HTML 中使用

```
<div class="jsmpeg"
	data-url="video.ts"
    data-loop="false"
    data-autoplay="true">
</div>

```

另一种

```
<video id="video" src="//file.ws.126.net/3g/activity/20171019/5.mp4" preload="true" webkit-playsinline="true" playsinline="true" x5-video-player-type="h5" x5-video-player-fullscreen="true" x5-video-orientation="portraint"></video>

    width: 7.5rem;
    height: 100%;
    z-index: 9;
    pointer-events: none;
    -o-object-fit: cover;
    object-fit: cover;
    -o-object-position: center top;
    object-position: center top;
```
