/*
Copyright AtlanticBT.
*/

import * as sf from "jsforce";

namespace AtlanticBTApp {
    export class SforceAuth {
        private _sfconn: any;
        private _ck: string = "3MVG9i1HRpGLXp.qijeggn1OC_wgtTx0cAhvRPveCdd69JJJWao_fGV4l.DDN.kd16oZ3ZTawpHW4I3Y7RIyK";
        private _cs: string = "8052009589975949097";
        private _redirectUri: string = "https://login.salesforce.com/services/oauth2/callback";

        constructor() {
            // this._force = new sf.Connection();
            debugger;

            this._sfconn = new sf.Connection();

            this._sfconn.on("refresh", (accessToken: string, res: any) => {
                debugger;
            });

            sf.browser.login({
                clientId: this._ck,
                redirectUri: this._redirectUri
            });

            // sf.browser.init({
            //     clientId: this._ck,
            //     redirectUri: this._redirectUri
            // });

            sf.browser.on("connect", (conn: any) => {
                debugger;
            });
        }
    }
}

export = AtlanticBTApp;
