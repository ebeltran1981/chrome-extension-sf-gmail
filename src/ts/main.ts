/*
Copyright AtlanticBT.
 */

import "font-awesome-sass-loader!./config/font-awesome.config";
import "../manifest.json";
import "../scss/main.scss";

import * as $ from "jquery";

import "font-awesome-sass-loader!./config/font-awesome.config";
import "gmail-js";

import { SforceServices } from "./services/salesforce.services";
import { EventsHelper, ExtensionHelper } from "./tools/helpers";

namespace AtlanticBTApp {
    const gmail = new Gmail($);

    const extensionHelper = new ExtensionHelper(gmail);
    const sforceService = new SforceServices(extensionHelper);
    const eventsHelper = new EventsHelper(gmail, extensionHelper, sforceService);

    // register main event will tell when Gmail is ready
    gmail.observe.on("load", eventsHelper.initialize.bind(eventsHelper));
}

export = AtlanticBTApp;
