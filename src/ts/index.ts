/*
Copyright AtlanticBT.
 */

import "font-awesome-sass-loader!./config/font-awesome.config";
import "gmail-js";
import "../manifest.json";
import "../scss/index.scss";

import * as $ from "jquery";

import { SforceAuth } from "./services/salesforce.services";
import { EventsHelper, ExtensionHelper } from "./tools/helpers";

namespace AtlanticBTApp {
    const gmail = new Gmail($);
    const force = new SforceAuth();

    const extensionHelper = new ExtensionHelper(gmail);
    const eventsHelper = new EventsHelper(gmail);

    // register main event will tell when Gmail is ready
    gmail.observe.on("load", eventsHelper.initialize.bind(eventsHelper));
}
