/*
Copyright AtlanticBT.
*/

import * as jsforce from "jsforce";
import * as _ from "lodash";

import { ChromeMessageRequest, ChromeMessageResponse } from "../models/chrome.model";
import { SforceErrorModel, SforceUserModel } from "../models/sforce.model";
import { ChromeConnectKeys, ChromeMessageKeys, ChromeStorageKeys, SforceErrorCodes, SforceKeys, SforceValues } from "../tools/constants";

let notification: chrome.notifications.NotificationOptions;

namespace AtlanticBTApp {
    export class SforceServices {
        private _conn: any;
        private _currentUser: SforceUserModel;

        public initialize() {
            const message = new ChromeMessageRequest(ChromeMessageKeys.SforceSessionCookie);
            const loginPort = chrome.runtime.connect({ name: ChromeConnectKeys.SforceLoginPort });
            loginPort.postMessage(message);
            loginPort.onMessage.addListener((msg: ChromeMessageResponse<chrome.cookies.Cookie>) => {
                this.connection = msg.data ? msg.data.value : null;
            });

            const logoutPort = chrome.runtime.connect({ name: ChromeConnectKeys.SforceLogoutPort });
            logoutPort.onMessage.addListener((msg: ChromeMessageResponse<chrome.cookies.CookieChangeInfo>) => {
                this.logout();
            });
        }

        public get connection() {
            return this._conn;
        }

        public set connection(value: string) {
            this._conn = new jsforce.Connection({
                oauth2: {
                    clientId: SforceValues.OAuthId,
                    redirectUri: SforceValues.RedirectUrl
                },
                instanceUrl: SforceValues.InstanceUrl,
                accessToken: value
            });

            this._conn.identity({}).then((user: SforceUserModel) => {
                this._currentUser = user;
            }, (error: SforceErrorModel) => {
                let message: ChromeMessageRequest<chrome.notifications.NotificationOptions>;

                switch (error.errorCode) {
                    case SforceErrorCodes.InvalidSession:
                        notification = {
                            type: "basic",
                            title: "WARNING",
                            message: "Salesforce session expired or is invalid. Please login to Salesforce."
                        };
                        message = new ChromeMessageRequest(ChromeMessageKeys.CreateNotification, notification);
                        chrome.runtime.sendMessage(message);
                        break;
                    default:
                        notification = {
                            type: "basic",
                            title: error.errorCode,
                            message: error.message
                        };
                        message = new ChromeMessageRequest(ChromeMessageKeys.CreateNotification, notification);
                        chrome.runtime.sendMessage(message);
                        break;
                }
            });
        }

        public logout() {
            // TODO: implement removal of controls when user is logged out.
            let message: ChromeMessageRequest<chrome.notifications.NotificationOptions>;
            notification = {
                type: "basic",
                title: "LOGOUT",
                message: "You're not logged in Salesforce!"
            };
            message = new ChromeMessageRequest(ChromeMessageKeys.CreateNotification, notification);
            chrome.runtime.sendMessage(message);
        }
    }
}

export = AtlanticBTApp;
