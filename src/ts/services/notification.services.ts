/*
Copyright AtlanticBT.
*/

import * as uuid from "uuid/v1";

import { ChromeStorageKeys, SforceValues } from "../tools/constants";

namespace AtlanticBTApp {
    chrome.notifications.onButtonClicked.addListener((nId, bIdx) => {
        chrome.storage.local.get("extensionButtonLink", (item) => {
            if (item.extensionButtonLink === nId) {
                window.open(SforceValues.ExtensionUrl, "_blank");
            }
        });
    });

    /**
     * Method to create a notification. It returns the Id of the notification.
     * @param options options to show notification. See Chrome documentation about notifications.
     */
    export function createNotification(options: chrome.notifications.NotificationOptions): string {
        const id = uuid();
        options.iconUrl = "images/favicon_black48.png";
        chrome.notifications.create(id, options, () => {
            if (chrome.runtime.lastError) {
                console.error("LAST ERROR: ", chrome.runtime.lastError);
            }
        });
        return id;
    }
}

export = AtlanticBTApp;
