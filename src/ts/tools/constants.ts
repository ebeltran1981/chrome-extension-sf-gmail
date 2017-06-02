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
        public static readonly BccSforce = "bcc_sforce";
    }

    export class ChromeCookieKeys {
        public static readonly SforceSession: string = "sid";
    }

    export class ChromeCookieCauseKeys {
        public static readonly Overwrite = "overwrite";
        public static readonly Explicit = "explicit";
        public static readonly ExpiredOverwrite = "expired_overwrite";
    }

    export class ChromeExtensionValues {
        public static readonly ExtensionId: string = "gbajakhniioiefjggbcojmibedeaelbh";
    }

    export class GmailValues {
        public static readonly GmailUrlRegEx: RegExp = /^(https):\/\/(inbox|mail)\.google\.com$/;
    }

    export class ChromeErrorCodes {
        public static readonly SforceInvalidSession: string = "INVALID_SESSION_ID";
        public static readonly CookieGet: string = "cookie_getter_error";
    }

    export class SforceValues {
        public static readonly RedirectUrl: string = "https://mail.google.com/mail/u/0";
        public static readonly ExtensionId: string = "jjghhkepijgakdammjldcbnjehfkfmha";
        public static readonly ExtensionUrl: string = "https://chrome.google.com/webstore/detail/jjghhkepijgakdammjldcbnjehfkfmha";
        public static readonly ExtensionName: string = "Salesforce Lightning for Gmail";
        // public static readonly OAuthId: string = "3MVG9i1HRpGLXp.qijeggn1OC__TFqN3KFcMkAkPDAVJEfnfNn9VynFLunBuDnrory4en_kK_hfu861CgL2VZ"; // Edwin ABT Developer Account
        public static readonly OAuthId: string = "3MVG97wqanbUM37Jm2iv5h_W.ym43KVYOLEMc1D7PniR7XsxlEH3Uo2.ep0ByZHfUUuGqsZa.9sX7e47kEWvz"; // ABT Sandbox3
        public static readonly CookieDomainRegEx: RegExp = /^((?=\w*[a-z])(?=\w*[0-9])\w+)(\.salesforce\.com)(:\d+)?$/;
        public static readonly InstanceRegEx: RegExp = /^(https):\/\/((?=\w*[a-z])(?=\w*[0-9])\w+)(\.salesforce\.com)(:\d+)?$/;
    }
}

export = AtlanticBTApp;
