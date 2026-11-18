import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { validateCatalog,validateConfig,matches,affiliateLink,requireRelease } from '../lib/catalog.mjs';
import { build,root } from '../scripts/build.mjs';
import { check } from '../scripts/check.mjs';
import { probe,researchQueue,weeklyReport,deploymentCheck } from '../scripts/operations.mjs';
const catalog=JSON.parse(await readFile(new URL('../data/catalog.json',import.meta.url),'utf8'));
const liveConfig=JSON.parse(await readFile(new URL('../config.json',import.meta.url),'utf8'));
const config={...liveConfig,publicationApproved:false,hostingApproved:false,publicContactApproved:false,siteUrl:'',hostingProvider:'',hostingPrivacyUrl:''};
test('current project configuration validates',()=>assert.equal(validateConfig(liveConfig),true));
const clone=value=>structuredClone(value);
test('all records satisfy scoped schema and evidence requirements',()=>assert.equal(validateCatalog(catalog),true));
for(const [name,mutate] of [
  ['duplicate IDs',d=>d.records.push(clone(d.records[0]))],
  ['duplicate variants',d=>{Object.assign(d.records[1],{widthMm:6});}],
  ['unverified claims',d=>d.records[0].status='draft'],
  ['missing evidence',d=>d.records[0].evidence=''],
  ['unsupported widths',d=>d.records[0].widthMm=18],
  ['other tape families',d=>d.records[0].family='M'],
  ['future reviews',d=>d.records[0].reviewedAt='2099-01-01'],
  ['invalid review date',d=>d.records[0].reviewedAt='2026-02-31'],
  ['wrong source SKU',d=>d.records[0].sourceUrl=d.records[1].sourceUrl],
  ['insecure URLs',d=>d.records[0].sourceUrl='http://brothermobilesolutions.com/products/media/tapes/tze211/'],
  ['unapproved source host',d=>d.records[0].sourceUrl='https://example.com/products/media/tapes/tze211/'],
  ['embedded credentials',d=>d.records[0].sourceUrl='https://secret@brothermobilesolutions.com/products/media/tapes/tze211/'],
  ['excluded record accidentally included',d=>d.excluded[0].id=d.records[0].id]
]) test('rejects '+name,()=>{const d=clone(catalog);mutate(d);assert.throws(()=>validateCatalog(d));});
test('search accepts hyphen-free and case-insensitive SKUs',()=>assert.equal(catalog.records.filter(r=>matches(r,{query:'tZe231'})).length,1));
test('search ANDs words, width and background',()=>assert.deepEqual(catalog.records.filter(r=>matches(r,{query:'black white',width:'9',background:'White'})).map(r=>r.id),['tze-221']));
test('empty query/reset returns all records',()=>assert.equal(catalog.records.filter(r=>matches(r)).length,7));
test('unknown query returns no results',()=>assert.equal(catalog.records.filter(r=>matches(r,{query:'not-a-tape'})).length,0));
test('hostile query stays a plain search string',()=>assert.equal(catalog.records.filter(r=>matches(r,{query:'<script>alert(1)</script>'})).length,0));
test('affiliate link absent in disabled mode',()=>assert.equal(affiliateLink(catalog.records[0],config),null));
test('affiliate flag alone cannot activate links',()=>{const c=clone(config);c.affiliate.enabled=true;assert.throws(()=>validateConfig(c));});
test('approved exact link is preserved, never fabricated',()=>{const c=clone(config);Object.assign(c.affiliate,{enabled:true,agreementApproved:true,publisherId:'fixture',approvedHosts:['approved.example'],links:{'tze-211':'https://approved.example/exact-link'}});assert.equal(affiliateLink(catalog.records[0],c),'https://approved.example/exact-link');assert.equal(affiliateLink(catalog.records[1],c),null);});
test('affiliate redirect host must be approved',()=>{const c=clone(config);Object.assign(c.affiliate,{enabled:true,agreementApproved:true,publisherId:'fixture',approvedHosts:['approved.example'],links:{'tze-211':'https://evil.example/'}});assert.throws(()=>validateConfig(c));});
test('release is blocked without approvals',()=>assert.throws(()=>requireRelease(config)));
test('release requires approvals, HTTPS origin, host privacy and public contact',()=>{const c=clone(config);c.publicationApproved=true;c.hostingApproved=true;c.siteUrl='https://approved.example';assert.throws(()=>requireRelease(c));Object.assign(c,{publicContactApproved:true,hostingProvider:'Approved host',hostingPrivacyUrl:'https://approved.example/privacy'});assert.doesNotThrow(()=>requireRelease(c));c.siteUrl='http://approved.example';assert.throws(()=>requireRelease(c));});
test('AI and analytics cannot silently activate',()=>{for(const field of ['analytics','aiPublishing']){const c=clone(config);c[field].enabled=true;assert.throws(()=>validateConfig(c));}});
test('403 is review required, never a healthy source',async()=>assert.equal((await probe(catalog.modelSource,{fetcher:async()=>new Response('',{status:403})})).status,'review_required'));
test('404 is a failed source',async()=>assert.equal((await probe(catalog.modelSource,{fetcher:async()=>new Response('',{status:404})})).status,'failed'));
test('200 is reachability, not claim validation',async()=>{const result=await probe(catalog.modelSource,{fetcher:async()=>new Response('ok')});assert.equal(result.status,'reachable');assert.match(result.reason,/claims still require review/);});
test('redirect to local/private host is not followed',async()=>{let calls=0;const result=await probe(catalog.modelSource,{fetcher:async()=>{calls++;return new Response(null,{status:302,headers:{location:'http://127.0.0.1/secret'}});}});assert.equal(calls,1);assert.equal(result.status,'review_required');});
test('network errors remain exceptions',async()=>assert.equal((await probe(catalog.modelSource,{fetcher:async()=>{throw new Error('offline');}})).status,'review_required'));
test('stale records and exclusions enter queue, never publication',()=>{const q=researchQueue(catalog,null,new Date('2027-03-01'));assert.equal(q.length,9);assert(q.every(r=>r.publish===false));});
test('missing metrics are unavailable, not zero',()=>{const report=weeklyReport({checks:{passed:true},links:null,deployment:{status:'unavailable',reason:'Approval pending'},queue:[]});assert.match(report,/Visitors \| Unavailable/);assert.match(report,/Attributed earnings \| Unavailable/);assert.match(report,/Source checks needing review \| Unavailable/);});
test('no deployment request occurs without approval',async()=>{const result=await deploymentCheck(config,{fetcher:()=>{throw new Error('must not fetch');}});assert.equal(result.status,'unavailable');});
test('generated site passes links and integrity; corruption is caught',async()=>{
  const result=await build();assert.equal(result.records,7);const verified=await check();assert(verified.passed);assert(verified.bytes<250000);
  const file=root+'/dist/style.css', original=await readFile(file);await writeFile(file,'corrupted');
  try{await assert.rejects(check(),/Integrity mismatch/);}finally{await writeFile(file,original);}
});
test('broken internal links are caught even with a matching artifact hash',async()=>{
  await build();
  const file=root+'/dist/about.html',manifestFile=root+'/dist/integrity.json';
  const original=await readFile(file), manifestOriginal=await readFile(manifestFile);
  const changed=original.toString().replace('href="guide.html"','href="missing.html"');
  const manifest=JSON.parse(manifestOriginal);manifest.files['about.html']=createHash('sha256').update(changed).digest('hex');
  await writeFile(file,changed);await writeFile(manifestFile,JSON.stringify(manifest));
  try{await assert.rejects(check(),/Broken internal link/);}finally{await writeFile(file,original);await writeFile(manifestFile,manifestOriginal);}
});
test('deployment verifies every asset and detects an incorrect deployed artifact',async()=>{
  await build();
  const manifestFile=root+'/dist/integrity.json',original=await readFile(manifestFile),manifest=JSON.parse(original);manifest.release=true;await writeFile(manifestFile,JSON.stringify(manifest));
  const c={...config,publicationApproved:true,hostingApproved:true,siteUrl:'https://approved.example'};
  try{
    let calls=0;
    const success=await deploymentCheck(c,{fetcher:async url=>{calls++;return new Response(await readFile(root+'/dist/'+new URL(url).pathname.slice(1)));}});
    assert.equal(success.status,'passed');assert.equal(calls,Object.keys(manifest.files).length-1);
    const failed=await deploymentCheck(c,{fetcher:async()=>new Response('unexpected page')});assert.equal(failed.status,'failed');assert.match(failed.reason,/differs/);
    const redirected=await deploymentCheck(c,{fetcher:async url=>{
      const path=new URL(url).pathname;
      if(path.endsWith('.html'))return new Response(null,{status:301,headers:{location:path==='/index.html'?'/':path.slice(0,-5)}});
      const filename=path==='/'?'index.html':path.slice(1)+(path.includes('.')?'':'.html');
      return new Response(await readFile(root+'/dist/'+filename));
    }});assert.equal(redirected.status,'passed');
    const login=await deploymentCheck(c,{fetcher:async()=>new Response(null,{status:302,headers:{location:'/login'}})});assert.equal(login.status,'failed');
  }finally{await writeFile(manifestFile,original);}
});
