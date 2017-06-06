/*
Copyright AtlanticBT.
*/

import { ChromeMessage } from "../models/chrome.model";
import { ChromeMessageKeys, ChromeMessageType } from "../tools/constants";

namespace AtlanticBTApp {
    window.addEventListener("message", (event) => {
        if (event.source != window) {
            return;
        }

        const windowMessage = event.data as ChromeMessage<{}>;
        if (windowMessage.type && (windowMessage.type === ChromeMessageType.ContentScriptMessage)) {
            switch (windowMessage.key) {
                case ChromeMessageKeys.GetExtensionId:
                    const eIdMessage = new ChromeMessage(ChromeMessageKeys.GetExtensionId);
                    chrome.runtime.sendMessage(eIdMessage, (response) => {
                        const webPageMessage = new ChromeMessage(ChromeMessageKeys.GetExtensionId, response, ChromeMessageType.WebPageMessage);
                        window.postMessage(webPageMessage, "*");
                    });
                    break;
                default:
                    chrome.runtime.sendMessage(windowMessage);
                    break;
            }
        }
    }, false);
}

export = AtlanticBTApp;
