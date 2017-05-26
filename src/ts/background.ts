/*
Copyright AtlanticBT.
*/

import * as _ from "lodash";

import { ChromeMessageRequest, ChromeMessageResponse, ChromeMessageResponseTypeEnum } from "./models/chrome.model";
import { ChromeConnectKeys, ChromeCookieCauseKeys, ChromeMessageKeys, SforceKeys, SforceValues } from "./tools/constants";
import { createNotification } from "./tools/notifications";

chrome.runtime.onConnect.addListener((port) => {
    // Login
    if (port.name === ChromeConnectKeys.SforceLoginPort) {
        let isLoginPortOpen = true;
        port.onMessage.addListener((msg: ChromeMessageRequest<{}>, p) => {
            // The login happened thru the initial loading of the browser
            if (msg.key === ChromeMessageKeys.SforceSessionCookie) {
                const details: chrome.cookies.GetAllDetails = {
                    name: SforceKeys.SessionCookie
                };
                chrome.cookies.getAll(details, (cookies) => {
                    _.forEach(cookies, (cookie) => {
                        if (SforceValues.CookieDomainRegEx.test(cookie.domain)) {
                            const response = new ChromeMessageResponse(ChromeMessageResponseTypeEnum.loginLoading, cookie);
                            if (isLoginPortOpen) {
                                p.postMessage(response);
                            }
                            return;
                        }
                    });
                });
            }
        });

        chrome.cookies.onChanged.addListener((changeInfo) => {
            if (!changeInfo.removed && changeInfo.cause === ChromeCookieCauseKeys.Explicit) {
                if (changeInfo.cookie.name === SforceKeys.SessionCookie && SforceValues.CookieDomainRegEx.test(changeInfo.cookie.domain)) {
                    const response = new ChromeMessageResponse(ChromeMessageResponseTypeEnum.loginExtension, changeInfo.cookie);
                    if (isLoginPortOpen) {
                        port.postMessage(response);
                    }
                }
            }
        });

        port.onDisconnect.addListener((p) => {
            // debugger;
            isLoginPortOpen = false;
        });
    }

    // Logout
    if (port.name === ChromeConnectKeys.SforceLogoutPort) {
        let isLogoutPortOpen = true;
        chrome.cookies.onChanged.addListener((changeInfo) => {
            if (changeInfo.removed && changeInfo.cause === ChromeCookieCauseKeys.ExpiredOverwrite) {
                if (changeInfo.cookie.name === SforceKeys.SessionCookie && SforceValues.CookieDomainRegEx.test(changeInfo.cookie.domain)) {
                    const response = new ChromeMessageResponse(ChromeMessageResponseTypeEnum.logoutExtension, changeInfo.cookie);
                    if (isLogoutPortOpen) {
                        port.postMessage(response);
                    }
                }
            }
        });
        port.onDisconnect.addListener((p) => {
            // debugger;
            isLogoutPortOpen = false;
        });
    }
});

chrome.runtime.onMessage.addListener((message: ChromeMessageRequest<chrome.notifications.NotificationOptions>, sender, sendResponse) => {
    if (message.key === ChromeMessageKeys.CreateNotification) {
        const nId = createNotification(message.data);
        sendResponse(nId);
    }
});

chrome.notifications.onButtonClicked.addListener((nId, bIdx) => {
    if (extNotInstalledNotificationId === nId) {
        window.open(SforceValues.ExtensionUrl, "_blank");
    }
});

let extNotInstalledNotificationId: string = null;
chrome.management.getAll((result) => {
    let found = false;
    _.forEach(result, (extension) => {
        if (extension.id === SforceValues.ExtensionId && extension.enabled) {
            found = true;
        }
    });
    if (!found) {
        const notification = {
            type: "basic",
            title: "IMPORTANT",
            message: `${SforceValues.ExtensionName} extension not found or is disabled! Go to the Chrome Store and install it before using AtlanticBT extension.`,
            buttons: [
                {
                    title: "Goto Extension Homepage"
                }
            ]
        };
        extNotInstalledNotificationId = createNotification(notification);
    }
}); 
