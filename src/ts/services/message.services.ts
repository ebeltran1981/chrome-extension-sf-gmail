/*
Copyright AtlanticBT.
*/

import { ChromeMessage } from "../models/chrome.model";
import { ChromeMessageKeys } from "../tools/constants";
import { loadSforceFromCookie, loadSforceFromInit } from "./sforce.services";

namespace AtlanticBTApp {
    chrome.runtime.onMessageExternal.addListener((message: ChromeMessage<{}>, sender, sendResponse) => {
        switch (message.key) {
            case ChromeMessageKeys.LoadSforceFromInit:
                loadSforceFromInit();
                break;
            case ChromeMessageKeys.LoadSforceFromCookie:
                loadSforceFromCookie(message.data as chrome.cookies.Cookie);
                break;
        }
    });
}

export = AtlanticBTApp;
