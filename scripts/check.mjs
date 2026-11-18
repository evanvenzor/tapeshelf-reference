import { readFile, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { root } from './build.mjs';
import { validateCatalog,validateConfig } from '../lib/catalog.mjs';
export async function check(directory=join(root,'dist')) {
  validateCatalog(JSON.parse(await readFile(join(root,'data/catalog.json'),'utf8')));
  validateConfig(JSON.parse(await readFile(join(root,'config.json'),'utf8')));
  const files=await readdir(directory), manifest=JSON.parse(await readFile(join(directory,'integrity.json'),'utf8'));
  if(JSON.stringify(Object.keys(manifest.files).sort())!==JSON.stringify(files.filter(f=>f!=='integrity.json').sort())) throw new Error('Manifest file set mismatch');
  let links=0;
  for(const [name,hash] of Object.entries(manifest.files)) {
    if(!/^[\w.-]+$/.test(name)) throw new Error('Unsafe manifest path');
    const content=await readFile(join(directory,name));
    if(createHash('sha256').update(content).digest('hex')!==hash) throw new Error('Integrity mismatch: '+name);
    if(!name.endsWith('.html')) continue;
    const html=content.toString();
    if(!/<html lang="en">/.test(html)||!/<title>[^<]+<\/title>/.test(html)||!/<main id="main"/.test(html)) throw new Error('Missing page semantics: '+name);
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
    if(new Set(ids).size!==ids.length) throw new Error('Duplicate HTML IDs: '+name);
    for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const value=match[1].replaceAll('&amp;','&');
      if(/^https:\/\//.test(value)) continue;
      if(value.includes(':')||value.startsWith('//')) throw new Error('Unsafe link: '+value);
      const [target,hash]=value.split('#'); const path=target.split('?')[0]||name;
      if(!files.includes(path)) throw new Error('Broken internal link: '+name+' -> '+value);
      if(hash && !(await readFile(join(directory,path),'utf8')).includes(`id="${hash}"`)) throw new Error('Missing anchor: '+value);
      links++;
    }
  }
  const bytes=(await Promise.all(files.map(async f=>(await readFile(join(directory,f))).length))).reduce((a,b)=>a+b,0);
  if(bytes>250_000) throw new Error('Static payload exceeds 250 KB budget');
  return {passed:true,files:files.length,internalLinks:links,bytes};
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) console.log(JSON.stringify(await check()));
