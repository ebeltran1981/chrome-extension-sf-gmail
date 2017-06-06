/*
Copyright AtlanticBT.
 */

// tslint:disable-next-line:no-var-requires
const gmailjs = require("gmail-js");

import * as $ from "jquery";

import "./listeners/webPage.listeners";

import { ChromeMessage } from "./models/chrome.model";
import { GmailServices } from "./services/gmail.services";
import { ChromeMessageKeys, ChromeMessageType } from "./tools/constants";

namespace AtlanticBTApp {
    export function isPluginLoaded(fn, params) {
        if (document.readyState === "complete" && typeof gmailjs !== "undefined" && chrome.runtime !== undefined) {
            fn(params);
        } else {
            setTimeout(isPluginLoaded.bind(this, fn, params), 100);
        }
    }

    export function loadGmail(eId) {
        const gmail = new gmailjs.Gmail($);
        const gmailServices = new GmailServices(eId, gmail);
        gmail.observe.on("load", gmailServices.initialize.bind(gmailServices), (a, b, c, d) => {
            debugger;
        });
    }

    window.addEventListener("message", (event) => {
        if (event.source != window) {
            return;
        }

        const webPageMessage = event.data as ChromeMessage<any>;
        if (webPageMessage.type && (webPageMessage.type === ChromeMessageType.WebPageMessage)) {
            switch (webPageMessage.key) {
                case ChromeMessageKeys.GetExtensionId:
                    isPluginLoaded(loadGmail, webPageMessage.data);
                    break;
            }
        }
    }, false);

    const eIdMessage = new ChromeMessage(ChromeMessageKeys.GetExtensionId, null, ChromeMessageType.ContentScriptMessage);
    window.postMessage(eIdMessage, "*");

}

export = AtlanticBTApp;
