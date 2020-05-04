/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { createElement } from 'lwc';
import CmsNotice from 'c/cmsNotice';

describe('c-cms-notice', () => {
    const BUTTON_LABEL = 'Okay';

    afterEach(() => {
        // The jsdom isntance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('header', () => {
        const HEADER = 'The Header';

        const element = createElement('c-cms-notice', {
            is: CmsNotice
        });

        element.header = HEADER;
        document.body.appendChild(element);

        const header = element.shadowRoot.querySelector('h2');
        expect(header.textContent).toBe(HEADER);
        const button = element.shadowRoot.querySelector('lightning-button');
        expect(button.label).toBe(BUTTON_LABEL);
    });

    it('message', () => {
        const MESSAGE = 'The Message';

        const element = createElement('c-cms-notice', {
            is: CmsNotice
        });

        element.message = MESSAGE;
        document.body.appendChild(element);

        const message = element.shadowRoot.querySelector('div[class="slds-modal__content slds-p-around_medium"]');
        expect(message.textContent).toBe(MESSAGE);
        const button = element.shadowRoot.querySelector('lightning-button');
        expect(button.label).toBe(BUTTON_LABEL);
    });

    it('close notice event', () => {
        const mockCloseNoticeHandler = jest.fn();

        const element = createElement('c-cms-notice', {
            is: CmsNotice,
        });

        element.addEventListener('closenotice', mockCloseNoticeHandler);
        document.body.appendChild(element);

        const button = element.shadowRoot.querySelector('lightning-button');
        expect(button.label).toBe(BUTTON_LABEL);

        //Simulate user interaction to close modal
        button.click();

        // Check that closenotice event was fired
        expect(mockCloseNoticeHandler).toHaveBeenCalledTimes(1);
    });
});