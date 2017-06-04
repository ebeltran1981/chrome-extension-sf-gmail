/*
Copyright AtlanticBT.
*/

import * as _ from "lodash";

import { ChromeStorageKeys, SforceValues } from "../tools/constants";
import { createNotification } from "./notification.services";

namespace AtlanticBTApp {
    chrome.management.getAll((result) => {
        let found = false;
        _.forEach(result, (extension) => {
            if (extension.id === SforceValues.ExtensionId && extension.enabled) {
                found = true;
            }
        });
        if (!found) {
            showSforceExtensionNotification();
        }
    });

    chrome.management.onDisabled.addListener((info) => {
        if (info.id === SforceValues.ExtensionId) {
            showSforceExtensionNotification();
        }
    });

    chrome.management.onUninstalled.addListener((id) => {
        if (id === SforceValues.ExtensionId) {
            showSforceExtensionNotification();
        }
    });

    function showSforceExtensionNotification() {
        const notification = {
            type: "basic",
            title: "IMPORTANT",
            message: `${SforceValues.ExtensionName} extension not found or is disabled! Go to the Chrome Store and install it before using AtlanticBT extension.`,
            buttons: [
                {
                    title: "Go to Extension Homepage"
                }
            ]
        };
        const nId = createNotification(notification);
        chrome.storage.local.set({extensionButtonLink: nId});
    }
}

export = AtlanticBTApp;
