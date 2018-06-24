const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')
const jsforce = require('jsforce')
const SalesforceDX = require('sfdx-bulk-helper')
const sequential = require('promise-sequential')

// read environment
require('dotenv').config()

module.exports = {
    ensureCommandLineArguments: () => {
        return new Promise((resolve, reject) => {
            // define CLI options, parse and display error/help if applicable
            const optionDefinitions = [
                {name: 'help', alias: 'h', type: Boolean, description: 'Print this help'},
                {name: 'username', alias: 'u', type: String, description: 'Username for SFDX (required)', defaultValue: 'myscratch'},
                {name: 'verbose', alias: 'v', type: Boolean, description: 'More verbose output'}
            ]
            const options = commandLineArgs(optionDefinitions, {'argv': process.argv})
            if (options.help || !options.username) {
                console.log(commandLineUsage([
                    {'header': 'SF Cloud SE Panel', content: 'Script to ease building and rebuilding the environment.'}, 
                    {'header': 'Options', 'optionList': optionDefinitions}
                ]))
                return reject()
            }
            return resolve(options)
        })
    },
    ensureOrgData: (options, odataService) => {
        const sfdx = new SalesforceDX(options.username, options.verbose)
        return new Promise((resolve, reject) => {
            sfdx.executeSFDXCommand('force:org:display').then(data => {
                const accessToken = data.result.accessToken
                const instanceUrl = data.result.instanceUrl
                return Promise.resolve(new jsforce.Connection({
                    instanceUrl, accessToken
                }))
            }).then(sfconn => {
                return Promise.all([
                    Promise.resolve(sfconn),
                    sfconn.query('SELECT Id FROM Account'),
                ])
            
            }).then(responses => {
                const sfconn = responses[0]
            
                // curryable function to delete each object sequentially to avoid running into
                // concurrent call limit
                let deleteAll = (response) => (obj) => () => {
                    let ids = response.records.map(r => r.Id)
                    if (ids && ids.length) return sequential(ids.map(id => () => sfconn.delete(obj, id)))
                    return () => Promise.resolve()
                }
                return Promise.all([
                    Promise.resolve(sfconn),
                    sequential([
                        deleteAll(responses[1])('Account')
                    ])
                ])
            
            }).then((responses) => {
                const sfconn = responses[0]
                return Promise.all([
                    Promise.resolve(sfconn),
                    odataService.get()
                ])
            }).then(responses => {
                const odataResponse = JSON.parse(responses[1].body)
                odataResponse.value.forEach(c => {
                    // calc  rating
                    let rating = ['Hot','Warm','Cold'][Math.floor(Math.random() * 3)]
                    if (c.CompanyName === 'Chop-suey Chinese') rating = 'Hot'
                    if (c.CompanyName === 'Alfreds Futterkiste') rating = 'Warm'
                    if (c.CompanyName === 'Ernst Handel') rating = 'Cold'
                    c.Rating = rating
                })
                return resolve([responses[0], odataResponse.value])

            }).catch(reject)
        })
    }
}
