// name: set-topic
// outputs: 2
try {
    if (msg.topic && msg.topic !== null) {
        const t = msg.topic.split("/");
        const storeType = env.get("NODE_RED_STORE_TYPE") || "memoryOnly";
        const deviceName = env.get("DEVICE_NAME");
        if (!deviceName) throw new Error("no name found");
        let device;
        global.get(deviceName, storeType, (err, res)=> {
            if (err) throw err;
            device = res;
        });
        if (!device) throw new Error("no device found");
        const method = t[0];
        const objectId = t[1];
        const nodeId = t[2];
        const sensorId = t[3];
        const resourceId = t[4];
        msg.topic = `${device.devEui}${device.outPrefix}/${method}/${objectId}/${nodeId}/${sensorId}/${resourceId}`;
        msg.parts = msg.topic.split("/");
        if (env.get("debug")){
            return [msg,msg];
        }
        return [msg,null];  
    }
    throw new Error("No msg.topic");
} catch(error){
    //  console.log('error', error);
    return null;
}
