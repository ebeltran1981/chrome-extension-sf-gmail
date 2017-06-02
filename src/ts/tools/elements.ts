/*
Copyright AtlanticBT.
*/

import * as $ from "jquery";

namespace AtlanticBTApp {
    const cssClasses = {
        abtToolbar: "aoD az6 abt-toolbar"
    };

    export class ComposeElements {
        public add_toolbar($el: JQuery): JQuery {
            const toolbar = $(document.createElement("div"));
            toolbar.addClass(cssClasses.abtToolbar);
            $el.append(toolbar);
            return toolbar;
        }

        public get_toolbar(item: JQuery): JQuery {
            return item.children(`.${cssClasses.abtToolbar.split(" ").join(".")}`);
        }

        public hasToolbar(item: JQuery): boolean {
            return item.children(`.${cssClasses.abtToolbar.split(" ").join(".")}`).length > 0;
        }

        /**
         * Method to get a checkbox with a label wrapped in a div
         * @param name this name will be used for the id and name attributes
         * @param text this value will be used on the label wrapping the checkbox
         * @param css this is the class of the div wrapping the label and the input
         * @param inverse used to position the label to the right or the left
         */
        public checkbox(name: string, text: string, css: string, inverse: boolean = false): JQuery {
            const div = $(document.createElement("div"));
            const lbl = $(document.createElement("label"));
            const chk = $(document.createElement("input"));

            div.addClass(`aoT ${css}`);
            lbl.text(text);
            chk.attr("name", name);
            chk.attr("id", name);
            chk.attr("type", "checkbox");

            if (inverse) {
                lbl.append(chk);
            } else {
                lbl.prepend(chk);
            }

            div.append(lbl);

            return div;

        }
    }
}

export = AtlanticBTApp;
