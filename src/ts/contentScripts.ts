/*
Copyright AtlanticBT.
*/

import "font-awesome-sass-loader!./config/font-awesome.config";
import "../manifest.json";
import "../scss/main.scss";

const s = document.createElement("script");
s.src = chrome.extension.getURL("js/webPage.js");
(document.head || document.documentElement).appendChild(s);

import "./listeners/contentScripts.listeners";
