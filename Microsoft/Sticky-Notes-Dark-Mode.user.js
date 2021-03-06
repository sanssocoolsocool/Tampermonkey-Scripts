// ==UserScript==
// @name         Microsoft Sticky Notes - Dark Mode
// @namespace    https://thealiendrew.github.io/
// @version      1.2.7
// @downloadURL  https://github.com/TheAlienDrew/Tampermonkey-Scripts/raw/master/Microsoft/Sticky-Notes-Dark-Mode.user.js
// @description  Enables official, but hidden, dark mode on the Sticky Notes website.
// @author       AlienDrew
// @include      /^https?://www\.onenote\.com/stickynotes*/
// @include      /^https?://support\.office\.com/client/results\?NS=stickynotes&Context=%7B%22ThemeId%22:4,*/
// @icon         https://pbs.twimg.com/profile_images/1205385387276787718/eTJQu8Ck_400x400.jpg
// @grant        GM_getResourceText
// @grant        GM_getResourceURL
// @resource     cssDarkStickies https://userstyles.org/styles/170362.css
// @resource     cssDarkScrollbar https://userstyles.org/styles/179150.css
// ==/UserScript==

/* Copyright (C) 2020  Andrew Larson (thealiendrew@gmail.com)

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// dark sticky notes partial via https://userstyles.org/styles/170362
// dark scrollbar via https://userstyles.org/styles/179150

// constants
const fastDelay = 100;
const stickyNotesWebsite = 'https://www.onenote.com/stickynotes';
const stickiesHelpBeginning = 'https://support.office.com/client/results?NS=stickynotes&Context=%7B%22ThemeId%22:4,';
// need to check url
var currentURL = window.location.href;

// function for elements
var elementExists = function(element) {
    return (typeof(element) != 'undefined' && element != null);
};
// function for fixing css resources
var getCssResource = function(nameOfResource) {
    var css_resource = GM_getResourceText(nameOfResource).split('\n');
    var resource_parsed = "";
    // starts at 1 and ends at the second to last line to remove the @-moz-document encasement
    var k;
    for (k = 1; k < css_resource.length - 1; k++) {
        resource_parsed = resource_parsed.concat(css_resource[k]);
    }
    return resource_parsed;
};
// function for injecting css styles
var injectCss = function(documentToInject, cssStyle) {
    var node = document.createElement('style');
    node.type = 'text/css';
    node.innerHTML = cssStyle;
    documentToInject.body.appendChild(node);
};

if (currentURL.startsWith(stickyNotesWebsite)) {// code to run on the sticky notes website
    const urlDoubleQuote = '%22';
    const darkModeThemeId = '4';
    const darkModeLinkColor = urlDoubleQuote + 'B3D6FC' + urlDoubleQuote;
    const helpIFrameId = '#helpPaneFull iframe';
    // listener variables
    var helpIFrameLoaded = false;

    // apply the partial fix
    injectCss(document, getCssResource('cssDarkStickies'));

    // theme help iframe
    function checkForHelp() {
        setTimeout(function() {
            var helpIFrame = document.querySelector(helpIFrameId);
            var helpIFrameExists = elementExists(helpIFrame);
            if (helpIFrameExists && !helpIFrameLoaded) {
                // get locations in string for theme and link edits
                var oldURL = helpIFrame.src;
                var themeIdStart = oldURL.indexOf(':', oldURL.indexOf('ThemeId')) + 1;
                var themeIdEnd = oldURL.indexOf(',', themeIdStart);
                var linkColorStart = oldURL.indexOf(':', oldURL.indexOf('LinkColor')) + 1;
                var linkColorEnd = oldURL.indexOf(',', linkColorStart);

                // create the new url
                var newURL = oldURL.substring(0, themeIdStart) + darkModeThemeId + oldURL.substring(themeIdEnd, linkColorStart) + darkModeLinkColor + oldURL.substring(linkColorEnd);

                // change to the new URL
                helpIFrame.src = newURL;
                helpIFrameLoaded = true;
            } else if (!helpIFrameExists) helpIFrameLoaded = false;
            checkForHelp();
        }, fastDelay);
    }

    // apply the dark mode class to the html element
    document.body.classList.add('n-darkMode');
    checkForHelp();
} else if (currentURL.startsWith(stickiesHelpBeginning)) { // code to run on the dark sticky notes help website
    const iframeID = 'ocSearchIFrame';
    const iframeFixCss = '.ocpArticleContent .ocpAlert{background-color:#686868}' + getCssResource('cssDarkScrollbar');

    // set the style fixes
    checkForIFrame = setInterval(function() {
        var iframe = document.getElementById(iframeID);
        var iframeDoc = iframe.contentDocument;

        if (elementExists(iframe) && iframeDoc != null) {
            clearInterval(checkForIFrame);

            // must listen for page load to change style
            iframe.onload = function () {
                var iDocument = frames[0].document;
                injectCss(iDocument, iframeFixCss);
            }
        }
    }, 100);
}