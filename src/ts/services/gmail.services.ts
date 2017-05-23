/*
Copyright AtlanticBT.
*/

import { ComposeElements } from "../tools/elements";

namespace AtlanticBTApp {
    export class GmailEvents {
        private _gmail: Gmail;
        private _composeEl: ComposeElements;

        constructor(gmail: Gmail) {
            this._gmail = gmail;
            gmail.observe.on("compose", this.composeEmail.bind(this));
            gmail.observe.on("send_message", this.sendEmail.bind(this));
        }

        private composeEmail(compose: GmailDomCompose, type: GmailComposeType): void {
            const gmail = this._gmail;
            const composeEl = this._composeEl;
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

        private sendEmail(url, body, data, xhr): void {
            debugger;
        }
    }
}

export = AtlanticBTApp;
