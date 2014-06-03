var args = arguments[0] || {};

function startChart() {
	$.webView.applyProperties({
		height:args.size.height,
		width:args.size.width
	});
	
	$.webView.removeEventListener('load', startChart);

	Ti.API.debug('webview load event fired');
	$.webView.evalJS('plotChart('+JSON.stringify(args)+')');
};

$.update = function (_params) {
	$.webView.evalJS('updateChart('+JSON.stringify(_params)+')');
};

$.plotChart = function(_params){
	$.webView.evalJS('plotChart('+JSON.stringify(_params)+')');
};

$.setOptions = function(_params){
	$.webView.evalJS('setChartOptions('+JSON.stringify(_params)+')');
};



