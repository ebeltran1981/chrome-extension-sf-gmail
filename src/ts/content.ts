/*
Copyright AtlanticBT.
*/

import "font-awesome-sass-loader!./config/font-awesome.config";
import "../manifest.json";
import "../scss/content.scss";

const s = document.createElement("script");
s.src = chrome.extension.getURL("js/main.js");
(document.head || document.documentElement).appendChild(s);
