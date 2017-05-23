/*
Copyright AtlanticBT.
 */

import * as $ from "jquery";

import { SforceServices } from "../services/salesforce.services";
import { ComposeElements } from "./elements";

namespace AtlanticBTApp {
    /**
     * @description meant for plugin information
     */
    export class ExtensionHelper {
        private _gmail: Gmail;
        private _userEmail: string;

        constructor(gmail: Gmail) {
            this._gmail = gmail;
            this._userEmail = this._gmail.get.user_email();
        }
    }

    /**
     * @description meant for gmail and salesforce events interactions
     */
    export class EventsHelper {
        private _gmail: Gmail;
        private _sforce: SforceServices;
        private _composeEl: ComposeElements;

        constructor(gmail: Gmail, extensionHelper: ExtensionHelper, sforce: SforceServices) {
            this._gmail = gmail;
            this._sforce = sforce;
            this._composeEl = new ComposeElements();
        }

        public initialize(): void {
            this._gmail.observe.on("compose", this.composeEmail.bind(this));
            // this._gmail.observe.after("send_message", this.sentEmail.bind(this));
            this._gmail.observe.before("send_message", (url, body, data, xhr) => {
                console.warn(`SEND_MESSAGE WAS CALLED`);
                const body_params = xhr.xhrParams.body_params;

                // lets cc this email to someone extra if the subject is 'Fake example'
                if (data.subject == "Fake example") {
                    if (body_params.cc) {
                        if (typeof body_params.cc != "object") {
                            body_params.cc = [body_params.cc];
                        }
                    } else {
                        body_params.cc = [];
                    }
                    body_params.cc.push("ebeltran1981@gmail.com");
                }

                // now change the subject
                body_params.subject = "Subject overwritten!";
                console.log("sending message, url:", url, "body", body, "email_data", data, "xhr", xhr);
            });
            // this._gmail.observe.after("send_message", this.sentEmail.bind(this));
        }

        private composeEmail(compose: GmailDomCompose, type: GmailComposeType): void {
            const gmail = this._gmail;
            const composeEl = this._composeEl;
            const temp = this._sforce.connection;

            const composes = gmail.dom.composes();
            $.each(composes, (idx: number, item: GmailDomCompose) => {
                const form = item.$el.find("form");
                const toolbar = composeEl.add_toolbar(form);

                // Bcc Salesforce
                const chk = composeEl.checkbox("Bcc Salesforce", "checkbox", false);
                toolbar.append(chk);

                form.on("submit", (e) => {
                    debugger;
                });
            });
        }

        private sentEmail(url, body, data, xhr) {
            debugger;
        }
    }
}

export = AtlanticBTApp;
