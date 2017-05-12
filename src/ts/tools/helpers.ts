require('gmail-js');

import * as $ from 'jquery';

module AtlanticBTApp {
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

        constructor(gmail: Gmail) {
            this._gmail = gmail;
        }

        initialize(): void {
            this._gmail.observe.on('open_email', this.openEmail.bind(this));
            this._gmail.observe.on('view_thread', this.viewThread.bind(this));
            this._gmail.observe.on('view_email', this.viewEmail.bind(this));
            this._gmail.observe.on('load_email_menu', (match: JQuery) => {
                console.log('Menu loaded', match);

                // insert a new element into the menu
                $('<div />').addClass('J-N-Jz')
                    .html('New element')
                    .appendTo(match);
            });
        }

        openEmail(id: string, url: string, body: string, xhr: JQueryXHR): void {
            debugger;
        }

        viewEmail(email: GmailDomEmail): void {
            debugger;
        }

        viewThread(thread: GmailDomThread): void {
            debugger;
        }
    }
}

export = AtlanticBTApp;
