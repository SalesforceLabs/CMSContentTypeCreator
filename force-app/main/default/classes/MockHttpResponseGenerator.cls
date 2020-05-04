/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

@isTest
global class MockHttpResponseGenerator implements HttpCalloutMock {
    global HTTPResponse respond(HTTPRequest req) {
        List<String> validMethods = new list<String> { 'GET' , 'POST' , 'DELETE' };
        
        System.assert(validMethods.contains(req.getMethod()), req.getMethod());
        
        String toolingApiVersion = '48.0';
        String fakeId = 'sa7d6fa8s7d65as';
        String getAllPath = '/services/data/v48.0/tooling/query/?q=SELECT+Id,DeveloperName,Language,MasterLabel,CreatedDate,CreatedBy.Name,LastModifiedDate,LastModifiedBy.Name,SystemModstamp,Description+FROM+ManagedContentType';
        String getOnePath = '/services/data/v48.0/tooling/query/?q=SELECT+Id,DeveloperName,Language,MasterLabel,CreatedDate,CreatedBy.Name,LastModifiedDate,LastModifiedBy.Name,SystemModstamp,Description,Metadata+FROM+ManagedContentType+WHERE+Id+=+\''+fakeId+'\'';
        String createPath = '/services/data/v48.0/tooling/sobjects/ManagedContentType/';
        String deletePath = '/services/data/v48.0/tooling/sobjects/ManagedContentType/' + fakeId;

        String sfdcURL = URL.getSalesforceBaseUrl().toExternalForm();
        
        HttpResponse res = new HttpResponse();

        if(req.getMethod() == 'GET'){
			System.assert(req.getEndpoint() == (sfdcURL + getAllPath) || req.getEndpoint() == (sfdcURL + getOnePath));
            if(req.getEndpoint().contains(fakeId)){
                res.setBody('{"size":1,"totalSize":1,"done":true,"queryLocator":null,"entityTypeName":"ManagedContentType","records":[{"attributes":{"type":"ManagedContentType","url":"/services/data/v48.0/tooling/sobjects/ManagedContentType/' + fakeId + '"},"Id":"' + fakeId + '","DeveloperName":"news","Language":"en_US","MasterLabel":"News","CreatedDate":"2020-03-24T19:11:08.000+0000","CreatedBy":{"attributes":{"type":"User","url":"/services/data/v48.0/tooling/sobjects/User/0053h000001aoaoOOO"},"Name":"Automated Process"},"LastModifiedDate":"2020-03-24T19:11:08.000+0000","LastModifiedBy":{"attributes":{"type":"User","url":"/services/data/v48.0/tooling/sobjects/User/0053h000001aoaoOOO"},"Name":"Automated Process"},"SystemModstamp":"2020-03-24T19:11:08.000+0000","Description":"A basic article format with rich text and image support.","Metadata":{"description":"A basic article format with rich text and image support.","developerName":"news","managedContentNodeTypes":[{"helpText":null,"isLocalizable":true,"isRequired":true,"nodeLabel":"Title","nodeName":"title","nodeType":"NAMEFIELD","placeholderText":null},{"helpText":null,"isLocalizable":true,"isRequired":false,"nodeLabel":"Body","nodeName":"body","nodeType":"RTE","placeholderText":null},{"helpText":"Images aren’t required, but they help your post get attention.","isLocalizable":false,"isRequired":false,"nodeLabel":"Banner Image","nodeName":"bannerImage","nodeType":"IMG","placeholderText":null},{"helpText":"Excerpts display as summary or teaser text on compilation pages. Excerpts give your customers a quick sense of what your post is about so they can quickly decide whether or not to view the full article.","isLocalizable":true,"isRequired":false,"nodeLabel":"Excerpt","nodeName":"excerpt","nodeType":"MTEXT","placeholderText":"Enter a summary or short description of your post..."}],"masterLabel":"News","urls":null}}]}}');
            }else{
                res.setBody('{"size":4,"totalSize":4,"done":true,"queryLocator":null,"entityTypeName":"ManagedContentType","records":[{"attributes":{"type":"ManagedContentType","url":"/services/data/v48.0/tooling/sobjects/ManagedContentType/' + fakeId + '"},"Id":"' + fakeId + '"},{"attributes":{"type":"ManagedContentType","url":"/services/data/v48.0/tooling/sobjects/ManagedContentType/sa7d6fa8s7d66"},"Id":"sa7d6fa8s7d66"},{"attributes":{"type":"ManagedContentType","url":"/services/data/v48.0/tooling/sobjects/ManagedContentType/sa7d6fa8s7d767"},"Id":"sa7d6fa8s7d767"},{"attributes":{"type":"ManagedContentType","url":"/services/data/v48.0/tooling/sobjects/ManagedContentType/sa7d6fa8s7668"},"Id":"sa7d6fa8s7668"}]}');
            }
            res.setHeader('Content-Type', 'application/json');
            res.setStatusCode(200);
        }
        
        if(req.getMethod() == 'POST'){
			System.assertEquals(req.getEndpoint(), sfdcURL + createPath);
            res.setBody('{ "id" : "' + fakeId + '", "success" : true, "errors" : [ ], "warnings" : [ ], "infos" : [ ]}');
            res.setStatusCode(201);
        }
        
        if(req.getMethod() == 'DELETE'){
            if(req.getEndpoint().contains('cannotDeleteId')){
                res.setBody('[ {"message" : "The News Content type can\'t be updated or deleted.","errorCode" : "DELETE_FAILED","fields" : [ ]} ]');
                res.setStatusCode(400);
            }
            else{
                System.assertEquals(req.getEndpoint(), sfdcURL + deletePath);
	            res.setStatusCode(204);
            }
        }
        
        return res;
    }
}