/*
Configuration scripts and initial variables
Making use of browser local storage for
Personal Token


(Anything else that it needs to get added, for instance chosen units to display...)
*/

var storedConfig = { 'wfPersonalToken':'' };

// weatherflow observation field maps
var tempestObsFields=['time_epoch', 'wind_lull', 'wind_avg', 'wind_gust', 'wind_direction', 'wind_sample_interval', 'station_pressure', 'air_temperature', 'relative_humidity', 'illuminance', 'uv', 'solar_radiation', 'rain_accumulated', 'precipitation_type', 'lightning_strike_avg_distance', 'lightning_strike_count', 'battery', 'report_interval','local_daily_rain_accumm','rain_accumm_final','local_daily_rain_accum_final','precipitation_analysis_type'];
var rapidWindObsFields=['time_epoch','wind_speed','wind_direction'];

// for when bucket = 1440 minutes, different format from WF rest API
var obsSummaryFields = ['TIMESTAMP', 'PRESSURE', 'PRESSURE_HIGH', 'PRESSURE_LOW', 'TEMP', 'TEMP_HIGH', 'TEMP_LOW', 'HUMIDITY', 'HUMIDITY_HIGH', 'HUMIDITY_LOW', 'LUX', 'LUX_HIGH', 'LUX_LOW', 'UV', 'UV_HIGH', 'UV_LOW', 'SOLAR_RADIATION', 'SOLAR_RADIATION_HIGH', 'SOLAR_RADIATION_LOW', 'WIND_AVG', 'WIND_GUST', 'WIND_LULL', 'WIND_DIR', 'WIND_INTERVAL', 'STRIKE_COUNT', 'STRIKE_AVG_DISTANCE', 'RECORD_COUNT', 'BATTERY', 'PRECIP_ACCUM_TODAY_LOCAL', 'PRECIP_ACCUM_TODAY_LOCAL_FINAL', 'PRECIP_MINS_TODAY_LOCAL', 'PRECIP_MINS_TODAY_LOCAL_FINAL', 'PRECIP_TYPE', 'PRECIP_ANALYSIS_TYPE'];

// custom derived fields map
var derivedFields=['power_mode','obs_time'];
var unitLabels={};


var obsToday = { 	'time_epoch':[], 	'wind_lull':[], 	'wind_avg':[], 	'wind_gust':[], 	'wind_direction':[], 	'wind_sample_interval':[], 	'station_pressure':[], 	'air_temperature':[], 	'relative_humidity':[], 	'illuminance':[], 	'uv':[], 	'solar_radiation':[], 	'rain_accumulated':[], 	'precipitation_type':[], 	'lightning_strike_avg_distance':[], 	'lightning_strike_count':[], 	'battery':[], 	'report_interval':[], 	'local_daily_rain_accumm':[], 	'rain_accumm_final':[], 	'local_daily_rain_accum_final':[], 	'precipitation_analysis_type':[] 	};
var obs7Days = {	 	'time_epoch':[], 	'wind_lull':[], 	'wind_avg':[], 	'wind_gust':[], 	'wind_direction':[], 	'wind_sample_interval':[], 	'station_pressure':[], 	'air_temperature':[], 	'relative_humidity':[], 	'illuminance':[], 	'uv':[], 	'solar_radiation':[], 	'rain_accumulated':[], 	'precipitation_type':[], 	'lightning_strike_avg_distance':[], 	'lightning_strike_count':[], 	'battery':[], 	'report_interval':[], 	'local_daily_rain_accumm':[], 	'rain_accumm_final':[], 	'local_daily_rain_accum_final':[], 	'precipitation_analysis_type':[]};
var obsSummary = { 'TIMESTAMP' : [], 'PRESSURE' : [], 'PRESSURE_HIGH' : [], 'PRESSURE_LOW' : [], 'TEMP' : [], 'TEMP_HIGH' : [], 'TEMP_LOW' : [], 'HUMIDITY' : [], 'HUMIDITY_HIGH' : [], 'HUMIDITY_LOW' : [], 'LUX' : [], 'LUX_HIGH' : [], 'LUX_LOW' : [], 'UV' : [], 'UV_HIGH' : [], 'UV_LOW' : [], 'SOLAR_RADIATION' : [], 'SOLAR_RADIATION_HIGH' : [], 'SOLAR_RADIATION_LOW' : [], 'WIND_AVG' : [], 'WIND_GUST' : [], 'WIND_LULL' : [], 'WIND_DIR' : [], 'WIND_INTERVAL' : [], 'STRIKE_COUNT' : [], 'STRIKE_AVG_DISTANCE' : [], 'RECORD_COUNT' : [], 'BATTERY' : [], 'PRECIP_ACCUM_TODAY_LOCAL' : [], 'PRECIP_ACCUM_TODAY_LOCAL_FINAL' : [], 'PRECIP_MINS_TODAY_LOCAL' : [], 'PRECIP_MINS_TODAY_LOCAL_FINAL' : [], 'PRECIP_TYPE' : [], 'PRECIP_ANALYSIS_TYPE' : [] };

