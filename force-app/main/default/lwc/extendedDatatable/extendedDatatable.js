/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import LightningDatatable from 'lightning/datatable';
import comboboxTemplate from './comboboxTemplate.html';

export default class ExtendedDatatable extends LightningDatatable {
    static customTypes = {
        combobox: {
            template: comboboxTemplate,
            standardCellLayout: true,
            typeAttributes: ['options', 'disabled', 'rowId']
        }
    };
}