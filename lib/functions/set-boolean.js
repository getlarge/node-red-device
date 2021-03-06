// name: set-boolean
// outputs: 1
try {
    const debug = env.get("debug");
    if (!msg || msg === null || !msg.payload) throw new Error("No input to parse");
    const resourceId = env.get("resource_id");
    if (!resourceId) throw new Error("no resource id set");
    const value = msg.payload;
    if (debug) {
        console.log(`get-boolean for ${resourceId} : ${typeof value}`);
    }
    if (typeof value === "string") {
        msg.payload = value; 
    } else if (typeof value === "number") {
        msg.payload = value.toString(); 
    } else if (typeof value === "boolean") {
        msg.payload = value; 
    } else if (typeof value === "object" && value.type && value.data){
        //  msg.payload = value.data.toString('utf-8');
        msg.payload = Buffer.from(value.data).toString('utf-8');
    } else if (Buffer.isBuffer(value)){
        msg.payload = value.toString('utf-8');
    } else if (value instanceof Array) {
        msg.payload = Buffer.from(value).toString('utf-8');
    } else {
        throw new Error("No value found");
    }
    if (msg.payload === "true" || msg.payload === "1" || msg.payload === 1) {
        msg.payload = true;
    } else if (msg.payload === "false" || msg.payload === "0" || msg.payload === 0) {
        msg.payload = false;
    }
    if (debug) {
        console.log(`set-boolean for ${resourceId} : ${msg.payload}`);
    }
    return msg;
} catch(error) {
    return null;
}