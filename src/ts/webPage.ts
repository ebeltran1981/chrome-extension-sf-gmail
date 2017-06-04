/*
Copyright AtlanticBT.
 */

import "gmail-js";
import * as $ from "jquery";

import "./listeners/webPage.listeners";

import { GmailServices } from "./services/gmail.services";

namespace AtlanticBTApp {
    function isPluginLoaded(fn) {
        if (document.readyState !== "complete" || (typeof Gmail === "undefined")) {
            setTimeout(isPluginLoaded.bind(this, fn), 1000);
        } else {
            fn();
        }
    }

    function loadGmail() {
        const gmail = new Gmail($);
        const gmailServices = new GmailServices(gmail);
        gmail.observe.on("load", gmailServices.initialize.bind(gmailServices));
    }

    isPluginLoaded(loadGmail);
}

export = AtlanticBTApp;
