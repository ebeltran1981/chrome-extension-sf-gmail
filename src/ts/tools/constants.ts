/*
Copyright AtlanticBT.
*/

namespace AtlanticBTApp {
    export class ChromeStorageKeys {
        public static readonly SforceSession: string = "sforce_session";
    }

    export class ChromeConnectKeys {
        public static readonly LoginPort = "sforce_login_port";
    }

    export class ChromeMessageKeys {
        public static readonly CreateNotification = "create_notification";
        public static readonly LoadSforceFromInit = "load_sforce_init";
        public static readonly LoadSforceFromCookie = "load_sforce_cookie";
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

    export class SforceErrorCodes {
        public static readonly InvalidSession: string = "INVALID_SESSION_ID";
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
