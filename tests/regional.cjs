const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../Donahue_Burn_Day.js'),'utf8');
const placer=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/placer-2026-11-06.json'),'utf8'));
const feather=fs.readFileSync(path.join(__dirname,'fixtures/feather-2026-11-06.html'),'utf8');
const fire=fs.readFileSync(path.join(__dirname,'fixtures/fire-2026-11-06.html'),'utf8');
const boundaries=JSON.parse(fs.readFileSync(path.join(__dirname,'../boundaries-v9.json'),'utf8'));
const registry=source.slice(source.indexOf('const PLACER_URL'),source.indexOf('const now =')).replace('await loadRegionData()','TEST_REGIONS');
const oldGeometry=source.split('\n').find(l=>l.startsWith('const AREA_BOUNDARIES'));
const geometryHelpers=source.slice(source.indexOf('function regionForLocation('),source.indexOf('function withTimeout('));
const helpers=source.slice(source.indexOf('function pacificMinute('),source.lastIndexOf('\n}'));
let checks=0;
function api(instant='2026-11-06T20:00:00Z') {
 const ctx=vm.createContext({Intl,console,TEST_REGIONS:boundaries,now:new Date(instant)});
 vm.runInContext(registry+oldGeometry+'\nconst today=dayKey(now);let nextStatusCheck=now.getTime()+1800000;'+geometryHelpers+helpers+'\nglobalThis.api={parsePlacer,parseFeather,parseButte,parseFire,combineSources,solarWindow,regionForLocation,areaFor,AREAS,refresh:()=>nextStatusCheck};',ctx);
 return ctx.api;
}
function check(actual,expected){assert.deepEqual(JSON.parse(JSON.stringify(actual)),expected);checks++;}
const a=api();
function p(key,instant,data=placer){const x=api(instant);return x.parsePlacer(data,x.areaFor(key));}
check(p('placer-west').status,'YES');check(p('placer-auburn').status,'NO');
for(const key of ['placer-lincoln','placer-rocklin','placer-roseville'])check(p(key).status,'NO');
check(p('placer-tahoe','2026-11-06T15:59:00Z').status,'NO');
check(p('placer-tahoe','2026-11-06T16:00:00Z').status,'YES');
check(p('placer-tahoe','2026-11-07T02:00:00Z').status,'NO');
check(p('placer-tahoe','2026-11-07T08:00:00Z').status,'UNKNOWN'); // tomorrow awaiting confirmation
check(p('placer-truckee','2026-11-06T20:00:00Z').status,'YES');
check(p('placer-truckee','2026-11-07T04:00:00Z').status,'UNKNOWN');
for(const instant of ['2026-01-15T20:00:00Z','2026-07-15T19:00:00Z','2028-02-29T20:00:00Z']){
 const window=api(instant).solarWindow('placer-truckee');assert(window.rise<new Date(instant).getTime());assert(window.set>new Date(instant).getTime());checks++;
}
let changed=structuredClone(placer);changed.features.find(f=>f.attributes.OBJECTID===417).attributes.statusDateToday=Date.parse('2026-11-05T08:00:00Z');check(p('placer-west',undefined,changed).status,'UNKNOWN');
changed=structuredClone(placer);changed.features.find(f=>f.attributes.OBJECTID===417).attributes.burnStatusToday='new-unknown-code';check(p('placer-west',undefined,changed).status,'UNKNOWN');
changed=structuredClone(placer);changed.features.push(changed.features.find(f=>f.attributes.OBJECTID===417));check(p('placer-west',undefined,changed).status,'UNKNOWN');
check(p('placer-west',undefined,{}).status,'UNKNOWN');
// The residential decision differs from the district-permit column in the official fixture.
for(const key of ['sutter-1','sutter-7','yuba-1'])check(a.parseFeather(feather,a.areaFor(key)).status,'NO');
check(a.parseFeather(feather,a.areaFor('yuba-4')).status,'YES');
check(api('2026-11-06T16:59:00Z').parseFeather(feather,a.areaFor('yuba-4')).status,'NO');
check(api('2026-11-07T00:00:00Z').parseFeather(feather,a.areaFor('yuba-4')).status,'NO');
check(a.parseFeather(feather,a.areaFor('sutter')).status,'NO');
check(a.parseFeather(feather,a.areaFor('yuba')).status,'UNKNOWN');
check(a.parseFeather(feather.replace('November 6','November 5'),a.areaFor('yuba-4')).status,'UNKNOWN');
check(a.parseFeather(feather.replace('November 6','November 7'),a.areaFor('yuba-4')).status,'UNKNOWN');
check(a.parseFeather(feather.replaceAll('9:00AM to 4:00PM','invalid time'),a.areaFor('yuba-4')).status,'UNKNOWN');
check(a.parseFeather(feather.replace('Residential</th>','Other</th>'),a.areaFor('yuba-4')).status,'UNKNOWN');
check(a.parseFeather(feather.replace('November 6, 2026','Friday'),a.areaFor('yuba-4')).status,'UNKNOWN');
check(a.parseFeather('<h3>November 6, 2026</h3>'+feather.replace('November 6','November 5'),a.areaFor('yuba-4')).status,'UNKNOWN');
check(a.parseFeather(feather.replace(/<tr>\s*<th scope="row"><\/th>\s*<td>2<\/td>[\s\S]*?<\/tr>/,'').replace(/November 6, 2026/,'November 6, 2026'),a.areaFor('sutter')).status,'UNKNOWN');
// County-specific CAL FIRE checks never borrow El Dorado's answer.
check(a.parseFire(fire,'Placer'),'UNKNOWN');
check(a.parseFire(fire.replace(/El Dorado County/g,'Placer County'),'Placer'),'OPEN');
check(a.parseFire(fire.replace(/El Dorado County/g,'Yuba County').replace('Permit Required','Burning Suspended'),'Yuba'),'SUSPENDED');
for(const [point,expected] of [
 [[38.7296,-120.7985],'west'],[[38.9399,-119.9772],'tahoe'],[[38.7521,-121.2880],'placer-roseville'],[[38.8916,-121.2930],'placer-lincoln'],[[38.8966,-121.0769],'placer-auburn'],[[39.14,-121.62],'sutter'],[[39.35,-121.2],'yuba'],[[38.58,-121.49],'sacramento'],[[38.3488,-120.7741],'amador']
])check(a.regionForLocation({latitude:point[0],longitude:point[1],horizontalAccuracy:10}),expected);
check(a.regionForLocation({latitude:39.14,longitude:-121.62,horizontalAccuracy:1500}),null);
assert(source.length<80000,'Existing loader must accept the larger body');checks++;
const old=fs.readFileSync(path.join(__dirname,'fixtures/loader-release7.txt'),'utf8');
assert.equal(source.split('\n// WIDGET_BODY_START\n')[0].replace(/^\/\/ DONAHUE_RELEASE_VERSION: \d+/,'// DONAHUE_RELEASE_VERSION: 7'),old);checks++;
const butte=fs.readFileSync(path.join(__dirname,'fixtures/butte-2026-11-06.html'),'utf8');
check(a.parseButte(butte,a.areaFor('butte-rural')).status,'YES');
check(a.parseButte(butte,a.areaFor('butte')).status,'UNKNOWN');
check(a.parseButte(butte,a.areaFor('butte')).needsCall,true);
check(api('2026-11-06T16:44:00Z').parseButte(butte,a.areaFor('butte-rural')).status,'NO');
check(api('2026-11-06T16:45:00Z').parseButte(butte,a.areaFor('butte-rural')).status,'YES');
check(api('2026-11-07T04:00:00Z').parseButte(butte,a.areaFor('butte-rural')).status,'UNKNOWN');
check(a.parseButte(butte.replace('November 06','November 05'),a.areaFor('butte-rural')).status,'UNKNOWN');
check(a.parseButte(butte.replace('November 06','November 08'),a.areaFor('butte-rural')).status,'UNKNOWN');
check(a.parseButte(butte.replaceAll('8:45am - 1 hour before sunset','10am to noon'),a.areaFor('butte-rural')).status,'UNKNOWN');
check(a.parseButte(butte.replaceAll('Residential Burning','Other Burning'),a.areaFor('butte-rural')).status,'UNKNOWN');
check(a.parseButte(butte.replaceAll('Permissive burn day where burning is allowed.','No burn day.'),a.areaFor('butte')).status,'NO');
for(const [lat,lon,key] of [[38.3488,-120.7741,'amador'],[38.2,-120.6,'calaveras'],[38.0,-120.2,'tuolumne'],[38.69,-119.78,'alpine'],[39.25,-121.0,'nevada'],[39.6,-120.8,'sierra'],[40.0,-120.9,'plumas'],[38.7,-121.8,'yolo'],[38.25,-121.95,'solano'],[39.7,-121.6,'butte']])check(a.regionForLocation({latitude:lat,longitude:lon,horizontalAccuracy:10}),key);
console.log(`${checks} regional checks passed: dated sources, county isolation, residential columns, zone consensus, hours/daylight, geometry, loader size/compatibility`);
