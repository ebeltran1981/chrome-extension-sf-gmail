/*
Copyright AtlanticBT.
 */

import * as $ from "jquery";
import * as _ from "lodash";

import { ChromeMessage } from "../models/chrome.model";
import { ISforceContactModel } from "../models/sforce.model";
import { SforceServices } from "../services/salesforce.services";
import { ChromeMessageKeys } from "./constants";
import { ComposeElements } from "./elements";
import { EmailTemplates } from "./templates";

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
        private _gmail: Gmail;
        private _sforce: SforceServices;
        private _composeEl: ComposeElements;

        constructor(gmail: Gmail, extensionHelper: ExtensionHelper, sforce: SforceServices) {
            this._gmail = gmail;
            this._sforce = sforce;
            this._composeEl = new ComposeElements();
        }

        public initialize(): void {
            this._gmail.observe.on("compose", this.composeEmail.bind(this));
        }

        private composeEmail(compose: GmailDomCompose, type: GmailComposeType): void {
            const gmail = this._gmail;
            const sforce = this._sforce;
            const composeEl = this._composeEl;
            const composes = gmail.dom.composes();
            if (sforce.isLoggedIn()) {
                $.each(composes, (idx: number, item: GmailDomCompose) => {
                    const form = item.$el.find("form");

                    if (composeEl.hasToolbar(form)) {
                        return;
                    }

                    const toolbar = composeEl.add_toolbar(form);

                    // Bcc Salesforce
                    const chkDiv = composeEl.checkbox("bcc_salesforce", "Bcc Salesforce", "checkbox", false);
                    toolbar.append(chkDiv);
                    const chk = chkDiv.find("input[type=checkbox]");

                    chk.on("change", (e) => {
                        if ((e.currentTarget as HTMLInputElement).checked) {
                            if (!sforce.isLoggedIn()) {
                                const notification = {
                                    type: "basic",
                                    title: "WARNING",
                                    message: "You are not logged in Salesforce"
                                };
                                const message = new ChromeMessage(ChromeMessageKeys.CreateNotification, notification);
                                chrome.runtime.sendMessage(message);
                            }
                        }
                    });

                    const sendBtn = item.dom("send_button");
                    sendBtn.on("click", (e) => {
                        const bccSalesforce = chk.is(":checked");
                        if (bccSalesforce) {
                            const $toList: JQuery = item.to() as any;
                            const toList: string[] = [];
                            $.each($toList.siblings("div.vR").children("span.vN.vP"), (elIdx, elem) => {
                                _.forEach(elem.attributes, (attr) => {
                                    if (attr.nodeName === "email") {
                                        toList.push(attr.nodeValue);
                                    }
                                });
                            });

                            const $ccList: JQuery = item.cc() as any;
                            const ccList: string[] = [];
                            $.each($ccList.siblings("div").children("span"), (elIdx, elem) => {
                                _.forEach(elem.attributes, (attr) => {
                                    if (attr.nodeName === "email") {
                                        ccList.push(attr.nodeValue);
                                    }
                                });
                            });

                            const $bccList: JQuery = item.bcc() as any;
                            const bccList: string[] = [];
                            $.each($bccList.siblings("div").children("span"), (elIdx, elem) => {
                                _.forEach(elem.attributes, (attr) => {
                                    if (attr.nodeName === "email") {
                                        bccList.push(attr.nodeValue);
                                    }
                                });
                            });

                            const bodyContainer = $(document.createElement("div"));
                            bodyContainer.html(item.body());
                            bodyContainer.find(".gmail_signature").remove();

                            let body = _.replace(bodyContainer.html(), /<br>/gi, "\n\n");
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

                            body = _.truncate(body, {
                                length: 32000 - 58, // doubled the limit due to the omission text.
                                omission: "[-----MESSAGE TRUNCATED-----]"
                            });

                            const subject = item.subject();

                            body = EmailTemplates.SforceTask
                                .replace("{{from}}", this._sforce.currentUser.email)
                                .replace("{{toList}}", _.join(toList, ", "))
                                .replace("{{ccList}}", _.join(ccList, ", "))
                                .replace("{{bccList}}", _.join(bccList, ", "))
                                .replace("{{subject}}", subject)
                                .replace("{{body}}", body);

                            let contacts: ISforceContactModel[] = [];

                            _.forEach(toList, (toEmail) => {
                                sforce.connection
                                    .sobject("Contact")
                                    .select("Id, AccountId")
                                    .where({
                                        Email: toEmail
                                    })
                                    .execute((errC, resC: ISforceContactModel[]) => {
                                        if (errC) {
                                            return console.error(`Error finding Contact: ${toEmail}`);
                                        }
                                        _.forEach(resC, (contact) => {
                                            contacts.push(contact);
                                        });

                                        // Remove possible duplicates on contacts
                                        contacts = _.uniqBy(contacts, "Id");

                                        _.forEach(contacts, (c) => {
                                            const task = {
                                                OwnerId: sforce.currentUser.user_id,
                                                Subject: subject,
                                                Description: body,
                                                TaskSubtype: "Email",
                                                WhoId: c.Id,
                                                WhatId: c.AccountId
                                            };
                                            sforce.connection
                                                .sobject("Task")
                                                .create(task, (errT, resT) => {
                                                    if (errT || !resT.success) {
                                                        return console.error(errT, resT);
                                                    }
                                                    console.log("Task created");
                                                });
                                        });
                                    });
                            });
                        }
                    });
                });
            }
        }
    }
}

export = AtlanticBTApp;
