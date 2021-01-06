// *******************************
// get data from wf using rest api
// *******************************

//*****************************
// Forecast

async function getForecast(){
	// request all values from today in 1 minute buckets
fetchString="https://swd.weatherflow.com/swd/rest/better_forecast?station_id="+config['station_id']+"&token="+config['wfPersonalToken']+"&lat="+config['latitude']+"&lon="+config['longitude'];
	//fetchString="https://swd.weatherflow.com/swd/rest/observations/device/"+config['wfTempestID']+"?day_offset=0&token="+config['wfPersonalToken']
	const response = await fetch(fetchString);
	const forecastJson = await response.json(); //extract JSON from the http response
	currentConditions=forecastJson['current_conditions'];
	//forecastNextHour = forecastJson
	
console.log("current: ");
console.log(currentConditions);
console.log("Daily: ");
console.log(forecastJson['forecast']['daily'][0]);
console.log("Hourly: ");
console.log(forecastJson['forecast']['hourly'][0]);
console.log(forecastJson);
console.log(currentConditions['pressure_trend']);
	
	
}// end getTodayObs

// function to send request to weatherflow rest interface for all summary observations for 1 month
// const getDailySummaryObs = async () => {
async function getDailySummaryObs(){
	var minDate = new Date(); 
    minDate.setMonth(minDate.getMonth() - 1);
	var maxDate = new Date();
	fetchString="https://swd.weatherflow.com/swd/rest/observations/device/"+config['wfTempestID']+"?time_start="+Math.round(minDate.getTime()/1000)+"&time_end="+Math.round(maxDate.getTime()/1000)+"&token="+config['wfPersonalToken']+"&bucket=e"
	
	const response = await fetch(fetchString);
	const dailySummaryJson = await response.json(); //extract JSON from the http response
	
	// pass the observations from the returned JSON to todayObs to be processed
	processSummaryObs(dailySummaryJson['obs']); //send array of daily summaries
}

function processSummaryObs(summaries){
// gets an array of daily summaries
summaries.forEach(parseSummary);
//drawSummaryCharts();

}

function parseSummary(daySummary){
	for(i=0;i<obsSummaryFields.length;i++){
		obsSummary[obsSummaryFields[i]].push(daySummary[i]);
	}// end for
}// end parseSummary

// get maximum and minimum from today (and time so need index)
  var maximumTemp = -Infinity;
  var maximumTempEpoch = new Date();
  var minimumTemp = Infinity;
  var minimumTempEpoch = new Date();

//*****************************
// Today Obs

// send request to weatherflow rest interface for all observations from today at 1 minute intervals!
//const getTodayObs = async () => {
async function getTodayObs(){
	// request all values from today in 1 minute buckets

	fetchString="https://swd.weatherflow.com/swd/rest/observations/device/"+config['wfTempestID']+"?day_offset=0&token="+config['wfPersonalToken']
	const response = await fetch(fetchString);
	const dailyJson = await response.json(); //extract JSON from the http response
	
	// todayJson['obs'] contains all of today's readings
	todayJSON = dailyJson['obs']
	await todayJSON.forEach(parseTempest);
	
	
}// end getTodayObs

//const getInitialDaily = async () => {
async function getInitialDaily(){
  await getTodayObs();
  //drawTodayCharts();
  
  
  //***************************
  // chartist
  
  var dayData = {
  // A labels array that can contain any sort of values
  labels: fifteenMinuteEpoch,
  // Our series array that contains series objects or in this case series data arrays
  series: [fifteenMinuteTemp],className: 'colourme'
  
};
var dayOptions = {
  // Don't draw the line chart points
  showPoint: false,
  // Disable line smoothing
  lineSmooth: true,
  axisX: {
    // We can disable the grid for this axis
    showGrid: false,
    // and also don't show the label
    showLabel: false
  },
  
};
// charts removed from console main screen
//chartDayTemp = new Chartist.Line('#dailychartist', dayData,dayOptions);

}









