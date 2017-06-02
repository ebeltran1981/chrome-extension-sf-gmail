/*
Copyright AtlanticBT.
*/

import * as _ from "lodash";
import { ChromeStorageModel } from "../models/chrome.model";
import { ChromeStorageKeys, SforceValues } from "../tools/constants";
import { createNotification } from "./notification.services";

namespace AtlanticBTApp {
    export let extNotInstalledNotificationId: string = null;
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
        const extButtonStorage = new ChromeStorageModel(ChromeStorageKeys.ExtensionButtonLink, nId);
        chrome.storage.local.set(extButtonStorage);
    }
}

export = AtlanticBTApp;
