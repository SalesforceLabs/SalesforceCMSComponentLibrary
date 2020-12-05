import { LightningElement, wire, api } from 'lwc';
import basePath from '@salesforce/community/basePath';
import getCMSContent from '@salesforce/apex/ManagedContentController.getCMSContent';

export default class cmsContentByRecordAndType extends LightningElement {

    // Params from config
    @api recordId;
    @api contentType;
    @api numberContentItems;
    @api pathAttribute;
    @api titleAttribute;
    @api bodyAttribute;
    @api imageAttribute;
    @api linkAttribute;
    @api contentDisplayStyle;

    // Params from parent
    @api topicMode = false;

    //Params for content manipulation
    content;
    contentArray;
    items;
    attributesCollected = new Set();
    error;
    isCardDisplayStyle = false;
    isGalleryDisplayStyle = false;

    //Fetch CMS content
    @wire(getCMSContent, { recordId: '$recordId', numItems: '$numberContentItems', managedContentType: '$contentType', singleTopicMode: '$topicMode' })
    wiredContent({ error, data }) {
        if (data) {

            //Logs
            console.log("CMS Component Debug || Grabbed data and beginning to parse");

            this.cleanUpForDisplay(data);

        } else if (error) {

            //Grab error
            this.error = 'Unknown error';
            this.content = undefined;
            if (Array.isArray(error.body)) {
                this.error = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                this.error = error.body.message;
            }

            //Logs
            console.log("CMS Component Debug || Fetch failed");
            console.log("CMS Component Debug || Error" + error);

        }
    }

    //Private function to do all the data massaging
    cleanUpForDisplay(data) {
        //Determine display style
        if (this.contentDisplayStyle == 'Grid') {
            this.isCardDisplayStyle = true;
        } else {
            this.isGalleryDisplayStyle = true;
        }

        //Grab data
        this.contentArray = data;
        this.content = JSON.stringify(this.contentArray);

        //Logs
        //console.log("CMS Component Debug || Fetched content successfully");
        //console.log("CMS Component Debug || Record Id: " + this.recordId);
        //console.log("CMS Component Debug || Content Type: " + this.contentType);
        console.log("CMS Component Debug || Content Array: ");
        console.log(this.content);

        //Temporarily hold items
        let itemsToTweak = [];

        //Make desired item tweaks based on config
        for (let item of this.contentArray.items) {

            //Clone the original item object json
            let itemToAdd = JSON.parse(JSON.stringify(item));

            //Parse nodes and adjust accordingly
            for (let [nodeName, node] of Object.entries(itemToAdd.contentNodes)) {

                //Collect attribute
                this.attributesCollected.add(nodeName);

                //HTML Decode Rich Text
                //console.log("CMS Component Debug || Checking if " + nodeName + " of type " + node.nodeType + " needs to be decoded.");
                if (node.nodeType == 'RichText') {
                    //Encode
                    node.value = this.htmlDecode(node.value);
                }

                //Adjust image URLs if it's not a fully-qualified URL
                //console.log("CMS Component Debug || Checking if " + nodeName + " of type " + node.nodeType + " needs to have its URL adjusted.");
                if (node.nodeType == 'Media' && node.url.substring(0, 4) != 'http') {
                    node.url = '/sfsites/c' + node.url;
                }
            }

            //Adjust item based on config
            let emptyVal = { "value" : "" };
            let emptyImgVal = { "url": "" };


            // Set Title --> {item.contentNodes.title.value}
            if (this.titleAttribute) {
                console.log("CMS Component Debug || Mapping title to the CMS attribute " + this.titleAttribute);
                itemToAdd.contentNodes.title = itemToAdd["contentNodes"][this.titleAttribute] ? itemToAdd["contentNodes"][this.titleAttribute] : emptyVal;
                console.log("CMS Component Debug || Mapped:  ");
                console.log(itemToAdd.contentNodes.title);
            }

            // Set Body --> {item.contentNodes.excerpt.value}
            if (this.bodyAttribute) {
                console.log("CMS Component Debug || Mapping body to the CMS attribute " + this.bodyAttribute);
                itemToAdd.contentNodes.excerpt = itemToAdd["contentNodes"][this.bodyAttribute] ? itemToAdd["contentNodes"][this.bodyAttribute] : emptyVal;
                console.log("CMS Component Debug || Mapped:  ");
                console.log(itemToAdd.contentNodes.excerpt);
            }

            // Set Image --> {item.contentNodes.bannerImage.url}
            if (this.imageAttribute) {
                console.log("CMS Component Debug || Mapping image to the CMS attribute " + this.imageAttribute);
                itemToAdd.contentNodes.bannerImage = itemToAdd["contentNodes"][this.imageAttribute] ? itemToAdd["contentNodes"][this.imageAttribute] : emptyImgVal;
                console.log(itemToAdd.contentNodes.bannerImage);
            }

            // Set URL --> item.contentUrlName
            if (this.pathAttribute && itemToAdd.contentUrlName) {
                console.log("CMS Component Debug || Change URL to add in " + this.pathAttribute);
                itemToAdd.contentUrlName = basePath + '/' + this.pathAttribute + '/' + itemToAdd.contentUrlName + '-' + itemToAdd.managedContentId;
                console.log(itemToAdd.contentUrlName);
            }

            //Logs
            //console.log("CMS Component Debug || Item to add");
            //console.log(itemToAdd);

            //Add to array
            itemsToTweak.push(itemToAdd);
        }

        //Review attributes found
        console.log("CMS Component Debug || CMS attributes found");
        console.log(this.attributesCollected);

        //Assign items
        this.items = itemsToTweak;
        console.log("CMS Component Debug || Final updated items:");
        console.log(this.items);
    }

    //Private function to decode HTML
    htmlDecode(input) {
        var doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
    }

    //Private functions to set up scrolling for the gallery view
    slideRight() {
        let currentAmount = this.template.querySelector('.cms-gallery-block').scrollLeft;
        let cardWidth = this.template.querySelector('.cms-gallery-block').scrollWidth;
        let cardCount = this.items.length;
        let moveToVal = currentAmount + (cardWidth / cardCount);
        console.log("CMS Component Debug || Looking at moving across " + cardCount + " cards with a total width of " + cardWidth) ;
        this.slide(moveToVal);
    }
    slideLeft() {
        let currentAmount = this.template.querySelector('.cms-gallery-block').scrollLeft;
        let cardWidth = this.template.querySelector('.cms-gallery-block').scrollWidth;
        let cardCount = this.items.length;
        let moveToVal = currentAmount - (cardWidth / cardCount);
        console.log("CMS Component Debug || Looking at moving across " + cardCount + " cards with a total width of " + cardWidth) ;
        this.slide(moveToVal);

    }
    slide(val) {
        let currentAmount = this.template.querySelector('.cms-gallery-block').scrollLeft;
        console.log("CMS Component Debug || Scrolling to: " + val + " from " + currentAmount);

        this.template.querySelector('.cms-gallery-block').scrollLeft = val;
        /* this.template.querySelector('.cms-gallery-block').animate([
            { scrollLeft: currentAmount },
            { scrollLeft: val }
          ], {
            // timing options
            duration: 0,
            iterations: 2
          });
        */

    }
}