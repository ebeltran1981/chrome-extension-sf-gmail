/*
Copyright AtlanticBT.
 */

import "gmail-js";

import * as $ from "jquery";

import { EventsHelper, ExtensionHelper } from "./tools/helpers";

namespace AtlanticBTApp {
    const gmail = new Gmail($);

    const extensionHelper = new ExtensionHelper(gmail);
    const eventsHelper = new EventsHelper(gmail);

    // register main event will tell when Gmail is ready
    gmail.observe.on("load", eventsHelper.initialize.bind(eventsHelper));
}
