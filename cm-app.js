var fixIntrvl=null;

var CMApp = function(){

  //production url (change to http://localhost:3000 for local), do the same in CMBackground
  // this.baseURL = "http://localhost:3000";
  // this.baseURL = "http://localhost:9292";
  // this.baseURL = "https://staging.contactmonkey.com";
  this.baseURL = "https://contactmonkey.com";
  this.pluginCurrentEnv = (this.baseURL == "https://contactmonkey.com" ? 'production' : 'staging');

  //extension base path
  this.extBaseUrl = chrome.extension.getURL("/");

  if (!chrome.runtime) {
    // Chrome 20-21
    chrome.runtime = chrome.extension;
  } else if(!chrome.runtime.onMessage) {
      // Chrome 22-25
      chrome.runtime.onMessage = chrome.extension.onMessage;
      chrome.runtime.sendMessage = chrome.extension.sendMessage;
      chrome.runtime.onConnect = chrome.extension.onConnect;
      chrome.runtime.connect = chrome.extension.connect;
  };

  // plugin version
  this.version = chrome.runtime.getManifest().version;

  //the id of the chrome extension
  this.pluginID = chrome.runtime.id;

  this.primary_email_tab = false;

  //user's email address
  this.email = null;

  //previous tab email
  this.previousEmail = null;

  // CM flags
  this.mail_merge_enabled = false;
  this.send_later_enabled = false;
  this.sendLaterBtnDisabledState = true;

  // is this a mac with an apple key code
  this.isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;

  // html tag
  this.html

  // array of urls that could be loaded in the sidebar. If any of these are loaded, the hover should not navigate away
  this.urlsToIgnoreHover =[
  "/dashboard/contacts/",
  "/dashboard/leads/",
  "/dashboard/opportunities/",
  "/dashboard/activities/",
  "/dashboard/cases/"
  ];

  this.shiftedComposeContainer = false;

  //defaults for link tracking and email tracking
  this.defaultDoTrackEmails = true;
  this.defaultDoTrackLinks = true;
  this.defaultDoBcc = false;

  this.salesforce_bcc_email = null;

  this.is_salesforce_user = false;

  this.gmailExtraRemoved = false;

  this.lastDashboardData = {};
  this.lastSentEmailData = {sobjects: {}};
  this.quickAddIfReply = false;

  //initialize the entire app
  this.init(this);

  this.force_reload_on_focus = false;
};

CMApp.prototype.init = function(self) {
  console.log("APP CREATED");

  window.setTimeout(function(){
    if (!self.isDashboardInjected()){
      if (window.location.host.indexOf("google") > 0 || window.location.host.indexOf("gmail") > 0){
        console.log("*** Warning, injecting dashboard through timeout");
        self.loadDashboard(self);
      }
    }
  }, 10000);

  //listen for messages from the background script
  chrome.runtime.onMessage.addListener(function(command, sender, sendResponse){
    self.messageListener(self, command, sender, sendResponse);
    //returning true means that we intend to return an asynchronous response
    //see chrome api documentation on runtime.onMessage
    if(command.response){ return true; }
  });


  // Force the sidebar on visible GMAIL tab to reload on tab change when needed.
  document.addEventListener('visibilitychange', function(){
    console.log('~visibilitychange')
    if (document.visibilityState == "visible"){
      console.log("DETECTED TAB CHANGE USING DOCUMENT"); // change tab text for demo
      console.log("^---- EMAIL: " + self.email);
      console.log( document.visibilityState );

      self.sendCommand(self, {cmd: "GET_PREVIOUS_EMAIL", email: self.email}, function(self, sendResponse){
          console.log("Getting previousEmail cookie:: " + sendResponse);

          if (sendResponse != self.email){
            console.log("^----- RELOAD_CURRENT_TAB");
            console.log("^------- CURRENT_TAB: " + sendResponse.tabEmail);
            // self.sendCommand(self, {cmd: "RELOAD_CURRENT_TAB"});
            self.setEmailAddressTrigger(self, $('#loading'), sendResponse)
          } else {
              // if this is an alternative address and the primary address is active don't reload
              if (self.sendLaterBtnDisabledState == false){
                if (sendResponse.tabEmail == sendResponse){
                  console.log("^------- RELOAD NOT NEEDED*");
                  if (self.force_reload_on_focus) {
                    self.force_reload_on_focus = false;
                    self.reloadStats(self);
                  }
                } else {
                  console.log("^----- RELOAD_CURRENT_TAB*");
                  console.log("^------- CURRENT_TAB: " + sendResponse.tabEmail);
                  // self.sendCommand(self, {cmd: "RELOAD_CURRENT_TAB"});
                  self.setEmailAddressTrigger(self, $('#loading'), sendResponse)
                }
              } else {
                // self.loadSidebarView(self)
                console.log("^----- CURRENT_TAB: " + sendResponse.tabEmail);
                console.log("^------- RELOAD NOT NEEDED");
                if (self.force_reload_on_focus) {
                  self.force_reload_on_focus = false;
                  self.reloadStats(self);
                }
              }
          }

      }, true);

      // TODO: Don't need this anymore probably because this state doesn't change once the tab is refreshed...

      // When visibility change check and update sendlaterbtndisabledstate
      if (self.sendLaterBtnDisabledState == true){
        console.log("-- sendLaterBtnDisabledState: " + self.sendLaterBtnDisabledState);
        console.log("disabling the sendlater button");
        elements = $('button.sendLater');
        for (var i = 0; i < elements.length; i++) {
          elements[i].disabled = true;
          elements[i].style.background = '#cfcecd';
        }
      } else {
        console.log("-- sendLaterBtnDisabledState: " + self.sendLaterBtnDisabledState);
        console.log("activating the sendlater button");
        elements = $('button.sendLater');
        for (var i = 0; i < elements.length; i++) {
          elements[i].disabled = false;
          elements[i].style.background = '#f15928';
        }
      }
    } else {
      console.log("document.visibilityState is not 'visible'");
      self.sendCommand(self, {cmd: "SET_PREVIOUS_EMAIL", email: self.email}, function(self, sendResponse){
          console.log("seting previousEmail Cookie:" + sendResponse.previousEmail);
      })
    }
  });

  //listen for title element so we can extract the user's email address
  self.titleObserver = new MutationSummary({
    callback: function(summaries){ self.setEmailAddress(self, summaries); },
    queries: [{element: '#loading'}]
  });

  self.SignInWithGoogleBtnObserver = new MutationSummary({
    callback: function(summaries){ self.setEmailAddress(self, summaries); },
    queries: [{element: 'img[alt=Sign-in-with-google]'}]
  });

  self.inboxObserver = new MutationSummary({
    callback:function(summaries){ self.loadDashboard(self); },
    queries: [{element: '.vI8oZc'}, {element: '.ata-asE'}]
  });

  //listen for new popup compose
  self.newComposeObserver = new MutationSummary({
    callback: function(summaries){
      self.composeHandler(self, summaries, true, false);
    },
    queries: [{element: '.nH.Hd', elementAttributes:'role'}]
  });

  //listen for new pikaday calendar to be inserted
  // self.newSendLaterCalendarObserver = new MutationSummary({
  //   callback: function(summaries){
  //       console.log("Detected Send Later Calendar");
  //       self.addCalendarToCompose(self);
  //       CMPikaday();
  //   },
  //   queries: [{element: '#pikaday-calendar'}]
  // });


  //listen for new replys / forwards
  self.newReplyObserver = new MutationSummary({
    callback: function(summaries){self.composeHandler(self, summaries, true, true);},
    queries: [{element: '.aoP.HM'}]
  });

  //listen for old compose / old replys / old forwards
  self.oldComposeObserver = new MutationSummary({
    callback: function(summaries){self.composeHandler(self, summaries, false);},
    queries: [{element: '.cf.eA'}]
  });

  //listen for gmail_extra i.e. quoted regions containing old trackers
  self.oldComposeObserver = new MutationSummary({
    callback: function(summaries){self.gmailExtra(self, summaries);},
    queries: [{element: '.gmail_extra'}]
  });

  //listen for sent emails loading
  self.sentObserver = new MutationSummary({
    callback: function(summaries){self.sentEmailHandler(self, summaries);},
    queries: [{ element: '.gE.iv.gt' }]
  });

  //listen for a new 'to' address to be entered when composing an email
  self.newToEmailAddress = new MutationSummary({
    callback: function(summaries){self.newComposeAddressee(self, summaries);},
    queries: [{element: '.vR'}]
  });

  self.newEmailIdObserver = new MutationSummary({
    callback: function(summaries){self.emailIdObserver(self, summaries);},
    queries: [{element: '#link_vsm', elementAttributes:'role'}]
  });

  //listen for the Gmail message to be opened which will show the buttons for us to insert beside
  self.emailOpenedObserver = new MutationSummary({
    callback: function(summaries){self.handleLoadedEmail(self, summaries);},
    queries: [{element: '.gH.acX'}]
  });

  // MutationSummary watches for a new email open and the callback adds a hover to the contacts in the email header
  var hoverTimer;
  self.emailContactsObserver = new MutationSummary({
    callback: function(summaries){
      $('.iw span[email]').off( "mouseenter mouseleave" );
      $('.iw span[email]').hover(
        function(){
          var emailElement = this;
          var hoverEmailAddress = $(this).attr('email');
          hoverTimer = setTimeout(function(){
            if (self.is_salesforce_user){
              self.loadOverviewView(self, self.obtainEmailData(self, $(emailElement).parents('.cf.gJ').find('.gH.acX'), hoverEmailAddress), true);
            }
          }, 350);
        }, function(){
          // On mouse out, cancel the timer, this way we can ensure they are actually overing and not juset moving their mouse through
          clearTimeout(hoverTimer);
        }
      );
    },
    queries: [{element: '.adn.ads'}]
  });

  // Listen to dashboard
  window.addEventListener( "message",
    function (e) {
      if(e.origin === self.baseURL) {
        var cmd;
        try{
          cmd = JSON.parse(e.data);
        }catch(err){
          //command polluted with html entities
          //gotta use some retarded method to strip them....
          cmd = $("<div/>").html(e.data).text();
          cmd = JSON.parse(cmd);
        }

        if (cmd.hasOwnProperty('cmd')) {
          if(cmd.cmd === "OPEN_GMAIL_LINK"){
            console.log("OPENING GMAIL LINK");
            self.openGmailLink(self, cmd);
          }else if(cmd.cmd === "SHOW_NOTIFICATION"){
            self.sendCommand(self, {cmd: 'SHOW_NOTIFICATION', data: cmd});
            console.log(cmd);
          }else if(cmd.cmd === "TEST"){
            //alert(cmd.data.message);
          }else if(cmd.cmd === "SEND_EMAIL"){
            self.sendEmail();
          }else if(cmd.cmd === "LOAD_OVERVIEW"){
            // Note: This just loads the first address in the compose email. Add conditions if you are supposed
            // to check the command to load a specific overview
            var addresses = $('.vR');
            if (addresses && addresses.length > 0){
              self.newComposeAddressee(self, [{added: [addresses[0]]} ] );
            }else{
              $('#contactmonkey').attr('src', self.baseURL + "/dashboard/stats" );
            }
          }else if(cmd.cmd === "OVERVIEW_LOAD_COMPLETE"){
            self.handleOverviewLoad(self, cmd.data.email_id);
          }else if(cmd.cmd === "SET_QUICK_ADD_SOBJECTS"){
            self.handleSettingQuickAddSobjects(self, cmd.data.sobjects);
          } else {
            console.error("[Dashboard Listener] Unknown command: ", cmd, e.origin);
          }
        } else {
          console.error("[Dashboard Listener] No specified command: ", cmd, e.origin);
        }
      }else{
        // console.debug(e.origin);
      }
    },
    false
  );

  var windowWidth = $(window).width();

  window.addEventListener( "resize",
    function(){
      if ($(window).width() != windowWidth){  //Skip for vertial resize only (gmail seems to do the same)
        waitForFinalEvent(function(){
          self.adjustGmailLayoutForDash(self, true)
        }, 400, "WindowResizeEventListener");
        windowWidth = $(window).width();
      }
    },
    false
  );

  //Wait until the PAGE is ready, retrieve the state of the app (i.e first time use)
  //and initialize first run page
  $(window).bind("load", function() {
    self.sendCommand(self, {cmd: 'GET_APPSTATE'}, function(self, state){
      if (state){
        self.sendCommand(self, {cmd: 'SET_APPSTATE'}, function(self){});
        // For now we are not going show the first launch page.
//        self.injectFirstRunPage(self);
      }
    });
  });
  // first update page (2.2.9)
  $(window).bind("load", function() {
    self.sendCommand(self, {cmd: 'GET_APPUPDATE'}, function(self, state){
      if (state && chrome.runtime.getManifest().version === "2.2.9"){
        self.sendCommand(self, {cmd: 'SET_APPUPDATE'}, function(self){});
        self.injectFirstUpdatePage(self);
      }
    });
  });

  //Load up the saved settings for the plugin
  self.sendCommand(self, {cmd:"GET_DEFAULTS"}, function(self, values){
    if(values){
      self.defaultDoTrackEmails = values.track_emails;
      self.defaultDoTrackLinks = values.track_links;
      self.defaultDoBcc = values.send_bcc;
      console.log("cookies Read Ok");
    }
  }, true);


  // get information about the user from the server
  // FIXME: This is run before self.email is set (i.e. tab_email's usual value).
  // By moving it into setEmailAddress (where self.email is set), I'm not sure
  // what consequences it would have since self.is_salesforce_user won't be set
  // so I'm leaving it here and doing it in setEmailAddress as well.
  self.sendCommand(self, {cmd: "GET_USER_INFO", tab_email: null}, function(self, info){
    if(info != null){
      self.is_salesforce_user = info.is_salesforce_user;
      if (self.email == info.email) {
        self.primary_email_tab = true;
        self.mail_merge_enabled = info.mail_merge_enabled;
        self.send_later_enabled = info.send_later_enabled;

        // Wait for compose button to appear, then inject it.
        self.composeButtonObserver = new MutationSummary({
          callback: function(summaries){ self.injectMailMergeComposeButton(self, summaries); },
          queries: [{element: '.aic'}]
        });
      }
    }
  }, true);

  // TODO: Only make this call if the bcc email doesn't come back from the above get info call
  // Fetch the user's bcc email address if they have one
  self.sendCommand(self, {cmd:"GET_BCC"}, function(self, value){
    if(value){
      self.salesforce_bcc_email = value;
    }
  }, true);

};

