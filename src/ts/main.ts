/*
Copyright AtlanticBT.
 */

import "jquery";

import "gmail-js";

// import { SforceServices } from "./services/salesforce.services";
// import { EventsHelper, ExtensionHelper } from "./tools/helpers";

// namespace AtlanticBTApp {
//     const gmail = new Gmail($);

//     const extensionHelper = new ExtensionHelper(gmail);
//     const sforceService = new SforceServices(extensionHelper);
//     const eventsHelper = new EventsHelper(gmail, extensionHelper, sforceService);

//     // register main event will tell when Gmail is ready
//     // gmail.observe.on("load", eventsHelper.initialize.bind(eventsHelper));

//     // let gmail;

//     function refresh(f) {
//         if ((/in/.test(document.readyState)) || (typeof Gmail === "undefined")) {
//             setTimeout(refresh.bind(this, f), 10);
//         } else {
//             f();
//         }
//     }

//     const main = () => {
//         // console.log("Hello, from abt extension: ", gmail.get.user_email());
//         eventsHelper.initialize();
//     };

//     refresh(main);
// }

// export = AtlanticBTApp;

let gmail;

function refresh(f) {
    if ((/in/.test(document.readyState)) || (typeof Gmail === "undefined")) {
        setTimeout(refresh.bind(this, f), 1000);
    } else {
        f();
    }
}

const main = () => {
    gmail = new Gmail();

    // tslint:disable:only-arrow-functions
    // tslint:disable:semicolon
    // tslint:disable:quotemark
    // tslint:disable:space-before-function-paren
    // tslint:disable:prefer-const
    // tslint:disable:no-var-keyword
    // tslint:disable:curly
    gmail.observe.on("load", function () {
        gmail.observe.on("http_event", function (params) {
            console.log("url data:", params);
            debugger;
        })

        gmail.observe.on("unread", function (id, url, body, xhr) {
            console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("read", function (id, url, body, xhr) {
            console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("delete", function (id, url, body, xhr) {
            console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("mark_as_spam", function (id, url, body, xhr) {
            console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("mark_as_not_spam", function (id, url, body, xhr) {
            console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("label", function (id, url, body, label, xhr) {
            console.log("id:", id, "url:", url, 'body', body, "label", label, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("archive", function (id, url, body, xhr) {
            console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("move_to_inbox", function (id, url, body, xhr) {
            console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("delete_forever", function (id, url, body, xhr) {
            console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("delete_message_in_thread", function (id, url, body) {
            console.log("id:", id, "url:", url, 'body', body);
            debugger;
        })

        gmail.observe.on("restore_message_in_thread", function (id, url, body) {
            console.log("id:", id, "url:", url, 'body', body);
            debugger;
        })

        gmail.observe.on("star", function (id, url, body, xhr) {
            console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("unstar", function (id, url, body, xhr) {
            console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("undo_send", function (url, body, data, xhr) {
            console.log('body', body, 'xhr', xhr, 'msg_id : ', body.m);
            debugger;
        })

        gmail.observe.on("mark_as_important", function (id, url, body, xhr) {
            console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("mark_as_not_important", function (id, url, body, xhr) {
            console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("filter_messages_like_these", function (id, url, body, xhr) {
            console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("mute", function (id, url, body, xhr) {
            console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("unmute", function (id, url, body, xhr) {
            console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("add_to_tasks", function (url, body, data, xhr) {
            console.log("url:", url, 'body', body, 'task_data', data, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("move_label", function (id, url, body, xhr) {
            console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("save_draft", function (url, body, data, xhr) {
            console.log("url:", url, 'body', body, 'email_data', data, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("discard_draft", function (id, url, body, xhr) {
            console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("send_message", function (url, body, data, xhr) {
            console.log("url:", url, 'body', body, 'email_data', data, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("expand_categories", function (url, body, data, xhr) {
            console.log("url:", url, 'body', body, 'expanded_data', data, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("delete_label", function (id, url, body, xhr) {
            console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("show_newly_arrived_message", function (id, url, body) {
            console.log("id:", id, "url:", url, 'body', body);
            debugger;
        })

        gmail.observe.on("poll", function (url, body, data, xhr) {
            console.log("url:", url, 'body', body, 'data', data, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("new_email", function (id, url, body, xhr) {
            console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("refresh", function (url, body, data, xhr) {
            console.log("url:", url, 'body', body, 'data', data, 'xhr', xhr);
            debugger;
        })

        gmail.observe.on("open_email", function (id, url, body, xhr) {
            console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
            console.log(gmail.get.email_data(id));
            debugger;
        })

        gmail.observe.on("upload_attachment", function (file, xhr) {
            console.log("file", file, 'xhr', xhr);
            debugger;
        })

        // DOM observers
        gmail.observe.on("compose", function (compose, type) {

            // type can be compose, reply or forward
            console.log('api.dom.compose object:', compose, 'type is:', type);  // gmail.dom.compose object
            debugger;
        });

        gmail.observe.on('recipient_change', function (match, recipients) {
            console.log('recipients changed', match, recipients);
            debugger;
        });

        gmail.observe.on('view_thread', function (obj) {
            console.log('conversation thread opened', obj); // gmail.dom.thread object
            debugger;
        });

        gmail.observe.on('view_email', function (obj) {
            console.log('individual email opened', obj);  // gmail.dom.email object
            debugger;
        });

        gmail.observe.on('load_email_menu', function (match) {
            console.log('Menu loaded', match);

            // insert a new element into the menu
            $('<div />').addClass('J-N-Jz')
                .html('New element')
                .appendTo(match);
            debugger;
        });

        gmail.observe.before('send_message', function (url, body, data, xhr) {
            var body_params = xhr.xhrParams.body_params;

            // lets cc this email to someone extra if the subject is 'Fake example'
            if (data.subject == 'Fake example') {
                if (body_params.cc) {
                    if (typeof body_params.cc != 'object') body_params.cc = [body_params.cc];
                } else {
                    body_params.cc = [];
                }
                body_params.cc.push('ebeltran1981@gmail.com');
            }

            // now change the subject
            body_params.subject = 'Subject overwritten!';
            console.log("sending message, url:", url, 'body', body, 'email_data', data, 'xhr', xhr);
            debugger;
        });

        gmail.observe.after("send_message", function (url, body, data, response, xhr) {
            console.log("message sent", "url:", url, 'body', body, 'email_data', data, 'response', response, 'xhr', xhr);
            debugger;
        })
    });
};

refresh(main);
