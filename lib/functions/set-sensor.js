// name: set-sensor
// outputs: 2
try {
    if (msg.parts && msg.parts !== null) {
        const storeType = env.get("store_type") || "memory";
        //  console.log('updateInstance', deviceName);
        const method = msg.parts[1];
        const objectId = msg.parts[2];
        const nodeId = msg.parts[3];
        const sensorId = msg.parts[4];
        const resourceId = msg.parts[5];
        if (!method || !objectId || nodeId === undefined || sensorId === undefined || !resourceId) {
            return [null,new Error("missing params")];
        }
        let sensor;
        global.get(`sensor-${nodeId}-${sensorId}`, storeType, (err, res) => {
            if (err) throw err;
            sensor = res;
        });
        if (!sensor || sensor === null) {
            sensor = {};
        }
        if (!sensor.resources) {
            sensor.resources = {};
        }
        sensor.resources[resourceId] = msg.payload;
        sensor.type = Number(objectId);
        sensor.resource = Number(resourceId);
        sensor.value = msg.payload;
        if (method === "1") {
            console.log('updateInstance', sensorId, sensor.type, sensor.resource);
            global.set(`sensor-${nodeId}-${sensorId}`, sensor, storeType, (err) => {
                if(err) throw err;
            });    
        }
        msg.payload = sensor;
        const msg2 = {payload: sensor.value, topic: msg.topic, parts: msg.parts, method, objectId, nodeId, sensorId, resourceId};
        return [msg, msg2];
    }
    throw new Error("No msg.parts")
} catch(error){
    //  console.log('updateInstance : error', error);
    return null;
}