CMApp.prototype.messageListener = function(self, command, sender, sendResponse) {
  console.log("GOT MESSAGE: " + command.cmd);

  if(command.cmd === "GET_EMAIL"){
    sendResponse(self.email);
  } else if (command.cmd === "RELOAD_STATS") {
    self.reloadStats(self, command.forceReload);
  } else if (command.cmd === "SET_RELOAD_WHEN_ACTIVE") {
    self.force_reload_on_focus = true;
  } else if (command.cmd === "OPEN_GMAIL_LINK") {
    self.openGmailLink(self, cmd);
  }
};

CMApp.prototype.extractEmailFromString = function(self, string) {
  var emailsArray = string.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
  if (emailsArray && emailsArray.length > 0) {
    return emailsArray[0];
  }
  return null;
};

/*
 *  Removes all items from a select except the first which is a message
 */
CMApp.prototype.clearSelect = function(self, select) {

  $(select).find('option').each(function(){
    if(this.value !== 0){
      $(this).remove();
    }
  });
};

CMApp.prototype.setEmailAddress = function(self, summaries) {
  console.log('[setEmailAddress] Event triggered');
  var elements = summaries[0];

  elements.added.forEach(function(emailAddrElement){
    var rawText = $(emailAddrElement).find('.msg').html().replace(/(\r\n|\n|\r)/gm,"");
    var email = self.extractEmailFromString(self, rawText);
    if(email && !self.email){
      self.email = email;
      console.log('[setEmailAddress] Email: ', self.email);
      self.sendCommand(self, {cmd: "GET_USER_INFO", tab_email: self.email}, function(self){ /* just to set tabEmailToPrimaryEmail */ }, true);
      self.sendCommand(self, { cmd:"GET_GMAIL_ADDRESS", email:self.email } );
      console.log("email = " + self.email);

      self.checkAlternativeAddresses(self, self.email);

      return true;
    }

    console.log("ERROR: Failed to extract email address from element");
  });
};

CMApp.prototype.setEmailAddressTrigger = function(self, emailAddrElement, previousTabEmail) {
  console.log("SetEmailAddress Triggered")
  var rawText = $(emailAddrElement).find('.msg').html().replace(/(\r\n|\n|\r)/gm,"");
  var email = self.extractEmailFromString(self, rawText);
  console.log("--- email: " + email);
  console.log("--- previousTabEmail: " + previousTabEmail );
  console.log("--- self.email: " + self.email);
  if(previousTabEmail != self.email){
    self.sendCommand(self, { cmd:"GET_GMAIL_ADDRESS", email:self.email } );
    self.checkAlternativeAddresses(self, self.email);
    self.loadSidebarView(self);
    return true;
  } else {
    console.log("INFO: Tab email didn't change.");
  }
};

CMApp.prototype.checkAlternativeAddresses = function(self, email_address) {
  console.log("[checkAlternativeAddresses] Initializing sendLaterBtnDisabledState to TRUE");
  self.sendLaterBtnDisabledState = true;
  // Load any additional email addresses that they have linked to their account
  self.sendCommand(self, {cmd: "GET_ALL_ADDRESSES"}, function(self, emailAddresses){
    console.log("[checkAlternativeAddresses] Retrieved all addresses for user: " + JSON.stringify(emailAddresses));
    if ((email_address != null && $.inArray(email_address, emailAddresses) < 0)){
      self.sendLaterBtnDisabledState = true;
      if (emailAddresses.length == 0) {
        console.debug("[checkAlternativeAddresses] No signed-in user")
      } else {
        // When the user is signed into one tab and opens a new tab where the new tab's email
        // is not an alternative email of the first tab (primary user)
        // Displaying the Popup
        // Check if email is affiliated on server
        self.sendCommand(self, {cmd: "CHECK_AFFILIATED_EMAILS", email_address: email_address}, function(self, isAffiliated){
          if (!isAffiliated){
            self.sendCommand(self, {cmd: "CREATE_ALTERNATIVE_ADDRESS", address: self.email, attach_to_account:true });
            self.injectAlternativeEmailModal(self, email_address);
          } else {
            // Don't show popup if email is affiliated already
            console.log("[checkAlternativeAddresses] Email already affiliated")
          }
        }, true);
      }
    } else if (email_address != null && $.inArray(email_address, emailAddresses) >= 0){
        // There are 2 scenarios here.
        // - an email with alternative address that is a primary account
        // - an email with  alternative address that is a secondary account

        console.log("email_address: " + email_address);
        // Grab current user from backend
        self.sendCommand(self, {cmd: "GET_USER_INFO", tab_email: self.email}, function(self, info){
          console.log("currentUser: " +  info.email);
          if (self.email == info.email){
            // current tab is the primary user
            console.log("**setting sendLaterBtnDisabledState to false")
            self.sendLaterBtnDisabledState = false;

          } else {
            // current tab is not the primary user
            // Alternative email address for current user were found and alternative email address is
            // a secondary email account
            console.log("**setting sendLaterBtnDisabledState to TRUE")
            self.sendLaterBtnDisabledState = true;
          }
        }, true);
    }
  }, true);

  // TODO: Don't need this anymore probably because this state doesn't change once the tab is refreshed...

  // When visibility change check and update sendlaterbtndisabledstate
  console.log("sendLaterBtnDisabledState : " + self.sendLaterBtnDisabledState);
  if (self.sendLaterBtnDisabledState){
    console.log("-- sendLaterBtnDisabledState: " + self.sendLaterBtnDisabledState);
    console.log("disabling the sendlater button");
    elements = $('button.sendLater');
    for (var i = 0; i < elements.length; i++) {
      elements[i].disabled = true;
      elements[i].style.background = '#cfcecd'; // grey
    }
  } else {
    console.log("-- sendLaterBtnDisabledState: " + self.sendLaterBtnDisabledState);
    console.log("activating the sendlater button");
    elements = $('button.sendLater');
    for (var i = 0; i < elements.length; i++) {
      elements[i].disabled = false;
      elements[i].style.background = '#f15928'; // orange
    }
  }
};

CMApp.prototype.sendCommand = function(self, command, callback, async) {
  //check if we are expecting a response
  command.response = false;
  //flag this as an asynchronous request
  //this should only be true if you are expecting an AJAX response
  if(async){ command.response = true; }
  //send the message
  chrome.runtime.sendMessage(command, function(response) {
    if(callback){ callback(self, response); }
  });
};

CMApp.prototype.sendCommandToDashboard = function(self, command) {
  $('#contactmonkey')[0].contentWindow.postMessage(JSON.stringify(command), self.baseURL);
};

CMApp.prototype.injectScript = function(self, basePath, scriptURL) {
  var scriptEl = document.createElement( "script" );
  scriptEl.src = basePath + scriptURL;
  scriptEl.async = false;
  $('body').append(scriptEl);
};

CMApp.prototype.injectCSS = function(self, element, cssURL) {
  $(element).append($('<link>').attr('rel', 'stylesheet').attr('type', 'text/css').attr('href', self.extBaseUrl + cssURL));
};

CMApp.prototype.injectFirstRunPage = function(self){
  self.sendCommand(self, {cmd: "GET_TEMPLATE", selector: ".modalWrapper"}, function(self, firstrunTemplate){
    $frt = $(firstrunTemplate);
    $frt.find('iframe').attr('src', self.baseURL + "/firstrun/index");

    button = document.createElement('input');
    button.id = 'modalButton';
    button.type = 'button';
    button.name = 'modalButton';
    button.value = 'Get Started!';

    $frt.find('#modalParent').append(button);
    $('body').prepend($frt);

    // The onclick button function to remove the first run page
    button.onclick = function() {
      $(".modalWrapper").remove();
      };

  }, false);
};

CMApp.prototype.injectAlternativeEmailModal = function(self, email_address){
  self.sendCommand(self, {cmd: "GET_TEMPLATE", selector: ".modalAlternativeEmail"}, function(self, modalTemplate){
    $template = $(modalTemplate);

    self.sendCommand(self, {cmd: "GET_PREVIOUS_EMAIL"}, function(self, previous_email){
      self.sendCommand(self, {cmd: "MAP_TAB_EMAIL_TO_PRIMARY_EMAIL", tab_email: previous_email}, function(self, primary_email){
        $template.find('.current-email-address').html(primary_email);
      }, true);
    }, true);

    $template.find('.email-address').html(email_address);

    buttonOk = document.createElement('input');
    buttonOk.id = 'butonOk';
    buttonOk.class = "modal-yes-no-button"
    buttonOk.type = 'button';
    buttonOk.name = 'modalOkButton';
    buttonOk.value = "Ok";

    $template.find('#modalParent .button-container').append(buttonOk);

    $('body').prepend($template);

    buttonOk.onclick = function(){
      $('.modalAlternativeEmail').remove();
      self.reloadCurrentGmailTab(self)
    };
  });
};


CMApp.prototype.injectFirstUpdatePage = function(self){
  self.sendCommand(self, {cmd: "GET_TEMPLATE", selector: ".modalWrapper"}, function(self, firstrunTemplate){
    $frt = $(firstrunTemplate);
    $frt.find('iframe').attr('src', self.baseURL + "/firstupdate/index");

    button = document.createElement('input');
    button.id = 'modalButton';
    button.type = 'button';
    button.name = 'modalButton';
    button.value = 'Got it!';

    $frt.find('#modalParent').append(button);
    $('body').prepend($frt);

    // The onclick button function to remove the first run page
    button.onclick = function() {
      $(".modalWrapper").remove();
      };

  }, false);
};


CMApp.prototype.getTrackerStr = function(self, editable, cm_session) {
  console.debug("CREATING TRACKING STRING");

  var s = "";

  s = '<img class="cm-tracker" src="' + self.baseURL + '/api/v1/tracker?cm_session=' + cm_session +
      '&cm_type=open&cm_user_email=' + self.email + '" width="0" height="0" style="border:0; width:0px; height:0px;">';
  s = s.concat(s);
  s += '<font class="cm-tracker" face="' + self.baseURL + '/api/v1/tracker?cm_session=' + cm_session +
      '&cm_type=open&cm_user_email=' + self.email + '" style></font>';
  return s;
};


CMApp.prototype.injectTracker = function(self, editable, cm_session) {
  console.debug("INJECTING TRACKING");
  self.sendCommand(self, {cmd: "GET_TEMPLATE", selector:".cm-tracker"}, function(self, trackerTemplate) {
    console.log("GET_TEMPLATE");
    var i;
    for (i = 0; i < 2; i++) {
      var tpl = $(trackerTemplate);
      $(tpl).attr('src', self.baseURL + '/api/v1/tracker?cm_session=' + cm_session + '&cm_type=open&cm_user_email=' + self.email);
      $(tpl).attr('width', '0');
      $(tpl).attr('height', '0');
      $(tpl).attr('style', 'border: 0; width: 0px; height: 0px;');
      $(editable).append(tpl);
    }
    var fnt = $('<font class="cm-tracker"></font>');
    $(fnt).attr('face', self.baseURL + '/api/v1/tracker?cm_session=' + cm_session + '&cm_type=open&cm_user_email=' + self.email);
    $(fnt).attr('style', "");
    $(editable).append(fnt);
  });
};


//inject draft_id in mail body
// draftId = ''; // debug
// CMApp.prototype.getDraftIdStr = function(self, editable, draftId) {
//   console.log('IN getDraftIdStr drafId: ' + drafId)
//   console.log("CREATING DraftId String");
//   var s = "";
//   s = '<img class="cm-draft-tracker" src="'+self.baseURL + '/cm-draft-tracker/'+draftId+'" width=0 height=0 />';
//   return s;
// };


// user clicked Schedule button
CMApp.prototype.scheduleClick = function(self, editable, cm_session, messageBodyVal, messageSubject, messageTo, messageCc, messageBcc, sendOnDate, compose, composeForm, messageAttachment, formData, isReply, isMMDraft, sendNow, checkAndPreview, mailMergeRecipientListId){
  console.debug("[scheduleClick] Clicked");

  // Checking if To is not blank
  if((messageTo.length == 0 && (!mailMergeRecipientListId || mailMergeRecipientListId == "")) || messageSubject == ""){
    self.showGoogleAlert(self, messageSubject == "" ? '#messageScheduleMissingSubject' : '#messageScheduleMissingRecipient', '.messageScheduleMissingField');
  } else {
    // Revert back to the normal Sidebar view (incase they were hovering)
    self.loadSidebarView(self)
    self.injectDraftIndicator(self, 'cm-sl-indicator', compose, editable);

    // message tracking
    if (!$(compose).find('#doTrack').get(0).checked) {
      self.injectFormTracking(self, composeForm, "false");
    } else {
      self.injectFormTracking(self, composeForm, "true");
      // add trackers
      var s = self.getTrackerStr(self, editable, cm_session);
      editable = $(compose).find('.editable');
      if ($(editable).html().indexOf(s) < 0) {
        $(editable).append(s);
      }
    }

    // Add the correct BCC email if the box is checked
    if ($(compose).find('#doBcc').get(0).checked && self.salesforce_bcc_email != null){
      $(compose).find('textarea[name=bcc]')[0].value = self.salesforce_bcc_email;
    }

    $(compose).find('#sendLaterTemplate #dropup').hide();
    if (!checkAndPreview) {
      $(compose).find('.sendLater').hide();
      $(compose).find('.scheduledSendLater').show();
    }

    var template_sel = '';
    if (isMMDraft && checkAndPreview) {
      template_sel = '#mm-checkAndPreview';
    } else if (isMMDraft && sendNow){
      template_sel = '#mm-sendNowLoadingPopup';
    } else {
      template_sel = (isMMDraft ? '#mm-' : '#') + (isReply ? 'sendLaterReplyPopup' : 'sendLaterLoadingPopup');
    }
    self.sendCommand(self, {cmd: 'GET_TEMPLATE', selector: template_sel}, function(self, sendLoadingPopup){
      var popupContainer = self.findPopupContainer(self, compose, isReply);
      var sendLoadingEle = $(sendLoadingPopup);
      if(popupContainer.find(template_sel).length==0){
        popupContainer.append(sendLoadingEle);
        sendLoadingEle.show();
      }

      setTimeout(function(){
        if (isMMDraft) {
          console.debug("[scheduleClick] Creating Mail Merge");
          self.sendCommand(self, {
              cmd: "CREATE_OR_PREVIEW_MAIL_MERGE",
              data: { cm_session_id: cm_session, subject: messageSubject, send_at: sendOnDate, compose: compose, isReply: isReply, checkAndPreview: checkAndPreview, mailMergeRecipientListId: mailMergeRecipientListId }
            }, function(self, response) {
              if (checkAndPreview) {
                setTimeout(function(){
                  self.removeLoadingPopup(self, compose, isReply);
                }, 5000);
              } else {
                self.handleSendLaterResponse(self, response, sendOnDate, compose, isReply, false, isMMDraft);
              }
          }, true);
        } else { // Send Later
          self.sendCommand(self, {
              cmd: "SEND_LATER",
              data: { cm_session: cm_session, subject: messageSubject, to: messageTo, bcc: messageBcc, cc: messageCc, send_on: sendOnDate, attachments: messageAttachment, compose: compose, formData: formData, isReply: isReply }
            }, function(self, response) {
              self.handleSendLaterResponse(self, response, sendOnDate, compose, isReply, false, isMMDraft);
          }, true);
        }
      }, (isReply ? 1 : 4000)); // Better implementation can be made by adding a callback and checking that the message was successfully scheduled.
    }, false);
  }
};

