
// parseDaily takes a single set of observatons and processes it
const parseTempest = async (minuteObs) => {
//function parseTempest(minuteObs){
	// process each temp value
	if (minuteObs['7'] !== null){
		
		
		if(minuteObs[7] > maximumTemp){
			maximumTemp = minuteObs[7];
			maximumTempEpoch = minuteObs[0];
			updateHTML('air_temperature_max',maximumTemp.toFixed(1));
			updateHTML('air_temperature_max_time',getHumanTimeHHMM(maximumTempEpoch));
			
		}
		
		if(minuteObs[7] < minimumTemp){
			minimumTemp = minuteObs[7];
			minimumTempEpoch = minuteObs[0];
			updateHTML('air_temperature_min',minimumTemp.toFixed(1));
			updateHTML('air_temperature_min_time',getHumanTimeHHMM(minimumTempEpoch));
		}
	}

	  // take only the observation every 15 minutes for the chart
	  // rounding because websocket obs don't come on the minute and the chart updates

	  if((60* Math.round(minuteObs[0]/60)) % 900 == 0) {
		//fifteenMinuteObs.push({time:getHumanTimeHHMM(minuteObs[0]),temp:minuteObs[7]});
//console.log("15 minute obs "+ getHumanTimeHHMM(minuteObs[0]));
		fifteenMinuteEpoch.push(getHumanTimeHHMM(minuteObs[0]));
		        fifteenMinuteTemp.push(minuteObs[7]);
        }
	  

 }// end parseTempest
 
 
 /*
 
// function to parse observations
function parseObs(item,index){
	
	switch(tempestObsFields[index]){
	
	// from wind_sample_interval create derived field power_mode
	case 'wind_sample_interval':
		
		// from wind sample interval update power mode
		switch (item){
			case 3:
				mode = 0;
				break;
			case 6:
				mode = 1;
				break;
			case 60:
				mode = 2;
				break;
			default:
	 			mode  = 3;
				break;
		}// end switch for power mode
		
		// wind is derived so additional update of  HTML
		if(document.getElementById("power_mode")){
			document.getElementById("power_mode").innerHTML = mode;
		}//end if
		
		break; // break wind_sample_interval

	case 'time_epoch':  // create human readable date format (currently UTC)
		updateDateTime(item);
		break;

	case 'air_temperature':
	// should check if this is greater than max, or less than min and update if it is
		break; 

	}//end observation switch
	
	// update all elements in page
    	if(document.getElementById(tempestObsFields[index]))
	{
		document.getElementById(tempestObsFields[index]).innerHTML = item;
	}// endif
}// end parse observations
*/

function updateElement(item,index){
		// update page HTML
		// if the obs id exists in an element
    	if(document.getElementById(tempestObsFields[index]))
	{
		document.getElementById(tempestObsFields[index]).innerHTML = item;
	}// endif
	

}

function updateOnObservations(tempestObs){
	
		console.log("updating...");
		// from wind sample interval update power mode
		switch (tempestObs[5]){
			case 3:
				mode = 0;
				break;
			case 6:
				mode = 1;
				break;
			case 60:
				mode = 2;
				break;
			default:
	 			mode  = 3;
				break;
		}// end switch for power mode
		
		// wind is derived so additiona update of  HTML
		updateHTML("power_mode",mode);
		
		// human readable date update
		updateDateTime(tempestObs[0]);
			// if time for a daily chart update!
	if(tempestObs[0] % 900 == 0){
		console.log("Updating 15 min charts");
		drawTodayCharts();
	}
	
	// update all html IDs
		tempestObs.forEach(updateElement);
		

	
	
	
}


function parseRapidWind(item, index){

switch(rapidWindObsFields[index]){
case 'time_epoch':
        updateDateTime(item);
        break;
case 'wind_direction':

		needle.targetDegrees=item;
		needle.targetCardinal = cardinal(item);
		break;
case 'wind_speed':
		needle.windSpeed=item;
		break;

}
		loop();
        if(document.getElementById(rapidWindObsFields[index]))
        {
        

                document.getElementById(rapidWindObsFields[index]).innerHTML = item;
        }
		


		


}

function updateDateTime(epoch){
		var d = new Date(epoch*1000);
		
		date = days[d.getDay()]+", "+d.getDate() + " "+months[d.getMonth()]+" "+d.getFullYear();
		time = pad(d.getHours(),2)+":"+pad(d.getMinutes(),2)+":"+pad(d.getSeconds(),2);
		if(document.getElementById("obs_date"))
        {
            document.getElementById("obs_date").innerHTML = date;
        }
		if(document.getElementById("obs_time"))
        {
            document.getElementById("obs_time").innerHTML = time;
        }
}



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

function updateHTML(updateElement,value){
			if(document.getElementById(updateElement)){
			document.getElementById(updateElement).innerHTML = value;
}
}


