// name: set-device-env
// outputs: 2
try {
    const storeType = env.get("store_type") || "memoryOnly";
    const processEnv = global.get("processEnv", storeType);
    if (!processEnv) throw new Error("process.env unavailable");
    const deviceDevEui = flow.get("deviceDevEui");
   if (deviceDevEui) {
        processEnv.DEVICE_DEVEUI = deviceDevEui;
    } 
    const deviceId = flow.get("deviceId");
    if (deviceId) {
        processEnv.DEVICE_ID = deviceId;
    }
    const deviceAppKey = flow.get("deviceAppKey");
    if (deviceAppKey) {
        processEnv.DEVICE_APPKEY = deviceAppKey;
    }
    const deviceType = flow.get("deviceType");
    if (deviceType) {
        processEnv.DEVICE_TYPE = deviceType;
    }
    const deviceName = flow.get("deviceName");
    if (deviceName) {
        processEnv.DEVICE_NAME = deviceName;
    }
    // ALOES - MQTT CONFIG
    const deviceInPrefix = flow.get("deviceInPrefix");
    if (deviceInPrefix) {
        processEnv.DEVICE_IN_PREFIX = deviceInPrefix;
    }
    const deviceOutPrefix = flow.get("deviceOutPrefix");
    if (deviceOutPrefix) {
        processEnv.DEVICE_OUT_PREFIX = deviceOutPrefix;
    }
    const deviceInTopic = flow.get("deviceInTopic");
    if (deviceInTopic) {
        processEnv.DEVICE_IN_TOPIC = deviceInTopic;
    }
    if (env.get("debug")) {
        return [msg,msg];
    }
    return [msg,null];
}catch(error){
    return error;
}
