/*
Copyright AtlanticBT.
*/

import { ChromeMessageType } from "../tools/constants";

namespace AtlanticBTApp {
    export class ChromeMessage<T> {
        public key: string;
        public data: T;
        public type: ChromeMessageType;
        public activator: string;

        constructor(key: string, data?: T, type?: ChromeMessageType) {
            this.key = key;
            this.data = data;
            this.type = type ? type : ChromeMessageType.BackgroundMessage;
        }
    }
}

export = AtlanticBTApp;
