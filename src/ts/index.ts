/*
Copyright AtlanticBT.
 */

import "font-awesome-sass-loader!./config/font-awesome.config";
import "gmail-js";
import "../manifest.json";
import "../scss/index.scss";
import "./services/chrome.services";

import * as $ from "jquery";

import { SforceServices } from "./services/salesforce.services";
import { EventsHelper } from "./tools/helpers";

namespace AtlanticBTApp {
    const gmail = new Gmail($);
    const sforceService = new SforceServices();
    const eventsHelper = new EventsHelper(gmail, sforceService);

    // initialize salesforce
    sforceService.initialize();

    // register main event will tell when Gmail is ready
    gmail.observe.on("load", eventsHelper.initialize.bind(eventsHelper));
}
