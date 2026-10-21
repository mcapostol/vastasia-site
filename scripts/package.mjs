import {execFileSync} from 'node:child_process';import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const status=execFileSync('git',['status','--porcelain','--untracked-files=normal'],{encoding:'utf8'}).trim();if(status)throw Error('Package only from a clean, identified source commit.');
const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
mkdirSync('delivery',{recursive:true});const archive='delivery/VASTASIA_public_html.zip';execFileSync('git',['archive','--format=zip',`--output=${archive}`,commit,'public_html','README.md','ASSETS.txt']);
const bytes=readFileSync(archive),sha256=createHash('sha256').update(bytes).digest('hex');writeFileSync('delivery/manifest.json',JSON.stringify({commit,archive,bytes:bytes.length,sha256,domain:'vastasia.ro'},null,2));console.log(JSON.stringify({commit,archive,bytes:bytes.length,sha256}));
