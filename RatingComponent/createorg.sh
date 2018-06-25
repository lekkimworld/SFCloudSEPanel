USERNAME=myscratch

sfdx force:org:create -a $USERNAME -f config/project-scratch-def.json --setdefaultusername
sfdx l18n:user:set --language en_US -u $USERNAME

ACCESS_TOKEN=`sfdx force:org:display -u $USERNAME --json | jq -r ".result.accessToken"`
INSTANCE_URL=`sfdx force:org:display -u $USERNAME --json | jq -r ".result.instanceUrl"`

sfdx force:data:tree:import -u $USERNAME -p ./data/Account-Contact-plan.json
sfdx force:source:push -u $USERNAME

sfdx force:org:open -u $USERNAME --path /lightning/page/home

open -a /Applications/Firefox.app "$INSTANCE_URL/secur/frontdoor.jsp?sid=$ACCESS_TOKEN&retURL=/lightning/page/home"