var fifteenMinuteTemp = [];
var fifteenMinuteEpoch = [];


{
	if(checkLocalStorage()){ // if local storage can be used in browser
		storedConfig = loadStoredConfig(storedConfig);
		if( checkURLParamsSettings() || !confirmSettings(storedConfig)){ // if settings have been requested or are missing
			toggleSettingsPage(true);
		}
		else
		{
			(async () => {
			config = await getWFConfig(storedConfig['wfPersonalToken'])  // get the config from the WF API
			updateUnitLabels(config['units']);
			document.title=config['public_name'];
			launchConsole(config); // launch the console
			})();
		}
	}
}


// check that browser local storage is available for use
function checkLocalStorage(){
	// confirm localStorage is available to store config
	if (storageAvailable('localStorage')) {
		return true;
	} else { // local storage not supported
		alert("Sorry, your browser does not allow local storage...");
		return false;
	}// end if
}

// get config from local storage
function loadStoredConfig(storedConfig){
	storedConfig = { 'wfPersonalToken':'' }; // stored in browser local storage

	// either read each defined key from storage or prompt user
	for (configKey in storedConfig){
		// if the value is already in local storage read from there
		if (localStorage.getItem(configKey)) {
			storedConfig[configKey] = localStorage.getItem(configKey);
			updateFormValue(configKey,storedConfig[configKey]);
		}
	}// end for

	return storedConfig;
}

function confirmSettings(storedConfig){
		confirmed = true;

		for (configKey in storedConfig){
			if (storedConfig[configKey]==""){
				confirmed=false;
			}
		}
		return confirmed;
}

function checkURLParamsSettings(){
	queryString = window.location.search;

	urlParams = new URLSearchParams(queryString);
	// check for url parameter to launch settings
	// e.g. https://www.wxconsole.in.net?settings
	if (urlParams.has('settings')){
		return true;
	}//end if
	else{
		// no settings param
		return false;
	}

}

function toggleSettingsPage(displaySettings){
	if(displaySettings){
		document.getElementById('settings').style.display = "block";
		document.getElementById('console').style.display = "none";
	}
	else{
		document.getElementById('settings').style.display = "none";
		document.getElementById('console').style.display = "grid";

	}
}

