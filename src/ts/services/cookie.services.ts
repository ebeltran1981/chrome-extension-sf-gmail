/*
Copyright AtlanticBT.
*/

import { ChromeMessage } from "../models/chrome.model";
import { ChromeCookieCauseKeys, ChromeMessageKeys, SforceKeys, SforceValues } from "../tools/constants";
import { sendMessageCurrentTab } from "./message.services";

namespace AtlanticBTApp {
    chrome.cookies.onChanged.addListener((changeInfo) => {
        if (changeInfo.removed && changeInfo.cause === ChromeCookieCauseKeys.ExpiredOverwrite) { // Removing
            if (changeInfo.cookie.name === SforceKeys.SessionCookie && SforceValues.CookieDomainRegEx.test(changeInfo.cookie.domain)) {
                const messageResponse = new ChromeMessage(ChromeMessageKeys.ClearSforceConnection, changeInfo.cookie);
                sendMessageCurrentTab(messageResponse);
            }
        } else if (!changeInfo.removed && changeInfo.cause === ChromeCookieCauseKeys.Explicit) { // Adding
            if (changeInfo.cookie.name === SforceKeys.SessionCookie && SforceValues.CookieDomainRegEx.test(changeInfo.cookie.domain)) {
                const messageResponse = new ChromeMessage(ChromeMessageKeys.SforceSessionCookie, changeInfo.cookie);
                sendMessageCurrentTab(messageResponse);
            }
        }
    });
}

export = AtlanticBTApp;
