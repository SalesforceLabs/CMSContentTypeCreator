/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement, track, api } from 'lwc';
import getManagedContentTypeCT from '@salesforce/apex/CMS_ContentTypesCT.getManagedContentTypeCT';
import deleteManagedContentTypeCT from '@salesforce/apex/CMS_ContentTypesCT.deleteManagedContentTypeCT';
import { showToast, getErrorInfo, closeCurrentTab } from 'c/utils';

const columns = [
    { label: 'Label', fieldName: 'nodeLabel', type: 'text' },
    { label: 'API Name', fieldName: 'nodeName', type: 'text' },
    { label: 'Type', fieldName: 'friendlyNodeType', type: 'text' },
    { label: 'Required', fieldName: 'isRequired', type: 'boolean' },
    { label: 'Localizable', fieldName: 'isLocalizable', type: 'boolean' },
    { label: 'Placeholder Text', fieldName: 'placeholderText', type: 'text' },
    { label: 'Help Text', fieldName: 'helpText', type: 'text' }
];

export default class CmsContentTypeDetails extends LightningElement {
    @api sforce;
    @api c__Id;

    errorMessage;
    errorTitle;
    columns = columns;
    masterLabel;
    developerName;
    createdByName;
    description;
    createdDateJS;
    @track nodes = [];

    isLoading = false;
    isConfirming = false;
    isShowingNotice = false;

    connectedCallback() {
        this.isLoading = true;
        const typeId = this.c__Id;
        const params = { typeId: typeId };
        getManagedContentTypeCT(params)
            .then((responseData) => {
                const queryResult = JSON.parse(responseData);
                const managedContentType = queryResult.records[0];
                this.setFields(managedContentType);
                this.sforce.console.setTabTitle(this.masterLabel);
            })
            .catch((errors) => {
                this.handleErrors(errors);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    setFields(managedContentType){
        this.masterLabel = managedContentType.MasterLabel;
        this.developerName = managedContentType.DeveloperName;
        this.createdByName = managedContentType.CreatedBy.Name;
        this.description = managedContentType.Description;
        this.createdDateJS = new Date(managedContentType.CreatedDate);
        let nodes = managedContentType.Metadata.managedContentNodeTypes;
        this.nodes = this.getNodesWithFriendlyNodeTypeNames(nodes);
    }

    getNodesWithFriendlyNodeTypeNames(nodes) {
        for (let node of nodes) {
            switch (node.nodeType) {
                case 'NAMEFIELD':
                    node.friendlyNodeType = 'Name Field';
                    break;
                case 'TEXT':
                    node.friendlyNodeType = 'Text';
                    break;
                case 'MTEXT':
                    node.friendlyNodeType = 'Text Area (MTEXT)';
                    break;
                case 'RTE':
                    node.friendlyNodeType = 'Rich Text Editor (RTE)';
                    break;
                case 'IMG':
                    node.friendlyNodeType = 'Image';
                    break;
                case 'URL':
                    node.friendlyNodeType = 'URL';
                    break;
                case 'DATETIME':
                    node.friendlyNodeType = 'DateTime';
                    break;
                default: //'DATE'
                    node.friendlyNodeType = 'Date';
            }
        }
        return nodes;
    }

    showConfirmation() {
        this.isConfirming = true;
    }

    clone() {
        this.sforce.one.navigateToURL('/apex/sflabs_cms_ct__CMS_CreateContentType_WrapperVFP?c__Id=' + this.c__Id, true);
    }

    closeConfirmationModal() {
        this.isConfirming = false;
    }

    deleteContentType() {
        this.isConfirming = false;
        this.isLoading = true;

        let params = { typeId: this.c__Id };
        deleteManagedContentTypeCT(params)
            .then((responseData) => {
                showToast(this.sforce, "Content Type deleted.", "success", "dismissable");
                closeCurrentTab(this.sforce);
            })
            .catch((errors) => {
                this.handleErrors(errors);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    closeNotice() {
        this.isShowingNotice = false;
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
}