// send request to get station config using personal token
async function getWFConfig(wfPersonalToken){
	config={};
	config['wfPersonalToken']=wfPersonalToken;
	// request all station config
	fetchString="https://swd.weatherflow.com/swd/rest/stations?token="+wfPersonalToken;
	const response = await fetch(fetchString);
	const wfStationsJson = await response.json(); //extract JSON from the http response

	// add tempestID to config
	wfStationsJson['stations'][0]['devices'].forEach(function(device) {
		if(device['device_type']== "ST"){
			config['wfTempestID']=device['device_id'];
			//wfTempestID = device['device_id'];
		}
	});

	config['latitude']=wfStationsJson['stations'][0]['latitude'];
	config['longitude']=wfStationsJson['stations'][0]['longitude'];
//	latitude=wfStationsJson['stations'][0]['latitude'];
	//longitude=wfStationsJson['stations'][0]['longitude'];

	// get station_id & public_name from wf API

	for (const [key, value] of Object.entries(wfStationsJson['stations'][0])) {
		if(key=='station_id'){
			config['station_id'] = value;
			//station_id=value;}
		}
		if(key=='public_name'){
			config['public_name']=value;
			public_name=value;}
		}

	// use station_id to get units in use on station
	fetchString="https://swd.weatherflow.com/swd/rest/observations/station/"+config['station_id']+"?token="+wfPersonalToken;
	const stationResponse = await fetch(fetchString);
	const wfStationObs = await stationResponse.json();

	for (const [key, value] of Object.entries(wfStationObs)) {
	if(key=='station_units'){
		config['units'] = value;
	}}

	return config;

}// end getWFConfig

// to be main launch point of console if all requirements are met
function launchConsole(config){
		// hide settings html and show console grid
		toggleSettingsPage(false);
		initCanvas('wind');  // initialise the wind compass canvas

		//load scripts in order, waiting to make sure data has arrived
		loadScript('suncalc.js')

//		.then(() => loadScript('https://cdn.jsdelivr.net/npm/chart.js@2.8.0'))
//		.then(() => loadScript('https://cdn.jsdelivr.net/chartist.js/latest/chartist.min.js'))
		//.then(() => loadScript('https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.min.js'))
		.then(() => loadScript('wfparse.js'))
		.then(() => loadScript('wflowrest.js'))
		.then(() => loadScript('wflowsocket.js'))
		.then(() => populateSunRiseSet(config['latitude'],config['longitude']))
		.then(() => getDailySummaryObs(config))
		.then(() => getInitialDaily(config))
		.then(() => launchSockets(config['units']))



		.catch(() => console.error('Something went wrong.'))

}


/***********************************************
* Utility scripts
***********************************************/
async function populateSunRiseSet(latitude,longitude){
	let sunTimes = SunCalc.getTimes(new Date(), latitude, longitude);
	let sunriseStr = sunTimes.sunrise.getHours() + ':' + sunTimes.sunrise.getMinutes();
	let sunsetStr = sunTimes.sunset.getHours() + ':' + sunTimes.sunset.getMinutes();
	let solarNoonStr = sunTimes.solarNoon.getHours() + ':' + sunTimes.solarNoon.getMinutes();
	updateHTML('sunrise_time', sunriseStr);
	updateHTML('sunset_time', sunsetStr);
	updateHTML('solarnoon_time', solarNoonStr);
}

// update element HTML
function updateHTML(updateElement,value){
	if(document.getElementsByClassName(updateElement)){
		var getClass = document.getElementsByClassName(updateElement);
		for(i=0;i<getClass.length;i++){
			getClass[i].innerHTML = value;
		}
	}
}// end updateHTML

// insert known value into form field
function updateFormValue(updateElement,value){
	if(document.getElementById(updateElement)){
          document.getElementById(updateElement).value=value;

	}
}// end updateFormValue

// get a value from a form text box
function getFormValue(formID){
	if(document.getElementById(formID)){
          return document.getElementById(formID).value;
	}
}

// clear all browser stored config
function clearConfig(){
	for (configKey in config){
		localStorage.removeItem(configKey);
		updateFormValue(configKey,"");
	}
}

// save config key to browser local storage
function saveConfig(){
	for (configKey in storedConfig){
		value = getFormValue(configKey);
		localStorage.setItem(configKey, value);

	}
	//reload page after config saved
	window.location.replace(`${location.protocol}//${location.host}${location.pathname}`);
}



