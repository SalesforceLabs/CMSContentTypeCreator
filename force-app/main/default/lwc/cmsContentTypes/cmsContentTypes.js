/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement, track, api } from 'lwc';
import getAllManagedContentTypesCT from '@salesforce/apex/CMS_ContentTypesCT.getAllManagedContentTypesCT';
import deleteManagedContentTypeCT from '@salesforce/apex/CMS_ContentTypesCT.deleteManagedContentTypeCT';
import { showToast, getErrorInfo } from 'c/utils';

const actions = [
    { label: 'View', name: 'view' },
    { label: 'Clone', name: 'clone' },
    { label: 'Delete', name: 'delete' }
];

const columns = [
    { label: 'Name', fieldName: 'MasterLabel', type: 'text', sortable: true, },
    { label: 'Developer Name', fieldName: 'DeveloperName', type: 'text', sortable: true, },
    { label: 'Created Date', fieldName: 'CreatedDate', type: 'date', sortable: true, typeAttributes: { day: '2-digit', hour: '2-digit', minute: '2-digit', month: '2-digit', year: 'numeric' } },
    { label: 'Created By', fieldName: 'CreatedByName', type: 'text' },
    { label: 'Description', fieldName: 'Description', type: 'text' },
    { type: 'action', typeAttributes: { rowActions: actions } }
];

export default class Cms_ContentTypes extends LightningElement {
    @api sforce;

    @track contentTypes = [];
    columns = columns;
    rowIdToDelete;
    errorTitle;
    errorMessage;
    sortDirection;
    sortedBy;

    isLoading = false;
    isConfirming = false;
    isShowingNotice = false;

    connectedCallback() {
        this.init();
    }

    init() {
        this.isLoading = true;
        getAllManagedContentTypesCT()
            .then(result => {
                let queryResult = JSON.parse(result);
                let contentTypes = queryResult.records;

                for (let ct of contentTypes) {
                    ct.CreatedByName = ct.CreatedBy.Name;
                    ct.LastModifiedByName = ct.LastModifiedBy.Name;
                }
                this.contentTypes = contentTypes;
            })
            .catch(errors => {
                this.handleErrors(errors);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'delete':
                this.isConfirming = true;
                this.rowIdToDelete = row.Id;
                break;
            case 'clone':
                this.sforce.one.navigateToURL('/apex/sflabs_cms_ct__CMS_CreateContentType_WrapperVFP?c__Id=' + row.Id, true);
                break;
            default: //'view'
                this.sforce.one.navigateToURL('/apex/sflabs_cms_ct__CMS_ContentTypeDetails_WrapperVFP?c__Id=' + row.Id, true);
        }
    }

    refresh() {
        this.init();
    }

    closeNotice() {
        this.isShowingNotice = false;
    }

    closeConfirmationModal() {
        this.isConfirming = false;
    }

    deleteContentType() {
        this.isConfirming = false;
        this.isLoading = true;

        const params = { typeId: this.rowIdToDelete };
        deleteManagedContentTypeCT(params)
            .then(() => {
                showToast(this.sforce, 'Content Type deleted.', 'success', 'dismissible');
                this.init();
            })
            .catch((errors) => {
                this.handleErrors(errors);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    showNotice(errorTitle, errorMessage) {
        this.errorTitle = errorTitle;
        this.errorMessage = errorMessage;
        this.isShowingNotice = true;
    }

    handleErrors(errors) {
        const { errorTitle, errorMessage } = getErrorInfo(errors);
        this.showNotice(errorTitle, errorMessage);
    }

    handleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneContentTypes = [...this.contentTypes];
        if (sortDirection === "asc") {
            cloneContentTypes.sort((a, b) => {
                if (a[sortedBy] < b[sortedBy]) {
                    return -1;
                }
                if (a[sortedBy] > b[sortedBy]) {
                    return 1;
                }
                return 0;
            });
        }
        else {
            cloneContentTypes.sort((a, b) => {
                if (a[sortedBy] > b[sortedBy]) {
                    return -1;
                }
                if (a[sortedBy] < b[sortedBy]) {
                    return 1;
                }
                return 0;
            });
        }

        this.contentTypes = cloneContentTypes;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }

    navToCreateContentType() {
        this.sforce.one.navigateToURL('/apex/sflabs_cms_ct__CMS_CreateContentType_WrapperVFP', true);
    }
}