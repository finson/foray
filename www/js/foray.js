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
    client.subscribe("/raw/LSM303D");
};

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0)
        console.log("onConnectionLost:"+responseObject.errorMessage);
};

function onMessageArrived(message) {
    console.log("onMessageArrived"+message.payloadString);
    var msgObject = JSON.parse(message.payloadString);
    if (msgObject.class === "TPV") {
        $("#timeLocationFix").html(msgObject.time);
        $("#lat").html(msgObject.lat);
        $("#lon").html(msgObject.lon);
    } else if (msgObject.class === "ATT") {
        $("#timeAttitudeFix").html(msgObject.time);
        $("#x_acceleration").html(msgObject.acc_x);
        $("#y_acceleration").html(msgObject.acc_y);
        $("#z_acceleration").html(msgObject.acc_z);
    }
};
