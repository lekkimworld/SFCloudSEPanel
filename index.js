const odata = require('odata-client')
const jsforce = require('jsforce')
const sequential = require('promise-sequential')

const SF_USERNAME = 'cloud_se_panel_dx@lekkimworld.com'
const SF_SECURITY_TOKEN = 'r08t69QVlhGmfzHVllA2ZyKX'
const SF_PASSWORD = '5^BJ5HevtP$h'

const odataService = odata({
    'service': 'http://services.odata.org/V3/Northwind/Northwind.svc', 
    'resources': 'Customers',
    'format': 'json'
})
const sfconn = new jsforce.Connection()
sfconn.login(SF_USERNAME, `${SF_PASSWORD}${SF_SECURITY_TOKEN}`).then((res) => {
    return Promise.all([
        sfconn.query('SELECT Id FROM Account'),
        sfconn.query('SELECT Id FROM Case'),
        sfconn.query('SELECT Id FROM Opportunity')
    ])
}).then(responses => {
    // curryable function to delete each object sequentially to avoid running into 
    // concurrent call limit
    let deleteAll = (response) => (obj) => () => {
        let ids = response.records.map(r => r.Id)
        if (ids && ids.length) return sequential(ids.map(id => () => sfconn.delete(obj, id)))
        return () => Promise.resolve()
    }
    return sequential([
        deleteAll(responses[2])('Opportunity'),
        deleteAll(responses[1])('Case'),
        deleteAll(responses[0])('Account')
    ])
    
}).then(() => {
    return Promise.all([
        odataService.get(),
        sfconn.describe('Account')
    ])
}).then(responses => {
    const odataResponse = responses[0]
    const accountDescribe = responses[1]

    // loop fields and see if SAP Customer ID is there
    let hasSAPId = accountDescribe.fields.filter(f => f.name === 'SAP_Customer_ID__c').length == 1
    let hasSAPRating = accountDescribe.fields.filter(f => f.name === 'SAP_Customer_Rating__c').length == 1

    // calc  rating
    let rating = ['Gold','Silver','Bronze'][Math.floor(Math.random() * 3)]

    return sequential(JSON.parse(odataResponse.body).value.map(c => {
        let obj = {
            'Name': c.CompanyName,
            'Rating': rating,
            'Fax': c.Fax,
            'Phone': c.Phone,
            'BillingStreet': c.Address,
            'BillingCity': c.City,
            'BillingPostalCode': c.PostalCode,
            'BillingCountry': c.Country
        }
        if (hasSAPId) obj['SAP_Customer_ID__c'] = c.CustomerID
        if (hasSAPRating) obj['SAP_Customer_Rating__c'] = rating

        return () => {
            return sfconn.insert('Account', obj)
        }
    }))
}).catch(err => {
    console.log(err)
})



/*
.then((response) => {
    
})
*/