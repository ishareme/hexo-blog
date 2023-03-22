// 如果你开启了在手机端显示侧边栏，可以将下面这行代码注释，开启下面的weibo();
try {
	if (document.getElementById('weibo').clientWidth) weibo();
} catch (error) {}
// weibo();

let weiboFetchCount = 0;

function weibo(type) {
	if (type === 'error') {
		console.log('[ weibo() error ]');
	}
	let hotness = {
		爆: 'weibo-boom',
		热: 'weibo-hot',
		沸: 'weibo-boil',
		新: 'weibo-new',
		荐: 'weibo-recommend',
		影: 'weibo-jyzy',
		剧: 'weibo-jyzy',
		综: 'weibo-jyzy',
	};
	let html = '<div id="weibo-container">';
	let data = JSON.parse(localStorage.getItem('weibo'));
	let nowTime = Date.now();
	let ls;

	if (data) {
		// 600000为缓存时间，即10分钟，避免频繁请求，加快本地访问速度。
		ls = JSON.parse(data.ls);
		for (let item of ls) {
			html +=
				'<div class="weibo-list-item"><div class="weibo-hotness ' +
				hotness[item.hot || '荐'] +
				'">' +
				(item.hot || '荐') +
				'</div>' +
				'<span class="weibo-title"><a title="' +
				item.title +
				'"href="' +
				item.url +
				'" target="_blank" rel="external nofollow noreferrer">' +
				item.title +
				'</a></span>' +
				'<div class="weibo-num"><span>' +
				item.num +
				'</span></div></div>';
		}
		html += '</div>';
		document.getElementById('weiboContent').innerHTML = html;

		if (nowTime - data.time > 600000) {
			getData();
		}
	} else {
		getData();
	}
}

function getData() {
	// if(weiboFetchCount > 10) {
	//     console.log('[ 23131313131 ]', )
	// }
	fetch('https://weibo-top-api.vercel.app/api')
		.then(data => data.json())
		.then(data => {
			weiboFetchCount += 1;
			data = { time: Date.now(), ls: JSON.stringify(data) };
			localStorage.setItem('weibo', JSON.stringify(data));
		})
		.then(weibo)
		.catch(function (error) {
			weiboFetchCount += 1;
			console.log('[ fetch error ]', error);
			weibo('error');
		});
}
