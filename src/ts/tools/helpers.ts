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
            this._gmail.tools.add_toolbar_button("<label>Testing</label>", () => {
                debugger;
            }, "abt-toolbar");
        }

        private composeEmail(compose: GmailDomCompose, type: GmailComposeType): void {
            const gmail = this._gmail;

            const composes = gmail.dom.composes();
            $.each(composes, (idx: number, item: GmailDomCompose) => {
                gmail.tools.add_compose_button(item, "<label>Testing</label>", () => {
                    debugger;
                }, "abt-toolbar");
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