// function to load scripts in correct order
//const loadScript = src => {
function loadScript(src){
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.onload = resolve
    script.onerror = reject
    script.src = src
    document.head.append(script)
  })
}




/*
******************************************************************
Initialisation of storage

Local storage in browser is used to hold the required startup info
on Startup:
	Check that it is available (If not, exit)
	If values exist, read from there
	If values don't exist, prompt for the values
*******************************************************************
*/

// function to check availability of local storage for config
function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}





// utility function to fetch the variables from the CSS
function cssvar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}
// update elements from tempest obs
function updateValues(observation,index){

	updateHTML(tempestObsFields[index],unitConvert(observation,tempestObsFields[index]));
}

async function updateUnitLabels(units){

	for (unit in units){

		switch(unit){
			case 'units_temp':
				switch (units[unit]){
					case 'c': label="&degC";
					break;
					case 'f': label="&degF";
					break;
				}
			break;

			case 'units_wind':
				switch (units[unit]){
					case 'mps': label="m/s";
					break;
					case 'kph': label="km/h";
					break;
					default: label = units[unit];
				}
			break;

			case 'units_pressure':
				switch (units[unit]){
					case 'mb': label="mb";
						break;
					case 'hpa' : label='hpa';
						break;
					default: label = units[unit];



				}

			break;
			default:label="";


		}

		unitLabels[unit]=label;
		updateHTML(unit,label);

	}

}

function unitConvert(observation,type){

	switch(type){
		case 'air_temperature':
			switch(config['units']['units_temp']){
				case 'c' :

					return parseFloat(observation).toFixed(1);
					break;
				case 'f' :

					return parseFloat(Math.round(10*Number((observation*9/5)+32))/10).toFixed(1);
					break;
			}
			break;

		case 'wind_lull':
		case 'wind_avg'	:
		case 'wind_gust':
		case 'wind_speed':
			switch(config['units']['units_wind']){
				case 'mps' :
					return Math.round(10*observation)/10;
					break;
				case 'kph' :
					return Math.round(10*Number(observation*3.5999916767997199862))/10;
					break;
				case 'mph' :
					return Math.round(10*Number(observation*2.2369311202577))/10;;
					break;
				case 'kts' :
					return Math.round(10*Number(observation*1.94384))/10;
					break;
				case 'bft' :
					return beaufort(observation);
					break;
			}
		break;

		case 'sea_level_pressure':
		case 'station_pressure':

			switch(config['units']['units_pressure']){
				case 'mb':
				case 'hpa':
					return Math.round(10*observation)/10;
					break;
				case 'inhg':
					return Math.round(100*(observation/33.864))/100;
					break;

				case 'mmhg':
					return Math.round(100*observation/1.333)/100;
					break;

			}
			break;
		default:
			return observation;
	}


}


function cardinal(deg){
	 if (deg>11.25 && deg<=33.75){
    return "NNE";
  }else if (deg>33.75 && deg<=56.25){
    return "NE";
  }else if (deg>56.25 && deg<=78.75){
    return "ENE";
  }else if (deg>78.75 && deg<=101.25){
    return "E";
  }else if (deg>101.25 && deg<=123.75){
    return "ESE";
  }else if (deg>123.75 && deg<=146.25){
    return "SE";
  }else if (deg>146.25 && deg<=168.75){
    return "SSE";
  }else if (deg>168.75 && deg<=191.25){
    return "S";
  }else if (deg>191.25 && deg<=213.75){
    return "SSW";
  }else if (deg>213.75 && deg<=236.25){
    return "SW";
  }else if (deg>236.25 && deg<=258.75){
    return "WSW";
  }else if (deg>258.75 && deg<=281.25){
    return "W";
  }else if (deg>281.25 && deg<=303.75){
    return "WNW";
  }else if (deg>303.75 && deg<=326.25){
    return "NW";
  }else if (deg>326.25 && deg<=348.75){
    return "NNW";
  }else{
    return "N";
  }
}// end cardinal
// Beaufort Wind Force Scale based on data at https://www.rmets.org/resource/beaufort-scale
function beaufort(mps){
	kph=mps*3.6;
	if(kph <1)
		return 0;
	else if (kph < 6)
		return 1;
	else if (kph < 12)
		return 2;
	else if (kph < 20)
		return 3;
	else if (kph < 29)
		return 4;
	else if (kph < 38)
		return 5;
	else if (kph < 50)
		return 6;
	else if (kph < 62)
		return 7;
	else if (kph < 75)
		return 8;
	else if (kph < 89)
		return 9;
	else if (kph < 103)
		return 10;
	else if (kph < 118)
		return 11;
	else
		return 12;
}


