/*
Copyright AtlanticBT.
 */

import "gmail-js";
import * as $ from "jquery";
import "./listeners/webPage.listeners";
import { ChromeMessage } from "./models/chrome.model";
import { GmailServices } from "./services/gmail.services";
import { ChromeExtensionValues, ChromeMessageKeys } from "./tools/constants";

namespace AtlanticBTApp {
    function isPluginLoaded(fn) {
        if (document.readyState !== "complete" || (typeof Gmail === "undefined")) {
            setTimeout(isPluginLoaded.bind(this, fn), 1000);
        } else {
            fn();
        }
    }

    function loadSforce() {
        const message = new ChromeMessage(ChromeMessageKeys.LoadSforce);
        chrome.runtime.sendMessage(ChromeExtensionValues.ExtensionId, message);
    }

    function loadGmail() {
        const gmail = new Gmail($);
        const gmailServices = new GmailServices(gmail);
        gmail.observe.on("load", gmailServices.initialize.bind(gmailServices));
    }

    isPluginLoaded(loadGmail);
    loadSforce();
}

export = AtlanticBTApp;
