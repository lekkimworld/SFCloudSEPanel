public with sharing class RatingComponentController {
    
    @AuraEnabled
    public static String getCustomerRating(Id recordId) {
        List<Account> accounts = [SELECT Id, SAP_Customer_Rating__c FROM Account WHERE Id =: recordId LIMIT 2];
        if (accounts.size() != 1) throw new AuraHandledException('Unable to load Account');
        return accounts[0].SAP_Customer_Rating__c;
    }
}
