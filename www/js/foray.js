jQuery(document).ready(function() {
	$("#lat").html("48");
	$("#lon").html("-122");
	
	var broker = { hostname:"spark", port:"80"}
	
	
	client = new Messaging.Client(broker.hostname, Number(broker.port), "foray"+Math.floor((Math.random()*1000)+1));
	client.onConnectionLost = onConnectionLost;
	client.onMessageArrived = onMessageArrived;
	client.connect({onSuccess:onConnect});
	
});

function onConnect() {
  console.log("onConnect");
  client.subscribe("/raw/location/TPV");
};

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0)
    console.log("onConnectionLost:"+responseObject.errorMessage);
};

function onMessageArrived(message) {
  console.log("onMessageArrived"+message.payloadString);
  var gpsdMessage = JSON.parse(message.payloadString);
  $("#time").html(gpsdMessage.time);
  $("#lat").html(gpsdMessage.lat);
  $("#lon").html(gpsdMessage.lon);
  
  
};	
