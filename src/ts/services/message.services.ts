/*
Copyright AtlanticBT.
*/

import { ChromeMessage } from "../models/chrome.model";
import { ErrorModel } from "../models/error.model";
import { SforceGmailModel } from "../models/gmail.model";
import { ChromeErrorCodes, ChromeMessageKeys } from "../tools/constants";
import { createNotification } from "./notification.services";
import { bccSforce, currentUser, processSessionCookie } from "./sforce.services";

namespace AtlanticBTApp {
    chrome.runtime.onMessageExternal.addListener((message: ChromeMessage<{}>, sender, sendResponse) => {
        switch (message.key) {
            case ChromeMessageKeys.LoadSforceFromInit:
                processSessionCookie()
                    .then((cookie) => {
                        const notification: chrome.notifications.NotificationOptions = {
                            type: "basic",
                            title: "LOGIN",
                            message: `${currentUser.availableName}, you're logged in Salesforce!`
                        };
                        createNotification(notification);
                    })
                    .catch((error: ErrorModel) => {
                        switch (error.code) {
                            case ChromeErrorCodes.CookieNotFound:
                            case ChromeErrorCodes.SforceInvalidSession:
                                const notification = {
                                    type: "basic",
                                    title: "WARNING",
                                    message: "Salesforce session expired or is invalid. Please login to Salesforce."
                                };
                                createNotification(notification);
                        }
                    });
                break;
            case ChromeMessageKeys.WarnIfNotLoggedIn:
                processSessionCookie()
                    .catch((error: ErrorModel) => {
                        switch (error.code) {
                            case ChromeErrorCodes.CookieNotFound:
                            case ChromeErrorCodes.SforceInvalidSession:
                                const notification = {
                                    type: "basic",
                                    title: "WARNING",
                                    message: "You are not logged in Salesforce."
                                };
                                createNotification(notification);
                        }
                    });
                break;
            case ChromeMessageKeys.BccSforce:
                const bccMessage = message.data as SforceGmailModel;
                bccSforce(bccMessage);
                break;
        }
    });
}

export = AtlanticBTApp;
