/*
Copyright AtlanticBT.
*/

import * as jsforce from "jsforce";
import * as _ from "lodash";

import { ISforceUserModel, SforceErrorModel, SforceUserModel } from "../models/sforce.model";
import { ChromeCookieKeys, SforceErrorCodes, SforceValues } from "../tools/constants";
import { createNotification } from "./notification.services";

namespace AtlanticBTApp {
    export let connection: any;
    export let currentUser: SforceUserModel;

    export function initSforceConnection(cookie: chrome.cookies.Cookie): void {
        connection = new jsforce.Connection({
            oauth2: {
                clientId: SforceValues.OAuthId,
                redirectUri: SforceValues.RedirectUrl
            },
            instanceUrl: `https://${cookie.domain}`,
            accessToken: cookie.value
        });
    }

    export function isValidSforceSession(cookie: chrome.cookies.Cookie): Promise<boolean> {
        const promise = new Promise<boolean>((resolve: (value: boolean) => {}, reject) => {
            if (_.isEmpty(connection)) {
                resolve(false);
                return;
            }

            connection.identity((err, res: ISforceUserModel) => {
                if (err) {
                    reject(err);
                    return;
                }
                currentUser = new SforceUserModel(res);
                resolve(true);
            });
        });

        return promise;
    }

    export function loadSforceFromInit() {
        const details: chrome.cookies.GetAllDetails = {};
        chrome.cookies.getAll(details, (cookies) => {
            _.forEach(cookies, (cookie) => {
                if (cookie.name === ChromeCookieKeys.SforceSession && SforceValues.CookieDomainRegEx.test(cookie.domain)) {
                    processCookie(cookie, "loadSforceFromInit");
                    return;
                }
            });
        });
    }

    export function loadSforceFromCookie(cookie: chrome.cookies.Cookie) {
        processCookie(cookie, "loadSforceFromCookie");
    }

    function processCookie(cookie: chrome.cookies.Cookie, caller: string) {
        let notification;

        initSforceConnection(cookie);
        isValidSforceSession(cookie).then((valid) => {
            if (valid) {
                notification = {
                    type: "basic",
                    title: "LOGIN",
                    message: `${currentUser.availableName}, you're logged in Salesforce!`
                };
            } else {
                notification = {
                    type: "basic",
                    title: "WARNING",
                    message: "Salesforce session expired or is invalid. Please login to Salesforce."
                };
            }
            createNotification(notification);
        }).catch((error: SforceErrorModel) => {
            switch (error.errorCode) {
                case SforceErrorCodes.InvalidSession:
                    notification = {
                        type: "basic",
                        title: "WARNING",
                        message: "Salesforce session expired or is invalid. Please login to Salesforce."
                    };
                    break;
                default:
                    notification = {
                        type: "basic",
                        title: "ERROR",
                        message: error.message
                    };
                    break;
            }
            createNotification(notification);
            currentUser = null;
        });
    }
}

export = AtlanticBTApp;
