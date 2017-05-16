/*
Copyright AtlanticBT.
*/


import * as jsforce from "jsforce";
import * as jsforceAjaxProxy from "jsforce-ajax-proxy";
import * as _ from "lodash";

namespace AtlanticBTApp {
    export class SforceAuthModel {
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
        protected _ck: string = "3MVG9i1HRpGLXp.qijeggn1OC__TFqN3KFcMkAkPDAVJEfnfNn9VynFLunBuDnrory4en_kK_hfu861CgL2VZ";
        protected _cs: string = "8452890720037761370";
        protected _redirectUri: string = "https://mail.google.com/mail/u/0";
        protected _instanceUrl: string = "https://na40.salesforce.com";
    }

    export class SforceServices extends SforceAuth {
        constructor() {
            super();
        }

        /**
         * initialize jsforce
         */
        public initialize() {
            debugger;

            const sforceModel = this.hash_parser(location.hash);

            // jsforce.browser.init({
            //     clientId: this._ck,
            //     redirectUri: this._redirectUri
            // });

            // jsforce.browser.on("connect", (conn: any) => {
            //     debugger;
            //     conn.query("SELECT Id, Name FROM Account", (err, res) => {
            //         debugger;
            //         if (err) { return console.error(err); }
            //         console.log(res);
            //     });
            // });

            if (_.isEmpty(sforceModel)) {
                jsforce.browser.login({
                    clientId: this._ck,
                    redirectUri: this._redirectUri
                });
            } else {
                // TODO: do something with the token
                const conn = new jsforce.Connection({
                    oauth2: {
                        clientId: this._ck,
                        clientSecret: this._cs,
                        redirectUri: this._redirectUri
                    },
                    instanceUrl: this._instanceUrl,
                    accessToken: sforceModel.access_token
                });

                conn.on("refresh", (accessToken, res) => {
                    // Refresh event will be fired when renewed access token
                    // to store it in your storage for next request
                    debugger;
                });

                conn.query("SELECT Id, Name FROM Account", (err, res) => {
                    if (err) { return this.handleError(err); }
                    this.handleResult(res);
                });
            }
        }

        private hash_parser(hash: string): SforceAuthModel {
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

        private handleError(err) {
            debugger;
        }

        private handleResult(err) {
            debugger;
        }
    }
}

export = AtlanticBTApp;

// https://mail.google.com/mail/u/0/
// #access_token=00D46000000oa0L%21AR8AQGQcuzLuYr7tCvriLpMw5hdAd94cB07gFENvIjc7__0A4Wbzwj3bHsMHSzqkWv1ZJrslsKwwQslA8Bc1hEfxA0vqlioL
// &instance_url=https%3A%2F%2Fna40.salesforce.com
// &id=https%3A%2F%2Flogin.salesforce.com%2Fid%2F00D46000000oa0LEAQ%2F00546000000ZIS8AAO
// &issued_at=1494960174308
// &signature=oJiTySGPhfrjzLImYnorsD06RZPkjQnz4YxvYdc3Zc4%3D
// &state=jsforce0.popup.pk4yruh2i8m
// &scope=id+api+web+refresh_token
// &token_type=Bearer