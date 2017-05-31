/*
Copyright AtlanticBT.
*/

import { ChromeMessage } from "../models/chrome.model";
import { ChromeMessageKeys, SforceKeys, SforceValues } from "../tools/constants";
import { createNotification } from "../tools/notifications";

import * as _ from "lodash";

namespace AtlanticBTApp {
    chrome.runtime.onMessage.addListener((message: ChromeMessage<chrome.notifications.NotificationOptions>, sender, sendResponse) => {
        switch (message.key) {
            case ChromeMessageKeys.CreateNotification:
                const nId = createNotification(message.data);
                sendResponse(nId);
                break;
            case ChromeMessageKeys.SforceSessionCookie:
                const details: chrome.cookies.GetAllDetails = {
                    name: SforceKeys.SessionCookie
                };
                chrome.cookies.getAll(details, (cookies) => {
                    _.forEach(cookies, (cookie) => {
                        if (SforceValues.CookieDomainRegEx.test(cookie.domain)) {
                            const messageResponse = new ChromeMessage(ChromeMessageKeys.SforceSessionCookie, cookie);
                            sendMessageCurrentTab(messageResponse);
                        }
                    });
                });
                break;
            case ChromeMessageKeys.ClearSforceConnection:
                const messageResponse = new ChromeMessage(ChromeMessageKeys.ClearSforceConnection);
                sendMessageCurrentTab(messageResponse);
                break;
            default:
                break;
        }
    });

    export function sendMessageCurrentTab(message: ChromeMessage<{}>) {
        chrome.tabs.query({}, (tabs) => {
            if (tabs.length > 0) {
                _.forEach(tabs, (tab) => {
                    if (tab.active) {
                        chrome.tabs.sendMessage(tab.id, message);
                        return;
                    }
                });
            }
        });
    }
}

export = AtlanticBTApp;
