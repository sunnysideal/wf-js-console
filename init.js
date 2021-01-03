/*
Configuration scripts and initial variables
Making use of browser local storage for 
Personal Token
Device ID
Station Name

(Anything else that it needs...)
*/

/*
******************************************************************
Initialisation of storage

Local storage in browser is used to hold the required startup info
on Startup:
	Check that it is available (If not, exit)
	If values exist, read from there
	If values don't exist, prompt for the values
	
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

/*
******************************************************************
Initialise site data structures and utility functions

*/

// JSON to hold required station config

var config = { 'wfPersonalToken':'','wfTempestID':'' };

// confirm locaStorage is available
if (storageAvailable('localStorage')) {
	
	// check for url parameter to clear current config 
	// to do this add ?clear=true to the end of the url
	// e.g. http://www.myweather.con/index.html?clear=true
	
	queryString = window.location.search;
	urlParams = new URLSearchParams(queryString);
	if (urlParams.get('clear')=='true'){	
		// clear previous config values
		for (configKey in config){
			localStorage.removeItem(configKey);
		}//end for
	}//end if
	
	// either read each defined key from storage or prompt user
	for (configKey in config){
		// TODO: wrap everything up in a single form when required fields have been listed

		// if the value is already in local storage read from there
		if (localStorage.getItem(configKey)) {
			config[configKey]=localStorage.getItem(configKey);
		}
		else { // if not in local storage prompt and receive from user, then save to storage
			// ****************
			// TODO: Add a check that the connection works
			// ****************
			tempKeyValue = prompt("Please enter the value for " + configKey );
			localStorage.setItem(configKey, tempKeyValue);
		} // end if
	}// end for
	
	// set OK for storage flag
	checkStorage = true;
	
	
} else { // local storage not supported
    alert("Sorry, your browser does not allow local storage...");
	checkStorage = false;
	
}// end if


// site wide variables

// weatherflow observation field maps
var tempestObsFields=['time_epoch', 'wind_lull', 'wind_avg', 'wind_gust', 'wind_direction', 'wind_sample_interval', 'station_pressure', 'air_temperature', 'relative_humidity', 'illuminance', 'uv', 'solar_radiation', 'rain_accumulated', 'precipitation_type', 'lightning_strike_avg_distance', 'lightning_strike_count', 'battery', 'report_interval','local_daily_rain_accumm','rain_accumm_final','local_daily_rain_accum_final','precipitation_analysis_type'];
var rapidWindObsFields=['time_epoch','wind_speed','wind_direction'];
// for when bucket = 1440 minutes, different format from WF rest API
var obsSummaryFields=[ 'TIMESTAMP', 'PRESSURE', 'PRESSURE_HIGH','PRESSURE_LOW','TEMP','TEMP_HIGH','TEMP_LOW','HUMIDITY', 'HUMIDITY_HIGH', 'HUMIDITY_LOW', 'LUX', 'LUX_HIGH', 'LUX_LOW', 'UV', 'UV_HIGH', 'UV_LOW', 'SOLAR_RADIATION', 'SOLAR_RADIATION_HIGH', 'SOLAR_RADIATION_LOW', 'WIND_AVG', 'WIND_GUST', 'WIND_LULL', 'WIND_DIR', 'WIND_INTERVAL', 'STRIKE_COUNT', 'STRIKE_AVG_DISTANCE', 'RECORD_COUNT', 'BATTERY', 'PRECIP_ACCUM_TODAY_LOCAL', 'PRECIP_ACCUM_TODAY_LOCAL_FINAL', 'PRECIP_MINS_TODAY_LOCAL', 'PRECIP_MINS_TODAY_LOCAL_FINAL', 'PRECIP_TYPE', 'PRECIP_ANALYSIS_TYPE']; 
var wspeed = [];
// custom derived fields map
var derivedFields=['power_mode','obs_time'];

// utility function to fetch the variables from the CSS
function cssvar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}
// update elements from tempest obs
function updateObsArray(observation,index){
	updateHTML(tempestObsFields[index],observation);
}

function updateHTML(updateElement,value){
	if(document.getElementById(updateElement)){
		document.getElementById(updateElement).innerHTML = value;
	}
}// end updateHTML

