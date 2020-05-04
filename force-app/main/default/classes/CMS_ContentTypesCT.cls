/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

public class CMS_ContentTypesCT {
    static private final String toolingApiVersion = '48.0';
    static private final String sfdcURL = URL.getSalesforceBaseUrl().toExternalForm();
    static private final String getAllPath = '/services/data/v' + toolingApiVersion + '/tooling/query/?q=SELECT+Id,DeveloperName,Language,MasterLabel,CreatedDate,CreatedBy.Name,LastModifiedDate,LastModifiedBy.Name,SystemModstamp,Description+FROM+ManagedContentType';
    static private final String getOnePath = '/services/data/v' + toolingApiVersion + '/tooling/query/?q=SELECT+Id,DeveloperName,Language,MasterLabel,CreatedDate,CreatedBy.Name,LastModifiedDate,LastModifiedBy.Name,SystemModstamp,Description,Metadata+FROM+ManagedContentType+WHERE+Id+=+';
    static private final String createPath = '/services/data/v' + toolingApiVersion + '/tooling/sobjects/ManagedContentType/';
    static private final String deletePath = '/services/data/v' + toolingApiVersion + '/tooling/sobjects/ManagedContentType/';
    
    @AuraEnabled
    public static String getAllManagedContentTypesCT(){
        HTTPResponse response = makeAPICall('GET', getAllPath, null);
        return response.getBody();
    }
    
    @AuraEnabled
    public static String getManagedContentTypeCT(String typeId){
        HTTPResponse response = makeAPICall('GET', getOnePath + '\'' + typeId + '\'', null);
        return response.getBody();
    }
    
    @AuraEnabled
    public static String createManagedContentTypeCT(Object mct){
        HTTPResponse response = makeAPICall('POST', createPath, mct);
        return response.getBody();
    }
    
    @AuraEnabled
    public static String deleteManagedContentTypeCT(String typeId){
        HTTPResponse response = makeAPICall('DELETE', deletePath + typeId, null);
        return response.getBody();
    }
    
    private static HTTPResponse makeAPICall(String method, String path, Object mct){
        HttpRequest req = new HttpRequest();
        
        if(method == 'POST'){
            req.setHeader('Accept', 'application/json');
        	req.setHeader('Content-Type', 'application/json');
        	req.setBody(JSON.serialize(mct));
        }
        
        req.setHeader('Authorization', 'Bearer ' + UserInfo.getSessionId());
        req.setEndpoint(sfdcURL + path);
        req.setMethod(method);
        Http http = new Http();
        HTTPResponse res = http.send(req);
        
        if(method == 'GET' && res.getStatusCode() != 200 || method == 'POST' && res.getStatusCode() != 201 || method == 'DELETE' && res.getStatusCode() != 204){
            throw new AuraHandledException(res.getBody());
        }
        
        return res;
    }
}