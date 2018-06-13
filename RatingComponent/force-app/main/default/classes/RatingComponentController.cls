public with sharing class RatingComponentController {
    
    @AuraEnabled
    public static String getCustomerRating(Id recordId) {
        return 'silver';
    }

}
