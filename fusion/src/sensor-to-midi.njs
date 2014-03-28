// This node.js program connects to a source MQTT broker, subscribes to a topic, then
// dumps the messages to the console.  It is intended as a troubleshooting tool and a
// skeleton for new fusion implementations.

//require('daemon')();
//require('fs').writeFileSync('/var/run/gpsMQTTd.pid',process.pid);

// all of the 
var mqtt = require('mqtt');

// parse command line arguments

var nopt = require("nopt");;
var knownOpts = { "input" : String, "output" : String, "topic" : String, "verbose" : Boolean};
var parsed = nopt(knownOpts)
console.log(parsed)

var theSource = parsed.input;
var theSink = parsed.output;
var theTopic = parsed.topic;

// attach to data source

var ttSource = mqtt.createClient(1883,theSource,{"clientId":"pipe-"+theSource+"-"+theSink});

// attach to data sink

var ttSink = mqtt.createClient(1883,theSink,{"clientId":"pipe-"+theSource+"-"+theSink});

ttSource.on('message', function(topic, message) {
	ttSink.publish(topic,message);
	if (parsed.verbose) {
		console.log(topic+" : "+message);
	}
});

ttSource.subscribe(theTopic);

var now = new Date();
console.log(now.toLocaleString()+" MQTT pipe is connected to source broker on "+theSource+
		" and sink broker on "+theSink+" for topic "+theTopic);