CMApp.prototype.rescheduleClick = function(self, cm_session, sendOnDate, compose, isReply, sendNow, isMMDraft, mailMergeRecipientListId) {
  var popupSel = isMMDraft ? '#mm-' : '#';
  if (isReply) {
    popupSel += sendNow ? 'sendNowReplyPopup' : 'sendRescheduledReplyPopup';
  } else {
    popupSel += sendNow ? 'sendNowLoadingPopup' : 'sendRescheduledLoadingPopup';
  }

  self.sendCommand(self, {cmd: 'GET_TEMPLATE', selector: popupSel}, function(self, sendLoadingPopup){
    var popupContainer = self.findPopupContainer(self, compose, isReply);
    if(popupContainer.find(".sendLoadingPopup").length==0){
      popupContainer.append(sendLoadingPopup).show();
    }
    setTimeout(function(){
      self.sendCommand(self, {cmd: "RESCHEDULE_EMAIL", data: {cm_session: cm_session, sendOnDate: sendOnDate, isMMDraft: isMMDraft, mailMergeRecipientListId: mailMergeRecipientListId} }, function(self, response) {
        if (response == true) {
          $(compose).find('#sendLaterTemplate #dropup').hide();
          $(compose).find('.sendOnDate').html(moment(sendOnDate, "D MMM YYYY h:mm A").format('YYYY-MM-DD HH:mm'));
        }
        self.handleSendLaterResponse(self, response, sendOnDate, compose, isReply, sendNow, isMMDraft);
      }, true);
    }, (isReply ? 1 : 4000)); // Give time for draft to save...
  }, false);
};

CMApp.prototype.handleSendLaterResponse = function(self, response, sendOnDate, compose, isReply, sendNow, isMMDraft) {
  $(compose).find(".Ha").each(self.simulateGmailClick);

  var sent_later = moment(sendOnDate, "D MMM YYYY h:mm A").isAfter(moment().add(10, 'seconds'));
  if(response == true){
    self.sendCommand(self, {cmd: 'GET_TEMPLATE', selector: ((isMMDraft ? '#mm-' : '#') + (sent_later ? 'messageSentLaterConfirmation' : 'messageSentNowConfirmation'))}, function(self, messageConfirmationTemplate){
      $('[role="alert"]').find('.J-J5-Ji').append(messageConfirmationTemplate).show();
      if (sent_later) {
        $('.messageConfirmation .send_on').append(sendOnDate);
      }

      setTimeout(function(){
        console.log('REMOVING .messageConfirmation');
        $('.messageConfirmation').remove();
      }, 10000);
    }, false);

    console.log("Scheduled Email Successfuly:" + response);
  } else if (response == 'Not Acceptable'){
    self.sendCommand(self, {cmd: 'GET_TEMPLATE', selector:'#authorizationRefreshNeeded'}, function(self, authorizationRefreshNeeded){
      $('[role="alert"]').find('.J-J5-Ji').append(authorizationRefreshNeeded).show();
      self.removeLoadingPopup(self, compose, isReply);
    });
  } else {
    var g_alert_sel = (isMMDraft ? '#mm-' : '#') + 'messageScheduleError';
    self.sendCommand(self, {cmd: 'GET_TEMPLATE', selector: g_alert_sel}, function(self, messageScheduleErrorTemplate){
      $('[role="alert"]').find('.J-J5-Ji').append(messageScheduleErrorTemplate).show();
      $(g_alert_sel + '.send_on').append(sendOnDate);

      setTimeout(function(){
        $(g_alert_sel).remove();
      }, 20000);
      self.removeLoadingPopup(self, compose, isReply);
    }, false);

    console.error("Schedule Email Failed");
  }
}

// user clicks send button or pressed ctrl-enter
CMApp.prototype.sendClick = function(self, editable, cm_session, compose, composeForm, isReply) {
  console.log("Send Message Clicked");
  if(self.is_salesforce_user){
    self.getQuickAddSobjects(self, editable, compose, composeForm, isReply);

    // Revert back to the normal Sidebar view (incase they were hovering)
    self.loadSidebarView(self);
  }

  // remove trackers
  self.removeTrackers(self, editable);


  // message tracking
  if (!$(compose).find('#doTrack').get(0).checked) {
    self.injectFormTracking(self, composeForm, "false");
  }
  else {
    self.injectFormTracking(self, composeForm, "true");
    // add trackers
    var s = self.getTrackerStr(self, editable, cm_session);
    if ($(editable).html().indexOf(s) < 0) {
      $(editable).append(s);
    }
  }

  // Add the correct BCC email if the box is checked
  if ($(compose).find('#doBcc').get(0).checked && self.salesforce_bcc_email != null){
    $(compose).find('textarea[name=bcc]')[0].value = self.salesforce_bcc_email;
  }

  self.manipulateDraftLinks(self, cm_session, compose, editable, composeForm);
};

CMApp.prototype.sendLaterClick = function(self, cm_session, compose, editable, composeForm) {
  console.log("[sendLaterClick] Triggered");
  self.manipulateDraftLinks(self, cm_session, compose, editable, composeForm);

  if ($(compose).find('.n1tfz #sendLaterTemplate #dropup').css('display') == 'none'){
    $(compose).find('.n1tfz #sendLaterTemplate #dropup').show();
  } else {
    $(compose).find('.n1tfz #sendLaterTemplate #dropup').hide();
  }
};

CMApp.prototype.toggleTracking = function(self, trackButton, editable, cm_session) {

  if (trackButton.checked) {
    //self.injectTracker(self, editable, cm_session);
  }
  else {
    result = $(editable).find(".cm-tracker");
    console.dir(result);
    //$(editable).remove(".cm-tracker");
    //console.log($(form).find("img.cm-tracker"));
    self.removeTrackers(self, editable);
  }
};

CMApp.prototype.addCalendarToCompose = function(self, compose){
  console.log("Inside add CalendarToCompose")
  if ( $(compose).find('.pika-single').length <= 0) {
    self.sendCommand(self, {cmd: 'GET_TEMPLATE', selector:'#datepicker'}, function(self, sendCalendar){
        PikadayJS();
        console.log('PIKADAY ---- inside Pikaday Picker');
        var now = new Date();
        var picker = new Pikaday({
            field: $(compose).find('#datepicker')[0],
            firstDay: 1,
            minDate: now,
            maxDate: new Date(2020, 12, 31),
            yearRange: [2000, 2020],
            bound: false,
            container:  $(compose).find('#pikaday-calendar')[0],
            format: 'Do MMM YYYY',
        });
        picker.setDate($(compose).find('#datepicker').data('datetime-to-set') || now);
    }, false);
  }
};


CMApp.prototype.injectModal = function(self, selector) {
  if($('body').find(selector).length <= 0){
    self.sendCommand(self, {cmd: "GET_TEMPLATE", selector: selector}, function(self, modal){
      $('body').prepend(modal);
    }, false);
  }
};

/*
 *  Removes any img that is a tracker from the supplied element.
 *  Returns the element afterwards.
 */
CMApp.prototype.removeTrackers = function(self, element) {
  //var trackers = $(element).find('img[src*="tracker?cm_session"]');
  var trackers = $(element).find('.cm-tracker');
  var trackers2 = $(element).find("img[src*='cm_user_email']");
  var trackers3 = $(element).find("font[face*='cm_user_email']");

  //no trackers to strip
  if(trackers.length <= 0 && trackers2.length <= 0 && trackers3.length <= 0){ return; }

  $.each(trackers, function(k,v){
    console.log("STRIPPING TRACKERS");
    $(v).remove();
  });
  $.each(trackers2, function(k,v){
    console.log("STRIPPING TRACKERS");
    $(v).remove();
  });
  $.each(trackers3, function(k,v){
    console.log("STRIPPING TRACKERS");
    $(v).remove();
  });

  return element;
};

CMApp.prototype.injectFormSessionInput = function(self, form, sid) {
  $(form).append('<input type="hidden" name="cm_session" id="cm_session" value="' + sid + '">');
  return sid;
};

CMApp.prototype.injectFormPriorityInput = function(self, form) {
  $(form).append('<input type="hidden" name="priority" value="false">');
};

CMApp.prototype.injectFormComposeTypeInput = function(self, form, type) {
  $(form).append('<input type="hidden" name="cm_compose" value="' + type + '">');
};

CMApp.prototype.injectFormLinksInput = function(self, form) {
  $(form).append('<input type="hidden" name="cm_links" value="{}">');
};

CMApp.prototype.injectFormTracking = function(self, form, value) {
  $(form).append('<input type="hidden" name="cm_tracking" value="' + value + '">');
};

CMApp.prototype.injectHiddenField = function(self, form, name, value) {
  $(form).find('input[name="' + name + '"]').remove();
  $(form).append('<input type="hidden" name="' + name + '" value="' + value + '">');
};

//http://stackoverflow.com/questions/6690752/insert-html-at-cursor-in-a-contenteditable-div
CMApp.prototype.pasteHtmlAtCaret = function(self, html) {
    document.execCommand('insertHTML', false, html);
};

CMApp.prototype.pasteHtmlAtCaretForIframe = function(self, iframe, html) {
  iframe.contentWindow.document.execCommand('insertHTML', false, html);
}

CMApp.prototype.adjustForComposeWindow = function(self){
  // We first need to shift over the container that holds the compose windows, this isn't created until the first compose
  // click so we will track if we have done that, and shift it the first time to allow for the dashboard window
  if (!self.shiftedComposeContainer){
    if (window.dashboardOpen){
      $('.dw .nH').first().width($('.dw .nH').first().width() - 277);
      console.log("COMPOSE CONTAINER SHIFTED!");
      self.shiftedComposeContainer = true;
    }

  }
}

/*
 *  Upon detecting a compose i.e. old or new, this handler is called.
 *  Currently two things occur, the prioritize bar is added and a tracker
 *  is inserted into the editable region of the compose. Hidden fields
 *  are also added so that data can be passed to the AJAX interceptor
 *  once the email is sent.
 */
