

// **************************
// websocket for live updates
// **************************
async function launchSockets(units){
// create socket
let socket = new WebSocket("wss://ws.weatherflow.com/swd/data?token=" + config['wfPersonalToken'] );

// launch when socket opened
socket.onopen = function(e) {

  // request rapid wind updates
  var rapid ="{\"type\":\"listen_rapid_start\",\"device_id\": \"" + config['wfTempestID'] + "\", \"id\":\"Tempest\"}";
  socket.send(rapid);
  
  // request observation updates
  var listen ="{\"type\":\"listen_start\",\"device_id\": \"" + config['wfTempestID'] + "\", \"id\":\"Tempest\"}";
  socket.send(listen);
};

// function onmessage called when a websocket message arrives
socket.onmessage = function(event) {
	/*
	message = new Paho.MQTT.Message(event.data);
	message.destinationName = "ssidewx/obs";
	client.send(message);
	*/
	// **********************************		
	// parse data recieved from websocket
	// **********************************  
	var message  = JSON.parse(event.data);
 
	// if message type is tempest observations 'obs_st'
	if ( message['type']=='obs_st'){
		// extract array of observations from message and call parseObs function for each item in array 
		parseTempest(message['obs'][0])
		.then(() => updateOnObservations(message['obs'][0]))
		.then(() => getForecast())
	}

	else if (message['type']=='rapid_wind'){
		// extract observations from 'ob' array in rapid_wind message
		message['ob'].forEach(parseRapidWind);
	}
}// end websocket onmessage

socket.onclose = function(event) { 
	if (event.wasClean) { 
		alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
	} else {
		// e.g. server process killed or network down
		// event.code is usually 1006 in this case
		alert('[close] Connection died');
	}
};

socket.onerror = function(error) {
	alert(`[error] ${error.message}`);
};
}
// all initialised and ready to go
//rotateWindNeedle();
