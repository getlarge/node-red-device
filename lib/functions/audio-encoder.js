// name: encoder
// outputs: 1
const nodeLame = global.get("nodeLame");

if (!nodeLame) return;
const Lame = nodeLame.Lame;
const audioFileBuffer = msg.payload;

const encoder = new Lame({
    "output": "buffer",
    "bitrate": 128
}).setBuffer(audioFileBuffer);
 
encoder.encode()
    .then(() => {
        msg.payload = encoder.getBuffer();
        msg.filename = "./public/sounds/record.mp3";
        node.send(msg);
    })
    .catch((error) => {
        // Something went wrong
    });

console.log('ENCODED ?', encoder.getStatus());