CMApp.prototype.composeHandler = function(self, summaries, isNew, isReply) {
  var isMMDraft = self.isMailMergeDraft(self);
  self.adjustForComposeWindow(self);

  summaries[0].added.forEach(function(compose){
    $(compose).find('.gmail_quote').each(function() {
      self.findDraftIndicator(self, 'cm-sl-indicator', $(this)).remove();
      self.findDraftIndicator(self, 'cm-mm-indicator', $(this)).remove();
    });

    if (!isMMDraft) {
      isMMDraft = self.isMailMergeDraft(self, compose);
    }

    // Although some repition in code with the callback below, this has been pulled out so that there isn't a pause while waiting
    // for a response for the session ID which will cause the cursor to jump back to the start when the 'click' happens
    var cf = isNew ? $(compose).find('form')[0] : $(compose).closest('form');

    if ($(cf).find('input[name="subject"]').length <= 0) { // If it's not a compose form for some reason (old logic refactored so I'm leaving it in...)
      console.error("[composeHandler] Triggered but actually isn't a form.");
      return;
    }
    if(isReply) {
      // Expand any quoted regions if there are any, this will cause gmail_extra to exist which will trigger a mutation summary and remove all old trackers
      self.gmailExtraRemoved = false;
      // $(compose).find('.aH1').click(); // Click on the quote dots icon to expand the quoted text
    }

    var cm_session_from_tracker = null;
    var is_send_later_draft = self.isIndicatorInDraft(self, 'cm-sl-indicator', compose);
    if (is_send_later_draft) {
      console.debug("[composeHandler] Previous SL detected")
      var trs = self.findTrackersInCompose(self, compose);
      cm_session_from_tracker = trs.length > 0 ? trs[trs.length-1].src.split("&")[0].split("=")[1] : null;
      if (cm_session_from_tracker == null) {
        console.error("[composeHandler] Previous SL detected but CM Session was not found");
      }
    }

    self.sendCommand(self, {cmd: 'GET_SESSION_ID', cm_session_from_tracker: cm_session_from_tracker}, function(self, cm_session){
      console.debug("[composeHandler] Using Session ID: ", (cm_session || "null"));

      //we never got an sid therefore dont inject anything
      if(cm_session === null){ return; }

      var composeForm = isNew ? $(compose).find('form')[0] :  $(compose).closest('form');;
      var editable = isNew ? $(compose).find('.editable') : $('.editable', $(compose).closest('form').find('iframe').contents());

      if (isMMDraft) {
        self.injectDraftIndicator(self, 'cm-mm-indicator', compose, editable);
      }

      var trackButton;
      var linkButton;

      //inject the session id in a hidden input field
      self.injectFormSessionInput(self, composeForm, cm_session);

      // Inject SL components (which also injects MM components if required)
      self.injectSendLaterComposeUI(self, cm_session, compose, editable, composeForm, isReply, isMMDraft);

      if((is_send_later_draft || isMMDraft) && (cm_session_from_tracker != null || cm_session != null)){
        self.sendCommand(self, {cmd: "GET_DRAFT_DETAILS", data: {mail_merge: isMMDraft, cm_session: (cm_session_from_tracker || cm_session)}}, function(self, response){
          if (response && !response.sent){
            console.log("sendOnDate:" + response.send_on);
            $(compose).find('.n1tfz .T-I.J-J5-Ji.aoO.T-I-atl.L3:not(#sendAndAddBtn)').hide();
            $(compose).find('.sendNow').addClass('rescheduling').show();
            $(compose).find('.sendLater').addClass('rescheduleLater').text('Reschedule');
            $(compose).find('.scheduleBtn, .rescheduleBtn').toggle();

            if (isMMDraft && !!response.mail_merge_recipient_list_id) {
              self.injectHiddenField(self, composeForm, 'cm-mail-merge-recipient-list-id', response.mail_merge_recipient_list_id);
              $(compose).data('force_load_csv', true);
              console.debug("[GET_DRAFT_DETAILS CALLBACK] Forcing CSV field change?", $(compose).find('.recipients-csv').length);

              $(compose).find('.recipients-csv').first().change();
            }

            if (isMMDraft && !response.send_on) {
              $(compose).find('.sendOnDate').hide();
            } else {
              var localtime = moment.utc(response.send_on).toDate();
              displayTime = moment(localtime).format('YYYY-MM-DD HH:mm');
              $(compose).find('.sendOnDate').html(displayTime);
              $(compose).find('.sendOnDate').css('display','inline');

              $(compose).find('#datepicker').data('datetime-to-set', localtime.toString())
              $(compose).find('#timeSelect').data('time-to-set', moment(localtime).format('h:mm A'));
            }
          }
        }, true);
      }

      if(!isNew){ self.injectCSS(self, editable, 'css/ContactMonkey.css'); }
      self.injectFormComposeTypeInput(self, composeForm, isNew ? 'new' : 'old');

      self.sendCommand(self, {cmd: "GET_TEMPLATE", selector: (isNew ? ".cm-toolbar" : ".cm-old-toolbar")}, function(self, prioritizeTemplate){
        self.injectFormPriorityInput(self, composeForm);

        if(isReply){ // We need to add a class for some slight border issue on replies
          prioritizeTemplate = $(prioritizeTemplate).addClass('cm-reply-toolbar');
        }

        if(!isMMDraft) {
          prioritizeTemplate = $(prioritizeTemplate).addClass('no-mail-merge');
        }

        if(isNew){
          $(composeForm).after(prioritizeTemplate);
        } else {
          // for old compose, we need to append the bar to a different location
          $(compose).find('> tbody').append($(prioritizeTemplate).find('.cm-old-prioritize-bar'));
        }

        //setup click listeners so that we can toggle the field values
        $(compose).find('.cm-prioritize-area').click(function(){ self.prioritizeHandler(self, this, composeForm); });

        //inject link tracking stuff
        self.injectLinkTracking(self, compose, composeForm, editable, cm_session);

        // setup click listener for track/don't track
        trackButton = $(compose).find('#doTrack');
        trackButton.click(function() { self.toggleTracking(self, this, editable, cm_session); } );
        linkButton = $(compose).find('#doLinks');
        sendBccButton = $(compose).find('#doBcc');

        // set the tracing checkboxes to their default values
        trackButton[0].checked = self.defaultDoTrackEmails;
        linkButton[0].checked = self.defaultDoTrackLinks;
        sendBccButton[0].checked = self.defaultDoBcc;

        // setup event handler for the user to set default preferences for tracking
        $(compose).find('#setDefaults').click(function(){
          var doTrackEmails = trackButton[0].checked;
          var doTrackLinks = linkButton[0].checked;
          var doSendBcc = sendBccButton[0].checked;

          self.defaultDoTrackEmails = doTrackEmails;
          self.defaultDoTrackLinks = doTrackLinks;
          self.defaultDoBcc = doSendBcc;

          // TODO: Create a method to return the settings value JSON and fetch it from there so if we add more settings in the
          // future, we can always just call this method to pull in the current settings rather than building the string manually
          // from multiple locations. Thats just asking for trouble... due to time restrictions I'm not implementing this now. -KS
          self.sendCommand(self, {cmd:"SET_DEFAULTS", values:{track_emails:doTrackEmails, track_links:doTrackLinks, send_bcc:doSendBcc}});

          this.innerHTML = "saved!";
          element = this;

          setTimeout(function(){
            element.innerHTML = 'set as default'
          }, 2000, element);

        });

        // Enable or Disable the Bcc to salesforce button depending on if we have their email or not
        if(self.salesforce_bcc_email != null){
          $('#doBcc').removeAttr("disabled");
        }else{
          $('.bccText').css('color', 'gray');
          $('.bccText').attr('title', 'You must sign in to Salesforce to enable this feature.');
          $('#doBcc').attr('title', 'You must sign in to Salesforce to enable this feature.');
          $('#doBcc').attr('checked', false);
        }

        $(compose).mousedown(function(e) {
          //console.log("track=" + $(compose).find('#doTrack').get(0).checked);
          var target;
          // do all browsers
          if (!e) { var e = window.event; }
          if (e.target) { target = e.target; }
          else if (e.srcElement) { target = e.srcElement; }
          if (target.nodeType === 3) { target = target.parentNode; }
          var areaLabel = $(target).attr("data-tooltip");
          var className = $(target).attr("class");
          if (( (areaLabel && areaLabel.indexOf("Send") >= 0) || (className && className.indexOf("T-I J-J5-Ji") >= 0)) && (areaLabel && areaLabel.indexOf("Send & Add") < 0)) {
            self.sendClick(self, editable, cm_session, compose, composeForm, isReply);
          }
        } );

        $(composeForm).find("input[name='subjectbox']").add(editable).keydown(function(e) {
          if (e.which === 13 && ((!self.isMac && e.ctrlKey) || (self.isMac && e.metaKey))) {
            self.sendClick(self, editable, cm_session, compose, composeForm, isReply);
          }
        });

        $(compose).on('click', '#sendLaterTemplate #dropup .scheduleBtn, #sendLaterTemplate .sendNow:not(.rescheduling), .cm-toolbar .mm-validate-and-preview', function(){
          var sendNow = $(this).hasClass('sendNow');
          var checkAndPreview = $(this).hasClass('mm-validate-and-preview');
          if (sendNow && !checkAndPreview) {
            self.manipulateDraftLinks(self, cm_session, compose, editable, composeForm);
          }

          if($(this).closest(".sendLaterTemplateSelector").parents(".ip.adB").length > 0){
             // Display Fake Reply Panel
            setTimeout(function(){
              self.sendCommand(self, {cmd: 'GET_TEMPLATE', selector:'#fakeReplyTemplate'}, function(self, fakeReplyTemplate){
                $(".ip.adB > div").hide();
                $(".ip.adB").append(fakeReplyTemplate).show();
              });
            },5000);
          }

          // Everything below form data can be refactored to just use FormData
          // I added form data after the message... variables
          // To trakc the email we need a couple attributes from the form itsel to use the
          // emailSentHandler to track the email with self.startTrackingEmail(self, cm_session, data, emailBody, cm_links);

          var parseFormData = function getFormData(dom_query){
              var out = {};
              var s_data = $(dom_query).serializeArray();
              //transform into simple data/value object
              for(var i = 0; i<s_data.length; i++){
                  var record = s_data[i];
                  out[record.name] = record.value;
              }
              return out;
          }

          var messageBodyVal      = editable.get(0).innerHTML;
          var messageSubject      = $(compose).find("input[name='subject']").val();
          var messageTos          = $(compose).find("input[name='to']");
          var messageCcs          = $(compose).find("input[name='cc']");
          var messageBccs         = $(compose).find("input[name='bcc']");
          var messageAttachments  = $(compose).find('a.d0');

          var messageTo           = [];
          var messageCc           = [];
          var messageBcc          = [];
          var messageAttachment   = [];

          // looping through messageTos Ccs Bccs"
          $.each(messageTos, function(index, value){ messageTo.push($(value).attr('value')); });
          $.each(messageCcs, function(index, value){ messageCc.push($(value).attr('value')); });
          $.each(messageBccs, function(index, value){ messageBcc.push($(value).attr('value')); });
          $.each(messageAttachments, function(index, value){ messageAttachment.push($(value).attr('value')); });

          var sendOnDate = sendNow ? moment().format("D MMM YYYY h:mm A") : $(compose).find('.greentxt span.date')[0].innerHTML + ' ' + $(compose).find('.greentxt span.time')[0].innerHTML;

          self.injectFormLinksInput(self, composeForm);

          // We can get read of all the message.. with the formData logic. Should refactor later.
          var formData = parseFormData($(compose).find('form'));
          formData.to = messageTo;
          formData.cc = messageCc;
          formData.bcc = messageBcc;
          linksInput = $(compose).find('input[name="cm_links"]');
          formData.cm_links =  JSON.parse($(linksInput).val());

          var mailMergeRecipientListId = $(compose).find('input[name="cm-mail-merge-recipient-list-id"]').val();
          self.scheduleClick(self, editable, cm_session, messageBodyVal, messageSubject, messageTo, messageCc, messageBcc, sendOnDate, compose, composeForm, messageAttachment, formData, isReply, isMMDraft, sendNow, checkAndPreview, mailMergeRecipientListId);
        });

        $(compose).on('click', '#sendLaterTemplate #dropup .rescheduleBtn, #sendLaterTemplate .sendNow.rescheduling', function(e) {
          var sendNow = $(this).hasClass('sendNow');
          var sendOnDate = sendNow ? moment().format('Do MMM YYYY h:mm A') : $(compose).find('.greentxt span.date')[0].innerHTML + ' ' + $(compose).find('.greentxt span.time')[0].innerHTML;
          var mailMergeRecipientListId = $(compose).find('input[name="cm-mail-merge-recipient-list-id"]').val();
          self.rescheduleClick(self, cm_session, sendOnDate, compose, isReply, sendNow, isMMDraft, mailMergeRecipientListId);
        });
      });
    }, true);
  });
};

CMApp.prototype.findTrackersInCompose = function(self, compose) {
  return $(compose).find('img[src*="tracker?cm_session"]').filter(function(){ return $(this).parents('.gmail_quote').length == 0 });
};

CMApp.prototype.findPopupContainer = function(self, compose, isReply) {
  var popupContainer = null;
  if (isReply) {
    popupContainer = $(compose).parents('table[role=presentation]').find('> tr > td:first-child');
    if (popupContainer.length <= 0) {
      popupContainer = $(compose);
    }
  } else {
    popupContainer = $(compose);
  }

  return popupContainer;
};

CMApp.prototype.removeLoadingPopup = function(self, compose, isReply) {
  var container = self.findPopupContainer(self, compose, isReply);
  (container.length <= 0 ? $('body') : container).find('.sendLoadingPopup').remove();
};

CMApp.prototype.toggleLoadingPopup = function(self, compose, isReply, makeVisible) {
  var container = self.findPopupContainer(self, compose, isReply);
  var popup = (container.length <= 0 ? $('body') : container).find('.sendLoadingPopup')
  if(makeVisible){
    popup.show();
  }else {
    popup.hide();
  }
};

CMApp.prototype.showGoogleAlert = function(self, messageId, messageClass, messageHTML, messageTimeout) {
  self.sendCommand(self, {cmd: 'GET_TEMPLATE', selector: messageId}, function(self, messageScheduleMissingFieldTemplate){
    var googleAlert = $(messageScheduleMissingFieldTemplate);
    if (!!messageHTML && messageHTML != 'default'){
      googleAlert.html(messageHTML.trim().replace(/\. /g, ".<br />"));
    }

    $('[role="alert"]').find('.J-J5-Ji').append(googleAlert).show();

    setTimeout(function(){
      $(messageClass).remove();
    }, (messageTimeout || 10000));
  }, false);
}

CMApp.prototype.showModal = function(self, modal) {
  $(modal).css('opacity', '1');
  $(modal).css('z-index', '9999');
};

CMApp.prototype.hideModal = function(self, modal) {
  $(modal).css('opacity', '0');
  $(modal).css('z-index', '-9999');
};

CMApp.prototype.injectLinkTracking = function(self, compose, composeForm, editable, cm_session) {
  var link;
  var links;
  var uuid;
  var id;
  var modal;
  var blank;
  var linksInput;

  //inject the modal for link tracking
  //self.injectModal(self, '#insert-link');
  self.injectFormLinksInput(self, composeForm);

  $(compose).find('.new-link').click(function(){

    //focus the editable so we can insert
    $(editable).focus();
    uuid = UUID.genV4().hexString;
    //insert a blank link to update later
    self.pasteHtmlAtCaret(self, '<a href="#" class="link_' + uuid + '"></a>');

    id = $(this).attr('href');
    modal = $('body').find(id);
    self.showModal(self, id);

    //close the modal
    $(id).find('.close').click(function(){
      self.hideModal(self, modal);
      // NEED TO IMPLEMENT a check to remove blank links
    });

    $(modal).find('#link-tracking').submit(function(e){
      linksInput = $(composeForm).find('input[name="cm_links"]');
      links = JSON.parse($(linksInput).val());
      //prevent the form from submitting
      e.preventDefault();

      //find and modify the trackable link
      link = $(modal).find('input[name="cm_trackable_link"]').val();
      blank = $(editable).find('.link_' + uuid);
      blank.attr('href', self.baseURL + '/api/v1/tracker?cm_session=' + cm_session + '&cm_type=link&cm_link=' + uuid + '&cm_destination=' + link);
      blank.html(link);

      //append to the list of current links
      links[uuid] = link;

      //save back the list of links
      $(linksInput).val(JSON.stringify(links));

      self.hideModal(self, modal);
    });
  });
};

