/*
Copyright AtlanticBT.
*/

import { ChromeMessage } from "../models/chrome.model";
import { ChromeConnectKeys, ChromeExtensionValues, ChromeMessageKeys } from "../tools/constants";
import { ComposeElements } from "../tools/elements";

namespace AtlanticBTApp {
    export class GmailServices {
        private composeEl: ComposeElements;

        constructor(private gmail: Gmail) {
            this.composeEl = new ComposeElements();
        }

        public initialize() {
            const initMessage = new ChromeMessage<{}>(ChromeMessageKeys.LoadSforceFromInit);
            chrome.runtime.sendMessage(ChromeExtensionValues.ExtensionId, initMessage);

            // const initPort = chrome.runtime.connect(ChromeExtensionValues.ExtensionId, { name: ChromeConnectKeys.LoginPort });
            // initPort.postMessage(initMessage);
            // initPort.onMessage.addListener((message, port) => {
            //     console.log("MESSAGE FROM WEBPAGE: ", message, "PORT", port);
            // });

            this.gmail.observe.on("compose", this.composeEmail.bind(this));
            this.gmail.observe.after("send_message", this.sendEmail.bind(this));
        }

        private composeEmail(GmailDomCompose: any, type: GmailComposeType): void {
            const gmail = this.gmail;
            const composeEl = this.composeEl;

            const composes = gmail.dom.composes();
            $.each(composes, (idx: number, item: GmailDomCompose) => {
                const form = item.$el.find("form");
                const toolbar = composeEl.add_toolbar(form);

                // Bcc Salesforce
                const chk = composeEl.checkbox("bccSforce", "Bcc Salesforce", "checkbox", false);
                toolbar.append(chk);
            });
        }

        private sendEmail(url: string, body: string, data: any, xhr: XMLHttpRequest): void {
            debugger;
        }
    }
}

export = AtlanticBTApp;
