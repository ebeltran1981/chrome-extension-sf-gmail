/*
Copyright AtlanticBT.
*/

// tslint:disable-next-line:no-reference
/// <reference path="../../../node_modules/gmail-js/src/gmail.d.ts" />

import * as $ from "jquery";
import * as _ from "lodash";

import { ChromeMessage } from "../models/chrome.model";
import { SforceGmailModel } from "../models/gmail.model";
import { ISforceContactModel } from "../models/sforce.model";
import { ChromeConnectKeys, ChromeMessageKeys } from "../tools/constants";
import { ComposeElements } from "../tools/elements";

namespace AtlanticBTApp {
    export class GmailServices {
        private currentUser: string;
        private composeEl: ComposeElements;

        constructor(private extensionId, private gmailjs: Gmail) {
            this.currentUser = gmailjs.get.user_email();
            this.composeEl = new ComposeElements();
        }

        public initialize() {
            // try to initialize sforce connection
            const initMessage = new ChromeMessage(ChromeMessageKeys.LoadSforceFromInit);
            chrome.runtime.sendMessage(this.extensionId, initMessage);

            // register gmail events
            this.gmailjs.observe.on("compose", this.composeEmail.bind(this));
            // this.gmailjs.observe.before("send_message", this.sendEmail.bind(this));
            this.gmailjs.observe.on("http_event", (params) => {
                if (params && params.url_raw && params.url_raw.act) {
                    switch (params.url_raw.act) {
                        case "sm": // send message
                            console.log("url data:", params);
                            this.sendEmail(params.body_params);
                            break;
                    }
                }
            });
            // In case the browser was reloaded
            const composes = this.gmailjs.dom.composes();
            _.forEach(composes, (compose) => {
                this.composeEmail(compose, compose.is_inline() ? "reply" : "compose");
            });
        }

        private composeEmail(compose: GmailDomCompose, type: GmailComposeType): void {
            const composeEl = this.composeEl;

            const form = compose.$el.find("form");

            if (composeEl.hasToolbar(form)) {
                return;
            }

            const toolbar = composeEl.add_toolbar(form);

            // Bcc Salesforce
            const chkDiv = composeEl.checkbox("bcc_salesforce", "Bcc Salesforce", "checkbox", false);
            toolbar.append(chkDiv);
            const chk = chkDiv.find("input[type=checkbox]");

            chk.on("change", (e) => {
                if ((e.currentTarget as HTMLInputElement).checked) {
                    const message = new ChromeMessage(ChromeMessageKeys.WarnIfNotLoggedIn);
                    chrome.runtime.sendMessage(this.extensionId, message);
                }
            });
        }

        private sendEmail(data): void {
            const msg = new SforceGmailModel(this.currentUser, data);
            if (msg.bcc_salesforce) {
                const bccSforceMessage = new ChromeMessage(ChromeMessageKeys.BccSforce, msg);
                chrome.runtime.sendMessage(this.extensionId, bccSforceMessage);
            }
        }
    }
}

export = AtlanticBTApp;
