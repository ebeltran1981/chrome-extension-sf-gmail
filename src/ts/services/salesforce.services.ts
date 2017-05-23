/*
Copyright AtlanticBT.
*/

import * as jsforce from "jsforce";
import * as _ from "lodash";

import { ChromeMessageRequest, ChromeMessageResponse } from "../models/chrome.model";
import { ISforceUserModel, SforceErrorModel, SforceUserModel } from "../models/sforce.model";
import { ChromeConnectKeys, ChromeMessageKeys, ChromeStorageKeys, SforceErrorCodes, SforceKeys, SforceValues } from "../tools/constants";
import { ExtensionHelper } from "../tools/helpers";

let notification: chrome.notifications.NotificationOptions;

namespace AtlanticBTApp {
    export class SforceServices {
        private _conn: any;
        private _currentUser: SforceUserModel;
        private _extensionHelper: ExtensionHelper;
        private _extensionId: string;

        constructor(extensionHelper: ExtensionHelper) {
            this._extensionHelper = extensionHelper;
            this._extensionId = "gbajakhniioiefjggbcojmibedeaelbh";

            const message = new ChromeMessageRequest(ChromeMessageKeys.SforceSessionCookie);

            const loginPort = chrome.runtime.connect(this._extensionId, { name: ChromeConnectKeys.SforceLoginPort });
            loginPort.postMessage(message);
            loginPort.onMessage.addListener((msg: ChromeMessageResponse<chrome.cookies.Cookie>) => {
                this.setConnection(msg.data ? msg.data.value : null);
            });

            const logoutPort = chrome.runtime.connect(this._extensionId, { name: ChromeConnectKeys.SforceLogoutPort });
            logoutPort.onMessage.addListener((msg: ChromeMessageResponse<chrome.cookies.CookieChangeInfo>) => {
                this.logout();
            });
        }

        public get connection() {
            return this._conn;
        }

        public logout() {
            this._currentUser = null;
            this._conn.logout();

            let message: ChromeMessageRequest<chrome.notifications.NotificationOptions>;
            notification = {
                type: "basic",
                title: "LOGOUT",
                message: "You're not logged in Salesforce!"
            };
            message = new ChromeMessageRequest(ChromeMessageKeys.CreateNotification, notification);
            chrome.runtime.sendMessage(message);
        }

        public isLoggedIn() {
            return !_.isEmpty(this._currentUser);
        }

        private setConnection(value: string) {
            this._conn = new jsforce.Connection({
                oauth2: {
                    clientId: SforceValues.OAuthId,
                    redirectUri: SforceValues.RedirectUrl
                },
                instanceUrl: SforceValues.InstanceUrl,
                accessToken: value
            });

            let message: ChromeMessageRequest<chrome.notifications.NotificationOptions>;
            this._conn.identity().then((u: ISforceUserModel) => {
                this._currentUser = new SforceUserModel(u);

                notification = {
                    type: "basic",
                    title: "LOGIN",
                    message: `${this._currentUser.availableName}, you're logged in Salesforce!`
                };
                message = new ChromeMessageRequest(ChromeMessageKeys.CreateNotification, notification);
                chrome.runtime.sendMessage(this._extensionId, message);
            }, (error: SforceErrorModel) => {
                switch (error.errorCode) {
                    case SforceErrorCodes.InvalidSession:
                        notification = {
                            type: "basic",
                            title: "WARNING",
                            message: "Salesforce session expired or is invalid. Please login to Salesforce."
                        };
                        message = new ChromeMessageRequest(ChromeMessageKeys.CreateNotification, notification);
                        chrome.runtime.sendMessage(this._extensionId, message);
                        break;
                    default:
                        notification = {
                            type: "basic",
                            title: "ERROR",
                            message: error.message
                        };
                        message = new ChromeMessageRequest(ChromeMessageKeys.CreateNotification, notification);
                        chrome.runtime.sendMessage(this._extensionId, message);
                        break;
                }
                this._currentUser = null;
            });
        }
    }
}

export = AtlanticBTApp;
