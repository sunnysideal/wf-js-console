
// ***************************
// fetch observations
// ***************************

// structures to hold data
var todayJSON = {};

var obsToday = { 	'time_epoch':[], 	'wind_lull':[], 	'wind_avg':[], 	'wind_gust':[], 	'wind_direction':[], 	'wind_sample_interval':[], 	'station_pressure':[], 	'air_temperature':[], 	'relative_humidity':[], 	'illuminance':[], 	'uv':[], 	'solar_radiation':[], 	'rain_accumulated':[], 	'precipitation_type':[], 	'lightning_strike_avg_distance':[], 	'lightning_strike_count':[], 	'battery':[], 	'report_interval':[], 	'local_daily_rain_accumm':[], 	'rain_accumm_final':[], 	'local_daily_rain_accum_final':[], 	'precipitation_analysis_type':[] 	};
var obs7Days = {	 	'time_epoch':[], 	'wind_lull':[], 	'wind_avg':[], 	'wind_gust':[], 	'wind_direction':[], 	'wind_sample_interval':[], 	'station_pressure':[], 	'air_temperature':[], 	'relative_humidity':[], 	'illuminance':[], 	'uv':[], 	'solar_radiation':[], 	'rain_accumulated':[], 	'precipitation_type':[], 	'lightning_strike_avg_distance':[], 	'lightning_strike_count':[], 	'battery':[], 	'report_interval':[], 	'local_daily_rain_accumm':[], 	'rain_accumm_final':[], 	'local_daily_rain_accum_final':[], 	'precipitation_analysis_type':[]}; 
var obsSummary = { 'TIMESTAMP' : [], 'PRESSURE' : [], 'PRESSURE_HIGH' : [], 'PRESSURE_LOW' : [], 'TEMP' : [], 'TEMP_HIGH' : [], 'TEMP_LOW' : [], 'HUMIDITY' : [], 'HUMIDITY_HIGH' : [], 'HUMIDITY_LOW' : [], 'LUX' : [], 'LUX_HIGH' : [], 'LUX_LOW' : [], 'UV' : [], 'UV_HIGH' : [], 'UV_LOW' : [], 'SOLAR_RADIATION' : [], 'SOLAR_RADIATION_HIGH' : [], 'SOLAR_RADIATION_LOW' : [], 'WIND_AVG' : [], 'WIND_GUST' : [], 'WIND_LULL' : [], 'WIND_DIR' : [], 'WIND_INTERVAL' : [], 'STRIKE_COUNT' : [], 'STRIKE_AVG_DISTANCE' : [], 'RECORD_COUNT' : [], 'BATTERY' : [], 'PRECIP_ACCUM_TODAY_LOCAL' : [], 'PRECIP_ACCUM_TODAY_LOCAL_FINAL' : [], 'PRECIP_MINS_TODAY_LOCAL' : [], 'PRECIP_MINS_TODAY_LOCAL_FINAL' : [], 'PRECIP_TYPE' : [], 'PRECIP_ANALYSIS_TYPE' : [] };

var fifteenMinuteTemp = [];
var fifteenMinuteEpoch = [];

// ********************
// charts here using chart.js
// ********************

function drawSummaryCharts(){
	var ctx = document.getElementById('summaryTempChart').getContext('2d');
	var chart = new Chart(ctx, {
    
	// The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: 
	{
        labels: obsSummary['TIMESTAMP'],
	
		datasets: [{
			label: 'Min',
            backgroundColor: cssvar('--temp-min-colour'),
			fill: false,
			pointRadius: 1,
            borderColor: cssvar('--temp-min-colour'),
			data: obsSummary['TEMP_LOW'],
        },
		{
            label: 'Ave',
			pointRadius: 0,
            backgroundColor: cssvar('--temp-min-colour'),
			fill: "-1",
            borderColor: cssvar('--temp-colour'),
			data: obsSummary['TEMP'],
        },
		{
            label: 'Max',
            backgroundColor: cssvar('--temp-max-colour'),
			fill: "-1",
			pointRadius: 1,
            borderColor: cssvar('--temp-max-colour'),
			data: obsSummary['TEMP_HIGH'],
        }]
    },

    // Configuration options go here
    options: {
		tooltips: {
			mode: 'index',
			intersect: false,
			displayColors: false,
		},
		legend:{
			display:false},
		scales: {
            xAxes: [{
                ticks: {
					display: false //this will remove only the label
				},
				gridLines: {
					drawOnChartArea: false
				}
            }],
			yAxes: [{
                gridLines: {
					drawOnChartArea: false
				}
            }]
        }
	}
	});	
}

function drawTodayCharts(){
	var ctx = document.getElementById('todayTempChart').getContext('2d');
	var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: 
	{
        labels: fifteenMinuteEpoch,		
		
		datasets: [{
            label: 'Temp',
			pointRadius: 1,
            backgroundColor: cssvar('--temp-colour'),
			fill: false,
            borderColor: cssvar('--temp-colour'),
			data: fifteenMinuteTemp,
		}]
    },

    // Configuration options go here
    options: {
		tooltips: {
			mode: 'index',
			intersect: false,
			displayColors: false,
		},
		legend:{
			display:false},
		scales: {
            xAxes: [{
                ticks: {
                    display: false //this will remove only the label
                },
				gridLines: {
					drawOnChartArea: false
				}
				}],
			yAxes: [{
                gridLines: {
					drawOnChartArea: false
				}
            }]
        }
	}
	});	
}

// *******************************
// get data from wf using rest api
// *******************************


// function to send request to weatherflow rest interface for all summary observations for 1 month
const getDailySummaryObs = async () => {
	console.log("Starting summary obs");
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
const getTodayObs = async () => {
	// request all values from today in 1 minute buckets
	fetchString="https://swd.weatherflow.com/swd/rest/observations/device/"+config['wfTempestID']+"?day_offset=0&token="+config['wfPersonalToken']
	const response = await fetch(fetchString);
	const dailyJson = await response.json(); //extract JSON from the http response
	
	// todayJson['obs'] contains all of today's readings
	todayJSON = dailyJson['obs']
	await todayJSON.forEach(parseTempest);
	
	
}// end getTodayObs

const getInitialDaily = async () => {
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
chartDayTemp = new Chartist.Line('#dailychartist', dayData,dayOptions);

  
  
  
   var windData = {
  // A labels array that can contain any sort of values
  //labels: fifteenMinuteEpoch,
  // Our series array that contains series objects or in this case series data arrays
  series: [wspeed]
  
};
var windOptions = {
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
chartWind = new Chartist.Line('#windchartist', windData,windOptions); 
  
}


getInitialDaily()
.then(getDailySummaryObs)

.then(() => loadScript('wflowsocket.js'))
.then(() => loadScript('suncalc.js'))
  .then(() => {
    // loading scripts in order
	var times = SunCalc.getTimes(new Date(), 55.978, -3.723);
	var sunriseStr = times.sunrise.getHours() + ':' + times.sunrise.getMinutes();
	var sunsetStr = times.sunset.getHours() + ':' + times.sunset.getMinutes();
	var solarNoonStr = times.solarNoon.getHours() + ':' + times.solarNoon.getMinutes();
	updateHTML('sunrise_time', sunriseStr);
	updateHTML('sunset_time', sunsetStr);
	updateHTML('solarnoon_time', solarNoonStr);
  })







