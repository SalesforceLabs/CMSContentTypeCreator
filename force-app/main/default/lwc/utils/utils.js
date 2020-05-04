/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

const showToast = (sforce, message, type, mode) => {
    sforce.one.showToast({
        "message": message,
        "type": type,
        "mode": mode
    });
};

const isJsonString = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

const getErrorInfo = (errors) => {
    let errorTitle = "Error";
    let errorMessage = "Unkown error.";

    if (errors.body) {
        if (errors.body.message) {
            if (isJsonString(errors.body.message)) {
                const parsedError = JSON.parse(errors.body.message);
                if (parsedError[0]) {
                    errorTitle = parsedError[0].errorCode;
                    errorMessage = parsedError[0].message;
                }
            }
            else {
                errorMessage = errors.body.message;

                if (errorMessage.includes('endpoint'))
                    errorMessage = errorMessage.split('/services/')[0];

                if (errors.body.exceptionType)
                    errorTitle = errors.body.exceptionType;
            }
        }
    }

    return { errorTitle, errorMessage };
};

const closeCurrentTab = (sforce) => {
    if (sforce.console.isInConsole()) {
        sforce.console.getEnclosingTabId((result) => {
            sforce.console.closeTab(result.id);
        });
    }
};

const cleanString = (dirtyString) => {
    let cleanedString = dirtyString;
    if (cleanedString.search(/[\xC0-\xFF]/g) > -1) {
        cleanedString = cleanedString
            .replace(/[\xC0-\xC5]/g, 'A')
            .replace(/[\xC6]/g, 'AE')
            .replace(/[\xC7]/g, 'C')
            .replace(/[\xC8-\xCB]/g, 'E')
            .replace(/[\xCC-\xCF]/g, 'I')
            .replace(/[\xD0]/g, 'D')
            .replace(/[\xD1]/g, 'N')
            .replace(/[\xD2-\xD6\xD8]/g, 'O')
            .replace(/[\xD9-\xDC]/g, 'U')
            .replace(/[\xDD]/g, 'Y')
            .replace(/[\xDE]/g, 'P')
            .replace(/[\xE0-\xE5]/g, 'a')
            .replace(/[\xE6]/g, 'ae')
            .replace(/[\xE7]/g, 'c')
            .replace(/[\xE8-\xEB]/g, 'e')
            .replace(/[\xEC-\xEF]/g, 'i')
            .replace(/[\xF1]/g, 'n')
            .replace(/[\xF2-\xF6\xF8]/g, 'o')
            .replace(/[\xF9-\xFC]/g, 'u')
            .replace(/[\xFE]/g, 'p')
            .replace(/[\xFD\xFF]/g, 'y');
    }
    cleanedString = cleanedString.replace(/[^A-Z0-9]+/ig, '_');
    return cleanedString;
};

export { showToast, getErrorInfo, closeCurrentTab, cleanString };