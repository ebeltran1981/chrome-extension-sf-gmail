/*
Copyright AtlanticBT.
*/

import { ChromeMessage } from "../models/chrome.model";
import { ChromeMessageType } from "../tools/constants";

namespace AtlanticBTApp {
    window.addEventListener("message", (event) => {
        // We only accept messages from this window to itself [i.e. from any iframes]
        if (event.source != window) {
            return;
        }

        const message = event.data as ChromeMessage<{}>;
        if (message.type && (message.type === ChromeMessageType.WindowMessage)) {
            chrome.runtime.sendMessage(message); // send to rest of extension, or could just send event.data.payload
        } // else ignore messages seemingly not sent to yourself
    }, false);
}

export = AtlanticBTApp;
