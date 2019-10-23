// name: set-aloes-env
// outputs: 2
try {
    const storeType = env.get("store_type") || "memoryOnly";
    const processEnv = global.get("processEnv", storeType);
    if (!processEnv) throw new Error("process.env unavailable");
    const aloesHttpHost = flow.get("aloesHttpHost")
    if (aloesHttpHost) {
        processEnv.ALOES_HTTP_HOST = aloesHttpHost;
    }   
    const aloesHttpPort = flow.get("aloesHttpPort")
    if (aloesHttpPort) {
        processEnv.ALOES_HTTP_PORT = aloesHttpPort;
    }  
    const aloesMqttHost = flow.get("aloesMqttHost")
    if (aloesMqttHost) {
        processEnv.ALOES_MQTT_HOST = aloesMqttHost;
    }   
    const aloesMqttPort = flow.get("aloesMqttPort")
    if (flow.get("aloesMqttPort")) {
        processEnv.ALOES_MQTT_PORT = aloesMqttPort;
    }    
    const aloesUserEmail = flow.get("aloesUserEmail")
    if (flow.get("aloesUserEmail")) {
        processEnv.ALOES_USER_EMAIL = aloesUserEmail;
    }  
    const aloesUserPassword = flow.get("aloesUserPassword")
    if (flow.get("aloesUserPassword")) {
        processEnv.ALOES_USER_PASSWORD = aloesUserPassword;
    } 
    if (env.get("debug")) {
        return [msg,msg];
    }
    return [msg,null];
} catch(error) {
    return null;
}