/*
 *  Handler for extra regions in a reply.
 *  Basically extra regions have old trackers, so upon
 *  detecting one of these regions, we simply call removeTrackers() on it.
 */
CMApp.prototype.gmailExtra = function(self, summaries) {
  if (self.gmailExtraRemoved) { return; } // Any time you press enter, gmail_extra seems to receive a mutation trigger so ignore once it's done.
  self.gmailExtraRemoved = true;
  var elements = summaries[0];

  elements.added.forEach(function(extra){
    console.log("EXTRA REGION DETECTED, stripping old trackers....");
    self.removeTrackers(self, extra);
    self.findDraftIndicator(self, 'cm-sl-indicator', extra).remove();
    self.findDraftIndicator(self, 'cm-mm-indicator', extra).remove();
  });
};

CMApp.prototype.emailIdObserver = function(self, summaries) {

  console.log("EMAIL ID OBSERVER FIRING");
  var elements = summaries[0];

  //upon detecting a gmail id, send the gmail ID to the background script
  //so that it can push to rails the cm_session + gmail_id for linking
  elements.added.forEach(function(emailIdElement){
    var gmailEmailId = $(emailIdElement).attr('param');
    console.debug('[emailIdObserver] Email detected with id: ', gmailEmailId);
    self.addToSalesforce(self, gmailEmailId);
    self.sendCommand(self, {cmd:"PUT_GMAIL_ID", gmail_id: gmailEmailId});
  });
};

CMApp.prototype.prioritizeHandler = function(self, element, form, event) {
  console.log("TOGGLING PRIORITY ON EMAIL");

  //toggle grey/yellow images
  $(element).find('img').toggle();

  //find the priority input field
  var priorityElement = $(form).find('input[name="priority"]');

  //toggle it
  if($(priorityElement).attr('value') === "false") {
    $(priorityElement).attr('value', 'true');
  }else{
    $(priorityElement).attr('value', 'false');
  }
};

CMApp.prototype.sentEmailHandler = function(self, summaries) {
  var elements = summaries[0];

  elements.added.forEach(function(email){
    self.retrieveStats(self, email);
  });
};

CMApp.prototype.obtainEmailData = function(self, element, selected_email, draft) {
  $('.add-to-sf').removeClass('activated');
  $(element).find('.add-to-sf').addClass('activated');

  var drafted_email = !!draft;
  var email_id = drafted_email ? null : 'email-not-detected';
  var subject = "";
  var to_address = [];
  var from_address = [];
  var email = "";
  var first_name = "";
  var last_name = "";
  var body = "";
  var email_body_html = "";
  var from_me = false;

  if (drafted_email && draft.sending) {
    from_address.push(self.email);
  }

  (drafted_email ? $(element).find('span[email]') : $(element).closest('.ads.ads').find('.iw span[email]')).each(function(){
    var current_email = $(this).attr('email');
    var from_element = $(this).hasClass('gD');
    if (current_email != self.email || selected_email == self.email) {
      if(from_element) {
        if (selected_email == self.email && current_email == selected_email) {
          from_me = true
        }
        from_address.push(current_email);
      } else {
        to_address.push(current_email);
      }

      if ((selected_email && current_email == selected_email) || (!selected_email && email == "" && ((!from_me && from_element) || (from_me && !from_element)))) {
        email = current_email;
        var nameData = ""
        if (drafted_email) {
          nameData = $(this).parent().find('input')[0].value;
          if (nameData.match(/[^<]+<.*>/g) != null) { // If it is only the email, there are no angle brackets
            nameData = nameData.replace(/<.*>/g, "").trim();
          } else {
            nameData = "";
          }
        } else {
          nameData = $(this).attr('name');
        }

        if (nameData != null && nameData.length > 0){
          var splitNames = nameData.split(' ');
          first_name = splitNames[0];
          if (splitNames.length > 1){
            last_name = splitNames[splitNames.length-1];
          }
        }
      }
    } else {
      if(from_element) {
        from_me = true;
      }
    }
  });

  var other_emails = from_address.concat(to_address);
  if (other_emails.indexOf(email) > -1) {
    other_emails.splice(other_emails.indexOf(email), 1);
  }

  if (drafted_email) {
    if (draft.sending) {
      subject = draft.subject;
      email_body_html = draft.email_body_html;
    }
  } else {
    email_id = self.obtainEmailIdFromElement(self, element, email_id);

    subject = $('.ha h2').text() || "";
    email_body_html = $(element).closest(".h7").find('.a3s').html();
  }

  if (email_body_html != "") {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = email_body_html.replace(/<br>/g, "||br||");
    body = (tmp.innerText || tmp.textContent).replace(/\|\|br\|\|/g, "\n").replace(/  +/g, "").trim();
  }

  var data = {
    overview_data: {
      email: email,
      first_name: first_name,
      last_name: last_name,
      email_id: email_id,
      draft: drafted_email,
      other_emails: other_emails
    }
  };

  if (drafted_email && !draft.sending) {
    data.email_data = null
  } else {
    data.email_data = {
      email_id: email_id,
      from_address: from_address,
      to_address: to_address,
      cc_address: [],
      subject: subject,
      body: body
    };
  }

  console.debug("[obtainEmailData] returning data: ", data);
  return data;
};

CMApp.prototype.obtainEmailIdFromElement = function(self, element, current_email_id){
  var email_id = current_email_id;
  try {
    var classes = $(element).parents('.adn.ads').find('.a3s.aXjCH').attr('class').split(' ');
    for (var i = 0; i < classes.length; i++) {
      if (classes[i] != 'a3s' && classes[i] != 'aXjCH' && classes[i] != 'adM' && classes[i].charAt(0) == 'm') {
        email_id = classes[i].replace(/^m/, '').trim();
        break;
      }
    };
  }catch(err){
    console.error("[obtainEmailData] email id could not be detected: ", err);
  }

  return email_id;
};

CMApp.prototype.handleLoadedEmail = function(self, summaries){
  console.debug('[handleLoadedEmail] hit');
  var elements = summaries[0];
  if(elements.added.length > 0){  //We dont care when they are removed
    $.each(elements.added, function(index, value){

      var container = this;
      console.debug('[handleLoadedEmail] in', $(container));
      var btn_container = document.createElement("div");
      var btn = document.createElement("input");

      btn_container.setAttribute("class", "dropdown-btn-group");

      btn.setAttribute("type", "button");
      btn.setAttribute("value", " ");
      btn.setAttribute("class", "add-to-sf");
      if (self.is_salesforce_user){
        btn.setAttribute("title", "Activate this email so that you can add to Salesforce.com");
        btn.setAttribute("style", "margin-left: 10px; color:#888; font-size:14px; cursor: pointer !important; padding-bottom: 3px; width:28px; background-color: #f5f5f5; width: 29px; height: 29px; background-repeat: no-repeat; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAARxJREFUeNpiYqAzYBq1cNRCUgELsQo/RmgZAKkAILaHCh0E4g38K65dIMVCRiIsEgBS86GWYQMbgDgRaPEHavlwPxAb4JEHOUQBiA0pjkOg7xoIWAYDBlC1lAUp0JD7UNcTA0BBegApbh+QZCHQMpBF9ylIkKB4XUBUkEITSgIewx5AMT4wH2hOAEELoZaBEko9DoMuQBOIIZSND/QT48P1eBIKyAJHUBaAZgNHApYq4LUQGm8O+CxDCgUYcCTCpzh9iC9FFmLJl/uhdCC5RdsDIuIDObhB7PN49D3A60No3jmAK3PjiFt80VBITKJJJCLJE5sPNxAsS0G+BCYKQ2g+9MdTqjDgCA1QSbMAV0lDdzDaxBi1cPBbCBBgAI/EUWWzx8ORAAAAAElFTkSuQmCC); border: 1px solid rgba(0,0,0,0.1); margin-top: -7px;")
      }else{
        btn.setAttribute("title", "Connect your Salesforce.com account in order to add emails.");
        btn.setAttribute("style", "margin-left: 10px; color:#888; font-size:14px; cursor: pointer !important; padding-bottom: 3px; width:28px; background-color: #f5f5f5; width: 29px; height: 29px; background-repeat: no-repeat; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAQAAADYBBcfAAAACXBIWXMAAAsTAAALEwEAmpwYAAADGGlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjaY2BgnuDo4uTKJMDAUFBUUuQe5BgZERmlwH6egY2BmYGBgYGBITG5uMAxIMCHgYGBIS8/L5UBFTAyMHy7xsDIwMDAcFnX0cXJlYE0wJpcUFTCwMBwgIGBwSgltTiZgYHhCwMDQ3p5SUEJAwNjDAMDg0hSdkEJAwNjAQMDg0h2SJAzAwNjCwMDE09JakUJAwMDg3N+QWVRZnpGiYKhpaWlgmNKflKqQnBlcUlqbrGCZ15yflFBflFiSWoKAwMD1A4GBgYGXpf8EgX3xMw8BSMDVQYqg4jIKAUICxE+CDEESC4tKoMHJQODAIMCgwGDA0MAQyJDPcMChqMMbxjFGV0YSxlXMN5jEmMKYprAdIFZmDmSeSHzGxZLlg6WW6x6rK2s99gs2aaxfWMPZ9/NocTRxfGFM5HzApcj1xZuTe4FPFI8U3mFeCfxCfNN45fhXyygI7BD0FXwilCq0A/hXhEVkb2i4aJfxCaJG4lfkaiQlJM8JpUvLS19QqZMVl32llyfvIv8H4WtioVKekpvldeqFKiaqP5UO6jepRGqqaT5QeuA9iSdVF0rPUG9V/pHDBYY1hrFGNuayJsym740u2C+02KJ5QSrOutcmzjbQDtXe2sHY0cdJzVnJRcFV3k3BXdlD3VPXS8Tbxsfd99gvwT//ID6wIlBS4N3hVwMfRnOFCEXaRUVEV0RMzN2T9yDBLZE3aSw5IaUNak30zkyLDIzs+ZmX8xlz7PPryjYVPiuWLskq3RV2ZsK/cqSql01jLVedVPrHzbqNdU0n22VaytsP9op3VXUfbpXta+x/+5Em0mzJ/+dGj/t8AyNmf2zvs9JmHt6vvmCpYtEFrcu+bYsc/m9lSGrTq9xWbtvveWGbZtMNm/ZarJt+w6rnft3u+45uy9s/4ODOYd+Hmk/Jn58xUnrU+fOJJ/9dX7SRe1LR68kXv13fc5Nm1t379TfU75/4mHeY7En+59lvhB5efB1/lv5dxc+NH0y/fzq64Lv4T8Ffp360/rP8f9/AA0ADzT6lvFdAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAE1SURBVHja7JS9ccMwDEYfch5AI3AEaoLYE0TZwBrBFdXFLSuPYG8QbSB7gmgDcwRtABei/qjz5S5VCrPRUcADvo/EUZS/rTde4NO16T+y+OksBe8CN619uwSGWxBNwCrTM4WgSJ9UU/puDW5SCdpgJaYICoUY8l89uqNYUBSZqlt3XIOJVHcXM7qIPQXtuMpNax+eeHSG+6zmTHD0W/qLrqVWGfs5pkGDRsEx/eyKlccqo+Fr6qUtOTltouC0AvVbbR8WFGnZ+c537CZUETAJWBm2g6ceA5cBsJN27jcB1fQ+YsJBkQYL0oB+DjFB05EjzOSgJ+iFY+VHw3A5U97Y0Qeus7DFjqUN22HUBA7rySkJi6NfTGY81dLXqVR8cDl7PmY+OuA67m568WE1cq8353+AjwEA3Gl3YTOHAzAAAAAASUVORK5CYII=); border: 1px solid rgba(0,0,0,0.1); margin-top: -7px;")
        btn.setAttribute("disabled", "disabled");
      }
      btn.addEventListener("click", function(){
        self.loadOverviewView(self, self.obtainEmailData(self, container), true);
      }, false);
      btn_container.appendChild(btn);
      container.appendChild(btn_container);

      if(self.quickAddIfReply) {
        self.quickAddIfReply = false;
        var email_id = self.obtainEmailIdFromElement(self, container, null);
        if (email_id) {
          self.addToSalesforce(self, email_id);
        }
      }

      if (self.is_salesforce_user && index == elements.added.length - 1) {
        self.loadOverviewView(self, self.obtainEmailData(self, container), true);
      }
    });
  }
};

CMApp.prototype.addToSalesforce = function(self, email_id){
  if (!!email_id) {
    console.log('[addToSalesforce] Adding email_id ', email_id);
    self.lastSentEmailData.email_id = email_id;
    self.sendCommand(self, {cmd:"ADD_TO_SALESFORCE", quick_add_data: self.lastSentEmailData});
  } else {
    console.error('[addToSalesforce] Failed to add email with id: ', email_id);
  }

  self.lastSentEmailData = {sobjects: {}};
};

CMApp.prototype.handleOverviewLoad = function(self, email_id){
  console.debug('[handleOverviewLoad] Overview loaded with email_id: ', email_id);
  if (self.lastDashboardData && self.lastDashboardData.email_data != null && self.lastDashboardData.email_data.email_id == email_id) {
    console.debug('[handleOverviewLoad] email_id matched, sending data: ', self.lastDashboardData.email_data);
    self.sendCommandToDashboard(self, {cmd: "SETUP_ADD_EMAIL_FORMS", email_data: self.lastDashboardData.email_data});
  }
};

CMApp.prototype.handleSettingQuickAddSobjects = function(self, sobjects){
  console.debug('[handleSettingQuickAddSobjects] Received response from dashboard. Sobjects: ', sobjects);
  self.lastSentEmailData.sobjects = sobjects
};

// To hide the add email menu when clicking elsewhere in the window.
$(document).on('click', function(event) {
  if (!$(event.target).closest('.add-email-menu').length && !$(event.target).closest('.add-to-sf').length) {
    $('.add-email-menu').hide();
  }
});

