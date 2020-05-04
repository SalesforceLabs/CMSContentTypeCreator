/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement, track, api } from 'lwc';
import getManagedContentTypeCT from '@salesforce/apex/CMS_ContentTypesCT.getManagedContentTypeCT';
import createManagedContentTypeCT from '@salesforce/apex/CMS_ContentTypesCT.createManagedContentTypeCT';
import { showToast, getErrorInfo, closeCurrentTab, cleanString } from 'c/utils';
import FixExtendedDatatable from '@salesforce/resourceUrl/FixExtendedDatatable';
import { loadStyle } from 'lightning/platformResourceLoader';

const columns = [
    { label: 'Label*', fieldName: 'nodeLabel', type: 'text', editable: true },
    { label: 'API Name*', fieldName: 'nodeName', type: 'text', editable: true },
    {
        label: 'Type*', fieldName: 'nodeType', type: 'combobox', wrapText: true, initialWidth: 200, typeAttributes: {
            options: [
                { 'label': 'Text', 'value': 'TEXT' },
                { 'label': 'Text Area (MTEXT)', 'value': 'MTEXT' },
                { 'label': 'Rich Text Editor (RTE)', 'value': 'RTE' },
                { 'label': 'Image', 'value': 'IMG' },
                { 'label': 'URL', 'value': 'URL' },
                { 'label': 'DateTime', 'value': 'DATETIME' },
                { 'label': 'Date', 'value': 'DATE' }
            ], disabled: { fieldName: 'isNAMEFIELD' }, rowId: { fieldName: 'rowId' }
        }
    },
    { label: 'Required', fieldName: 'isRequired', type: 'boolean', editable: true },
    { label: 'Localizable', fieldName: 'isLocalizable', type: 'boolean', editable: true },
    { label: 'Placeholder Text', fieldName: 'placeholderText', type: 'text', editable: true },
    { label: 'Help Text', fieldName: 'helpText', type: 'text', editable: true },
    { type: 'button-icon', initialWidth: 50, typeAttributes: { disabled: { fieldName: 'isNAMEFIELD' }, iconName: "utility:delete", name: 'remove', alternativeText: "Clear" } }
];

export default class CmsCreateContentType extends LightningElement {
    @api sforce;
    @api c__Id;

    errorMessage;
    errorTitle;
    masterLabel = '';
    developerName = '';
    description = '';
    @track nodes = [];
    columns = columns;
    errors = [];
    draftValues = [];

    isLoading = false;
    isConfirming = false;
    isShowingNotice = false;

    cmpInitialized = false;

    renderedCallback() {
        if (this.cmpInitialized) return;
        this.cmpInitialized = true;
        loadStyle(this, FixExtendedDatatable)
        .then(result => {
            console.log("Loaded!");
            console.log(result)
        });
    }

    connectedCallback() {
        this.isLoading = true;
        const typeId = this.c__Id;
        if (typeId) {
            this.setFieldsForCloneMode(typeId);
        }
        else {
            this.setNameFieldInitialNode();
            this.isLoading = false;
        }
    }

