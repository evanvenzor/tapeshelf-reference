import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { root } from './build.mjs';
const base=resolve(root,'dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain'};
createServer(async(req,res)=>{
  try {
    const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=resolve(base,'.'+(path.endsWith('/')?path+'index.html':path));
    if(!file.startsWith(base+sep)){res.writeHead(403);res.end();return;}
    const content=await readFile(file);
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});res.end(content);
  }catch{res.writeHead(404,{'Content-Type':'text/html'});res.end(await readFile(resolve(base,'404.html')));}
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