CMApp.prototype.retrieveStats = function(self, emailElement) {
  //find .Bk object which contains the entire message including headers
  var email = $(emailElement).parent().parent().parent().parent().parent().parent();

  console.log("DETECTED SENT EMAIL");
  //get the email address of this message in the thread
  var emailAddress = $(email).find('.gF.gK').find('[email]');
  var cm_session;

  //only inject stats if this is the user's email
  // debugger
  if(emailAddress.length > 0 && $(emailAddress).attr('email') && $(emailAddress).attr('email') === self.email){
    //locate the tracker within this email element
    tracker = $(email).find('img[src*="tracker?cm_session"]');
    if(tracker.length > 0){
      console.log("DETECTED TRACKER IN EMAIL");
      uri = URI($(tracker[tracker.length-1]).attr('src'));    //Grab the last tracker in case there are multiple ones in the email!

      //extract the cm_session
      cm_session = uri.hash().split("&")[0].split("=")[1];

      //attempt to retrieve the stats
      self.sendCommand(self, {cmd:'GET_STATS', cm_session: cm_session}, function(self, stats){
        if(stats){
          self.injectStats(self, email, stats, stats.cm_session);
        }else{
          throw new Error("Cannot inject stats, no data/cm_session provided");
        }
      }, true);
    }
  }
};

CMApp.prototype.injectStats = function(self, emailElement, data, cm_session) {

  self.sendCommand(self, {cmd: 'GET_TEMPLATE', selector:'.cm-stats'}, function(self, statsTemplate){

    var tpl = $(statsTemplate);

    // debugger
    if(data !== null && !data.hasOwnProperty('error')){

      // console debugger for tracker -- uncomment to debug tracker
      // console.log("data cm_Session:" + data.cm_session );
      // console.log("-- basic_info");
      // console.log("---- " + data.basic_info.subject );
      // console.log("---- " + data.basic_info.ipaddress );
      // console.log("---- " + data.basic_info.time );
      // console.log("---- " + data.basic_info.priority );
      // console.log("-- recipients: " + data.recipients.length );
      // for (i=0; i < data.recipients.length; i++){
      //   console.log("---- "+ i + " :"  + data.recipients[i] );
      // }
      // end of console debbugger for tracker

      //check how many times the email has been opened
      if(data.opens !== null){
        console.log("-- opens: " + data.opens.length ) ;

        //list of colors to use for IP addresses
        var IPColors = ["#DE1841", "#F58920", "#F5DE1A", "#5DD517", "#2186CC", "#6923CD", "#F6451A", "#F6B725", "#D6EB19", "#15CA7F", "#152ACA", "#CA16BD"];

        //set number of opens stats
        $(tpl).find('.opens').html("<b>Email Opens</b>: " + data.opens.length);
        //set stats for last read time
        $(tpl).find('.read').html("<b>Last Read</b>: " + moment(data.opens[0].created_at).format("dddd, MMM Do YYYY, h:mm:ss A"));

        $(tpl).find('.clicks').html("<b>Clicks</b>: " + (data.clicks != null ? data.clicks.length : "0"));

          //map if colors to IP addresses
        var IPColorMap = {length:0};

        $.each(data.opens, function(k, v){
          //append each row of stats i.e. details of an open

          if (((v.visitor.ip_address.indexOf("66.") === 0 || v.visitor.ip_address.indexOf("64.233") === 0) && v.visitor.city.toLowerCase() === "mountain view" ) || v.visitor.ip_address.indexOf("66.249") === 0){
            $(tpl).find('tbody').append('<tr><td class="ip-color"></td><td colspan="3"><a title="' + v.visitor.ip_address + '"> --- </a></td><td><a title="' + v.visitor.ip_address + '">' + "Gmail" + '</a></td><td>' + moment(v.created_at).format("dddd, MMM Do YYYY, h:mm:ss A") + '</td></tr>');
          }else{
            $(tpl).find('tbody').append('<tr><td class="ip-color"></td><td><a title="' + v.visitor.ip_address + '">' + v.visitor.city + '</a></td><td><a title="' + v.visitor.ip_address + '">' + v.visitor.state + '</a></td><td><a title="' + v.visitor.ip_address + '">' + v.visitor.country + '</a></td><td>' + v.useragent + '</td><td>' + moment(v.created_at).format("dddd, MMM Do YYYY, h:mm:ss A") + '</td></tr>');
          }
          //if a color was already picked for this IP, use it
          if(IPColorMap.hasOwnProperty(v.visitor.ip_address) === false){
            IPColorMap[v.visitor.ip_address] = IPColors[IPColorMap.length];
            IPColorMap.length++;
          }

          //set the color for this IP
          $($(tpl).find('tbody tr td.ip-color')[k]).css('background-color', IPColorMap[v.visitor.ip_address]);

        });

        //show/hide functionality of the stats
        $(tpl).click(function(ev) {
          console.log("TEMPLATE CLICKED");
          //make sure we do no expand the stats if they are clicking prioritize
          if(ev.target.tagName !== "IMG"){
            $(this).find('.stats').stop().slideToggle("fast");
          }
        });

        //set the priority of the email
        var priority = data.basic_info.priority;

        //if the priority is set, make the yellow icon visible
        if(priority){
          $(tpl).find('.cm-prioritize').find('img.grey').hide();
          $(tpl).find('.cm-prioritize').find('img.yellow').show();
        }

      }else{
        $(tpl).find('.opens').html("<b>Email Opens</b>: 0");
        //hide the reads
        $(tpl).find('.read').hide();
        $(tpl).find('.clicks').hide();
      }

      //toggle priority handler
      $(tpl).find('.cm-prioritize').click(function(){
        priority = !priority;
        //tell the background script to toggle the state of this email
        self.sendCommand(self, {cmd:'TOGGLE_PRIORITY_STATE', cm_session: cm_session, priority: priority}, function(self, success){
          //if it was successful at prioritizing, toggle the grey/yellow
          if(success) {
            console.log("TOGGLED PRIORITY: " + priority);
            $(tpl).find('.cm-prioritize').find('img').toggle();
          }else{
            console.log("FAILED TO TOGGLED PRIORITY (FAILED REQUEST) ");
          }
        }, true);
      });

      //hide the stats by default
      $(tpl).find('.stats').hide();
      // debugger
      console.log("INJECTING STATS");

      //inject the stats
      $(emailElement).find('.gE.iv.gt').after($(tpl));
    } else {
      console.error("[injectStats] Error detected: ", data['error']);
    }
  });
};

CMApp.prototype.adjustGmailLayoutForDash = function(self, isOnResize) {
  // If the dashboard is closed and we are trigging on the resize, gmail will do all the work for us
  // so just leave things alone!
  if (!isOnResize || window.dashboardOpen){
    var messagesContainerWidth = $('.nH .nH .no .nH.nn .ar4').parent().parent().parent().width();
    var shiftWidth = (window.dashboardOpen ? -277 : 277 );

    var newWidth = messagesContainerWidth + shiftWidth;
    var newMainWidth = 0;
    var internalContainer = null;

    if ($('.nH.SI').length > 0){    // The message is opened in it's own window rather than the standard gmail screen. Must shift differently
      $('.nH.SI').width($('.nH.SI').width() + shiftWidth);
    }else{  // Standard gmail view
      if ($('.nH .nH .no .nH.nn .ar4').length > 0){ // Everything is loaded and being friendly.
        var internalEl = $('.nH .nH .no .nH.nn .ar4').parent().parent().parent();
        internalContainer = internalEl.parent();

        internalEl.width(newWidth); // Inner Container

      }else{  // Initial load up, Specific Dom elements aren't here yet so selectors are different
        var internalEl =  $('.nH .nH .no .nH.nn').not('.oy8Mbf').last();
        internalContainer = internalEl.parent();

        messagesContainerWidth = $('.nH .nH .no .nH.nn').not('.oy8Mbf').last().width();
        newWidth = messagesContainerWidth + shiftWidth;
        //newMainWidth = $('div.nH').first().width() + shiftWidth;

        internalEl.width(newWidth);
      }

      $.each(internalContainer.children(), function (i, child){
        newMainWidth += $(child).width();
      });

      $('div.nH').first().width(newMainWidth + 1);  // Outer Container
      $('.dw .nH').first().width($('.dw .nH').first().width() + shiftWidth);  // compose window container
    }

    self.fixComposeBoxPosition();

  }
};

CMApp.prototype.fixComposeBoxPosition = function() {
  console.log("Fixing compose box position");

  clearInterval(fixIntrvl);

  fixIntrvl=setInterval(function(){

    if(window.dashboardOpen){
      var main_width=0;

      $(".dw > div > .nH > .nH > .no > .nH").each(function(){
        if($(this).css("display")!="none"){
          main_width+=$(this).width()
        }
      });

      // if(main_width > $(".no:eq(1) > .nH:eq(1)").width()){
      //   main_width = $(".no:eq(1) > .nH:eq(1)").width();
      // }

      $(".dw > div > .nH > .nH > .no").css("width", main_width+"px");
      // $(".no:eq(2)").css("width", main_width+"px");

      setTimeout(function(){
        $(".dw > div > .nH > .nH > .no > .nH").each(function(){
          $(this).find(".aDj").removeClass('aDi').removeClass('aDn');
          $(this).find(".aoI").css("height","auto");
        });

      },1);
    }

  }, 1);

  if(!window.dashboardOpen){
    $(".no:eq(2)").css("width", "auto");
  }

}

CMApp.prototype.reloadStats = function(self, forceReload) {
  if (forceReload) {
    $('#contactmonkey').attr('src', self.baseURL + "/dashboard/stats" );
  } else {
    self.sendCommandToDashboard(self, {cmd: 'RELOAD_STATS'});
  }
};

CMApp.prototype.loadDashboard = function(self) {
  console.log("STARTING TO LOAD DASHBOARD");
  //load the dashboard template
  if (!self.isDashboardInjected() && $('body.aAU').length > 0){ // The body lookup makes sure that we are viewing gmail and not something else like gmail chat
    self.sendCommand(self, {cmd: 'GET_TEMPLATE', selector:'#dashboard'}, function(self, dashboardTemplate){
    //if dashboard element was returned
    if(dashboardTemplate && !self.isDashboardInjected()){
      $el = $(dashboardTemplate);

      //change the iframe src using the user's access key
      //$el.find('iframe').attr('src', self.baseURL + "/bridge/dashboard?cm_client_identifier=chrome&cm_client_identifier_version=" + self.version + "&cm_os=" + self.getPlatformName() + "&cookies_enabled=" + self.are_cookies_enabled());
      $el.find('iframe').attr('src', self.baseURL + "/dashboard/stats?cm_client_identifier=chrome&cm_client_identifier_version=" + self.version + "&cm_os=" + self.getPlatformName() + "&cookies_enabled=" + self.are_cookies_enabled());

      // Add an event handler so that the plugin always knows what url is loaded in the iFrame


      //inject the entire dashboard template
      $('body').append($el);
      //Script that will toggle the dasboard in/out

      $("#dashboard-tab").click(function(){
        var messagesContainerWidth = $('.nH .nH .no .nH.nn .ar4').parent().parent().parent().width();
        console.log("messagesContainerWidth: " + messagesContainerWidth);

        if(window.dashboardOpen === false){
          window.dashboardOpen = true;
          self.adjustGmailLayoutForDash(self, false);
          $("#dashboard").stop().animate({ right:"+=277" }, 100, 'linear');

          //tell the background script your dash state
          self.sendCommand(self, {cmd:'SET_DASHBOARD_STATE', state: true}, null);
        }else{
          window.dashboardOpen = false;
          self.adjustGmailLayoutForDash(self, false);

          $("#dashboard").stop().animate({ right:"-=277" }, 100, 'linear');
          self.sendCommand(self, {cmd:'SET_DASHBOARD_STATE', state: false}, null);
        }
      });

      //State restoration check i.e. whether to open/close the dash
      self.sendCommand(self, {cmd:'GET_DASHBOARD_STATE'}, function(self, state){
        if(state === false){ //i.e. closed
          window.dashboardOpen = false;
          //$('.nH .nH .no .nH.nn .ar4').parent().parent().parent().width(messagesContainerWidth + 277);
          $("#dashboard").stop().animate({ right:"-=277" }, 100, 'linear');
        }
        else{
          self.adjustForComposeWindow(self);

          //Initializing with the dashboard open, so we need to shrink the gmail window
          window.dashboardOpen = true;
          self.adjustGmailLayoutForDash(self, false);

        }
      });


      console.log("INJECTING DASHBOARD");
      console.log("Is Dashboard Injected: " + self.isDashboardInjected());

      /* This was in the original 2.2.10 code, but removed by me because i was using a separate method
      if (self.isMac) { $("#dashboard").css("right", "0"); }
      else {
        //resolve html tag, which is more dominant than <body>
        if (document.documentElement) { self.html = $(document.documentElement); } //just drop $ wrapper if no jQuery }
        else if (document.getElementsByTagName('html') && document.getElementsByTagName('html')[0]) { self.html = $(document.getElementsByTagName('html')[0]); }
        else if ($('html').length > -1) { self.html = $('html'); }
        self.setWidth(self);
        $(window).resize(function() { self.setWidth(self); } );
      }
      */
    }else{
      console.log("WARNING: Unable to load dashboard template");
    }
  });
  }else{
    console.log("Dashboard Already Injected, no need to do it again");
  }
};


// set width of gmail
CMApp.prototype.setWidth = function(self) {

  console.log("dashboard open=" + (window.dashboardOpen || window.dashboardOpen === undefined));
  // position
  if (self.html.css('position') === 'static') { self.html.css('position', 'relative'); }
  // top (or right, left, or bottom) offset
  var currentWidth = $(window).width(); //or getComputedStyle(html).top
  self.html.css('width', window.dashboardOpen || window.dashboardOpen === undefined ? currentWidth - 277 : currentWidth);
};

