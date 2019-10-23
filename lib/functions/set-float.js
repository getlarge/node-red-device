// name: set-float
// outputs: 1
try {
    const debug = env.get("debug");
    if (!msg || msg === null || !msg.payload) throw new Error("No input to parse");
    const resourceId = env.get("resource_id");
    if (!resourceId) throw new Error("no resource id set")
    const value = msg.payload;
    if (value === undefined || value === null) throw new Error("no sensor value found")
    if (debug) {
        console.log(`get-float for ${resourceId} :`, value)
    }
    if (typeof value === "string") {
        if (value === "1" || value === "true") {
            msg.payload = 1;
        } else if (value === "0" || value === "false") {
            msg.payload = 0;
        } else {
            msg.payload = Number(value); 
        }
    } else if (typeof value === "number") {
        msg.payload = value;
    } else if (typeof value === "boolean") {
        if (value === true) {
            msg.payload = 1;
        } else if (value === false) {
            msg.payload = 0;
        } 
    } else if (typeof value === "object" && value.type && value.data){
        msg.payload = Number(value.data.toString('utf-8'));
    } else if (Buffer.isBuffer(value)){
        msg.payload = Number(value.toString('utf-8'));
    } else if (value instanceof Array) {
        msg.payload = Buffer.from(value).toString('utf-8');
    } else throw new Error("no valid payload to parse");
    
    if (msg.payload === undefined) throw new Error("no payload");
    const precision = env.get("precision") || msg.sensor.resources["5701"] || null;
    const unit = env.get("unit");
    if (unit && unit !== null) {
        msg.unit = unit;
    }
    //msg.payload = Number(msg.payload);
    //if (precision && precision !== null) {
    //    msg.payload = msg.payload.toPrecision(precision)
    //}
    if (debug) {
        console.log(`set-float for ${resourceId} : ${msg.payload}`)
    }
    return msg;
} catch(error) {
    return null;
}