// This node.js program connects to a source MQTT broker, subscribes to a topic, 
// connects to a sink MQTT broker, then copies everything it receives from source to sink.


require('daemon')();
require('fs').writeFileSync('/var/run/gpsMQTTd.pid',process.pid);

var readline = require('readline');
var net = require('net');
var mqtt = require('mqtt');
var os = require('os');

var gpsdHost = "shadow";
var mqttHost = "spark";

// attach to data source

var gpsd = net.createConnection({"host": gpsdHost, "port" : 2947});

// prepare to write to data sink

var ttc = mqtt.createClient(1883,mqttHost,{"clientId":"gps-"+gpsdHost});
var topicRoot = "/raw/location/";
var excludedMessageClasses = [ "SKY" ];

var rl = readline.createInterface({ input:gpsd, output:null, terminal:false});

rl.on('line', function (msg) {
  var gpsdMessage = JSON.parse(msg);
  if (excludedMessageClasses.indexOf(gpsdMessage.class) < 0 ) {
    var topic = topicRoot + gpsdMessage.class;
    ttc.publish(topic,msg);
  }
});

var now = new Date();
console.log(now.toLocaleString()+" Node program gpsMQTT is connected to gpsd on "+gpsdHost+" and an MQTT broker on "+mqttHost+".  Action!");

gpsd.write('?WATCH={"class":"WATCH", "json":true};');
rl.resume();
