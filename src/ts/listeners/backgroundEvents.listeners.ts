/*
Copyright AtlanticBT.
*/

import { ChromeMessage } from "../models/chrome.model";
import { ChromeMessageType } from "../tools/constants";

namespace AtlanticBTApp {
    window.addEventListener("message", (event) => {
        if (event.source != window) {
            return;
        }

        const webPageMessage = event.data as ChromeMessage<any>;
        if (webPageMessage.type && (webPageMessage.type === ChromeMessageType.BackgroundMessage)) {
            switch (webPageMessage.key) {
                default:
                    break;
            }
        }
    }, false);
}

export = AtlanticBTApp;
