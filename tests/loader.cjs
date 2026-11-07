const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../Donahue_Burn_Day.js'),'utf8');
const boundaries=fs.readFileSync(path.join(__dirname,'../boundaries-v9.json'),'utf8');
const county=fs.readFileSync(path.join(__dirname,'fixtures/county-2026-11-06.html'),'utf8');
const fire=fs.readFileSync(path.join(__dirname,'fixtures/fire-2026-11-06.html'),'utf8');
const marker='\n// WIDGET_BODY_START\n';
// This loader is unchanged from release 6 (apart from the first-line release number).
const loader=source.slice(0,source.indexOf(marker));
async function run(family,instant,storage,remote,expected,fetchExpected){
  const drawn=[],requested=[];let widget;storage.set('/docs/DonahueBurnDay/boundaries-v9.json',boundaries);
  const clock=new Date(instant).getTime();
  class Clock extends Date { constructor(...args){super(...(args.length?args:[clock]));}static now(){return clock;} }
  const noop=()=>{};
  class Drawing {constructor(){return new Proxy(this,{get:(obj,key)=>key==='then'?undefined:key in obj?obj[key]:noop});}drawTextInRect(t){drawn.push(t);}getImage(){return {};}}
  const context=vm.createContext({console,Intl,Date:Clock,config:{runsInWidget:true,widgetFamily:family},URLScheme:{forRunningScript:()=>"scriptable:///run?scriptName=Donahue"},
    FileManager:{local:()=>({documentsDirectory:()=>'/docs',joinPath:(a,b)=>a+'/'+b,fileExists:p=>storage.has(p),createDirectory:noop,readString:p=>storage.get(p),writeString:(p,v)=>storage.set(p,v)})},
    Request:class {constructor(url){this.url=url;this.response={statusCode:200};}async loadString(){requested.push(this.url);if(this.url.includes('raw.githubusercontent')){if(remote===null)throw Error('simulated offline update');return remote;}return this.url.includes('eldoradocounty')?county:fire;}},
    DrawContext:Drawing,Path:Drawing,Color:Drawing,Size:Drawing,Rect:Drawing,Point:Drawing,ListWidget:Drawing,Font:{systemFont:noop,boldSystemFont:noop},
    Location:{setAccuracyToHundredMeters:noop,current:async()=>({latitude:38.7296,longitude:-120.7985,horizontalAccuracy:20})},Timer:{schedule:()=>({invalidate:noop})},Script:{setWidget:w=>widget=w,complete:noop}
  });
  // Supply the old installed fallback; successful remote/cache execution must avoid it.
  await vm.runInContext('(async()=>{'+loader+'\nasync function runWidget(){throw Error("Old embedded fallback unexpectedly ran");}\n})()',context);
  assert(widget); assert(drawn.filter(x=>x===expected).length>=1,JSON.stringify(drawn));
  assert.equal(requested.some(u=>u.includes('raw.githubusercontent')),fetchExpected);
  return widget;
}
(async()=>{
for(const family of ['small','medium','large','extraLarge']){
 const storage=new Map([['/docs/DonahueBurnDay/update-state.json',JSON.stringify({version:6,nextCheck:0})]]);
 await run(family,'2026-11-06T16:24:00Z',storage,source,'BURN DAY',true);
 assert.equal(JSON.parse(storage.get('/docs/DonahueBurnDay/update-state.json')).version,9);
 assert.equal(storage.get('/docs/DonahueBurnDay/last-working.js'),source);
 await run(family,'2026-11-06T16:25:00Z',storage,null,'BURN DAY',false);
 // A failed subsequent download keeps release 9 cached and working.
 const state=JSON.parse(storage.get('/docs/DonahueBurnDay/update-state.json'));state.nextCheck=0;storage.set('/docs/DonahueBurnDay/update-state.json',JSON.stringify(state));
 await run(family,'2026-11-06T16:26:00Z',storage,null,'BURN DAY',true);
 assert.equal(JSON.parse(storage.get('/docs/DonahueBurnDay/update-state.json')).version,9);
 const w=await run(family,'2026-11-06T15:51:00Z',new Map(),source,'NO BURN',true);
 assert.equal(w.refreshAfterDate.toISOString(),'2026-11-06T16:00:00.000Z');
}
console.log('16 loader/render runs passed: upgrade, cached use, failed-download fallback, pre-start; all four sizes');
})().catch(e=>{console.error(e);process.exitCode=1;});
