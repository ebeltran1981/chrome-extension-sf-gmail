/*
Copyright AtlanticBT.
*/

namespace AtlanticBTApp {
    chrome.runtime.onConnectExternal.addListener((mainPort) => {
        console.log("MAIN PORT: ", mainPort);

        mainPort.onMessage.addListener((message, localPort) => {
            console.log("MESSAGE: ", message, "LOCAL PORT: ", localPort);
            localPort.postMessage({text: "SENDING MESSAGE TO WEBPAGE"});
        });

        mainPort.onDisconnect.addListener((localPort) => {
            console.log("DISCONNECT PORT: ", localPort);
        });
    });
}

export = AtlanticBTApp;
