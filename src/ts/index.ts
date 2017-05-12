/*
Copyright AtlanticBT.
 */

import "gmail-js";

import * as $ from "jquery";
import * as _ from "lodash";

import { EventsHelper, ExtensionHelper } from "./tools/helpers";

namespace AtlanticBTApp {
    let gmail = new Gmail($);

    let extensionHelper = new ExtensionHelper(gmail);
    const eventsHelper = new EventsHelper(gmail);

    // register all events then the events helper decides where to direct the action
    gmail.observe.on("load", eventsHelper.initialize.bind(eventsHelper));
}
