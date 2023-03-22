'use strict'

/**
 * hexo-foreignTips
 * by ShineTomorrow
 */
const foreignTips = hexo.config.foreignTips ? hexo.config.foreignTips : hexo.theme.config.foreignTips


const foreignTipsAction = (hexo) => {
  let result = '<script src="//geoip-js.com/js/apis/geoip2/v2.1/geoip2.js" type="text/javascript"></script>'
  result += `<script>
                var _foreignTips = (function () {
                    var onSuccess = function (geoipResponse) {
                    console.log('geoipResponse', geoipResponse);
                    if (!geoipResponse.country.iso_code) {
                        return;
                    }
                    var code = geoipResponse.country.iso_code.toLowerCase();
                    if (code !== 'cn'){
                        console.log('foreignTipsAction', '不是中国');
                        btf.snackbarShow('使用国外网络访问将无法访问文章图片，敬请谅解。If you use foreign network access, you will not be able to access articles and pictures.')
                        console.log('btf', btf);
                    }
                    };
                    var onError = function (error) {
                    };
                    return function () {
                    geoip2.country(onSuccess, onError);
                    };
                }());
                _foreignTips();
             </script>`

  return result
}

if (foreignTips && foreignTips.enable) {
  hexo.extend.injector.register('body_end', foreignTipsAction(hexo))
}
