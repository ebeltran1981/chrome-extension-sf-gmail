/*
Copyright AtlanticBT.
*/

import { ChromeMessageRequest, ChromeMessageResponse, ChromeMessageResponseTypeEnum } from "./models/chrome.model";
import { ChromeConnectKeys, ChromeCookieCauseKeys, ChromeMessageKeys, SforceKeys, SforceValues } from "./tools/constants";
import { createNotification } from "./tools/notifications";

// chrome.runtime.onConnectExternal.addListener((port) => {
//     // Login
//     if (port.name === ChromeConnectKeys.SforceLoginPort) {
//         let isLoginPortOpen = true;
//         port.onMessage.addListener((msg: ChromeMessageRequest<{}>, p) => {
//             // The login happened thru the initial loading of the browser
//             if (msg.key === ChromeMessageKeys.SforceSessionCookie) {
//                 chrome.cookies.get({ url: SforceValues.FullCookieDomain, name: SforceKeys.SessionCookie }, (cookie) => {
//                     const response = new ChromeMessageResponse(ChromeMessageResponseTypeEnum.loginLoading, cookie);
//                     if (isLoginPortOpen) {
//                         p.postMessage(response);
//                     }
//                 });
//             }
//         });

//         chrome.cookies.onChanged.addListener((changeInfo) => {
//             if (!changeInfo.removed && changeInfo.cause === ChromeCookieCauseKeys.Explicit) {
//                 if (changeInfo.cookie.name === SforceKeys.SessionCookie && changeInfo.cookie.domain === SforceValues.CookieDomain) {
//                     const response = new ChromeMessageResponse(ChromeMessageResponseTypeEnum.loginExtension, changeInfo.cookie);
//                     if (isLoginPortOpen) {
//                         port.postMessage(response);
//                     }
//                 }
//             }
//         });

//         port.onDisconnect.addListener((p) => {
//             // debugger;
//             isLoginPortOpen = false;
//         });
//     }

//     // Logout
//     if (port.name === ChromeConnectKeys.SforceLogoutPort) {
//         let isLogoutPortOpen = true;
//         chrome.cookies.onChanged.addListener((changeInfo) => {
//             if (changeInfo.removed && changeInfo.cause === ChromeCookieCauseKeys.ExpiredOverwrite) {
//                 if (changeInfo.cookie.name === SforceKeys.SessionCookie && changeInfo.cookie.domain === SforceValues.CookieDomain) {
//                     const response = new ChromeMessageResponse(ChromeMessageResponseTypeEnum.logoutExtension, changeInfo.cookie);
//                     if (isLogoutPortOpen) {
//                         port.postMessage(response);
//                     }
//                 }
//             }
//         });
//         port.onDisconnect.addListener((p) => {
//             // debugger;
//             isLogoutPortOpen = false;
//         });
//     }
// });

// chrome.runtime.onMessageExternal.addListener((message: ChromeMessageRequest<chrome.notifications.NotificationOptions>, sender, sendResponse) => {
//     if (message.key === ChromeMessageKeys.CreateNotification) {
//         const nId = createNotification(message.data);
//         sendResponse(nId);
//     }
// });

chrome.runtime.onConnectExternal.addListener((port) => {
    // Login
    if (port.name === ChromeConnectKeys.SforceLoginPort) {
        let isLoginPortOpen = true;
        port.onMessage.addListener((msg: ChromeMessageRequest<{}>, p) => {
            // The login happened thru the initial loading of the browser
            if (msg.key === ChromeMessageKeys.SforceSessionCookie) {
                chrome.cookies.get({ url: SforceValues.FullCookieDomain, name: SforceKeys.SessionCookie }, (cookie) => {
                    const response = new ChromeMessageResponse(ChromeMessageResponseTypeEnum.loginLoading, cookie);
                    if (isLoginPortOpen) {
                        p.postMessage(response);
                    }
                });
            }
        });

        // chrome.cookies.onChanged.addListener((changeInfo) => {
        //     if (!changeInfo.removed && changeInfo.cause === ChromeCookieCauseKeys.Explicit) {
        //         if (changeInfo.cookie.name === SforceKeys.SessionCookie && changeInfo.cookie.domain === SforceValues.CookieDomain) {
        //             const response = new ChromeMessageResponse(ChromeMessageResponseTypeEnum.loginExtension, changeInfo.cookie);
        //             if (isLoginPortOpen) {
        //                 port.postMessage(response);
        //             }
        //         }
        //     }
        // });

        port.onDisconnect.addListener((p) => {
            // debugger;
            isLoginPortOpen = false;
        });
    }
});

chrome.runtime.onMessageExternal.addListener((message: ChromeMessageRequest<chrome.notifications.NotificationOptions>, sender, sendResponse) => {
    debugger;
    switch (message.key) {
        case ChromeMessageKeys.CreateNotification:
            const nId = createNotification(message.data);
            sendResponse(nId);
            break;
        case ChromeMessageKeys.IsSforceLoggedIn:
            chrome.cookies.get({ url: SforceValues.FullCookieDomain, name: SforceKeys.SessionCookie }, (cookie) => {
                const response = new ChromeMessageResponse(ChromeMessageResponseTypeEnum.loginLoading, cookie);
                // todo: need to send a message to gmail services
            });
            break;
        default:
            break;
    }
});

chrome.cookies.onChanged.addListener((changeInfo) => {
    debugger;
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
