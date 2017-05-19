/*
Copyright AtlanticBT.
*/

import * as uuid from "uuid/v1";

namespace AtlanticBTApp {

    /**
     * Method to create a notification. It returns the Id of the notification.
     * @param options options to show notification. See Chrome documentation about notifications.
     */
    export function createNotification(options: chrome.notifications.NotificationOptions): string {
        const id = uuid();
        options.iconUrl = "images/favicon_black80.png";
        chrome.notifications.create(id, options, () => {
            if (chrome.runtime.lastError) {
                console.log("LAST ERROR: ", chrome.runtime.lastError);
            }
        });
        return id;
    }
}

export = AtlanticBTApp;
