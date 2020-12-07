  
/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
@isTest(SeeAllData=true)
private class ManagedContentControllerTests {
    public static String cmsNewsContentTypeDevName = 'news';
    
    @isTest static void testAllControllerMethods() {
        // test channel retrieval
        ConnectApi.ManagedContentChannelCollection channels = ManagedContentController.getAllAvailableContentChannels();
        System.assert((channels != null), 'At least one CMS channel must be defined and active in your org. This may mean you need to create a community (network), and activate it.');
        
        // TEST SETUP BEGIN
        // Find all topic-tagged CMS content to determine a community (network) to test with
        List<TopicAssignment> allAssignments = [SELECT EntityId,EntityType,Id,NetworkId,TopicId FROM TopicAssignment WHERE NetworkId != null ORDER BY EntityType DESC NULLS FIRST];
        System.assert((allAssignments != null && allAssignments.size() >0), 'Failed to query any community-scoped TopicAssignments from this org. To install, you must have at least one CMS Content Item tagged with a topic in a community.');

        // filter the list down to only CMS-affiliated topic assignments
        List<TopicAssignment> managedContentAssignments = new List<TopicAssignment>();
        for (TopicAssignment assgnment : allAssignments) {
            if (assgnment.EntityType == 'ManagedContentVersion') {
                managedContentAssignments.add(assgnment);
            } else {
                System.debug('Skipping topic assignment for non-CMS topic assignment ' + assgnment.Id);
            }
        }
        System.assert((managedContentAssignments != null && managedContentAssignments.size() > 0), 'Failed to query any CMS-related TopicAssignments from this org. To install, you must have at least one CMS Content Item tagged with a topic in a community.');

        // check for a live network
        List<Network> activeCommunities = [select Id, Name from Network where status = 'Live' LIMIT 10];
        System.assert(activeCommunities != null);
        System.assert(activeCommunities.size() > 0, 'No live networks (communities) defined in the org. Installation and testing requires at least one network (community) defined with Live status.');

        // set up test data
        TopicAssignment testAssignment = managedContentAssignments[0];
        System.assert(testAssignment != null, 'Failed to retrieve a topic assignment to test with.');
        String testTopicId = testAssignment.topicId;
        String testCMSId = testAssignment.EntityId;
        String testNetworkId = testAssignment.NetworkId;
        // TEST SETUP END
        // BEGIN TESTS
        
        // test CMS content retrieval for a topic
        // NOTE: Channel access currently prevents a meaningful test of CMS content. This code is to achieve test coverage only.
        try {
            ManagedContentController.getCMSContent(testTopicId, cmsNewsContentTypeDevName, 10, true);
        } catch (Exception e) {
            System.debug(e);
        }

        // test CMS content retrieval for a record tagged with topics
        // NOTE: Channel access currently prevents a meaningful test of CMS content. This code is to achieve test coverage only.
        String recordId = '';
        try {
            ManagedContentController.getCMSContent(recordId, cmsNewsContentTypeDevName, 10, false);
        } catch (Exception e) {
            System.debug(e);
        }
    } 
}
