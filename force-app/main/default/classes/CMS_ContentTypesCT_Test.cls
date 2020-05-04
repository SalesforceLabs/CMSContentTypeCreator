/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

@isTest
private class CMS_ContentTypesCT_Test {
    static private final String fakeId = 'sa7d6fa8s7d65as';
    
    @isTest static void testgetAllManagedContentTypesCT() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        String resBody = CMS_ContentTypesCT.getAllManagedContentTypesCT();
        
        System.assert(isValidJSONString(resBody));
        
        Map<String, Object> resBodyObj = (Map<String, Object>)JSON.deserializeUntyped(resBody);
        List<Object> mcts = (List<Object>)resBodyObj.get('records');
        
        System.assert(mcts.size() >= 1);
    }
    
    @isTest static void testGetManagedContentTypeCT() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        String resBody = CMS_ContentTypesCT.getManagedContentTypeCT(fakeId);
        
        System.assert(isValidJSONString(resBody));
        
        Map<String, Object> resBodyObj = (Map<String, Object>)JSON.deserializeUntyped(resBody);
        List<Object> mcts = (List<Object>)resBodyObj.get('records');
        
        System.assert(mcts.size() == 1);
    }
    
    @isTest static void testcreateManagedContentTypeCT() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        Object mct = JSON.deserializeUntyped('{"Metadata":{"description":null,"developerName":"Test","managedContentNodeTypes":[{"helpText":null,"isLocalizable":false,"isRequired":true,"nodeLabel":"Title","nodeName":"Title","nodeType":"NAMEFIELD","placeholderText":null},{"helpText":null,"isLocalizable":false,"isRequired":false,"nodeLabel":"Image","nodeName":"Image","nodeType":"IMG","placeholderText":null},{"helpText":null,"isLocalizable":false,"isRequired":false,"nodeLabel":"URL","nodeName":"URL","nodeType":"URL","placeholderText":null}],"masterLabel":"Test"},"FullName":"Test"}');
        String resBody = CMS_ContentTypesCT.createManagedContentTypeCT(mct);
        
        System.assert(isValidJSONString(resBody));
        
        Map<String, Object> resBodyObj = (Map<String, Object>)JSON.deserializeUntyped(resBody);
        
        System.assert((Boolean)resBodyObj.get('success'));
    }   
    
    @isTest static void testDeleteManagedContentTypeCT() {        
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        String resBody = CMS_ContentTypesCT.deleteManagedContentTypeCT(fakeId);
        
        System.assert(resBody == null || resBody == '', resBody);
    }
    
    @isTest static void testCannotDeleteIdManagedContentType() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        try{
            String resBody = CMS_ContentTypesCT.deleteManagedContentTypeCT('cannotDeleteId');
            
            System.assert(false);
        }
        catch(Exception e){
            System.assert(e.getTypeName() == 'System.AuraHandledException', e.getTypeName());
        }
    }
    
    static Boolean isValidJSONString(String stringToCheck){
        try {
            Object jsonObj = JSON.deserializeUntyped(stringToCheck);
            
        } catch (Exception err) {
            return false;
        }
        return true;
    }
}