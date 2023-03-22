'use strict';

/**
 * hexo-vanta
 * by ShineTomorrow
 */
const pluginname = 'hexo_vanta';

const vanta = hexo.config.vanta ? hexo.config.vanta : hexo.theme.config.vanta;

const addCss = () => {
	const content = `
    <style>
      #background-effect {
        position: absolute;
        top: 0px;
        left: 0px;
        z-index: -1;
        width: 100%;
        height: 100%
      }
    </style>
  `;
	return content;
};

const addVanta = hexo => {
	const { option, effect } = vanta;

	const config = Object.assign(
		{
			el: '#background-effect',
			parentNodeId: 'page-header',
		},
		option
	);

	const hexoVantaEle = `<script data-pjax>
                          function ${pluginname}_injector_config(){
                            var ${pluginname}_parent_div_git = document.getElementById('${config.parentNodeId}');
                            var ${pluginname}_item_html = '<div id="${config.el.split('#')[1]}"></div>';
                            ${pluginname}_parent_div_git.insertAdjacentHTML("${config.insertposition}", ${pluginname}_item_html)
                          }
                          
                          ${pluginname}_injector_config();
                        </script>`;

	// const vantaJs = `https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.${effect.toLowerCase()}.min.js`;
	const vantaJs = `https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/vanta/0.5.21/vanta.fog.min.js`;

	let result = '<script src="https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/three.js/110/three.min.js"></script>';
	result += hexoVantaEle;
	result += `<script src="${vantaJs}"></script>`;
	result += `<script data-pjax>VANTA.${effect.toUpperCase()}(${JSON.stringify(config)})</script>`;

	return result;
};

if (vanta && vanta.enable) {
	hexo.extend.injector.register('head_end', addCss);
	hexo.extend.injector.register('body_end', addVanta(hexo));
}