CMApp.prototype.openGmailLink = function(self, data) {
  var re = /^(https|http)\:\/\/mail.google.com\/mail(\/ca)?\/u\/[0-9]+/g;
  var matches = document.URL.match(re);
  if(matches.length > 0){
    var link = matches[0] + "/#inbox" + (data ? ("/" + data.gmail_id) : '');
    console.log("OPENING LINK TO GMAIL: " + link);
    window.location.href = link;
  }
};

CMApp.prototype.waitForResizeFinish = function() {
  var timers = {};
  return function (callback, ms, uniqueId){
    if(!uniqueId){
      uniqueId = "Don't call this multiple times without different Unique IDs"
    }
    if(timers[uniqueId]){
      clearTimeout(timers[uniqueId]);
    }
    timers[uniqueId] = setTimeout(callback, ms);
  };
};

CMApp.prototype.isDashboardInjected = function(){
  return $('#contactmonkey').length > 0;
};

CMApp.prototype.getPlatformName = function(){
  if (navigator.userAgent.indexOf('Windows NT 6.3') >=0) return "windows_8_1";
  if (navigator.userAgent.indexOf('Windows NT 6.2') >=0) return "windows_8";
  if (navigator.userAgent.indexOf('Windows NT 6.1') >=0) return "windows_7";
  if (navigator.userAgent.indexOf('Windows NT 6.0') >=0) return "windows_vista";
  if (navigator.userAgent.indexOf('Windows NT 5.1') >=0) return "windows_xp";
  if (navigator.userAgent.indexOf('Windows 98') >=0) return "windows_98";
  //More Generic identifiers
  if (navigator.platform.toUpperCase().indexOf('MAC')>=0) return "mac";
  if (navigator.platform.toUpperCase().indexOf('WIN')>=0) return "windows";
  if (navigator.platform.toUpperCase().indexOf('LINUX')>=0) return "linux";
  if (navigator.platform.toUpperCase().indexOf('X11')>=0) return "unix";
  return "unknown"
};

CMApp.prototype.are_cookies_enabled = function() {
  var cookieEnabled = (navigator.cookieEnabled) ? true : false;

  if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled)
  {
    document.cookie="testcookie";
    cookieEnabled = (document.cookie.indexOf("testcookie") != -1) ? true : false;
  }
  return (cookieEnabled);
}

CMApp.prototype.sendEmail = function(){
  var sendBtn = $('.n1tfz .T-I.J-J5-Ji.aoO.T-I-atl.L3:not(#sendAndAddBtn)');

  sendBtn.click();
}

// TODO: Should we use other logic in obtainEmailData
CMApp.prototype.getQuickAddSobjects = function(self, editable, compose, composeForm, isReply){
  if(composeForm){
    draft = {
      sending: true,
      subject: $(composeForm).find('input[name=subject]').attr('value') || "",
      email_body_html: editable.get(0).innerHTML
    }
    var email_data_obtained = self.obtainEmailData(self, $(composeForm).find('.fX.aXjCH'), self.lastDashboardData.overview_data.email, draft).email_data;
    email_data_obtained.sobjects = self.lastSentEmailData.sobjects
    self.lastSentEmailData = email_data_obtained;
    self.quickAddIfReply = isReply;
  }
}

CMApp.prototype.newComposeAddressee = function(self, summaries){
  var firstName = "";
  var lastName = "";
  if (summaries.length > 0){
    var elements = summaries[0];

    var emailAddressContainer = elements.added[elements.added.length-1];
    var email = $(emailAddressContainer).find('span[email]').attr('email');

    if (email != null){
      if (self.is_salesforce_user){
        self.loadOverviewView(self, self.obtainEmailData(self, $(emailAddressContainer).parents('.fX.aXjCH'), email, {sending: false}), false);
      }
    }
  }
}

// forceLoad is a bool to state whether we should load the view by setting the iFrame url. If false, we will try to change the url by
// passing a message to the iFrame and it can decide whether or not it makes sense to load the overview or not (ie. not if editing form)
CMApp.prototype.loadOverviewView = function(self, data, forceLoad){
  self.lastDashboardData = data;
  console.debug('[loadOverviewView] Loading with: ', data);
  // data.overview_data should contain keys: email, first_name, last_name, email_id, other_emails, draft
  var url = self.baseURL + '/dashboard/overview?' + $.param(data.overview_data);

  if(forceLoad){
    $('#contactmonkey').attr("src", url);
  }else{
    self.sendCommandToDashboard(self, {cmd: "LOAD_URL", url: url});
  }
}

// Note: This can't be used for the initial load up becaus we are leaving out some of the extra parameters here for the sake of speed
CMApp.prototype.loadSidebarView = function(self){
  // if(self.is_salesforce_user){
    $('#contactmonkey').attr('src', self.baseURL + "/dashboard/stats" );
  // }
}

CMApp.prototype.isIndicatorInDraft = function(self, indicator, compose) {
  return self.findDraftIndicator(self, indicator, compose).length > 0;
};

CMApp.prototype.findDraftIndicator = function(self, indicator, container) { // container usually compose or gmail_extra
  return $(container).find('[class*="' + indicator + '"]'); // Google prepends its own random substr to the class when the draft is saved so search by partial
};

CMApp.prototype.injectDraftIndicator = function(self, indicator, compose, editable) {
  self.findDraftIndicator(self, indicator, compose).remove();
  $(editable).append("<div class='" + indicator + "' style='display: none;'></div>");
};

CMApp.prototype.injectSendLaterComposeUI = function(self, cm_session, compose, editable, composeForm, isReply, isMMDraft) {
  if($(compose).find('.n1tfz #sendLaterTemplate').length <= 0) {
    self.sendCommand(self, {cmd: 'GET_TEMPLATE', selector:'#sendLaterTemplate'}, function(self, sendLaterTemplate){
      $(compose).find('.n1tfz td:first-child').append(sendLaterTemplate);

      console.log("sendLaterBtnDisabledState: " + self.sendLaterBtnDisabledState);
      var btns = $('button.sendLater');
      for (var i = 0; i < btns.length; i++) {
        btns[i].disabled = self.sendLaterBtnDisabledState;
        btns[i].style.background = self.sendLaterBtnDisabledState ? '#cfcecd' : '#f15928';
      }

      $(compose).find('#timeSelect').on('change', function(){
        $(this).attr('value', this.value);
      });


      self.addCalendarToCompose(self, compose);

      // Getting nearest value from array
      function closest(array,num){
        var i=0;
        var minDiff=1000;
        var ans;
        for(i in array){
          var m=Math.abs(num-array[i]);
          if(m<minDiff){
            minDiff=m;
            ans=array[i];
          }
        }
        return ans;
      }

      // Getting nearest time by adding minute
      function getNearestTime(addminutes){
        var timeArray = [5,10,15,20,25,30,35,40,45,50,55,60];
        var d1 = new Date()
        var d2 = new Date(d1);
        d2.setMinutes(d1.getMinutes() + addminutes);

        var minute = d2.getMinutes();
        var hour = d2.getHours();
        var inf = hour > 11 ? "PM" : "AM";
        if(hour > 12){ hour=(hour-12); }

        minute=closest(timeArray, minute);
        if(minute < 10){
          minute = "0"+minute;
        }

        return hour + ":" + minute + " " + inf;
      }

      setTimeout(function(){
        var time_to_set = $(compose).find('#timeSelect').data('time-to-set') || getNearestTime(15);

        $(compose).find('#timeSelect > option').each(function(index, el) {
          if(time_to_set==$(this).text()){
            $(compose).find('#timeSelect').val($(this).val());
            $(compose).find('#timeSelect').trigger("change");
          }
        });
      }, 200);

      $(compose).find('.Ap, .n1tfz #sendLaterTemplate .close-icon').on('click', function(){
        $('#sendLaterTemplate #dropup').hide();
      });

      preview = function(dateSelector, timeSelector, eventName, dateSpan, timeSpan){
        var date = moment().add(1, 'days').format('Do MMM YYYY');
        var time = '7:00 AM';
        // dateSpan.html(date);
        // timeSpan.html(time);

        dateSelector.on(eventName, function(){
          date = dateSelector[0].value
          // console.log(date);
          dateSpan.html(date);
        });

        timeSelector.on(eventName, function(){
          timeVal = timeSelector[0].value
          time = $(compose).find("#timeSelect option[value=\'" + timeVal + "\']")[0].innerHTML
          // console.log(time);
          timeSpan.html(time);
        });
      };

      preview($(compose).find('#datepicker'), $(compose).find('#timeSelect'),'change', $(compose).find('.greentxt .date'), $(compose).find('.greentxt .time'));

      $(compose).find('.n1tfz #sendLaterTemplate button.sendLater').on('click', function(){
        self.sendLaterClick(self, cm_session, compose, editable, composeForm);
      });

      if (isMMDraft) {
        self.injectMailMergeComposeUI(self, compose, composeForm, editable, isReply);
      }
    }, false);
  }
};

