/*
Copyright AtlanticBT.
 */

import * as $ from "jquery";

import "gmail-js";

import { SforceServices } from "./services/salesforce.services";
import { EventsHelper, ExtensionHelper } from "./tools/helpers";

namespace AtlanticBTApp {
    function isPluginLoaded(fn) {
        if ((/in/.test(document.readyState)) || (typeof Gmail === "undefined")) {
            setTimeout(isPluginLoaded.bind(this, fn), 1000);
        } else {
            fn();
        }
    }

    function loadGmail() {
        const gmail = new Gmail($);

        const eventsHelper = new EventsHelper();

        gmail.observe.on("load", eventsHelper.initialize.bind(eventsHelper));
    }

    isPluginLoaded(loadGmail);
}

export = AtlanticBTApp;
