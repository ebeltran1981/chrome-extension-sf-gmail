/*
Copyright AtlanticBT.
*/

import { ChromeMessage } from "../models/chrome.model";
import { ChromeMessageKeys, ChromeMessageType } from "../tools/constants";

namespace AtlanticBTApp {
    const message = new ChromeMessage(ChromeMessageKeys.GetExtensionId);
    chrome.runtime.sendMessage(message, (response) => {
        const webPageMessage = new ChromeMessage(ChromeMessageKeys.GetExtensionId, response, ChromeMessageType.WebPageMessage);
        webPageMessage.activator = "ContentScriptProxy";
        setTimeout(() => {
            window.postMessage(webPageMessage, "*");
        }, 5000);
    });

    window.addEventListener("message", (event) => {
        // We only accept messages from this window to itself [i.e. from any iframes]
        if (event.source != window) {
            return;
        }

        const windowMessage = event.data as ChromeMessage<{}>;
        if (windowMessage.type && (windowMessage.type === ChromeMessageType.ContentScriptMessage)) {
            chrome.runtime.sendMessage(windowMessage); // send to rest of extension, or could just send event.data.payload
        } // else ignore messages seemingly not sent to yourself
    }, false);
}

export = AtlanticBTApp;
