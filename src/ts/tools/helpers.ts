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

    /**
     * @description meant for gmail and salesforce events interactions
     */
    export class EventsHelper {
        private _gmail: Gmail;
        private _sforce: SforceServices;
        private _composeEl: ComposeElements;

        constructor(gmail: Gmail, sforce: SforceServices) {
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
