var http = require('http');
var faye = require('faye');
var fs   = require('fs');
var mqtt = require('mqtt');

var pagename = "panview.html";

// Handle non-Bayeux requests

function onRequest(request,response) {
console.log("New request for "+request.url);
response.writeHead(200, {'Content-Type': 'text/html'});
response.write(pageData);
response.end();

console.log("Response complete.");
}

//--------------------------------------------

// Read the only page we serve into memory

var pageData = fs.readFileSync(pagename,"utf8");

var server = http.createServer(onRequest);
var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});
bayeux.attach(server);

// get ready to listen to the telemetry transport layer for interesting info

var path = "/raw/loc";
ttc = mqtt.createClient();
ttc.subscribe(path);

console.log("Viewgen is subscribed to MQTT stream "+path);

ttc.on('message', function (topic, message) {
  console.log("Viewgen received MQTT message "+ topic +": "+message);
  bayeux.getClient().publish('/raw/text',message);
  console.log("Viewgen retransmitted as Faye message "+"/raw/text: "+message);
});

server.listen(8000);
