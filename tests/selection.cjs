const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../Donahue_Burn_Day.js'),'utf8');
const body=source.split('\n// WIDGET_BODY_START\n')[1];
const county=fs.readFileSync(path.join(__dirname,'fixtures/county-2026-11-06.html'),'utf8')
  .replace(/(SOUTH LAKE TAHOE BASIN[^<]*<\/td>\s*<td[^>]*><strong>)BURN DAY/g,'$1NO BURN DAY');
const fire=fs.readFileSync(path.join(__dirname,'fixtures/fire-2026-11-06.html'),'utf8');
const placer=fs.readFileSync(path.join(__dirname,'fixtures/placer-2026-11-06.json'),'utf8');
const feather=fs.readFileSync(path.join(__dirname,'fixtures/feather-2026-11-06.html'),'utf8');
const regionalFire=['El Dorado','Placer','Yuba','Sutter'].map(c=>fire.replace('El Dorado County',c+' County')).join('');
const boundaries=fs.readFileSync(path.join(__dirname,'../boundaries-v9.json'),'utf8');
const butte=fs.readFileSync(path.join(__dirname,'fixtures/butte-2026-11-06.html'),'utf8');
const setting='/docs/DonahueBurnDay/area-selection.json';
const west={latitude:38.7296,longitude:-120.7985,horizontalAccuracy:20};
const tahoe={latitude:38.9399,longitude:-119.9772,horizontalAccuracy:20};
let checks=0;
async function run({family='medium',saved,location=west,app=false,answer=-1,locationError=false,countyHtml=county,fireHtml=fire,placerData=placer,featherHtml=feather,featherPrimaryFailure=false,boundaryCache=boundaries,boundaryDownload=boundaries,boundaryOffline=false,butteHtml=butte}={}) {
 const drawn=[],storage=new Map(),menus=[],opened=[],requested=[];let widget,gps=0;
 if(boundaryCache!==null)storage.set('/docs/DonahueBurnDay/boundaries-v9.json',boundaryCache);
 if(saved!==undefined)storage.set(setting,typeof saved==='string'?saved:JSON.stringify({area:saved.area}));
 const noop=()=>{};
 class Drawing {constructor(){return new Proxy(this,{get:(o,k)=>k==='then'?undefined:k in o?o[k]:noop});}drawTextInRect(t){drawn.push(t);}getImage(){return {};}}
 const clock=new Date('2026-11-06T20:00:00Z').getTime();
 class Clock extends Date {constructor(...a){super(...(a.length?a:[clock]));} static now(){return clock;}}
 const context=vm.createContext({Intl,console,Date:Clock,config:{runsInWidget:!app,runsInApp:app,widgetFamily:family},
 FileManager:{local:()=>({documentsDirectory:()=>'/docs',joinPath:(a,b)=>a+'/'+b,fileExists:p=>storage.has(p),createDirectory:noop,readString:p=>storage.get(p),writeString:(p,v)=>storage.set(p,v)})},
 URLScheme:{forRunningScript:()=> 'scriptable:///run?scriptName=Donahue'},Safari:{openInApp:async u=>opened.push(u),open:async u=>opened.push(u)},
 Alert:class {constructor(){this.actions=[];menus.push(this);}addAction(a){this.actions.push(a);}addCancelAction(a){this.cancel=a;}async presentSheet(){return Array.isArray(answer)?answer.shift():answer;}},
 Request:class {constructor(u){this.url=u;this.response={statusCode:200};}async loadString(){requested.push(this.url);if(this.url.includes('boundaries-v9.json')){if(boundaryOffline)throw Error("offline boundaries");return boundaryDownload;}if(this.url.includes('bcaqmd.org'))return butteHtml;if(this.url.includes('FeatureServer'))return placerData;if(this.url.includes('fraqmd'))return featherPrimaryFailure&&!this.url.includes('specialdistrict')?'<h1>Site Unavailable</h1>':featherHtml;return this.url.includes('eldoradocounty')?countyHtml:fireHtml;}},
 Location:{setAccuracyToHundredMeters:noop,current:async()=>{gps++;if(locationError)throw Error('GPS denied');return location;}},Timer:{schedule:()=>({invalidate:noop})},
 DrawContext:Drawing,Path:Drawing,Color:Drawing,Size:Drawing,Rect:Drawing,Point:Drawing,ListWidget:Drawing,Font:{systemFont:noop,boldSystemFont:noop},Script:{setWidget:w=>widget=w}
 });
 await vm.runInContext('(async()=>{'+body+'\nawait runWidget();})()',context);
 return {drawn,storage,widget,gps,menus,opened,requested};
}
function single(r,name,status,other){
 assert(r.widget);assert.equal(r.widget.url,'scriptable:///run?scriptName=Donahue');
 assert(r.drawn.includes(name));assert(r.drawn.includes(status));assert(!r.drawn.includes(other),r.drawn.join('|'));
 // The main result is shown once. Source rows use different wording.
 assert.equal(r.drawn.filter(t=>['BURN DAY','NO BURN','UNCONFIRMED','CALL TO CONFIRM'].includes(t)).length,1);checks++;
}
(async()=>{
for(const family of ['small','medium','large','extraLarge']){
 single(await run({family}),'West Slope','BURN DAY','Tahoe Basin');
 single(await run({family,location:tahoe}),'Tahoe Basin','NO BURN','West Slope');
 for(const [area,name,status,other] of [['west','West Slope','BURN DAY','Tahoe Basin'],['tahoe','Tahoe Basin','NO BURN','West Slope']]){
  const r=await run({family,saved:{area},locationError:true});single(r,name,status,other);assert.equal(r.gps,0);checks++;
 }
 for(const location of [null,{latitude:39.5296,longitude:-119.8138,horizontalAccuracy:10},{...west,horizontalAccuracy:1500},{latitude:39.0674,longitude:-120.08,horizontalAccuracy:10}]){
  const r=await run({family,location});single(r,'Select an area','UNCONFIRMED','West Slope');assert(!r.drawn.includes('Tahoe Basin'));assert(!r.drawn.includes('Permits apply'));checks++;
 }
 const r=await run({family,locationError:true});single(r,'Select an area','UNCONFIRMED','West Slope');
}
for(const saved of ['{broken',JSON.stringify({area:'not-a-county'})])single(await run({saved}),'West Slope','BURN DAY','Tahoe Basin');
for(const [answer,area] of [[0,'auto'],[[1,0],'west'],[[1,1],'tahoe']]){
 const r=await run({app:true,answer});assert.equal(JSON.parse(r.storage.get(setting)).area,area);assert(r.widget);assert(r.menus.length>=1);checks++;
 const next=await run({saved:{area},location:tahoe});assert(next.drawn.includes(area==='west'?'West Slope':'Tahoe Basin'));checks++;
}
const cancel=await run({app:true,answer:-1,saved:{area:'west'}});assert(!cancel.widget);assert.equal(JSON.parse(cancel.storage.get(setting)).area,'west');assert.equal(cancel.gps,0);checks++;
const official=await run({app:true,answer:16});assert.equal(official.opened[0],'https://www.eldoradocounty.ca.gov/Services/Burn-Day');assert(!official.widget);checks++;
// Unknown geography must not inherit even a confirmed EDC prohibition.
const outside=await run({family:'large',location:null,fireHtml:fire.replace('Permit Required','Burning Suspended')});assert(!outside.drawn.includes('Suspended'));checks++;
const previous=fs.readFileSync(path.join(__dirname,'fixtures/loader-release7.txt'),'utf8');
assert.equal(source.split('\n// WIDGET_BODY_START\n')[0].replace(/^\/\/ DONAHUE_RELEASE_VERSION: \d+/,'// DONAHUE_RELEASE_VERSION: 7'),previous);checks++;
for(const family of ['small','medium','large','extraLarge']){
 for(const [area,name,status] of [['placer-west','Western Placer','BURN DAY'],['placer-auburn','Auburn','NO BURN'],['placer-roseville','Roseville','NO BURN'],['yuba-4','Zone 4','BURN DAY'],['sutter-1','Zone 1','NO BURN'],['yuba','County overview','UNCONFIRMED'],['sutter','County overview','NO BURN']]){
  const r=await run({family,saved:{area},fireHtml:regionalFire});single(r,name,status,'West Slope');assert.equal(r.gps,0);checks++;
 }
 const r=await run({family,location:{latitude:38.7521,longitude:-121.288,horizontalAccuracy:10},fireHtml:regionalFire});single(r,'Roseville','NO BURN','West Slope');
}
const blocked=await run({saved:{area:'placer-west'},fireHtml:regionalFire.replace(/Permit Required/g,'Burning Suspended')});single(blocked,'Western Placer','NO BURN','West Slope');
const missing=await run({saved:{area:'placer-west'},fireHtml:fire});single(missing,'Western Placer','UNCONFIRMED','West Slope');
const unavailable=await run({saved:{area:'placer-west'},placerData:'{"error":{}}',fireHtml:regionalFire});single(unavailable,'Western Placer','UNCONFIRMED','West Slope');
const fallback=await run({saved:{area:'yuba-4'},fireHtml:regionalFire,featherPrimaryFailure:true});single(fallback,'Zone 4','BURN DAY','West Slope');
for(const [answer,area] of [[[2,7],'placer-west'],[[3,3],'yuba-4'],[[4,6],'sutter-7']]){
 const r=await run({app:true,answer,fireHtml:regionalFire});assert.equal(JSON.parse(r.storage.get(setting)).area,area);assert.equal(r.menus.length,2);checks++;
}
for(const family of ['small','medium','large','extraLarge']) {
 for(const area of ['amador','calaveras','tuolumne','sacramento','alpine','nevada','sierra','plumas','yolo','solano']){
  const r=await run({family,saved:{area}});single(r,'Local confirmation','CALL TO CONFIRM','West Slope');assert.equal(r.gps,0);checks++;
 }
 const r=await run({family,saved:{area:'butte-rural'},fireHtml:fire.replace('El Dorado County','Butte County')});single(r,'Eligible rural areas','BURN DAY','West Slope');
 const overview=await run({family,saved:{area:'butte'},fireHtml:fire.replace('El Dorado County','Butte County')});single(overview,'County overview','CALL TO CONFIRM','West Slope');
}
const amadorAuto=await run({location:{latitude:38.3488,longitude:-120.7741,horizontalAccuracy:10}});single(amadorAuto,'Local confirmation','CALL TO CONFIRM','West Slope');
const amadorBan=await run({saved:{area:'amador'},fireHtml:fire.replace('El Dorado County','Amador County').replace('Permit Required','Burning Suspended')});single(amadorBan,'Local confirmation','NO BURN','West Slope');
const phone=await run({app:true,answer:17,saved:{area:'amador'}});assert.equal(phone.opened[0],'tel:2092236246');assert.equal(phone.gps,0);checks++;
for(const boundaryCache of [null,'{broken']){
 const r=await run({boundaryCache,location:{latitude:38.7521,longitude:-121.288,horizontalAccuracy:10},fireHtml:regionalFire});single(r,'Roseville','NO BURN','West Slope');
 assert.equal(r.requested.filter(u=>u.includes('boundaries-v9')).length,1);assert.equal(r.storage.get('/docs/DonahueBurnDay/boundaries-v9.json'),boundaries);checks++;
}
const cached=await run({boundaryOffline:true,location:{latitude:38.7521,longitude:-121.288,horizontalAccuracy:10},fireHtml:regionalFire});single(cached,'Roseville','NO BURN','West Slope');assert.equal(cached.requested.filter(u=>u.includes('boundaries-v9')).length,0);checks++;
const lost=await run({boundaryCache:null,boundaryOffline:true,location:{latitude:38.7521,longitude:-121.288,horizontalAccuracy:10},fireHtml:regionalFire});single(lost,'Select an area','UNCONFIRMED','Roseville');
const edcOffline=await run({boundaryCache:null,boundaryOffline:true});single(edcOffline,'West Slope','BURN DAY','Roseville');
const invalid=JSON.parse(boundaries);invalid.counties.amador[0][0]=[-999,38];
const bad=await run({boundaryCache:null,boundaryDownload:JSON.stringify(invalid),location:{latitude:38.3488,longitude:-120.7741,horizontalAccuracy:10}});single(bad,'Select an area','UNCONFIRMED','Local confirmation');assert(!bad.storage.has('/docs/DonahueBurnDay/boundaries-v9.json'));checks++;
const unknownOfficial=await run({app:true,answer:16,location:null});assert.equal(unknownOfficial.opened.length,0);checks++;
console.log(`${checks} selection/render checks passed: single area, different area decisions, GPS fallback, manual persistence, app menu, unchanged loader`);
})().catch(e=>{console.error(e);process.exitCode=1;});
