
// takes a single set of tempest observatons and processes it
const parseTempest = async (minuteObs) => {
	
	// process each temp value
	if (minuteObs['7'] !== null){
		// new max/min check and process
		if(minuteObs[7] > maximumTemp){
			maximumTemp = minuteObs[7];
			maximumTempEpoch = minuteObs[0];
		}
		
		if(minuteObs[7] < minimumTemp){
			minimumTemp = minuteObs[7];
			minimumTempEpoch = minuteObs[0];

		}
	}

	// take only the observation every 15 minutes for the chart
	// rounding because websocket obs don't come on the minute and the chart updates
	if((60* Math.round(minuteObs[0]/60)) % 900 == 0) {
		fifteenMinuteEpoch.push(getHumanTimeHHMM(minuteObs[0]));
		fifteenMinuteTemp.push(unitConvert(minuteObs[7],'air_temperature'));
    }

}// end parseTempest
 
 
function updateOnObservations(tempestObs){
	
	// from wind sample interval derive power mode
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
	
	

	// if it's a 15 minute interval, time for a daily chart update!
	// chart removed from console front screen
	/*if((60* Math.round(tempestObs[0]/60)) % 900 == 0){
		
		chartDayTemp.update();
	}*/
	// update all html IDs
	humidity=tempestObs[8];
	temp = tempestObs[7];
	wind = tempestObs[2];
	
	// calculate 'wind chill' using Canada formula (which appears to be in international use)
	// straight from https://weather.gc.ca/windchill/js/wind_chill.js
	wind = Number(wind*3.5999916767997199862); // convert m/s to km/h for formula
	
	if(wind>=5){
      windChill = 13.12 + (0.6215 * temp) - (11.37 * Math.pow(wind, 0.16)) + (0.3965 * temp * Math.pow(wind, 0.16));
    }
    else{
      windChill = parseFloat(temp) + ((((-1.59) + (0.1345*temp))/5) * wind);
    }
	windChill = Math.round(10*windChill)/10;
	updateHTML('canada_feels_like',unitConvert(windChill,'air_temperature'));
	
	updateHTML('power_mode',mode);
	updateHTML('beaufort_description',beaufortWindForceScale[beaufort(tempestObs[2])]['Description']);
	updateHTML('air_temperature_max',unitConvert(maximumTemp,'air_temperature'));
	updateHTML('air_temperature_max_time',getHumanTimeHHMM(maximumTempEpoch));
	updateHTML('air_temperature_min',unitConvert(minimumTemp,'air_temperature'));
	updateHTML('air_temperature_min_time',getHumanTimeHHMM(minimumTempEpoch));
	
	updateDateTime(tempestObs[0]);
	
	tempestObs.forEach(updateValues);
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
	
	rotateWindNeedle();
    updateHTML(rapidWindObsFields[index],item)

} //end parseRapidWind


//***************************
// MQTT
//***************************
/*
// Create a client instance
client = new Paho.MQTT.Client("test.mosquitto.org", 8080, "sside564");

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({onSuccess:onConnect});


// called when the client connects
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect");
  //client.subscribe("ssidewx/obs");
  //message = new Paho.MQTT.Message("Hello");
  //message.destinationName = "World";
  //client.send(message);
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:"+responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  console.log("onMessageArrived:"+message.payloadString);
}
*/
