/*
Copyright AtlanticBT.
*/

namespace AtlanticBTApp {
    export class ChromeStorageKeys {
        public static readonly Session = "sforce_session";
    }

    export class ChromeMessageKeys {
        public static readonly SforceSessionCookie = "sforce_session_cookie";
        public static readonly CreateNotification = "create_notification";
    }

    export class ChromeConnectKeys {
        public static readonly SforceLoginPort = "sforce_login_port";
        public static readonly SforceLogoutPort = "sforce_logout_port";
    }

    export class ChromeCookieCauseKeys {
        public static readonly Overwrite = "overwrite";
        public static readonly Explicit = "explicit";
        public static readonly ExpiredOverwrite = "expired_overwrite";
    }

    export class SforceErrorCodes {
        public static readonly InvalidSession: string = "INVALID_SESSION_ID";
    }

    export class SforceKeys {
        public static readonly SessionCookie: string = "sid";
    }

    export class SforceValues {
        public static readonly InstanceUrl: string = "https://na40.salesforce.com";
        public static readonly CookieDomain: string = "na40.salesforce.com";
        public static readonly FullCookieDomain: string = "https://na40.salesforce.com";
        public static readonly OAuthId: string = "3MVG9i1HRpGLXp.qijeggn1OC__TFqN3KFcMkAkPDAVJEfnfNn9VynFLunBuDnrory4en_kK_hfu861CgL2VZ";
        public static readonly RedirectUrl: string = "https://mail.google.com/mail/u/0";
        public static readonly SforceExtensionId: string = "jjghhkepijgakdammjldcbnjehfkfmha";
        public static readonly SforceExtensionUrl: string = "https://chrome.google.com/webstore/detail/jjghhkepijgakdammjldcbnjehfkfmha";
        public static readonly SforceExtensionName: string = "Salesforce Lightning for Gmail";
    }
}

export = AtlanticBTApp;
