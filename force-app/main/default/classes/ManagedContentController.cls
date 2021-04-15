  
/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
public with sharing class ManagedContentController {
    // API reference: https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_ManagedContent_static_methods.htm#apex_ConnectAPI_ManagedContent_static_methods
    
    /**
     * Returns all configured channels to which this user has access.
     */
    @AuraEnabled(cacheable=true)
    public static ConnectApi.ManagedContentChannelCollection getAllAvailableContentChannels() {
        return ConnectApi.ManagedContent.getAllDeliveryChannels(0, 250); // TODO: Make this paginate.
    }

    /**
     * Returns appropriate content based on the client request
     * Single Topic Mode is used to only fetch CMS content records tagged with the specific 
     * topic ID 
     */
    @AuraEnabled(cacheable=true)
    public static ConnectApi.ManagedContentVersionCollection getCMSContent(String recordId, String managedContentType, Integer numItems, Boolean singleTopicMode) {
        
        System.debug('CMS Component Debug || Topic mode set to ' + singleTopicMode);

        if (singleTopicMode) {
            System.debug('CMS Component Debug || Retrieving topic-related CMS content for one topic');
            return getCMSContentForTopic(recordId, numItems, managedContentType);
        } else {
            System.debug('CMS Component Debug || Retrieving record-related CMS content for Community by topics');
            return getCMSContentForRecordTopics(recordId, numItems, managedContentType);
        }
    }
    
    
    /**
     * Returns all content for a particular topic in the current community.
     */
    @AuraEnabled(cacheable=true)
    public static ConnectApi.ManagedContentVersionCollection getCMSContentForTopic(String topicId, Integer numItems, String managedContentType) {
        String communityId = Network.getNetworkId();
        
        List<String> topicIds = new List<String>();
        topicIds.add(topicId);

        System.debug('CMS Component Debug || Added topic to list of topics ' + topicIds + ' for fetch');
        return getCMSContentForTopics(topicIds, numItems, managedContentType);
    }
  
    /**
     * Returns CMS content related to a record by virtue of topic-for-objects associations.
     */
    @AuraEnabled(cacheable=true)
    public static ConnectApi.ManagedContentVersionCollection getCMSContentForRecordTopics(String recordId, Integer numItems, String managedContentType) {
        // 1. Retrieve network-scoped topics related to the record.
        String networkId = Network.getNetworkId();
        List<TopicAssignment> assignments = [Select TopicId from TopicAssignment where networkId = :networkId and EntityId = :recordId];
        // get the names opf the topics, to be used with the CMS API
        List<String> topicIds = new List<String>();
        for (TopicAssignment assn : assignments) {
            topicIds.add(assn.TopicId);
        }

        System.debug('CMS Component Debug || Added record topic to list of topics ' + topicIds + ' for fetch');
        
        // 2. Retrieve CMS content tagged with those same topics
        return getCMSContentForTopics(topicIds, numItems, managedContentType);
    }

    /**
     * Returns all CMS content for a set of topics in the current community.
     */
    @AuraEnabled(cacheable=true)
    public static ConnectApi.ManagedContentVersionCollection getCMSContentForTopics(List<String> topicIds, Integer numItems, String managedContentType) {
        String curLanguage = UserInfo.getLanguage(); // TODO: how does this work for the guest user?
        String communityId = Network.getNetworkId();
        
        System.debug('CMS Component Debug || Retrieving CMS Content for Community ' + communityId);
        
        if ( topicIds.size() <= 0 ) {
            //as no topics associated, return null instead of returning all content for a given managedContentType
            return null;
        }
        // convert topic IDs to names to work with the API
        List<Topic> topics = [select Name from Topic where Id in :topicIds and networkId = :communityId];
        List<String> topicNames = new List<String>();
        for (Topic tpc : topics) {
            System.debug('CMS Component Debug || Adding topic ' + tpc.Name + ' to CMS lookup list.');
            topicNames.add(tpc.Name);
        }
        
        return ConnectApi.ManagedContent.getManagedContentByTopics(communityId, topicNames, 0, numItems, curLanguage, managedContentType); // TODO: Implement pagination, more robust topic name wrapping?
    }
}