beaufortWindForceScale = [
{Description:'Calm',Specification:'Smoke rises vertically'},
{Description:'Light Air',Specification:'Direction shown by smoke drift but not by wind vanes'},
{Description:'Light Breeze',Specification:'Wind felt on face; leaves rustle; wind vane moved by wind'},
{Description:'Gentle Breeze',Specification:'Leaves and small twigs in constant motion; light flags extended'},
{Description:'Moderate Breeze',Specification:'Raises dust and loose paper; small branches moved.'},
{Description:'Fresh Breeze',Specification:'Small trees in leaf begin to sway; crested wavelets form on inland waters.'},
{Description:'Strong Breeze',Specification:'Large branches in motion; whistling heard in telegraph wires; umbrellas used with difficulty.'},
{Description:'Near Gale',Specification:'Whole trees in motion; inconvenience felt when walking against the wind.'},
{Description:'Gale',Specification:'Twigs break off trees; generally impedes progress.'},
{Description:'Strong Gale',Specification:'Slight structural damage (chimney pots and slates removed).'},
{Description:'Storm',Specification:'Seldom experienced inland; trees uprooted; considerable structural damage'},
{Description:'Violent Storm',Specification:'Very rarely experienced; accompanied by widespread damage.'},
{Description:'Hurricane',Specification:'Devastation'}
];


// return hours and minutes string in "hh:mm" format from epoch time
function getHumanTimeHHMM(epoch){
		var d = new Date(epoch*1000);
		time = pad(d.getHours(),2)+":"+pad(d.getMinutes(),2);

	return time;
}

// properties for the wind needle
var needle = { base:15, height:33, degrees: 1, targetDegrees: 0, targetCardinal: "N",windSpeed:0,moving:0, direction:1, speed:3,bfDesc:"" }

// initialise canvas to size of parent
function initCanvas(canvasID){

	//get canvas
	let canvas = document.getElementById(canvasID);

	//get context
	let ctx = canvas.getContext('2d');

	function parentWidth(elem) {
		return elem.parentElement.clientWidth;
	}

	function parentHeight(elem) {
		return elem.parentElement.clientHeight;
	}

	// gets width and height of parent and sets canvas to match
	parentWidth=parentWidth(document.getElementById(canvasID));
	parentHeight=parentHeight(document.getElementById(canvasID));
	canvasWidth=parentWidth;
	canvasHeight=parentHeight;

	// scale canvas to match screen for sharpness
	scale = window.devicePixelRatio;
    canvas.style.width = canvasWidth + "px";
    canvas.style.height = canvasHeight + "px";
	canvas.width = canvasWidth*scale;
    canvas.height = canvasHeight*scale;
	ctx.scale(scale, scale);
	// now that canvas is initialised it can be drawn on
}


