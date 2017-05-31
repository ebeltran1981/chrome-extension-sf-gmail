/*
Copyright AtlanticBT.
*/

import * as _ from "lodash";

import { ChromeMessage } from "../models/chrome.model";
import { ChromeMessageKeys, ChromeTabValues, SforceKeys, SforceValues } from "../tools/constants";
import { createNotification } from "../tools/notifications";

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
                    if (ChromeTabValues.GmailUrlRegEx.test(tab.url)) {
                        chrome.tabs.sendMessage(tab.id, message);
                    }
                });
            }
        });
    }
}

export = AtlanticBTApp;
