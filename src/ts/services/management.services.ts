/*
Copyright AtlanticBT.
*/

import * as _ from "lodash";
import { SforceValues } from "../tools/constants";
import { createNotification } from "../tools/notifications";

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
            const notification = {
                type: "basic",
                title: "IMPORTANT",
                message: `${SforceValues.ExtensionName} extension not found or is disabled! Go to the Chrome Store and install it before using AtlanticBT extension.`,
                buttons: [
                    {
                        title: "Goto Extension Homepage"
                    }
                ]
            };
            extNotInstalledNotificationId = createNotification(notification);
        }
    });
}

export = AtlanticBTApp;
