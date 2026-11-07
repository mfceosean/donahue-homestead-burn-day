const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../Donahue_Burn_Day.js'),'utf8');
const body=source.split('\n// WIDGET_BODY_START\n')[1];
const county=fs.readFileSync(path.join(__dirname,'fixtures/county-2026-11-06.html'),'utf8')
  .replace(/(SOUTH LAKE TAHOE BASIN[^<]*<\/td>\s*<td[^>]*><strong>)BURN DAY/g,'$1NO BURN DAY');
const fire=fs.readFileSync(path.join(__dirname,'fixtures/fire-2026-11-06.html'),'utf8');
const setting='/docs/DonahueBurnDay/area-selection.json';
const west={latitude:38.7296,longitude:-120.7985,horizontalAccuracy:20};
const tahoe={latitude:38.9399,longitude:-119.9772,horizontalAccuracy:20};
let checks=0;
async function run({family='medium',saved,location=west,app=false,answer=-1,locationError=false,countyHtml=county,fireHtml=fire}={}) {
 const drawn=[],storage=new Map(),menus=[],opened=[];let widget,gps=0;
 if(saved!==undefined)storage.set(setting,typeof saved==='string'?saved:JSON.stringify({area:saved.area}));
 const noop=()=>{};
 class Drawing {constructor(){return new Proxy(this,{get:(o,k)=>k==='then'?undefined:k in o?o[k]:noop});}drawTextInRect(t){drawn.push(t);}getImage(){return {};}}
 const clock=new Date('2026-11-06T20:00:00Z').getTime();
 class Clock extends Date {constructor(...a){super(...(a.length?a:[clock]));} static now(){return clock;}}
 const context=vm.createContext({Intl,console,Date:Clock,config:{runsInWidget:!app,runsInApp:app,widgetFamily:family},
 FileManager:{local:()=>({documentsDirectory:()=>'/docs',joinPath:(a,b)=>a+'/'+b,fileExists:p=>storage.has(p),createDirectory:noop,readString:p=>storage.get(p),writeString:(p,v)=>storage.set(p,v)})},
 URLScheme:{forRunningScript:()=> 'scriptable:///run?scriptName=Donahue'},Safari:{openInApp:async u=>opened.push(u)},
 Alert:class {constructor(){this.actions=[];menus.push(this);}addAction(a){this.actions.push(a);}addCancelAction(a){this.cancel=a;}async presentSheet(){return answer;}},
 Request:class {constructor(u){this.url=u;this.response={statusCode:200};}async loadString(){return this.url.includes('eldoradocounty')?countyHtml:fireHtml;}},
 Location:{setAccuracyToHundredMeters:noop,current:async()=>{gps++;if(locationError)throw Error('GPS denied');return location;}},Timer:{schedule:()=>({invalidate:noop})},
 DrawContext:Drawing,Path:Drawing,Color:Drawing,Size:Drawing,Rect:Drawing,Point:Drawing,ListWidget:Drawing,Font:{systemFont:noop,boldSystemFont:noop},Script:{setWidget:w=>widget=w}
 });
 await vm.runInContext('(async()=>{'+body+'\nawait runWidget();})()',context);
 return {drawn,storage,widget,gps,menus,opened};
}
function single(r,name,status,other){
 assert(r.widget);assert.equal(r.widget.url,'scriptable:///run?scriptName=Donahue');
 assert(r.drawn.includes(name));assert(r.drawn.includes(status));assert(!r.drawn.includes(other),r.drawn.join('|'));
 // The main result is shown once. Source rows use different wording.
 assert.equal(r.drawn.filter(t=>['BURN DAY','NO BURN','UNCONFIRMED'].includes(t)).length,1);checks++;
}
(async()=>{
for(const family of ['small','medium','large','extraLarge']){
 single(await run({family}),'West Slope','BURN DAY','Tahoe Basin');
 single(await run({family,location:tahoe}),'Tahoe Basin','NO BURN','West Slope');
 for(const [area,name,status,other] of [['west','West Slope','BURN DAY','Tahoe Basin'],['tahoe','Tahoe Basin','NO BURN','West Slope']]){
  const r=await run({family,saved:{area},locationError:true});single(r,name,status,other);assert.equal(r.gps,0);checks++;
 }
 for(const location of [null,{latitude:38.58,longitude:-121.49,horizontalAccuracy:10},{...west,horizontalAccuracy:1500},{latitude:39.0674,longitude:-120.08,horizontalAccuracy:10}]){
  const r=await run({family,location});single(r,'Select an area','UNCONFIRMED','West Slope');assert(!r.drawn.includes('Tahoe Basin'));assert(!r.drawn.includes('Permits apply'));checks++;
 }
 const r=await run({family,locationError:true});single(r,'Select an area','UNCONFIRMED','West Slope');
}
for(const saved of ['{broken',JSON.stringify({area:'amador'})])single(await run({saved}),'West Slope','BURN DAY','Tahoe Basin');
for(const [answer,area] of [[0,'auto'],[1,'west'],[2,'tahoe']]){
 const r=await run({app:true,answer});assert.equal(JSON.parse(r.storage.get(setting)).area,area);assert(r.widget);assert.equal(r.menus.length,1);checks++;
 const next=await run({saved:{area},location:tahoe});assert(next.drawn.includes(area==='west'?'West Slope':'Tahoe Basin'));checks++;
}
const cancel=await run({app:true,answer:-1,saved:{area:'west'}});assert(!cancel.widget);assert.equal(JSON.parse(cancel.storage.get(setting)).area,'west');assert.equal(cancel.gps,0);checks++;
const official=await run({app:true,answer:3});assert.equal(official.opened[0],'https://www.eldoradocounty.ca.gov/Services/Burn-Day');assert(!official.widget);checks++;
// Unknown geography must not inherit even a confirmed EDC prohibition.
const outside=await run({family:'large',location:null,fireHtml:fire.replace('Permit Required','Burning Suspended')});assert(!outside.drawn.includes('Suspended'));checks++;
const previous=require('node:child_process').execFileSync('git',['show','HEAD:Donahue_Burn_Day.js'],{cwd:path.join(__dirname,'..'),encoding:'utf8'});
assert.equal(source.split('\n// WIDGET_BODY_START\n')[0].replace('VERSION: 7','VERSION: 6'),previous.split('\n// WIDGET_BODY_START\n')[0]);checks++;
console.log(`${checks} selection/render checks passed: single area, different area decisions, GPS fallback, manual persistence, app menu, unchanged loader`);
})().catch(e=>{console.error(e);process.exitCode=1;});
