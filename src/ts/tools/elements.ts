/*
Copyright AtlanticBT.
*/

import * as $ from "jquery";

namespace AtlanticBTApp {
    const cssClasses = {
        abtToolbar: "abt-toolbar"
    };

    export class ComposeElements {
        public toolbar(): JQuery {
            const toolbar = $(document.createElement("div"));

            toolbar.addClass(cssClasses.abtToolbar);

            return toolbar;
        }

        public hasToolbar(item: JQuery): boolean {
            return item.find(`.${cssClasses.abtToolbar}`).length > 0;
        }
    }
}

export = AtlanticBTApp;
