import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const assets=[...files('.next/static'),...files('public')];
const leaks=[];
for(const file of assets)if(/sk-[A-Za-z0-9_-]{20,}/.test(fs.readFileSync(file,'utf8')))leaks.push(file);
const localConfig=fs.existsSync('.env.local')?fs.readFileSync('.env.local','utf8'):'';
const report={assetFilesChecked:assets.length,credentialPatternsFound:leaks,localProviderConfigPresent:/OPENAI_|TRACTO_AI_|sk-[A-Za-z0-9_-]{20,}/.test(localConfig),aiEndpointSourcePresent:fs.existsSync('app/api/assistant/route.ts')};
fs.mkdirSync('audit-screenshots/corrections',{recursive:true});fs.writeFileSync('audit-screenshots/corrections/client-secrets.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
assert.equal(leaks.length,0);assert.equal(report.localProviderConfigPresent,false);assert.equal(report.aiEndpointSourcePresent,false);
