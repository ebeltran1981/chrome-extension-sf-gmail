/*
Copyright AtlanticBT.
 */

import * as $ from "jquery";
import * as _ from "lodash";

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
            this._gmail.observe.after("send_message", this.sentEmail.bind(this));
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

                const sendBtn = item.dom("send_button");
                sendBtn.on("click", (e) => {
                    const bccSalesforce = chk.find("input[type=checkbox]").is(":checked");
                    if (bccSalesforce) {
                        const $toList: JQuery = item.to() as any;
                        const toList: string[] = [];
                        $.each($toList.siblings("div.vR").children("span.vN.vP"), (elIdx, elem) => {
                            _.forEach(elem.attributes, (attr) => {
                                if (attr.nodeName === "email") {
                                    toList.push(attr.nodeValue);
                                }
                            });
                        });

                        const subject = item.subject();
                        const body = item.body();
                    }
                });
            });
        }

        private sentEmail(url, body, data, xhr) {
            debugger;
        }
    }
}

export = AtlanticBTApp;
