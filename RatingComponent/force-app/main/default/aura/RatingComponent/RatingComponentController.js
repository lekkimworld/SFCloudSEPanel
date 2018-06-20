({
    doinit: function(component, event, helper) {
        var action = component.get("c.getAccountRating");
        action.setParams({
            "recordId": component.get("v.recordId")
        })
        action.setCallback(this, function(response) {
            var rating = response.getReturnValue();
            component.set("v.rating", rating);
        })
        $A.enqueueAction(action);
    }
})
