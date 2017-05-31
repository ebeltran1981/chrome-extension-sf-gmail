/*
Copyright AtlanticBT.
*/

import * as jsforce from "jsforce";
import * as _ from "lodash";

import { ChromeMessage } from "../models/chrome.model";
import { ISforceUserModel, SforceErrorModel, SforceUserModel } from "../models/sforce.model";
import { ChromeConnectKeys, ChromeMessageKeys, ChromeStorageKeys, SforceErrorCodes, SforceKeys, SforceValues } from "../tools/constants";
import { ExtensionHelper } from "../tools/helpers";

let notification: chrome.notifications.NotificationOptions;

namespace AtlanticBTApp {
    export class SforceServices {
        private _conn: any;
        private _currentUser: SforceUserModel;
        private _extensionHelper: ExtensionHelper;

        constructor(extensionHelper: ExtensionHelper) {
            let timeout: any;
            const timeoutDelay: number = 1000;

            this._extensionHelper = extensionHelper;

            const loginMessage = new ChromeMessage(ChromeMessageKeys.SforceSessionCookie);
            chrome.runtime.sendMessage(loginMessage);

            chrome.runtime.onMessage.addListener((message: ChromeMessage<{}>, sender, sendResponse) => {
                switch (message.key) {
                    case ChromeMessageKeys.SforceSessionCookie:
                        if (timeout) {
                            clearTimeout(timeout);
                        }
                        timeout = setTimeout(() => {
                            this.setConnection(message.data as chrome.cookies.Cookie);
                        }, timeoutDelay);
                        break;
                    case ChromeMessageKeys.ClearSforceConnection:
                        this.logout();
                        break;
                }
            });
        }

        public get currentUser() {
            return this._currentUser;
        }

        public get connection() {
            return this._conn;
        }

        public logout() {
            this._currentUser = null;
            this._conn.logout();

            let message: ChromeMessage<chrome.notifications.NotificationOptions>;
            notification = {
                type: "basic",
                title: "LOGOUT",
                message: "You're not logged in Salesforce!"
            };
            message = new ChromeMessage(ChromeMessageKeys.CreateNotification, notification);
            chrome.runtime.sendMessage(message);
        }

        public isLoggedIn() {
            return !_.isEmpty(this._currentUser);
        }

        private setConnection(cookie: chrome.cookies.Cookie) {
            this._conn = new jsforce.Connection({
                oauth2: {
                    clientId: SforceValues.OAuthId,
                    redirectUri: SforceValues.RedirectUrl
                },
                instanceUrl: `https://${cookie.domain}`,
                accessToken: cookie.value
            });

            let message: ChromeMessage<chrome.notifications.NotificationOptions>;
            this._conn.identity().then((u: ISforceUserModel) => {
                this._currentUser = new SforceUserModel(u);

                notification = {
                    type: "basic",
                    title: "LOGIN",
                    message: `${this._currentUser.availableName}, you're logged in Salesforce!`
                };
                message = new ChromeMessage(ChromeMessageKeys.CreateNotification, notification);
                chrome.runtime.sendMessage(message);
            }, (error: SforceErrorModel) => {
                switch (error.errorCode) {
                    case SforceErrorCodes.InvalidSession:
                        notification = {
                            type: "basic",
                            title: "WARNING",
                            message: "Salesforce session expired or is invalid. Please login to Salesforce."
                        };
                        message = new ChromeMessage(ChromeMessageKeys.CreateNotification, notification);
                        chrome.runtime.sendMessage(message);
                        break;
                    default:
                        notification = {
                            type: "basic",
                            title: "ERROR",
                            message: error.message
                        };
                        message = new ChromeMessage(ChromeMessageKeys.CreateNotification, notification);
                        chrome.runtime.sendMessage(message);
                        break;
                }
                this._currentUser = null;
            });
        }
    }
}

export = AtlanticBTApp;
