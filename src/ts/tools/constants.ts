/*
Copyright AtlanticBT.
*/

namespace AtlanticBTApp {
    export class ChromeStorageKeys {
        public static readonly SforceSession: string = "sforce_session";
        public static readonly ExtensionButtonLink: string = "extension_button_link";
    }

    export class ChromeConnectKeys {
        public static readonly LoginPort = "sforce_login_port";
    }

    export class ChromeMessageKeys {
        public static readonly LoadSforceFromInit = "load_sforce_init";
        public static readonly WarnIfNotLoggedIn = "warn_sforce_not_loggedin";
        public static readonly GetExtensionId = "get_extension_id";
        public static readonly BccSforce = "bcc_sforce";
    }

    export enum ChromeMessageType {
        BackgroundMessage = 1000,
        ContentScriptMessage = 1001,
        WebPageMessage = 1002
    }

    export class ChromeCookieKeys {
        public static readonly SforceSession: string = "sid";
    }

    export class ChromeCookieCauseKeys {
        public static readonly Overwrite = "overwrite";
        public static readonly Explicit = "explicit";
        public static readonly ExpiredOverwrite = "expired_overwrite";
    }

    export class GmailValues {
        public static readonly GmailUrlRegEx: RegExp = /^(https):\/\/(inbox|mail)\.google\.com$/;
        public static readonly GetEmailRegEx: RegExp = /[a-zA-Z0-9-_.]+@[a-zA-Z0-9-_.]+/;
    }

    export class ChromeErrorCodes {
        public static readonly SforceInvalidSession: string = "INVALID_SESSION_ID";
        public static readonly CookieGet: string = "cookie_getter_error";
        public static readonly CookieNotFound: string = "cookie_notfound_error";
    }

    export class SforceValues {
        public static readonly ExtensionId: string = "jjghhkepijgakdammjldcbnjehfkfmha";
        public static readonly ExtensionUrl: string = "https://chrome.google.com/webstore/detail/jjghhkepijgakdammjldcbnjehfkfmha";
        public static readonly ExtensionName: string = "Salesforce Lightning for Gmail";
        public static readonly CookieDomainRegEx: RegExp = /^((?=\w*[a-z])(?=\w*[0-9])\w+)(\.salesforce\.com)(:\d+)?$/;
        public static readonly InstanceRegEx: RegExp = /^(https):\/\/((?=\w*[a-z])(?=\w*[0-9])\w+)(\.salesforce\.com)(:\d+)?$/;
    }
}

export = AtlanticBTApp;