function cardinal(deg){
	 if (deg>11.25 && deg<=33.75){
    return "NNE";
  }else if (deg>33.75 && deg<=56.25){
    return "ENE";
  }else if (deg>56.25 && deg<=78.75){
    return "E";
  }else if (deg>78.75 && deg<=101.25){
    return "ESE";
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

function initWind(){
		//get DPI
	let dpi = window.devicePixelRatio;
	
	//get canvas
	let canvas = document.getElementById('wind');
	//get context
	let wind = canvas.getContext('2d');

/*
	function fix_dpi() {
		//get CSS height
		//the + prefix casts it to an integer
		//the slice method gets rid of "px"
		//computedStyles = getComputedStyle(canvas);
		/*
for (var i=0; i<computedStyles.length; i++)
{        
    console.log( computedStyles[i] + " " + computedStyles.getPropertyValue(computedStyles[i]));
    
}
		let style_height = getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
		//get CSS width
		let style_width = getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
		//scale the canvas
		canvas.setAttribute('height', style_height * dpi);
		canvas.setAttribute('width', style_width * dpi);
	}// end fix-dpi
*/
//	fix_dpi();
/*  
	width = getComputedStyle(canvas).getPropertyValue("width").slice(0, -2)*dpi;
	height = getComputedStyle(canvas).getPropertyValue("height").slice(0, -2)*dpi;
*/	
//https://www.geeksforgeeks.org/how-to-sharpen-blurry-text-in-html5-canvas/

	//width = getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
	//height = getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
	//console.log(width+" "+height);
	function parentWidth(elem) {
    return elem.parentElement.clientWidth;
}
	function parentHeight(elem) {
    return elem.parentElement.clientHeight;
}

width=parentWidth(document.getElementById('wind'));
height=parentHeight(document.getElementById('wind'));
	if(width>height)
		size=height;
	else
		size=width;
	       
		   var scale = window.devicePixelRatio;
        canvas.style.width = size + "px"; 
        canvas.style.height = size + "px"; 
		canvas.width = size*scale; 
        canvas.height = size*scale; 
		console.log(width + " " +height+" "+scale);
		        
		wind.scale(scale, scale);
  
  drawWind(needle);
	
	
}

function drawWind(needle) {
	let canvas = document.getElementById('wind');
	//get context
	let wind = canvas.getContext('2d');

	width = getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
	height = getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);		


	 

	
	console.log("width:height "+width+" "+height);
	
	wind.clearRect(0, 0, width, height); // clear canvas
	
	wind.lineWidth = height*0.04;
	gaugeRadius = (-wind.lineWidth-height*0.1) +height/2;
	windFontSize = height/10;
	wind.font = windFontSize + "px Arial";
	
	needle.base=height*0.04;
	needle.height = needle.base*3.5;

  	wind.fillStyle = cssvar('--page-text-colour');
	wind.strokeStyle = cssvar('--wind-gauge-colour');
  	wind.textAlign = "center";
	
	// print wind direction and speed in centre of dial
	wind.fillText(needle.targetCardinal,width/2,-1.3*windFontSize+height/2);
	wind.fillText(Math.round(needle.windSpeed*10)/10+" m/s",width/2,height/2);
	wind.fillText(needle.bfDesc,width/2,1.3*windFontSize+height/2);
	
	// draw dial
	wind.beginPath();
  	wind.fillStyle = cssvar('--wind-needle-colour');
	wind.strokeStyle = cssvar('--wind-gauge-colour');
	wind.translate(width/2,height/2);
	wind.arc(0, 0, gaugeRadius, 0, Math.PI * 2); //draw outer arc
	wind.stroke();
  
	// draw needle
	wind.beginPath();
	wind.rotate(needle.degrees*Math.PI/180); //rotate to draw at current deg
	wind.translate(0,-gaugeRadius-wind.lineWidth/2); // move to radius
	wind.lineTo(needle.base,0);
	wind.lineTo(0,needle.height);
	wind.lineTo(-needle.base,0);
    wind.fill();
	
	wind.translate(0,gaugeRadius+wind.lineWidth/2);
	wind.rotate(-needle.degrees*Math.PI/180);//rotate back to beginning
	wind.translate(-width/2,-height/2);
	
}

function rotateWindNeedle(){
	// get direction to move compass in 
	change = needle.targetDegrees-needle.degrees;
	if(change !=0){  // if there is a difference between current direction and new direction
		if( (( change + 360) % 360 > 180) && needle.moving==0){ //(clockwise, anti-clockwise whichever is closest)
			needle.direction = -1; // anti-clockwise
		}
		needle.moving=1; // to show that we've started animation
		needle.degrees = needle.degrees+needle.direction; // add/remove degree per animation loop
		// deal with 0/360 degree
		if (needle.degrees > 359)
			needle.degrees=0;
		if (needle.degrees < 0)
			needle.degrees=359;
		// draw the canvas
		drawWind(needle);
		requestAnimationFrame(rotateWindNeedle);
	}
	else{ // current and target are now the same, animation complete
		needle.moving=0;
		needle.direction=1;
	}
}

function updateDateTime(epoch){
		var d = new Date(epoch*1000);
		
		date = days[d.getDay()]+", "+d.getDate() + " "+months[d.getMonth()]+" "+d.getFullYear();
		time = pad(d.getHours(),2)+":"+pad(d.getMinutes(),2)+":"+pad(d.getSeconds(),2);
		updateHTML("obs_date",date);
		updateHTML("obs_time",time);
} // end updateDateTime

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

function browserResize(){
	initWind();
}

