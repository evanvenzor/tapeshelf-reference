import { readFile,writeFile,mkdir,appendFile } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { build,root } from './build.mjs';
import { check } from './check.mjs';
import { validateUrl,validateCatalog } from '../lib/catalog.mjs';

const out=join(root,'reports');
export async function probe(url,{fetcher=fetch}={}) {
  try{
    // Redirects are checked individually; never follow a source to a private network or an unknown host.
    let current=url;
    for(let n=0;n<5;n++){
      validateUrl(current);
      const response=await fetcher(current,{redirect:'manual',signal:AbortSignal.timeout(15000),headers:{'User-Agent':'TapeShelfReference/1.0 (source availability check)'}});
      if(response.status>=300&&response.status<400){
        const next=response.headers.get('location'); await response.body?.cancel();
        if(!next) return {url,status:'failed',httpStatus:response.status,reason:'Redirect without Location'};
        current=new URL(next,current).href; continue;
      }
      const status=response.ok?'reachable':[403,429].includes(response.status)?'review_required':'failed';
      await response.body?.cancel();
      return {url,finalUrl:current,status,httpStatus:response.status,reason:status==='reachable'?'HTTP reachability only; claims still require review':status==='review_required'?'Access blocked or rate limited; not verified healthy':'Non-success response'};
    }
    return {url,status:'failed',reason:'Too many redirects'};
  }catch(error){return {url,status:'review_required',reason:error.name==='TimeoutError'?'Timed out':error.message};}
}
export async function linkCheck(data,fetcher=fetch){
  validateCatalog(data);
  const urls=[...new Set([data.modelSource,data.manualSource,...data.records.map(r=>r.sourceUrl),...data.excluded.map(r=>r.sourceUrl)])];
  // Two requests at a time keep the job short without hammering one manufacturer.
  const results=[];
  for(let i=0;i<urls.length;i+=2) results.push(...await Promise.all(urls.slice(i,i+2).map(url=>probe(url,{fetcher}))));
  return {checkedAt:new Date().toISOString(),results,passed:results.every(r=>r.status==='reachable')};
}
export function researchQueue(data,links,now=new Date()){
  const queue=data.excluded.map(r=>({id:r.id,reason:r.reason,sourceUrl:r.sourceUrl,action:'manual_source_review',publish:false}));
  for(const r of data.records){
    if(now-Date.parse(r.reviewedAt)>90*86400000) queue.push({id:r.id,reason:'Evidence review is older than 90 days',sourceUrl:r.sourceUrl,action:'manual_source_review',publish:false});
  }
  for(const r of links?.results||[]) if(r.status!=='reachable') queue.push({id:r.url,reason:r.reason,sourceUrl:r.url,action:'manual_link_review',publish:false});
  return [...new Map(queue.map(r=>[r.id,r])).values()];
}
export async function deploymentCheck(config,{fetcher=fetch,manifestPath=join(root,'dist/integrity.json')}={}){
  if(!config.publicationApproved||!config.hostingApproved||!config.siteUrl) return {status:'unavailable',reason:'Public deployment is pending owner approval'};
  try{
    const expected=JSON.parse(await readFile(manifestPath,'utf8'));
    if(!expected.release) throw new Error('Local artifact is a review build, not a release');
    const origin=new URL(config.siteUrl);
    if(origin.protocol!=='https:') throw new Error('HTTPS required');
    for(const [name,hash] of Object.entries(expected.files)){
      if(name==='_headers') continue; // Hosting control file, not a public asset.
      if(!/^[\w.-]+$/.test(name)) throw new Error('Unsafe manifest path');
      let response=await fetcher(new URL(name,origin),{redirect:'manual',signal:AbortSignal.timeout(15000)});
      if([301,302,307,308].includes(response.status)&&name.endsWith('.html')){
        const destination=new URL(response.headers.get('location')||'',origin);
        const cleanPath=name==='index.html'?'/':'/'+name.slice(0,-5);
        if(destination.origin!==origin.origin||destination.pathname!==cleanPath||destination.search||destination.hash) throw new Error(name+': unexpected redirect');
        await response.body?.cancel();
        response=await fetcher(destination,{redirect:'manual',signal:AbortSignal.timeout(15000)});
      }
      if(!response.ok && !(name==='404.html'&&response.status===404)) throw new Error(name+': HTTP '+response.status);
      const actual=createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex');
      if(actual!==hash) throw new Error(name+': deployed content differs from validated artifact');
    }
    return {status:'passed',reason:'HTTPS content hashes match all deployable files'};
  }catch(error){return {status:'failed',reason:error.message};}
}
export function weeklyReport({checks,links,deployment,queue,config,now=new Date()}){
  const failedLinks=links?.results.filter(r=>r.status!=='reachable').length;
  const approval=config?.publicationApproved&&config?.hostingApproved&&config?.reportDeliveryApproved?'Public Cloudflare Pages Free launch, public repository and GitHub job-summary delivery approved by owner on 2026-11-18.':'Public hosting, contact availability and report delivery require owner approval.';
  return `# TapeShelf operating report\n\nGenerated: ${now.toISOString()}\n\n| Metric | Result |\n| --- | --- |\n| Visitors | Unavailable — analytics not authorized or connected |\n| Search impressions / clicks | Unavailable — Search Console not connected |\n| Outbound affiliate clicks | Unavailable — affiliate links and tracking disabled |\n| Attributed earnings | Unavailable — no affiliate reporting account |\n| New verified pages published this week | Unavailable — no approved publication ledger |\n| Validation | ${checks?.passed?'Passed':'Failed or unavailable'} |\n| Source checks needing review | ${failedLinks===undefined?'Unavailable — check not run':failedLinks} |\n| Deployment check | ${deployment?.status||'unavailable'} |\n| Research queue | ${queue?.length??'Unavailable'} items |\n| Recurring cost estimate | $0 for approved static free hosting and public standard-runner checks; paid features disabled |\n| Actual account charges | Unavailable — billing API permission not granted |\n\n## Exceptions and gates\n\n- ${deployment?.reason||'Deployment has not been checked.'}\n- ${approval}\n- Private GitHub Actions allowance is unverified; metered private runs remain disabled.\n- Unattended AI publication is blocked pending an approved hosted model, scoped credentials and a cost estimate.\n- Source reachability is not semantic verification. No queued item is automatically published.\n\n${(links?.results||[]).filter(r=>r.status!=='reachable').map(r=>`- ${r.url}: ${r.status} — ${r.reason}`).join('\n')}\n`;
}
async function run(command){
  await mkdir(out,{recursive:true});
  const data=JSON.parse(await readFile(join(root,'data/catalog.json'),'utf8'));
  const config=JSON.parse(await readFile(join(root,'config.json'),'utf8'));
  if(command==='links'){
    const links=await linkCheck(data); await writeFile(join(out,'links.json'),JSON.stringify(links,null,2));
    console.log(JSON.stringify({sources:links.results.length,passed:links.passed,reviewRequired:links.results.filter(r=>r.status!=='reachable').length}));
    if(!links.passed) process.exitCode=1; return;
  }
  const release=config.publicationApproved&&config.hostingApproved&&!!config.siteUrl;
  let checks;try{await build({release});checks=await check();}catch(error){checks={passed:false,error:error.message};}
  let links;
  if(command==='all') links=await linkCheck(data);
  else {try{links=JSON.parse(await readFile(join(out,'links.json'),'utf8'));}catch{links=null;}}
  const deployment=await deploymentCheck(config);
  const queue=researchQueue(data,links);
  const summary=weeklyReport({checks,links,deployment,queue,config});
  const status={checkedAt:new Date().toISOString(),checks,links,deployment,queue};
  await writeFile(join(out,'status.json'),JSON.stringify(status,null,2));
  await writeFile(join(out,'research-queue.json'),JSON.stringify(queue,null,2));
  await writeFile(join(out,'weekly-report.md'),summary);
  if(links) await writeFile(join(out,'links.json'),JSON.stringify(links,null,2));
  if(process.env.GITHUB_STEP_SUMMARY && config.reportDeliveryApproved) await appendFile(process.env.GITHUB_STEP_SUMMARY,summary);
  console.log(JSON.stringify({validation:checks.passed,sourceChecks:links?.passed??'unavailable',deployment:deployment.status,queue:queue.length,report:'reports/weekly-report.md'}));
  if(!checks.passed || links&&!links.passed || deployment.status==='failed') process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) await run(process.argv[2]||'all');
