/*
Copyright AtlanticBT.
*/

import * as jsforce from "jsforce";
import * as _ from "lodash";

import { ErrorModel } from "../models/error.model";
import { SforceGmailModel } from "../models/gmail.model";
import { ISforceContactModel, ISforceUserModel, SforceErrorModel, SforceUserModel } from "../models/sforce.model";
import { ChromeCookieKeys, ChromeErrorCodes, SforceValues } from "../tools/constants";
import { getSessionCookies } from "./cookie.services";
import { createNotification } from "./notification.services";

namespace AtlanticBTApp {
    export let connection: any;
    export let currentUser: SforceUserModel;

    export function setSforceConnection(cookie: chrome.cookies.Cookie): void {
        connection = new jsforce.Connection({
            oauth2: {
                clientId: SforceValues.OAuthId,
                redirectUri: SforceValues.RedirectUrl
            },
            instanceUrl: `https://${cookie.domain}`,
            accessToken: cookie.value
        });
    }

    export function processSessionCookie(): Promise<chrome.cookies.Cookie> {
        const promise = new Promise((resolve: (cookie: chrome.cookies.Cookie) => {}, reject: (error: ErrorModel) => {}) => {
            getSessionCookies().then((cookies) => {
                if (_.isEmpty(cookies)) {
                    currentUser = null;
                    const error = new ErrorModel(ChromeErrorCodes.CookieNotFound, "No session cookies found.");
                    reject(error);
                    return;
                }
                let counter = 0;
                _.forEach(cookies, (c) => {
                    setSforceConnection(c);
                    connection.identity((err: SforceErrorModel, res: ISforceUserModel) => {
                        if (err) {
                            counter++;
                            if (counter === cookies.length) {
                                currentUser = null;
                                const error = new ErrorModel(err.errorCode, err.message);
                                reject(error);
                                return false;
                            }
                            return;
                        }
                        currentUser = new SforceUserModel(res);
                        resolve(c);
                        return false;
                    });
                });
            }).catch((error: ErrorModel) => {
                reject(error);
            });
        });
        return promise;
    }

    export function bccSforce(message: SforceGmailModel) {
        connection
            .sobject("Contact")
            .select("Id, AccountId")
            .where({
                Email: message.to
            })
            .execute((errC, resC: ISforceContactModel[]) => {
                if (errC) {
                    return console.error("Error finding Contacts", errC);
                }

                let aIds = _.map(resC, (c) => {
                    return c.AccountId;
                });

                aIds = _.uniq(aIds);

                _.forEach(aIds, (aId) => {
                    const cIds: string[] = [];
                    _.forEach(resC, (c) => {
                        if (c.AccountId === aId) {
                            cIds.push(c.Id);
                        }
                    });
                    const task = {
                        OwnerId: currentUser.user_id,
                        Subject: message.subject,
                        Description: message.body,
                        TaskSubtype: "Email",
                        TaskWhoIds: cIds,
                        WhatId: aId
                    };
                    connection
                        .sobject("Task")
                        .create(task, (errT, resT) => {
                            if (errT || !resT.success) {
                                return console.error(errT, resT);
                            }
                            console.log("Task created");
                        });
                });
            });
    }
}

export = AtlanticBTApp;
