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