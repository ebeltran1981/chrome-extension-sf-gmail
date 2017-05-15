/*
Copyright AtlanticBT.
 */

import * as $ from "jquery";

import { ComposeElements } from "./elements";

namespace AtlanticBTApp {
    export class ExtensionHelper {
        private _gmail: Gmail;

        private _version: string;
        private _pluginId: string;
        private _extensionPath: string;

        private _userEmail: string;

        constructor(gmail: Gmail) {
            this._gmail = gmail;

            this._version = chrome.runtime.getManifest().version;
            this._pluginId = chrome.runtime.id;
            this._extensionPath = chrome.extension.getURL("/");

            this._userEmail = this._gmail.get.user_email();
        }
    }

    export class EventsHelper {
        private _gmail: Gmail;
        private _composeEl: ComposeElements;

        constructor(gmail: Gmail) {
            this._gmail = gmail;
            this._composeEl = new ComposeElements();
        }

        public initialize(): void {
            this._gmail.observe.on("compose", this.composeEmail.bind(this));
        }

        private composeEmail(compose: GmailDomCompose, type: GmailComposeType): void {
            const gmail = this._gmail;

            const composes = gmail.dom.composes();
            $.each(composes, (idx: number, item: GmailDomCompose) => {
                const toolbar = $(document.createElement("div"));
                toolbar.addClass("aoD az6 abt-toolbar");

                // Bcc Salesforce
                const chkBccSF = $(document.createElement("input"));
                chkBccSF.attr("type", "checkbox");
                const lblBccSF = $(document.createElement("label"));
                lblBccSF.addClass("checkbox");
                lblBccSF.text("Bcc Salesforce");
                lblBccSF.prepend(chkBccSF);

                // Button Send
                const btnSend = $(document.createElement("button"));
                const btnSendIcon = $(document.createElement("i"));
                btnSendIcon.addClass("fa fa-2x fa-address-book");
                btnSend.append(btnSendIcon);

                // Appending elements to Toolbar
                toolbar.append(lblBccSF);
                toolbar.append(btnSend);

                const form = item.$el.find("form");
                form.append(toolbar);
                debugger;
                // const hasToolbar = this._composeEl.hasToolbar(item.$el);
                // if (!hasToolbar) {
                //     const composeForm = item.$el.find("form");
                //     const toolbar = this._composeEl.toolbar();
                //     composeForm.appendTo(toolbar);
                // }
            });
        }
    }
}

export = AtlanticBTApp;