    setFieldsForCloneMode(typeId) {
        const params = { typeId: typeId };
        getManagedContentTypeCT(params)
            .then((responseData) => {
                let queryResult = JSON.parse(responseData);
                let managedContentType = queryResult.records[0];

                this.masterLabel = 'Copy of ' + managedContentType.MasterLabel;
                this.developerName = 'Copy_of_' + managedContentType.DeveloperName;

                let nodes = managedContentType.Metadata.managedContentNodeTypes;
                for (let i = 1; i <= nodes.length; i++) {
                    nodes[i - 1].rowId = i;
                    nodes[i - 1].isNAMEFIELD = nodes[i - 1].nodeType === 'NAMEFIELD' ? true : false;
                }
                this.nodes = nodes;
            })
            .catch((errors) => {
                this.handleErrors(errors);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    setNameFieldInitialNode() {
        let nameFieldNode = {
            'rowId': 1,
            'isNAMEFIELD': true,
            'helpText': null,
            'isLocalizable': false,
            'isRequired': true,
            'nodeLabel': 'Title',
            'nodeName': 'Title',
            'nodeType': 'NAMEFIELD',
            'placeholderText': null
        };

        this.nodes.push(nameFieldNode);
        this.isLoading = false;
    }

    cancel() {
        closeCurrentTab(this.sforce);
    }

    create() {
        this.isLoading = true;
        this.isConfirming = false;

        let copyOfNodes = JSON.parse(JSON.stringify(this.nodes));

        for (let node of copyOfNodes) {
            delete node.rowId;
            delete node.isNAMEFIELD;
        }

        let managedContentType = {
            "FullName": this.developerName,
            'Metadata': {
                'masterLabel': this.masterLabel,
                'developerName': this.developerName,
                'description': this.description,
                'managedContentNodeTypes': copyOfNodes
            }
        };

        let params = {
            mct: managedContentType
        };

        createManagedContentTypeCT(params)
            .then((responseData) => {
                showToast(this.sforce, "Content Type created!", "success", "dismissable");
                let createdId = JSON.parse(responseData).id;

                this.sforce.one.navigateToURL('/apex/sflabs_cms_ct__CMS_ContentTypeDetails_WrapperVFP?c__Id=' + createdId, true);
            })
            .catch((errors) => {
                this.handleErrors(errors);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    cellChanged(event) {
        //Auto-save
        let draftValues = event.detail.draftValues;
        let nodes = this.nodes;
        for (let newValue of draftValues) {
            newValue.rowId = parseInt(newValue.rowId);
            for (let node of nodes) {
                if (node.rowId === newValue.rowId) {
                    for (let key of Object.keys(newValue)) {
                        node[key] = newValue[key];
                    }
                }
            }
        }
        this.draftValues = [];
        this.nodes = nodes;
    }

    comboboxSelected(event) {
        //Auto-save
        let { rowId, value } = event.detail;
        let nodes = this.nodes;

        for (let node of nodes) {
            if (node.rowId === rowId) {
                node.nodeType = value;
            }
        }

        this.draftValues = [];
        this.nodes = nodes;
    }

    datatableRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === 'change_type') {
            this.modalNodeType = row.nodeType;
            this.modalNodeName = row.nodeName;
            this.nodeRowId = row.rowId;
            this.changingNodeType = true;
        }
        if (actionName === 'remove') {
            let nodes = this.nodes;
            let newNodes = nodes.filter((node) => node.rowId !== row.rowId);
            for (let i = 1; i <= newNodes.length; i++) {
                newNodes[i - 1].rowId = i;
            }
            this.nodes = newNodes;
        }
    }

    addNode() {
        let nodes = this.nodes;
        let newNode = {
            "rowId": nodes.length + 1,
            "isNAMEFIELD": false,
            "helpText": "",
            "isLocalizable": false,
            "isRequired": false,
            "nodeLabel": "",
            "nodeName": "",
            "nodeType": "TEXT",
            "placeholderText": ""
        };
        nodes = [...nodes, newNode];
        this.nodes = nodes;
    }

    closeLastCheckBeforeCreatingModal() {
        this.isConfirming = false;
    }

    openLastCheckBeforeCreatingModal() {
        this.isConfirming = true;
    }

    setMasterLabel(event) {
        let newLabel = event.target.value;
        this.masterLabel = newLabel;

        //try to auto-fill the developer name
        let developerName = this.developerName;
        if (newLabel === "" || developerName !== "") return;
        let cleanedLabel = cleanString(newLabel);
        this.developerName = cleanedLabel;
    }

    setDeveloperName(event) {
        //let newName = event.target.value;
        //let cleanedName = cleanString(newName);
        //this.developerName = cleanedName;
        this.developerName = event.target.value;
    }

    setDescription(event) {
        this.description = event.target.value;
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