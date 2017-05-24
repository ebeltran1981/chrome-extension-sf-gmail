/*
Copyright AtlanticBT.
*/

namespace AtlanticBTApp {
    export class WindowEventKeys {
        public static readonly SforceLogin: string = "sforce_login";
        public static readonly SforceLogout: string = "Sforce_logout";
    }

    export class ChromeMessageKeys {
        public static readonly CreateNotification = "create_notification";
        public static readonly LoadSforce = "load_sforce";
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

    export class ChromeExtensionValues {
        public static readonly ExtensionId: string = "gbajakhniioiefjggbcojmibedeaelbh";
    }

    export class SforceValues {
        public static readonly InstanceUrl: string = "https://na40.salesforce.com";
        public static readonly CookieDomain: string = "na40.salesforce.com";
        public static readonly FullCookieDomain: string = "https://na40.salesforce.com";
        public static readonly OAuthId: string = "3MVG9i1HRpGLXp.qijeggn1OC__TFqN3KFcMkAkPDAVJEfnfNn9VynFLunBuDnrory4en_kK_hfu861CgL2VZ";
        public static readonly RedirectUrl: string = "https://mail.google.com/mail/u/0";
    }
}

export = AtlanticBTApp;
