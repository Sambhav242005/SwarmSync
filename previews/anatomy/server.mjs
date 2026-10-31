import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const html=fileURLToPath(new URL('./index.html',import.meta.url));
createServer(async(req,res)=>{if(req.url!=='/'&&req.url!=='/index.html'){res.writeHead(404);res.end();return;}try{res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile(html));}catch{res.writeHead(500);res.end('Preview unavailable');}}).listen(4178,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4178'));
