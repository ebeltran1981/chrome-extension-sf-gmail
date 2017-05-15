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

        public checkbox(text: string, css: string, inverse: boolean = false): JQuery {
            const div = $(document.createElement("div"));
            const lbl = $(document.createElement("label"));
            const chk = $(document.createElement("input"));

            div.addClass(`aoT ${css}`);
            lbl.text(text);
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
