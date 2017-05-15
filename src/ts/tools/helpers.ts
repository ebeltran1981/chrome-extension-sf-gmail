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
            const composeEl = this._composeEl;

            const composes = gmail.dom.composes();
            $.each(composes, (idx: number, item: GmailDomCompose) => {
                const form = item.$el.find("form");
                const toolbar = composeEl.add_toolbar(form);

                // Bcc Salesforce
                const chk = composeEl.checkbox("Bcc Salesforce", "checkbox", false);
                toolbar.append(chk);
            });
        }
    }

    export class SalesforceEvents {
        private _force: any;

        constructor() {
            this._force.browser.on("connect", (conn: any) => {
                
            });
        }
    }
}

export = AtlanticBTApp;
