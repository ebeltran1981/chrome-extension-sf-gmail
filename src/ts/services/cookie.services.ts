/*
Copyright AtlanticBT.
*/

import * as _ from "lodash";

import { ErrorModel } from "../models/error.model";
import { ChromeCookieKeys, ChromeErrorCodes, SforceValues } from "../tools/constants";

namespace AtlanticBTApp {
    export function getSessionCookies(): Promise<chrome.cookies.Cookie[]> {
        const promise = new Promise((resolve: (cookies: chrome.cookies.Cookie[]) => {}, reject: (error: ErrorModel) => {}) => {
            const cookies: chrome.cookies.Cookie[] = [];
            chrome.cookies.getAll({}, (cList) => {
                if (chrome.runtime.lastError) {
                    const error = new ErrorModel(ChromeErrorCodes.CookieGet, chrome.runtime.lastError.message);
                    reject(error);
                    return;
                }
                _.forEach(cList, (c) => {
                    if (c.name === ChromeCookieKeys.SforceSession && SforceValues.CookieDomainRegEx.test(c.domain)) {
                        cookies.push(c);
                    }
                });
                resolve(cookies);
            });
        });
        return promise;
    }
}

export = AtlanticBTApp;
