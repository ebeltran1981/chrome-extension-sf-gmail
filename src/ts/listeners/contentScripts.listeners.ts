/*
Copyright AtlanticBT.
*/

import { ChromeMessageRequest } from "../models/chrome.model";
import { ChromeMessageKeys } from "../tools/constants";

namespace AtlanticBTApp {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        debugger;
        switch (message.key) {
            case ChromeMessageKeys.LoadSforce:
                break;
            default:
                break;
        }
    });
}

export = AtlanticBTApp;
