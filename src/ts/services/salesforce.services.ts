/*
Copyright AtlanticBT.
*/

import * as jsforce from "jsforce";
import * as _ from "lodash";

import { ChromeStorageModel, SforceErrorModel, SforceUserModel } from "../models/auth.model";
import { ChromeStorageKeys, SforceErrorCodes } from "../tools/constants";

namespace AtlanticBTApp {
    class SforceAuthModel {
        public access_token: string;
        public instance_url: string;
        public id: string;
        public issued_at: Date;
        public signature: string;
        public state: string;
        public scope: string;
        public token_type: string;
    }

    abstract class SforceAuth {
        protected _currentUser: SforceUserModel = null;
        protected _ck: string = "3MVG9i1HRpGLXp.qijeggn1OC__TFqN3KFcMkAkPDAVJEfnfNn9VynFLunBuDnrory4en_kK_hfu861CgL2VZ";
        protected _redirectUri: string = "https://mail.google.com/mail/u/0";
        protected _instanceUrl: string = "https://na40.salesforce.com";
    }

    export class SforceServices extends SforceAuth {
        private _conn: any;

        constructor() {
            super();
        }

        /**
         * initialize jsforce
         */
        public initialize() {
            let sforceAuth = this.hashParser(location.hash);
            chrome.storage.sync.get(ChromeStorageKeys.Session, (items) => {
                if (sforceAuth !== null) {
                    this.session = sforceAuth;
                } else if (items[ChromeStorageKeys.Session]) {
                    sforceAuth = items[ChromeStorageKeys.Session] as SforceAuthModel;
                    this.session = sforceAuth;
                } else {
                    this.login();
                }
            });
        }

        private login(): void {
            jsforce.browser.login({
                clientId: this._ck,
                redirectUri: this._redirectUri
            });
        }

        private set session(sforceAuth: SforceAuthModel) {
            debugger;
            this._conn = new jsforce.Connection({
                oauth2: {
                    clientId: this._ck,
                    redirectUri: this._redirectUri
                },
                instanceUrl: this._instanceUrl,
                accessToken: sforceAuth.access_token
            });

            this._conn.identity({}).then((user: SforceUserModel) => {
                debugger;
                this._currentUser = user;
            }, (error: SforceErrorModel) => {
                debugger;
                switch (error.errorCode) {
                    case SforceErrorCodes.InvalidSession:
                        this.login();
                        break;
                    default:
                        alert(error.toString());
                        break;
                }
            });

            chrome.storage.sync.set({ sforce_session: sforceAuth }, () => {
                if (chrome.runtime.lastError !== undefined) {
                    alert("Salesforce session was not saved properly.");
                }
            });
        }

        private hashParser(hash: string): SforceAuthModel {
            if (_.isEmpty(hash) || hash.indexOf("salesforce.com") < 0) {
                return null;
            }

            if (hash[0] == "#") {
                hash = hash.slice(1, hash.length);
            }

            const sforceModel = new SforceAuthModel();

            const hashSplit = hash.split("&");
            _.forEach(hashSplit, (hashItem: string) => {
                const ampSplit = hashItem.split("=");
                sforceModel[ampSplit[0]] = decodeURIComponent(ampSplit[1]);
            });

            return sforceModel;
        }
    }
}

export = AtlanticBTApp;
