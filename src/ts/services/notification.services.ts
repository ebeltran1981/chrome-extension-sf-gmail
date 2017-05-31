/*
Copyright AtlanticBT.
*/


import { SforceValues } from "../tools/constants";
import { extNotInstalledNotificationId } from "./management.services";

namespace AtlanticBTApp {
    chrome.notifications.onButtonClicked.addListener((nId, bIdx) => {
        if (extNotInstalledNotificationId === nId) {
            window.open(SforceValues.ExtensionUrl, "_blank");
        }
    });
}

export = AtlanticBTApp;
