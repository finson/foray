// This node.js program opens a text file in CSV format and reads it
// line by line.  Each line is parsed and converted to a Javascript object,
// the key names determined by the column names in the first row.
// The object is written as a JSON formatted MQTT message to the host and
// topic specified.

var readline = require('readline');
var nopt = require('nopt');;
var fs = require('fs');
var mqtt = require('mqtt');

// parse and remember command line arguments

var knownOpts = { "input" : String, 'output': String, "topic" : String, "-verbose" : Boolean};
var parsed = nopt(knownOpts);

//console.log(parsed);

if ((typeof parsed.input == 'undefined') ||
	(typeof parsed.output == 'undefined') ||
	(typeof parsed.topic == 'undefined')) {
    console.error(' Usage >%s %s %j',process.argv[0],process.argv[1], knownOpts);
    process.exit(1);
}

var theSourceFile = parsed.input;
var theSinkBroker = parsed.output;
var theTopic = parsed.topic;
var isVerbose = (typeof parsed.verbose == 'undefined') ? false : parsed.verbose;

var theClientId = 'fusion-'+process.pid;

// attach to data source

var fd = fs.openSync(theSourceFile,'r');

// attach to data sink

var ttSink = mqtt.createClient(1883,theSinkBroker,{"clientId":theClientId});

console.log('Opened file %s for reading and MQTT broker %s as client %s for writing to topic %s.',
	theSourceFile,theSinkBroker,theClientId,theTopic);

// Now set up whatever we need in order to process the source data and send it to the sink.

var rl = readline.createInterface({ input:gpsd, output:null, terminal:false});

rl.on('line', function (msg) {
  var gpsdMessage = JSON.parse(msg);
  if (excludedMessageClasses.indexOf(gpsdMessage.class) < 0 ) {
    var topic = topicRoot + gpsdMessage.class;
    ttc.publish(topic,msg);
  }
});

ttSource.on('message', function processMessage(topic, message, packet) {
    if (isVerbose) {
	console.log('Message packet received: %j',packet);
    }
    console.log('%s : %s',topic,message);
});

ttSource.subscribe(theTopic);

