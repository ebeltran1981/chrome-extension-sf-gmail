/*
Copyright AtlanticBT.
*/

namespace AtlanticBTApp {
    export class EmailTemplates {
        public static readonly SforceTask: string = `
        From: {{from}}
        To: {{toList}}
        Cc: {{ccList}}
        Bcc: {{bccList}}
        Subject: {{subject}}

        {{body}}`;
    }
}

export = AtlanticBTApp;
