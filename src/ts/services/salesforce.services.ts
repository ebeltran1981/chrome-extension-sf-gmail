/*
Copyright AtlanticBT.
*/

import * as jsforce from "jsforce";
import * as _ from "lodash";

import { ChromeMessageRequest, ChromeMessageResponse } from "../models/chrome.model";
import { SforceErrorModel, SforceUserModel } from "../models/sforce.model";
import { ChromeConnectKeys, ChromeMessageKeys, ChromeStorageKeys, SforceErrorCodes, SforceKeys, SforceValues } from "../tools/constants";

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
            logoutPort.postMessage(null);
            logoutPort.onMessage.addListener((msg: ChromeMessageResponse<chrome.cookies.CookieChangeInfo>) => {
                this.logout();
            });
        }

        public get connection() {
            return this._conn;
        }

        public set connection(value: string) {
            debugger;
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
                debugger;
                switch (error.errorCode) {
                    case SforceErrorCodes.InvalidSession:
                        alert("Salesforce session expired or is invalid. Please login to Salesforce.");
                        break;
                    default:
                        console.error(error.toString());
                        break;
                }
            });
        }

        public logout() {
            debugger;
        }
    }
}

export = AtlanticBTApp;
