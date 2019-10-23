// name: parse-topic
// outputs: 2
msg.parts = msg.topic.split("/");
msg.method = msg.parts[1];
msg.objectId = msg.parts[2];
msg.nodeId = msg.parts[3];
msg.sensorId = msg.parts[4];
msg.resourceId = msg.parts[5];

if (env.get("debug")) {
    return [msg,msg];
}
return [msg,null];