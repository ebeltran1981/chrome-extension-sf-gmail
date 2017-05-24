/*
Copyright AtlanticBT.
*/

import { ChromeMessageRequest, ChromeMessageResponse, ChromeMessageResponseTypeEnum } from "../models/chrome.model";
import { ChromeCookieCauseKeys, ChromeMessageKeys, SforceKeys, SforceValues } from "../tools/constants";
import { createNotification } from "../tools/notifications";

namespace AtlanticBTApp {
    chrome.runtime.onConnectExternal.addListener((port) => {
        // todo
    });

    chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
        switch (message.key) {
            case ChromeMessageKeys.CreateNotification:
                const nId = createNotification(message.data);
                sendResponse(nId);
                break;
            case ChromeMessageKeys.LoadSforce:
                debugger;
                chrome.cookies.get({ url: SforceValues.FullCookieDomain, name: SforceKeys.SessionCookie }, (cookie) => {
                    debugger;
                    const cookieMessage = new ChromeMessageRequest(ChromeMessageKeys.LoadSforce, cookie);
                    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                        debugger;
                        chrome.tabs.sendMessage(tabs[0].id, cookieMessage);
                    });
                });
                break;
            default:
                break;
        }
    });

    chrome.cookies.onChanged.addListener((changeInfo) => {
        // This typically will run if the user logout thru the Salesforce extension.
        if (changeInfo.removed && changeInfo.cause === ChromeCookieCauseKeys.ExpiredOverwrite) {
            if (changeInfo.cookie.name === SforceKeys.SessionCookie && changeInfo.cookie.domain === SforceValues.CookieDomain) {
                const response = new ChromeMessageResponse(ChromeMessageResponseTypeEnum.logoutExtension, changeInfo.cookie);
                // todo: do something with the response
            }
        }

        // This typically will run if the user login thru the Salesforce extension.
        if (!changeInfo.removed && changeInfo.cause === ChromeCookieCauseKeys.Explicit) {
            if (changeInfo.cookie.name === SforceKeys.SessionCookie && changeInfo.cookie.domain === SforceValues.CookieDomain) {
                const response = new ChromeMessageResponse(ChromeMessageResponseTypeEnum.loginExtension, changeInfo.cookie);
                // todo: do something with the response
            }
        }
    });
}

export = AtlanticBTApp;
