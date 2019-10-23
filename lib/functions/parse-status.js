// name: parse-status
// outputs: 1
try {
    let status = false;
    msg.device = {};
    msg.device.name = env.get("DEVICE_NAME");
    if (msg.status && msg.status.text && msg.status.text.startsWith("node-red:common.status.")) {
        if (msg.status.text.endsWith("connected")) {
            msg.device.status = true;
        } else if (msg.status.text.endsWith("disconnected")) {
            msg.device.status = false;
        }
    }
    const prevConnStatus = flow.get("conn_status");
    if (!msg.device.status || msg.device.status !== prevConnStatus) {
        // change Client Id
        const devEui = env.get("DEVICE_DEVEUI");
        const clientId = `${devEui}-${Math.random().toString(16).substr(2, 8)}`;
        flow.set("client-id", clientId);
        const processEnv = global.get("processEnv");
        if (processEnv) processEnv.DEVICE_CLIENT_ID = clientId;
    } else {
        const clientId = flow.get("client-id") || env.get("DEVICE_DEVEUI");
        const processEnv = global.get("processEnv");
        if (processEnv) processEnv.DEVICE_CLIENT_ID = clientId;
    }
    flow.set("conn_status", msg.device.status);
    return msg;
} catch(error) {
    return null;
}