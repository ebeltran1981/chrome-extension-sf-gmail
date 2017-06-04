/*
Copyright AtlanticBT.
*/

namespace AtlanticBTApp {
    export class ErrorModel {
        public readonly code: string;
        public readonly message: string;

        constructor(code: string, message: string) {
            this.code = code;
            this.message = message;
        }
    }
}

export = AtlanticBTApp;
