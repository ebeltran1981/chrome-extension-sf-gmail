/*
Copyright AtlanticBT.
 */

import * as $ from "jquery";

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

    // let gmail;

    // function refresh(f) {
    //     if ((/in/.test(document.readyState)) || (typeof Gmail === "undefined")) {
    //         setTimeout(refresh.bind(this, f), 10);
    //     } else {
    //         f();
    //     }
    // }

    // const main = () => {
    //     // NOTE: Always use the latest version of gmail.js from
    //     // https://github.com/KartikTalwar/gmail.js
    //     gmail = new Gmail($);
    //     console.log("Hello, from abt extension: ", gmail.get.user_email());
    // };

    // refresh(main);
}

export = AtlanticBTApp;