CMApp.prototype.injectMailMergeComposeUI = function(self, compose, composeForm, editable, isReply) {
  console.debug("[injectMailMergeComposeUI] Injecting MM components");
  // var limit = /gmail.com$/.test(self.email) ? '300' : '1500' // FIXME: Use this once gmail quota limitation is overcome
  var gmailToField = $(compose).find('.gO.aQY');
  var gmailToContainer = gmailToField.parents('.fX.aXjCH');
  var gmailHeaderForm = gmailToContainer.parent();
  var gmailRecipientsContainer = gmailHeaderForm.find('.aoD.hl');

  gmailToField.text("Send merge to (max 200):"); // Update "To" text
  $(compose).find('.aB.gQ').remove(); // Remove CC/BCC links

  if($(compose).find('#csv-fields-container').length <= 0) {
    self.sendCommand(self, {cmd: 'GET_TEMPLATE', selector:'#csv-fields-container'}, function(self, csvFieldsContainer){
      self.sendCommand(self, {cmd: 'GET_TEMPLATE', selector: '#mm-csv-uploading'}, function(self, sendLoadingPopup){
        var popupContainer = self.findPopupContainer(self, compose, isReply);
        var sendLoadingEle = $(sendLoadingPopup).hide();
        if(isReply) { sendLoadingEle.addClass('isReply'); }
        if(popupContainer.find(".sendLoadingPopup").length==0){
          popupContainer.append(sendLoadingEle);
        }
      }, false);

      gmailToContainer.prepend(csvFieldsContainer);
      var toCSVContainer = gmailToContainer.find('#csv-fields-container');
      toCSVContainer.attr('id', "to-csv-fields-container");

      gmailRecipientsContainer.prepend(csvFieldsContainer);
      var recipientsCSVContainer = gmailRecipientsContainer.find('#csv-fields-container');
      recipientsCSVContainer.hide().attr('id', "recipients-csv-fields-container");

      var bothCSVContainers = gmailHeaderForm.find('.csv-fields-container');

      gmailRecipientsContainer.find('.csv-selected').mousedown(function(e){ // 'click' wasn't triggering it properly
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      });

      gmailHeaderForm.find('.csv-link').click(function(e){
        e.preventDefault();
        $(this).parent().find('.recipients-csv').val(null).change().click();
      });

      gmailHeaderForm.find('.recipients-csv').change(function(e){
        var form_data, content_type, process_data;
        var recipiends_csv_field = $(this);
        if (!!($(compose).data('force_load_csv'))) {
          $(compose).data('force_load_csv', null);
          $(compose).find('.mail-merge-recipient-list').val($(compose).find('input[name="cm-mail-merge-recipient-list-id"]').val()).change();
          form_data = JSON.stringify({mail_merge_recipient_list_id: $(this.parentElement).find('.mail-merge-recipient-list').val()});
          content_type = 'application/json';
          process_data = true
        } else if (!recipiends_csv_field.val() || recipiends_csv_field.val() == "") {
          return;
        } else {
          form_data = new FormData(this.parentElement);
          content_type = false;
          process_data = false
        }

        $(compose).find('.messageScheduleGenericError').remove();
        var csvUploadingPopup = $(compose).find('#mm-csv-uploading');
        csvUploadingPopup.data('timeout-complete', false);
        csvUploadingPopup.data('upload-complete', false);
        csvUploadingPopup.data('google-alert-message', false);
        self.toggleLoadingPopup(self, compose, isReply, true);

        window.setTimeout(function(){
          $(compose).find('#mm-csv-uploading').data('timeout-complete', true);
          if(!!$(compose).find('#mm-csv-uploading').data('upload-complete')){
            self.toggleLoadingPopup(self, compose, isReply, false);
            if (!!csvUploadingPopup.data('google-alert-message')){
              self.showGoogleAlert(self, '#messageScheduleGenericError', '.messageScheduleGenericError', csvUploadingPopup.data('google-alert-message'), 20000);
            }
          }
        }, 5000);

        $.ajax({ // Must do AJAX in cm-app because cm-background isn't receiving the file properly
          type:"POST",
          url: self.baseURL + "/api/v1/mail_merge_campaigns/mail_merge_recipient_list",
          cache: false,
          contentType: content_type,
          processData: process_data,
          data: form_data,
          success: function(response){
            if (response.status == "success"){
              console.debug("[injectMailMergeComposeUI] Successfully created Mail Merge Recipient List");
              var merge_field_options = "<option value=''>Search for a field</option>";
              var field_select = $(compose).find('.mm-select2-container .mm-fields');
              $.each(response.mail_merge_recipient_list.merge_fields, function(field_key, field_value){
                merge_field_options += '<option value="' + field_key + '">' + field_value + '</option>';
              });
              field_select.select2('destroy');
              field_select.html(merge_field_options);
              field_select.select2({ placeholder: "Search for a field" });

              self.injectDraftIndicator(self, 'cm-mm-csv-indicator', compose, editable);
              self.injectHiddenField(self, composeForm, 'cm-mail-merge-recipient-list-id', response.mail_merge_recipient_list.id);
              $(compose).find('.mail-merge-recipient-list').val(response.mail_merge_recipient_list.id).change();

              gmailToContainer.find('> table').hide();
              bothCSVContainers.css({left: '5px', right: 'auto'});
              bothCSVContainers.find('.csv-unselected').hide();
              bothCSVContainers.find('.csv-selected .recipients_count').text(response.mail_merge_recipient_list.recipients_count);
              bothCSVContainers.find('.csv-selected').css('display', 'inline-block');

              gmailRecipientsContainer.find('> :not(.csv-fields-container)').hide();
              gmailRecipientsContainer.find('> .csv-fields-container').show();

              gmailHeaderForm.find('.vN.bfK.a3q > .vM').each(self.simulateGmailClick); // Remove existing contacts
              var toInputContainer = gmailHeaderForm.find('textarea[name="to"]').parent();
              toInputContainer.find('input[name="to"]').remove();
              toInputContainer.prepend('<input name="to" type="hidden" value="' + self.email+ '"/>');
            } else {
              if(!csvUploadingPopup.data('timeout-complete')){
                csvUploadingPopup.data('google-alert-message', response.message);
              } else {
                self.showGoogleAlert(self, '#messageScheduleGenericError', '.messageScheduleGenericError', response.message, 20000);
              }
              console.error("[injectMailMergeComposeUI] Failed to create Mail Merge:", response.message);
            }
          },
          error: function(request, status, error){
            if(!csvUploadingPopup.data('timeout-complete')){
              csvUploadingPopup.data('google-alert-message', 'default');
            } else {
              self.showGoogleAlert(self, '#messageScheduleGenericError', '.messageScheduleGenericError', 'default', 20000);
            }
            console.error("[injectMailMergeComposeUI] Error encountered while creating Mail Merge:", error);
          },
          complete: function() {
            csvUploadingPopup.data('upload-complete', true);
            if(!!csvUploadingPopup.data('timeout-complete')){
              self.toggleLoadingPopup(self, compose, isReply, false);
            }
          },
          timeout: 30000
        });
      });

      if (!!($(compose).data('force_load_csv'))) {
        console.debug("[injectMailMergeComposeUI] Forcing CSV field change!");
        gmailHeaderForm.find('.recipients-csv').first().change();
      }
    }, false);
  }

  $(compose).find('.n1tfz .T-I.J-J5-Ji.aoO.T-I-atl.L3').hide(); // Hide Send
  $(compose).find('.sendNow').text("Send Merge").removeClass('rescheduling').show();

  function saveSelection() {
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        return sel.getRangeAt(0);
      }
    } else if (document.selection && document.selection.createRange) {
      return document.selection.createRange();
    }
    return null;
  }

  function restoreSelection(range) {
    if (range) {
      if (window.getSelection) {
        sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } else if (document.selection && range.select) {
        range.select();
      }
    }
  }

  function isOrContains(node, container) {
    while (node) {
      if (node === container) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  function insertTextAtCursor(text) {
    var sel, range, html;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode( document.createTextNode(text) );
      }
    } else if (document.selection && document.selection.createRange) {
      document.selection.createRange().text = text;
    }
  }

  var selected_editable_ele;
  var subject_cursor_index;

  if($(compose).find('.aDh #mm-fields-container').length <= 0) {
    self.sendCommand(self, {cmd: 'GET_TEMPLATE', selector:'#mm-fields-container'}, function(self, mmFieldsContainer){
      $(compose).find('.aDh').append(mmFieldsContainer);

      var subject_box = $(compose).find("input[name='subjectbox']").parent();
      var mm_dropup = $(compose).find('.aDh #mm-fields-container .mm-field-dropup');
      var field_select_container = $(compose).find('.aDh .mm-select2-container');
      var field_select = field_select_container.find('.mm-fields');
      var copy_field_container = $(compose).find('.aDh .mm-input-field-container');
      var copy_field_input = copy_field_container.find('input');

      field_select.select2({ placeholder: "Search for a field" });
      field_select.change(function(e) {
        if($(this).val() != '') {
          // FIXME: Saving where the cursor is was not working. Uncomment this to make it work.
          // if (selected_editable_ele != null && isOrContains(selected_editable_ele.startContainer, subject_box.get(0))) {
          //   var subj_sel = subject_box.find('input[name="subjectbox"]');
          //   var subject_text = subj_sel.val();
          //   var index = subject_cursor_index || subject_text.length;
          //   var front = subject_text.substring(0, subject_cursor_index);
          //   var end = subject_text.substring(subject_cursor_index, subject_text.length);
          //   if (front.length != 0) { merge_field = (front[front.length - 1] != ' ' ? ' ' : '') + merge_field; }
          //   if (end.length != 0)   { merge_field += (end[0] != ' ' ? ' ' : ''); }
          //   subj_sel.val(front + merge_field + end).change();
          // } else if (selected_editable_ele != null && isOrContains(selected_editable_ele.startContainer, editable.get(0))) {
          //   restoreSelection(selected_editable_ele);
          //   insertTextAtCursor(merge_field);
          // } else {
          //   editable.append(merge_field);
          // }

          field_select_container.hide();
          copy_field_input.val("{{" + $(this).val() + "}}");
          copy_field_container.fadeIn();
          copy_field_input.click();
          $(this).val('').change();
        }
      });

      copy_field_input.on("click", function (e) {
         $(this).select();
         document.execCommand('copy');
      });

      copy_field_container.find('.mm-close-copy-alert').click(function(){
        copy_field_container.hide();
        field_select_container.show();
      });

      // FIXME: Saving where the cursor is was not working. Uncomment this to make it work.
      // mm_dropup.on('mousedown', function(e) { selected_editable_ele = saveSelection(); });
      // editable.on(   'mouseup', function(e) { selected_editable_ele = saveSelection(); });
      // subject_box.on('mouseup', function(e) {
      //   selected_editable_ele = saveSelection();
      //   subject_cursor_index = $(this).find('input[name="subjectbox"]').get(0).selectionStart;
      // });

      mm_dropup.on('click', function(e) {
        console.debug("[injectMailMergeComposeUI] dropup clicked");
        $(compose).find('#sendLaterTemplate #dropup').hide();
        $(this).parents('#mm-fields-container').find('.mm-popup-container').toggle(function(e) {
          copy_field_container.hide();
          field_select_container.show();
          if ($(this).is(':visible')) {
            field_select.select2('open');
          }
        });
      });

      $(compose).on('click', '#sendLaterTemplate button.sendLater, .sendNow', function(e) {
        if (mm_dropup.find('.mm-popup-container').is(':visible')) {
          mm_dropup.click();
        }
      });
    }, false);
  }
};

CMApp.prototype.injectMailMergeComposeButton = function(self, summaries) {
  console.debug("[injectMailMergeComposeButton] Reached")
  if (!self.primary_email_tab || $('#mail-merge-compose-container').length > 0) { return; }
  summaries[0].added.forEach(function(cmp_btn){
    var mail_merge_cmp_btn = $(cmp_btn).clone();
    mail_merge_cmp_btn.attr('id', 'mail-merge-compose-container');
    mail_merge_cmp_btn.find('div[role=button]').attr('id', 'mail-merge-compose').text("MAIL MERGE").data('mm-activated', false);
    if (self.mail_merge_enabled) {
      mail_merge_cmp_btn.click(function(e){
        self.mailMergeClick(self, e, this, cmp_btn);
      });
    } else {
      mail_merge_cmp_btn.attr('title', "Mail Merge is only available to Professional Plus plans and up.\nUpgrade your plan now to start using this feature!").addClass('mm-disabled');
    }
    $(cmp_btn).after(mail_merge_cmp_btn);
  });
};

CMApp.prototype.mailMergeClick = function(self, e, mail_merge_cmp_btn, cmp_btn) {
  if (self.mail_merge_enabled) {
    $(mail_merge_cmp_btn).data('mm-activated', true);
    $(cmp_btn).find('div > div').each(self.simulateGmailClick);
  } else {
    // TODO: inject new prompt which signs user out etc etc
  }
};

CMApp.prototype.isMailMergeDraft = function(self, compose) {
  var mm_active = false;
  if (compose) {
    mm_active = self.isIndicatorInDraft(self, 'cm-mm-indicator', compose);
    if (mm_active) {
      console.debug('[isMailMergeDraft] Previous MM detected');
    }
  } else {
    mm_active = $('#mail-merge-compose-container').data('mm-activated');
    $('#mail-merge-compose-container').data('mm-activated', false);
  }
  console.debug("[isMailMergeDraft] Active MM?", mm_active);
  return mm_active;
};

CMApp.prototype.simulateGmailClick = function() {
  console.debug("[simulateGmailClick] Clicked on: ", $(this));
  var evt, thisButton = this;
  evt = document.createEvent("MouseEvents");
  evt.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  thisButton.dispatchEvent(evt);
  evt = document.createEvent("MouseEvents");
  evt.initMouseEvent("mouseup", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  thisButton.dispatchEvent(evt);
};

CMApp.prototype.manipulateDraftLinks = function(self, cm_session, compose, editable, composeForm) {
  var reg = /("|'|cm_destination=|<wbr>)?(www|http:\/\/|https:\/\/|ftp:\/\/)?([-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:;%_\+.~#?&//=]*))(<wbr>[a-zA-Z=0-9]+)?('|")?/g; // '
  //This one is a much more verbose URL checker and will catch strange false edgecases that 'reg' will not.
  // But because the groups in reg are used in complicated ways below, we will include this check below to make sure we are looking at a good link
  var verbose = /(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.‌​\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[‌​6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1‌​,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00‌​a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u‌​00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?/ig;
  var regNegate = /(mailto:|@|<wbr>|toutapp.com|mailfoogae|<img|cm_session|cm_type|cm_link|cm_destination|cm_user_email|.gif\b|.jpg\b|.png\b|.css\b|mail.google.com|googleusercontent.com|storage.googleapis.com)/; // stuff that negates a link
  var regInclude = /www|http:\/\/|https:\/\/|ftp:\/\//; // must have at least one of these to be a link
  var regSuffix = /.(com|net|org|edu|biz|gov|mil|info|name|me|tv|us|mobi|ca|to|ad|ae|ag|ai|al|am|ar|at|au|aw|ba|be|bg|bh|bm|bn|bo|br|bs|bw|by|bz|ch|ci|cl|cn|co|cr|cu|cy|cz|de|dk|dm|do|ec|ee|eg|es|et|fi|fj|fm|fo|fr|gb|ge|gi|gl|gr|gt|gu|gy|hk|hn|hr|hu|id|ie|il|in|ir|is|it|jm|jo|jp|ke|kg|kr|kw|kz|lb|lc|li|lk|lt|lu|lv|ma|mc|md|mk|mn|mo|mt|mu|mv|mx|my|na|nc|ng|ni|nl|no|np|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pt|py|qa|ro|ru|sa|se|sg|si|sk|su|sv|th|tn|tr|tt|tw|tz|ua|ug|uk|us|uy|uz|va|ve|vi|vn|ws|ye|yu|za|zm|zw)\b/;
  var stripQuotes = /"|'/g;
  var stripPunctuation = /[.,?\-!]$/g;

  if ($(compose).find('#doLinks').get(0).checked) {
    // search for links
    // this is where links are stored to send to database
    var linksInput = $(composeForm).find('input[name="cm_links"]');
    var links = JSON.parse($(linksInput).val());
    var uuid;
    // find/replace function
    $(editable).html($(editable).html().replace(reg, function(match, match2, match3, match4) {
      var matchHttp;
      //      console.log("match: " + match + " match2:" + match2 + " match3:" + match3 + " match4:" + match4);
      // don't track trackers!
      if (match.search(regNegate) >= 0 || match.search(verbose) < 0)
        { /*console.log("negated!");*/ return match; }
      else if (match.search(regInclude) >= 0 || match.search(regSuffix) >= 0) {
        // Look for trailing punctuation so that we can add it back in later
        var punctuationMatch = stripPunctuation.exec(match);
        match = match.replace(stripPunctuation, ""); //Remove any trailing punctuation that might be included with the link
        //console.log("--- match: " + match);
        matchHttp = match;

        if (match2 === '"' && match2 === "'") { matchHttp = matchHttp.replace(stripQuotes, ""); }
        if (match.indexOf("http") < 0 && match.indexOf("ftp") < 0) { matchHttp = "http://" + match; } // add http or redirect doesn't work
        uuid = UUID.genV4().hexString;
        // append to the list of current links
        links[uuid] = (match2 !== '"' && match2 !== "'") ? matchHttp : matchHttp.replace(stripQuotes, "");
        $(linksInput).val(JSON.stringify(links));
        var tLink = self.baseURL + "/api/v1/tracker?cm_session=" + cm_session + "&cm_type=link&cm_link=" + uuid + "&cm_destination=" + matchHttp;
        // only add anchor if it's a link
        if (match2 !== '"' && match2 !== "'") {
          if(match != null && punctuationMatch != null){
            match = match + punctuationMatch;
          }
          console.log("---link found. tLink: " + tLink); return '<a href="' + tLink + '">' + match + '</a>';
        }
        else { console.log("Replacing with: " + tLink.replace(stripQuotes, "")); return tLink.replace(stripQuotes, ""); }
      }
      else { return match; }
    } ));
    self.injectFormLinksInput(self, composeForm);
  }
};

var waitForFinalEvent = (function () {
  var timers = {};
  return function (callback, ms, uniqueId) {
    if (!uniqueId) {
      uniqueId = "Don't call this more than once without using unique IDs.";
    }
    if (timers[uniqueId]) {
      clearTimeout (timers[uniqueId]);
    }
    timers[uniqueId] = setTimeout(callback, ms);
  };
})();

/*
window.addEventListener('message', function(event){
  if (event.origin !== "http://localhost:3000"){
    console.log(event.origin);
    return;
  }
  else{
    var cmd;
    try{
      cmd = JSON.parse(e.data);
    }catch(err){
      //command polluted with html entities
      //gotta use some retarded method to strip them....
      cmd = $("<div/>").html(event.data).text();
      cmd = JSON.parse(cmd);
    }

    if(cmd.hasOwnProperty('cmd')){
      alert(cmd.cmd);
    }
  }
  alert("Message: " + event.data);
});
*/

new CMApp();
/*
window.addEventListener("message", receiveMessage, false);


function receiveMessage(event){
  if (event.origin !== "http://localhost:3000"){
    if(event.origin.indexOf("google")<0){
      alert("Origin was: " + event.origin);
    }
  }else{
    alert("Messge Received: " + event.data);
  }
}
  */
