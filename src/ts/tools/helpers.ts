/*
Copyright AtlanticBT.
 */

import * as $ from "jquery";

import { ChromeMessageRequest } from "../models/chrome.model";
import { SforceServices } from "../services/salesforce.services";
import { ChromeMessageKeys } from "./constants";
import { ComposeElements } from "./elements";

namespace AtlanticBTApp {
    /**
     * @description meant for plugin information
     */
    export class ExtensionHelper {
        private _gmail: Gmail;
        private _userEmail: string;

        constructor(gmail: Gmail) {
            this._gmail = gmail;
            this._userEmail = this._gmail.get.user_email();
        }
    }

    /**
     * @description meant for gmail and salesforce events interactions
     */
    export class EventsHelper {
        public initialize(): void {
            const message = new ChromeMessageRequest(ChromeMessageKeys.IsSforceLoggedIn);

            chrome.runtime.sendMessage("gbajakhniioiefjggbcojmibedeaelbh", message, (cookie) => {
                debugger;
            });
        }
    }
}

export = AtlanticBTApp;
