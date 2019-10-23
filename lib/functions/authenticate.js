// name: authenticate
// outputs: 1

let protocol = 'http';
if (env.get("ALOES_HTTP_SECURE")) {
    protocol = 'https';
}
const serverHost = env.get("ALOES_HTTP_HOST") || "localhost";
const serverPort = env.get("ALOES_HTTP_PORT") || "localhost";
const apiRoot = env.get("ALOES_HTTP_API_ROOT") || "/api";
const apiKey =  env.get("DEVICE_APPKEY");
const devEui =  env.get("DEVICE_DEVEUI");
const deviceId =  env.get("DEVICE_ID");
const baseUrl = `${protocol}://${serverHost}:${serverPort}${apiRoot}`;
msg.url = `${baseUrl}/Devices/authenticate`;
msg.method = "POST";
msg.payload = {deviceId, apiKey};
// msg.headers = {apikey: apiKey, deveui: devEui};
// msg.headers = {apiKey, devEui};

return msg;