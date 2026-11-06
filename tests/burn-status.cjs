const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../Donahue_Burn_Day.js'), 'utf8');
const county = fs.readFileSync(path.join(__dirname, 'fixtures/county-2026-11-06.html'), 'utf8');
const fire = fs.readFileSync(path.join(__dirname, 'fixtures/fire-2026-11-06.html'), 'utf8');
const helpers = source.slice(source.indexOf('function combineSources('), source.lastIndexOf('\n}'));
let checks = 0;
function check(value, expected) { assert.deepEqual(JSON.parse(JSON.stringify(value)), expected); checks++; }
function api(instant) {
  const context = vm.createContext({Intl, console, now:new Date(instant), ZONE:'America/Los_Angeles'});
  vm.runInContext('const today = "2026-11-06"; let nextStatusCheck = now.getTime()+1800000;'+helpers+';globalThis.api={parseCounty,parseFire,combineSources,startMinute,refresh:()=>nextStatusCheck}',context);
  return context.api;
}
function statuses(a, html=county) { const c=a.parseCounty(html,'2026-11-06');return ['west','tahoe'].map(k=>a.combineSources(c[k]||{status:'UNKNOWN',detail:'Missing today'},a.parseFire(fire)).status); }
for (const [instant,expected] of [['2026-11-06T15:51:00Z','NO'],['2026-11-06T15:59:59Z','NO'],['2026-11-06T16:00:00Z','YES'],['2026-11-06T16:24:00Z','YES']]) check(statuses(api(instant)),[expected,expected]);
check(new Date(api('2026-11-06T15:51:00Z').refresh()).toISOString(),'2026-11-06T16:21:00.000Z');
const pre=api('2026-11-06T15:51:00Z');statuses(pre);check(new Date(pre.refresh()).toISOString(),'2026-11-06T16:00:00.000Z');
const a=api('2026-11-06T16:24:00Z');
const tables=county.match(/<table\b[^>]*>[\s\S]*?<\/table>/gi);
const heading='<h2>El Dorado County Outdoor Burn Day Status</h2>';
check(statuses(a,heading+tables.slice().reverse().join('')),['YES','YES']);
check(statuses(a,heading+tables[0]),['UNKNOWN','UNKNOWN']);
check(statuses(a,heading+tables[1]+tables[1].replace(/BURN DAY/g,'NO BURN DAY')),['NO','NO']);
check(statuses(a,heading+tables[1]+tables[1].replace(/2026/g,'2027')),['YES','YES']);
check(statuses(a,heading+tables[1].replace(/8:00AM/g,'25:00AM')),['UNKNOWN','UNKNOWN']);
check(statuses(a,heading+tables[1].replace(/8:00AM/g,'08:00')),['UNKNOWN','UNKNOWN']);
check(a.parseFire(fire.replace('November 6','November 7')),'UNKNOWN');
check(a.parseFire(fire.replace('Permit Required','Burning Suspended')),'SUSPENDED');
check(a.combineSources({status:'YES'},'UNKNOWN').status,'UNKNOWN');
check(a.combineSources({status:'UNKNOWN'},'SUSPENDED').status,'NO');
check(a.combineSources({status:'NO'},'OPEN').status,'NO');
for(const [value,minute] of [['8:00AM',480],['12:00 AM',0],['12:00 PM',720],['1:30 p.m.',810],['Effective at 25:00 AM',-1],['Effective at 08:00',-1],['no time',null]])check(a.startMinute(value),minute);
// Keep ongoing suspensions active even when their start date is earlier.
check(statuses(a,heading+tables[0].replace('THURSDAY,','CAL FIRE BURN PERMITS SUSPENDED THURSDAY,')),['NO','NO']);
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
new AsyncFunction(source); checks++;
new AsyncFunction(source.split('\n// WIDGET_BODY_START\n')[1]+'\nawait runWidget();'); checks++;
console.log(`${checks} status and syntax checks passed`);
