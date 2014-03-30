// This node.js program opens a text file in CSV format and reads it
// line by line.  Each line is parsed and converted to a Javascript object,
// with the key names determined by the column names in the first row.
// The object is written as a JSON formatted MQTT message to the host and
// topic specified.

var nopt = require('nopt');
var readline = require('readline');
var fs = require('fs');
var mqtt = require('mqtt');
var csv = require('csvrow');
var async = require('async');

// parse and remember command line arguments

var knownOpts = {
    "input" : String,
    'output' : String,
    "topic" : String,
    "verbose" : Boolean
};
var parsed = nopt(knownOpts);

if ((typeof parsed.input == 'undefined')
	|| (typeof parsed.output == 'undefined')
	|| (typeof parsed.topic == 'undefined')) {
    console.error(' Usage >%s %s %j', process.argv[0], process.argv[1],
	    knownOpts);
    process.exit(1);
}

var theSourceFile = parsed.input;
var theSinkBroker = parsed.output;
var theTopic = parsed.topic;
var isVerbose = (typeof parsed.verbose == 'undefined') ? false : parsed.verbose;

//Set local variables prior to beginning work

var isFirstLine = true;
var keys = [];
var dataValues = [];
var payload = {};

var theClientId = 'fusion-' + process.pid;

// attach to data source

var lines = fs.readFileSync(theSourceFile).toString().split('\r\n');

// attach to data sink

var ttSink = mqtt.createClient(1883, theSinkBroker, {
    "clientId" : theClientId
});

console
	.log(
		'Opened file %s for reading and MQTT broker %s as client %s for writing to topic %s.',
		theSourceFile, theSinkBroker, theClientId, theTopic);

// Now set up whatever we need in order to process the source data and send it
// to the sink.

function cbTest() {
    return lines.length > 0;
};

function cbTestIsTrue(done) {
    var line = lines.shift();
    if (isVerbose) {
	console.log(line);
    }
    if (line.length != 0) {
	if (isFirstLine) {
	    isFirstLine = false;
	    keys = csv.parse(line);
	} else {
	    dataValues = csv.parse(line);
	    for (idx = 0; idx < keys.length; idx++) {
		payload[keys[idx]] = Number(dataValues[idx]);
	    }
	    var serializedPayload = JSON.stringify(payload);
	    ttSink.publish(theTopic, serializedPayload);
	    if (isVerbose) {
		console.log("%s : %s", theTopic, serializedPayload);
	    }
	}
    }
    setTimeout(done, 500);
};

function cbTestIsFalse(err) {
    // no more lines present
    console.log('Read and transmitted entire file.  Now exiting.');
    process.exit(0);
};

async.whilst(cbTest, cbTestIsTrue, cbTestIsFalse);
