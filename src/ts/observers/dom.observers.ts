/*
Copyright AtlanticBT.
*/

// import { MutationSummary } from "mutation-summary";

declare let MutationSummary: any;

namespace AtlanticBTApp {
    const self: any = {};

    self.setEmailAddress = (a, b, d, e) => {
        debugger;
    };

    self.loadDashboard = (a, b, d, e) => {
        debugger;
    };

    self.composeHandler = (a, b, d, e) => {
        debugger;
    };

    self.gmailExtra = (a, b, d, e) => {
        debugger;
    };

    self.sentEmailHandler = (a, b, d, e) => {
        debugger;
    };

    self.newComposeAddressee = (a, b, d, e) => {
        debugger;
    };

    self.emailIdObserver = (a, b, d, e) => {
        debugger;
    };

    self.handleLoadedEmail = (a, b, d, e) => {
        debugger;
    };

    // listen for title element so we can extract the user's email address
    self.titleObserver = new MutationSummary({
        callback: (summaries) => { self.setEmailAddress(self, summaries); },
        queries: [{ element: "#loading" }]
    });

    self.SignInWithGoogleBtnObserver = new MutationSummary({
        callback: (summaries) => { self.setEmailAddress(self, summaries); },
        queries: [{ element: "img[alt=Sign-in-with-google]" }]
    });

    self.inboxObserver = new MutationSummary({
        callback: (summaries) => { self.loadDashboard(self); },
        queries: [{ element: ".vI8oZc" }, { element: ".ata-asE" }]
    });

    // listen for new popup compose
    self.newComposeObserver = new MutationSummary({
        callback: (summaries) => { self.composeHandler(self, summaries, true, false); },
        queries: [{ element: ".nH.Hd", elementAttributes: "role" }]
    });

    // listen for new replys / forwards
    self.newReplyObserver = new MutationSummary({
        callback: (summaries) => { self.composeHandler(self, summaries, true, true); },
        queries: [{ element: ".aoP.HM" }]
    });

    // listen for old compose / old replys / old forwards
    self.oldComposeObserver = new MutationSummary({
        callback: (summaries) => { self.composeHandler(self, summaries, false); },
        queries: [{ element: ".cf.eA" }]
    });

    // listen for gmail_extra i.e. quoted regions containing old trackers
    self.oldComposeObserver = new MutationSummary({
        callback: (summaries) => { self.gmailExtra(self, summaries); },
        queries: [{ element: ".gmail_extra" }]
    });

    // listen for sent emails loading
    self.sentObserver = new MutationSummary({
        callback: (summaries) => { self.sentEmailHandler(self, summaries); },
        queries: [{ element: ".gE.iv.gt" }]
    });

    // listen for a new 'to' address to be entered when composing an email
    self.newToEmailAddress = new MutationSummary({
        callback: (summaries) => { self.newComposeAddressee(self, summaries); },
        queries: [{ element: ".vR" }]
    });

    self.newEmailIdObserver = new MutationSummary({
        callback: (summaries) => { self.emailIdObserver(self, summaries); },
        queries: [{ element: "#link_vsm", elementAttributes: "role" }]
    });

    // listen for the Gmail message to be opened which will show the buttons for us to insert beside
    self.emailOpenedObserver = new MutationSummary({
        callback: (summaries) => { self.handleLoadedEmail(self, summaries); },
        queries: [{ element: ".gH.acX" }]
    });
}

export = AtlanticBTApp;
