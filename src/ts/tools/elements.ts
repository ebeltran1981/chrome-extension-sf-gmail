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

        public hasToolbar(item: JQuery): boolean {
            return item.find(`.${cssClasses.abtToolbar}`).length > 0;
        }

        /**
         * this is a wrapper to generate a checkbox inside a div within a label control.
         * @param name The name for the control, also is used for the id.
         * @param text The text to show on the label
         * @param css the class to add to the checkbox
         * @param inverse flag if you want to show the label to right or the left
         */
        public checkbox(name: string, text: string, css: string, inverse: boolean = false): JQuery {
            const div = $(document.createElement("div"));
            const lbl = $(document.createElement("label"));
            const chk = $(document.createElement("input"));

            div.addClass(`aoT ${css}`);
            lbl.text(text);
            chk.attr("id", name);
            chk.attr("name", name);
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
