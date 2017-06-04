/*
Copyright AtlanticBT.
*/

import * as $ from "jquery";
import * as _ from "lodash";

import { GmailValues } from "../tools/constants";
import { EmailTemplates } from "../tools/templates";

namespace AtlanticBTApp {
    abstract class BaseGmailModel {
        public readonly draft: string;
        public readonly body: string;
        public readonly isHtml: boolean;
        public readonly subject: string;
        public readonly to: string[];
        public readonly cc: string[];
        public readonly bcc: string[];

        constructor(currentUser: string, data: any) {
            // Draft Id processing
            this.draft = data.draft;

            // To list processing
            const $toList = data.to && data.to instanceof Array ? data.to : [];
            this.to = [];
            _.forEach($toList, (to: string) => {
                if (!_.isEmpty(to)) {
                    const match = GmailValues.GetEmailRegEx.exec(to);
                    if (_.isEmpty(match)) {
                        return;
                    }
                    this.to.push(match[0]);
                }
            });

            // Cc list processing
            const $ccList = data.cc && data.cc instanceof Array ? data.cc : [];
            this.cc = [];
            _.forEach($ccList, (cc: string) => {
                if (!_.isEmpty(cc)) {
                    const match = GmailValues.GetEmailRegEx.exec(cc);
                    if (_.isEmpty(match)) {
                        return;
                    }
                    this.cc.push(match[0]);
                }
            });

            // Bcc list processing
            const $bccList = data.bcc && data.bcc instanceof Array ? data.bcc : [];
            this.bcc = [];
            _.forEach($bccList, (bcc: string) => {
                if (!_.isEmpty(bcc)) {
                    const match = GmailValues.GetEmailRegEx.exec(bcc);
                    if (_.isEmpty(match)) {
                        return;
                    }
                    this.bcc.push(match[0]);
                }
            });

            // Subject processing
            this.subject = data.subject ? data.subject : data.subjectbox;

            // Is HTML processing
            this.isHtml = data.ishtml === "1";

            // Body text processing
            let body;
            if (this.isHtml) {
                const bodyContainer = $(document.createElement("div"));
                bodyContainer.html(data.body);
                bodyContainer.find(".gmail_signature").remove();

                body = _.replace(bodyContainer.html(), /<br>/gi, "\n\n");
                body = _.replace(body, /<br\/>/gi, "\n\n");
                body = _.replace(body, /<\/p>/gi, "</p>\n\n");
                body = _.replace(body, /<\/div>/gi, "</div>\n\n");
                body = _.replace(body, /<\/h1>/gi, "</h1>\n\n");
                body = _.replace(body, /<\/h2>/gi, "</h2>\n\n");
                body = _.replace(body, /<\/h3>/gi, "</h3>\n\n");
                body = _.replace(body, /<\/h4>/gi, "</h4>\n\n");
                body = _.replace(body, /<\/h5>/gi, "</h5>\n\n");
                body = _.replace(body, /<\/h6>/gi, "</h6>\n\n");

                bodyContainer.html(body);

                body = bodyContainer.text();
            } else {
                body = data.body;
            }
            body = _.truncate(body, {
                length: 32000 - 58, // doubled the limit due to the omission text.
                omission: "[-----MESSAGE TRUNCATED-----]"
            });

            body = EmailTemplates.SforceTask
                .replace("{{from}}", currentUser)
                .replace("{{toList}}", _.join(this.to, ", "))
                .replace("{{ccList}}", _.join(this.cc, ", "))
                .replace("{{bccList}}", _.join(this.bcc, ", "))
                .replace("{{subject}}", this.subject)
                .replace("{{body}}", body);

            this.body = body;
        }
    }

    export class SforceGmailModel extends BaseGmailModel {
        public readonly bcc_salesforce: boolean;

        constructor(currentUser: string, data: any) {
            super(currentUser, data);

            // Bcc Salesforce processing
            this.bcc_salesforce = data.bcc_salesforce === "on";
        }
    }
}

export = AtlanticBTApp;
