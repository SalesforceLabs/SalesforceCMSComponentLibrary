/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement, api } from 'lwc';

export default class cmsContentByTopicAndType extends LightningElement {

    // Params from config
    @api topicId;
    @api contentType;
    @api inBuilder;
    @api numberContentItems;
    @api pathAttribute;
    @api titleAttribute;
    @api bodyAttribute;
    @api imageAttribute;
    @api linkAttribute;
    @api contentDisplayStyle;

    //Params for content
    topicMode = true;

}
