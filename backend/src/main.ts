import OBSWebSocket from "npm:obs-websocket-js@4";

const obs = new OBSWebSocket();

obs.connect({ address: "172.30.0.119:3002", password: "test" });
// Request without data@
//const { currentProgramSceneName } = await obs.call("GetCurrentProgramScene");

console.log(currentProgramSceneName);
