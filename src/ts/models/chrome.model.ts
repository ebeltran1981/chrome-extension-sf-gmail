/*
Copyright AtlanticBT.
*/

namespace AtlanticBTApp {
    export class ChromeMessageRequest<T> {
        public key: string;
        public data: T;

        constructor(key: string, data?: T) {
            this.key = key;
            this.data = data;
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
