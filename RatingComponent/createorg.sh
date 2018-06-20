sfdx force:org:create -a myscratch -f config/project-scratch-def.json
sfdx l18n:user:set --language en_US -u myscratch

ACCESS_TOKEN=`sfdx force:org:display -u myscratch --json | jq -r ".result.accessToken"`
INSTANCE_URL=`sfdx force:org:display -u myscratch --json | jq -r ".result.instanceUrl"`

sfdx force:org:open -u myscratch --path /lightning/page/home

open -a /Applications/Firefox.app "$INSTANCE_URL/secur/frontdoor.jsp?sid=$ACCESS_TOKEN&retURL=/lightning/page/home"