// draws the wind compass based on the values in needle
function drawWind(needle) {
	let canvas = document.getElementById('wind');
	//get context
	let wind = canvas.getContext('2d');
	// get properties of canvas
	width = Number(getComputedStyle(canvas).getPropertyValue("width").slice(0, -2));
	height = Number(getComputedStyle(canvas).getPropertyValue("height").slice(0, -2));

	// to find radius for gauge
	if(width >= height){
		size=height;
	}
	else{
		size=width;
	}

	// clear canvas
	wind.clearRect(0, 0, width, height); // clear canvas

// adjust dimensions based on canvas dimensions
	wind.lineWidth = size*0.04;
	gaugeRadius = (-wind.lineWidth-size*0.1) +size/2;
	windFontSize = size/10;
	wind.font = windFontSize + "px Arial";
	needle.base=size*0.04;
	needle.height = needle.base*3.2;

	// set colours from CSS
  	wind.fillStyle = cssvar('--page-text-colour');
	wind.strokeStyle = cssvar('--wind-gauge-colour');

	// print wind direction, speed and Beaufort description in centre of dial
	wind.textAlign = "center";
	wind.fillText(needle.targetCardinal,width/2,-0.2*windFontSize+height/2);
	wind.fillText(Math.round(unitConvert(needle.windSpeed,'wind_speed')*10)/10+" "+unitLabels['units_wind'],width/2,0.8*windFontSize+height/2);
	//wind.fillText(needle.bfDesc,width/2,1.3*windFontSize+height/2);

	// draw dial
	wind.beginPath();
  	wind.fillStyle = cssvar('--wind-needle-colour');
	wind.strokeStyle = cssvar('--wind-gauge-colour');
	wind.translate(width/2,height/2);
	wind.arc(0, 0, gaugeRadius, 0, Math.PI * 2); //draw outer arc
	wind.stroke();

	// draw needle
	wind.beginPath();
	wind.rotate(needle.degrees*Math.PI/180); //rotate to draw at current deg value
	wind.translate(0,-gaugeRadius-wind.lineWidth/2); // move to radius
	wind.lineTo(needle.base,0); 	// draw half of base line
	wind.lineTo(0,needle.height); 	// draw to point
	wind.lineTo(-needle.base,0);	// draw back to other end of base line
    wind.fill();					// close fill triangle

	wind.translate(0,gaugeRadius+wind.lineWidth/2); // move back to centre of canvas
	wind.rotate(-needle.degrees*Math.PI/180);		//rotate back to beginning
	wind.translate(-width/2,-height/2);				// move back to (0,0) ready for next animation

}

// updates values in needle then draws and will animate until target angle is met
function rotateWindNeedle(){
	// get direction to move compass in

	change = needle.targetDegrees-needle.degrees;	// difference between current angle and target
	if(change !=0){  // if there is a difference between current direction and new direction
		if( (( change + 360) % 360 > 180) && needle.moving==0){ //(clockwise, anti-clockwise whichever is closest)
			needle.direction = -1; // anti-clockwise
		}
		needle.moving=1; // to show that we've started animation
		needle.degrees = needle.degrees + needle.direction; // add/remove degree per animation loop

		// deal with 0/360 degree
		if (needle.degrees > 359)
			needle.degrees=0;
		if (needle.degrees < 0)
			needle.degrees=359;

		// draw the canvas then request next frame in animation
		drawWind(needle);
		requestAnimationFrame(rotateWindNeedle);
	}
	else{ // current and target are now the same, animation complete
		needle.moving=0;
		needle.direction=1;
	}
}

// updates date and time fields in HTML with human readable values
function updateDateTime(epoch){
		var d = new Date(epoch*1000);

		date = days[d.getDay()]+", "+d.getDate() + " "+months[d.getMonth()]+" "+d.getFullYear();
		time = pad(d.getHours(),2)+":"+pad(d.getMinutes(),2)+":"+pad(d.getSeconds(),2);
		updateHTML("obs_date",date);
		updateHTML("obs_time",time);
} // end updateDateTime

// pad leading zeros in numbers
function pad(n, len) {

    s = n.toString();
    if (s.length < len) {
        s = ('0000000000' + s).slice(-len);
    }

    return s;
 }

const days = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
];

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

// when browser resizes, run anything in here
function browserResize(){
	initCanvas('wind'); //need to get new size of canvas and redraw the wind compass
	drawWind(needle);
}
