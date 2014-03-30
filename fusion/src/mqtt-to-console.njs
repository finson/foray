// This node.js program connects to a source MQTT broker, subscribes to a topic, then
// dumps the messages to the console.  It is intended as a troubleshooting tool and a
// skeleton for new fusion implementations.

// parse and remember command line arguments

var nopt = require("nopt");;
var knownOpts = { "input" : String, "topic" : String, "-verbose" : Boolean};
var parsed = nopt(knownOpts);

//console.log(parsed);

if (typeof parsed.input == 'undefined' || (typeof parsed.topic == 'undefined')) {
    console.error(' Usage >%s %s %j',process.argv[0],process.argv[1], knownOpts);
    process.exit(1);
}

var theSource = parsed.input;
var theTopic = parsed.topic;
var theClientId = 'fusion-'+process.pid+'-'+theSource;
var isVerbose = (typeof parsed.verbose == 'undefined') ? false : parsed.verbose;

// attach to data source

var mqtt = require('mqtt');
var ttSource = mqtt.createClient(1883,theSource,{"clientId":theClientId});

// attach to data sink
// Note:  In this console example, there's really no attaching to be done, but
// this is where it would go for more complicated sink.

// ...

console.log(' Connected to source broker on host '+theSource+ ' as client ' + theClientId +
		' for topic '+theTopic);

// Now set up whatever we need in order to process the source data and send it to the sink.

ttSource.on('message', function processMessage(topic, message, packet) {
    if (isVerbose) {
	console.log('Message packet received: %j',packet);
    }
    console.log('%s : %s',topic,message);
});

ttSource.subscribe(theTopic);

