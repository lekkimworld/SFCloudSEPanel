public with sharing class RatingComponentController {
    
    @AuraEnabled
    public static String getAccountRating(Id recordId) {
        List<Account> accounts = [SELECT Id, Rating FROM Account WHERE Id =: recordId LIMIT 2];
        if (accounts.size() != 1) throw new AuraHandledException('Unable to load Account');
        return accounts[0].Rating.toLowerCase();
    }
}
