/*
Copyright AtlanticBT.
*/

import { ChromeMessage } from "../models/chrome.model";
import { ChromeCookieCauseKeys, ChromeCookieKeys, ChromeMessageKeys, SforceValues } from "../tools/constants";
import { loadSforceFromCookie } from "./sforce.services";

namespace AtlanticBTApp {
    chrome.cookies.onChanged.addListener((changeInfo) => {
        if (changeInfo.removed && changeInfo.cause === ChromeCookieCauseKeys.ExpiredOverwrite) { // Removing
            if (changeInfo.cookie.name === ChromeCookieKeys.SforceSession && SforceValues.CookieDomainRegEx.test(changeInfo.cookie.domain)) {
                const messageResponse = new ChromeMessage(ChromeMessageKeys.LoadSforceFromCookie, changeInfo.cookie);
                loadSforceFromCookie(changeInfo.cookie);
            }
        } else if (!changeInfo.removed && changeInfo.cause === ChromeCookieCauseKeys.Explicit) { // Adding
            if (changeInfo.cookie.name === ChromeCookieKeys.SforceSession && SforceValues.CookieDomainRegEx.test(changeInfo.cookie.domain)) {
                const messageResponse = new ChromeMessage(ChromeMessageKeys.LoadSforceFromCookie, changeInfo.cookie);
                loadSforceFromCookie(changeInfo.cookie);
            }
        }
    });
}

export = AtlanticBTApp;
