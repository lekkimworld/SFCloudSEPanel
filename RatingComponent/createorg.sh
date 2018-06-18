sfdx force:org:create -a myscratch -f config/project-scratch-def.json
sfdx l18n:user:set --language en_US -u myscratch
sfdx force:org:open -u myscratch
