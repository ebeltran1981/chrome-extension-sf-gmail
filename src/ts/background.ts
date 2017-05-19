/*
Copyright AtlanticBT.
*/

import { ChromeMessageRequest, ChromeMessageResponse, ChromeMessageResponseTypeEnum } from "./models/chrome.model";
import { ChromeConnectKeys, ChromeMessageKeys, SforceKeys, SforceValues } from "./tools/constants";

chrome.runtime.onConnect.addListener((port) => {
    // Login
    if (port.name === ChromeConnectKeys.SforceLoginPort) {
        port.onMessage.addListener((msg: ChromeMessageRequest) => {
            // The login happened thru the initial loading of the browser
            if (msg.key === ChromeMessageKeys.SforceSessionCookie) {
                chrome.cookies.get({ url: SforceValues.FullCookieDomain, name: SforceKeys.SessionCookie }, (cookie) => {
                    const response = new ChromeMessageResponse(ChromeMessageResponseTypeEnum.loginLoading, cookie);
                    port.postMessage(response);
                });
            }
        });

        chrome.cookies.onChanged.addListener((changeInfo) => {
            if (changeInfo.cookie.name === SforceKeys.SessionCookie && changeInfo.cookie.domain === SforceValues.CookieDomain) {
                // The login happened thru the extension
                if (!changeInfo.removed) {
                    const response = new ChromeMessageResponse(ChromeMessageResponseTypeEnum.loginExtension, changeInfo.cookie);
                    port.postMessage(response);
                }
            }
        });
    }

    // Logout
    if (port.name === ChromeConnectKeys.SforceLogoutPort) {
        chrome.cookies.onChanged.addListener((changeInfo) => {
            if (changeInfo.cookie.name === SforceKeys.SessionCookie && changeInfo.cookie.domain === SforceValues.CookieDomain) {
                // The logout happened thru the extension
                if (changeInfo.removed) {
                    const response = new ChromeMessageResponse(ChromeMessageResponseTypeEnum.logoutExtension, changeInfo.cookie);
                    port.postMessage(response);
                }
            }
        });
    }
});
