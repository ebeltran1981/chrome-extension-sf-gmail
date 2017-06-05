/*
Copyright AtlanticBT.
 */

import "gmail-js";
import * as $ from "jquery";

import "./listeners/webPage.listeners";

import { ChromeMessage } from "./models/chrome.model";
import { GmailServices } from "./services/gmail.services";
import { ChromeMessageKeys, ChromeMessageType } from "./tools/constants";

namespace AtlanticBTApp {
    let extensionId: string;
    export function isPluginLoaded(fn) {
        if (document.readyState === "complete" && typeof Gmail !== "undefined" && chrome.runtime !== undefined && extensionId !== undefined) {
            fn(extensionId);
        } else {
            setTimeout(isPluginLoaded.bind(this, fn), 100);
        }
    }

    export function loadGmail(eId) {
        const gmail = new Gmail($);
        const gmailServices = new GmailServices(eId, gmail);
        gmail.observe.on("load", gmailServices.initialize.bind(gmailServices));
    }

    window.addEventListener("message", (event) => {
        if (event.source != window) {
            return;
        }

        const webPageMessage = event.data as ChromeMessage<any>;
        if (webPageMessage.type && (webPageMessage.type === ChromeMessageType.WebPageMessage)) {
            switch (webPageMessage.key) {
                case ChromeMessageKeys.GetExtensionId:
                    extensionId = webPageMessage.data;
                    break;
            }
        }
    }, false);

    isPluginLoaded(loadGmail);
}

export = AtlanticBTApp;
