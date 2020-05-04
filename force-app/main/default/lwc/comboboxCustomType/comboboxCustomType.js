/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement, api, track } from 'lwc';

export default class ComboboxCustomType extends LightningElement {
    @api rowId;
    @api value;
    @api options;
    @api disabled;

    @track realOptions;

    connectedCallback() {
        let options = [...this.options];
        if (this.disabled) {
            options.push({ 'label': 'Name Field', 'value': 'NAMEFIELD' });
        }

        this.realOptions = options;
    }

    handleChange(event) {
        this.dispatchEvent(new CustomEvent('comboboxselected', {
            composed: true,
            bubbles: true,
            cancelable: true,
            detail: {
                rowId: this.rowId,
                value: event.detail.value
            }
        }));
    }
}