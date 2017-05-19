/*
Copyright AtlanticBT.
*/

namespace AtlanticBTApp {
    export class ChromeMessageRequest {
        public key: string;

        constructor(key: string) {
            this.key = key;
        }
    }

    export class ChromeMessageResponse<T> {
        public type: ChromeMessageResponseTypeEnum;
        public data: T;

        constructor(type: ChromeMessageResponseTypeEnum, data: T) {
            this.type = type;
            this.data = data;
        }
    }

    export enum ChromeMessageResponseTypeEnum {
        loginLoading = 1,
        loginExtension = 2,
        logoutExtension = 3
    }
}

export = AtlanticBTApp;
