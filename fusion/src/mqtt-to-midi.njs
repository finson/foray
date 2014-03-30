// This node.js program connects to a source MQTT broker, subscribes to a topic, then
// uses the MQTT info to generate MIDI control signals.

// The incoming MQTT messages are assumed to be valid JSON objects.

var nopt = require("nopt");
var mqtt = require('mqtt');
var midi = require('midi');

// parse and remember command line arguments

var knownOpts = {
	"input" : String,
	"output" : String,
	"topic" : String,
	"verbose" : Boolean
	};
var parsed = nopt(knownOpts)

if ((typeof parsed.input == 'undefined')
	|| (typeof parsed.output == 'undefined')
	|| (typeof parsed.topic == 'undefined')) {
    console.error(' Usage >%s %s %j', process.argv[0], process.argv[1],
	    knownOpts);
    process.exit(1);
}

var theSourceBroker = parsed.input;
var theSinkMidi = parsed.output;
var theTopic = parsed.topic;
var isVerbose = (typeof parsed.verbose == 'undefined') ? false : parsed.verbose;

// Set local variables prior to beginning work

var theClientId = 'midi-' + process.pid;

// attach to data source

var ttSource = mqtt.createClient(1883,theSourceBroker,{"clientId":theClientId});

// attach to data sink

var midiOut = new midi.output();
var mCount = midiOut.getPortCount();
console.log('Port count: %d',mCount);
for (idx = 0; idx<mCount; idx++) {
	console.log(midiOut.getPortName(idx));
}
if (mCount < 0) {
	console.log('No available ports to write to.');
process.exit(0);
}

midiOut.openPort(0);

// Now set up whatever we need in order to process the source data and send it to the sink.

ttSource.on('message', function processMessage(topic, message, packet) {
    if (isVerbose) {
		console.log('Message packet received: %j',packet);
    }
    var obj = JSON.parse(message);
	midiOut.sendMessage([176,22,obj.time]);
});

ttSource.subscribe(theTopic);

console.log('MQTT midi is connected to source broker on '+theSourceBroker+' for topic '+theTopic);
