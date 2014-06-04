//Using HighCharts: http://api.highcharts.com/highcharts

var charts = require("chartData");
var chartCount = 0;
/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('charts'));
}

//EVENT LISTENER
function doChart() {
	
	if(chartCount<charts.length-1){
		chartCount++;
	} else {
		chartCount = 0;
	}
	
	$.chart.plotChart({chartData:charts[chartCount]});
};

$.chart = Alloy.createWidget("com.appcelerator.charts",{
	chartData:charts[0], 
	size:{
		height:$.chartView.height,
		width:$.chartView.width
	}
});

$.chartView.add($.chart.getView());

/**
 * Closes the window
 * */
function closeWindow() {
	$.chartWin.close();
}

initialize();
