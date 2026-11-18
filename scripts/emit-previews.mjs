import { readFile } from 'node:fs/promises';
// The public CI log carries only our generated site screenshots. Avoids billable artifact storage.
for(const name of ['desktop','mobile','small-mobile']){
  try { const bytes=await readFile(`test-results/${name}.png`); if(bytes.length>1_000_000) throw new Error('Preview exceeds log budget'); console.log(`TAPESHELF_PREVIEW_${name}=${bytes.toString('base64')}`); }
  catch(error){console.log(`Preview ${name} unavailable: ${error.message}`);}
}
