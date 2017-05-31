/*
Copyright AtlanticBT.
*/

import { ChromeTabValues } from "../tools/constants";

namespace AtlanticBTApp {
    export let mainTabId: number;
    export let mainWindowId: number;

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if(ChromeTabValues.GmailUrlRegEx.test(tab.url)) {
            mainTabId = tab.id;
            mainWindowId = tab.windowId;
        }
    });
}

export = AtlanticBTApp;
