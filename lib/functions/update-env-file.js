// name: update-env-file
// outputs: 1
try {
    const processEnv = global.get("processEnv");
    if (!processEnv) throw new Error("process.env not available");
    if (!processEnv.NODE_ENV) {
        msg.filename = "./.env";
    } else {
        msg.filename = `./deploy/.env_${processEnv.NODE_ENV}`;
    }
    msg.payload = `NODE_ENV=${processEnv.NODE_ENV}
NODE_RED_URL=${processEnv.NODE_RED_URL}
NODE_RED_HOST=${processEnv.NODE_RED_HOST}
NODE_RED_PORT=${processEnv.NODE_RED_PORT}
NODE_RED_ADMIN_ROOT=${processEnv.NODE_RED_ADMIN_ROOT}
NODE_RED_API_ROOT=${processEnv.NODE_RED_API_ROOT}
NODE_RED_UI_PATH=${processEnv.NODE_RED_UI_PATH}
NODE_RED_USER_DIR=${processEnv.NODE_RED_USER_DIR}
NODE_RED_USERNAME=${processEnv.NODE_RED_USERNAME}
NODE_RED_USERPASS=${processEnv.NODE_RED_USERPASS}
NODE_RED_PASSHASH=${processEnv.NODE_RED_PASSHASH}
NODE_RED_ADMIN_PASSHASH=${processEnv.NODE_RED_ADMIN_PASSHASH}
NODE_RED_SESSION_SECRET=${processEnv.NODE_RED_SESSION_SECRET}
NODE_RED_CREDENTIAL_SECRET=${processEnv.NODE_RED_CREDENTIAL_SECRET}
NODE_RED_STORE_TYPE=${processEnv.NODE_RED_STORE_TYPE}
ALOES_MQTT_HOST=${processEnv.ALOES_MQTT_HOST}
ALOES_MQTT_PORT=${processEnv.ALOES_MQTT_PORT}
ALOES_USER_EMAIL=${processEnv.ALOES_USER_EMAIL}
ALOES_USER_PASSWORD=${processEnv.ALOES_USER_PASSWORD}
DEVICE_DEVEUI=${processEnv.DEVICE_DEVEUI}
DEVICE_ID=${processEnv.DEVICE_ID}
DEVICE_APPKEY=${processEnv.DEVICE_APPKEY}
DEVICE_TYPE=${processEnv.DEVICE_TYPE}
DEVICE_NAME=${processEnv.DEVICE_NAME}
DEVICE_IN_PREFIX=${processEnv.DEVICE_IN_PREFIX}
DEVICE_OUT_PREFIX=${processEnv.DEVICE_OUT_PREFIX}
DEVICE_IN_TOPIC=${processEnv.DEVICE_IN_TOPIC}
SERVER_LOGGER_LEVEL=${processEnv.SERVER_LOGGER_LEVEL}
TUNNEL_URL=${processEnv.TUNNEL_URL}
GIT_REPO_SSH_URL=${processEnv.GIT_REPO_SSH_URL}`;
    return msg;
} catch(error){
    return null;
}
