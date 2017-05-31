/*
Copyright AtlanticBT.
*/

namespace AtlanticBTApp {
    export class ChromeMessage<T> {
        public key: string;
        public data: T;

        constructor(key: string, data?: T) {
            this.key = key;
            this.data = data;
        }
    }
}

export = AtlanticBTApp;
