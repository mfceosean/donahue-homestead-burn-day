// DONAHUE_RELEASE_VERSION: 1
// Donahue Homestead Burn Day • install this same file in Scriptable and GitHub.
// Increase the version number above each time you publish changed code.
// Status still comes directly from the official county and CAL FIRE pages.

const UPDATE_URL = "https://raw.githubusercontent.com/mfceosean/donahue-homestead-burn-day/main/Donahue_Burn_Day.js";
const UPDATE_EVERY = 6 * 60 * 60 * 1000;
const RETRY_AFTER = 30 * 60 * 1000;
const BODY_MARKER = "\n// WIDGET_BODY_START\n";
const files = FileManager.local();
const folder = files.joinPath(files.documentsDirectory(), "DonahueBurnDay");
if (!files.fileExists(folder)) files.createDirectory(folder);
const cachedPath = files.joinPath(folder, "last-working.js");
const statePath = files.joinPath(folder, "update-state.json");
let state = { version: 1, nextCheck: 0 };
try {
  if (files.fileExists(statePath)) {
    const saved = JSON.parse(files.readString(statePath));
    if (Number.isSafeInteger(saved.version) && saved.version >= 1) state = saved;
  }
} catch (e) { console.log("Burn Day state: " + e); }
if (!files.fileExists(cachedPath)) state.nextCheck = 0;
let shown = false;

if (Date.now() >= (state.nextCheck || 0)) {
  try {
    const req = new Request(UPDATE_URL + "?t=" + Math.floor(Date.now() / UPDATE_EVERY));
    req.timeoutInterval = 5;
    req.headers = { "Cache-Control": "no-cache" };
    const source = await req.loadString();
    if (!req.response || req.response.statusCode !== 200 ||
        source.length < 10000 || source.length > 80000) throw new Error("Update unavailable");
    const remote = parseRelease(source);
    if (remote.version > state.version) {
      await runBody(remote.body); // A failed version never replaces the cache.
      shown = true;
      files.writeString(cachedPath, source);
      state.version = remote.version;
    }
    state.nextCheck = Date.now() + UPDATE_EVERY;
  } catch (e) {
    console.log("Burn Day update check: " + e);
    state.nextCheck = Date.now() + RETRY_AFTER;
  }
  saveState();
}

if (!shown && files.fileExists(cachedPath)) {
  try {
    const cached = parseRelease(files.readString(cachedPath));
    if (cached.version >= 1) {
      await runBody(cached.body);
      shown = true;
    }
  } catch (e) {
    console.log("Burn Day cached version: " + e);
    state.version = 1;
    state.nextCheck = 0;
    saveState();
  }
}

if (!shown) await runWidget(); // Built-in release 1 also works offline.
Script.complete();

function parseRelease(source) {
  const match = /^\/\/ DONAHUE_RELEASE_VERSION: ([1-9]\d*)\n/.exec(source);
  const markerAt = source.indexOf(BODY_MARKER);
  if (!match || markerAt < 0) throw new Error("Invalid update format");
  const version = Number(match[1]);
  if (!Number.isSafeInteger(version)) throw new Error("Invalid version");
  const body = source.slice(markerAt + BODY_MARKER.length);
  new (Object.getPrototypeOf(async function(){}).constructor)(body + "\nawait runWidget();");
  return { version, body };
}
async function runBody(body) {
  const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
  await new AsyncFunction(body + "\nawait runWidget();")();
}
function saveState() {
  try { files.writeString(statePath, JSON.stringify(state)); }
  catch (e) { console.log("Burn Day state write: " + e); }
}
// WIDGET_BODY_START
async function runWidget() {
// El Dorado County Burn Day • v2.1 • Created by Donahue Homestead
// Paste the whole script into Scriptable. Run once to allow location access.
// Add a small, medium or large Scriptable widget and select this script.
// Location only changes the header; coverage ALWAYS stays El Dorado County.
// Tahoe means the El Dorado County portion, not the entire Tahoe Basin.
// Green: both sources allow. Red: either prohibits. White: unconfirmed.
// CAL FIRE's county entry applies to State Responsibility Areas (SRA).
// No MiniNAS, keys, external artwork, or stored location history required.
// iOS controls refresh timing. Check the visible date before using the status.

const USE_LOCATION = true; // Set false to disable location access.
const PREVIEW_SIZE = "medium"; // "small", "medium", or "large" in the app.
const COUNTY_URL = "https://www.eldoradocounty.ca.gov/Services/Burn-Day";
const FIRE_URL = "https://burnpermit.fire.ca.gov/current-burn-status/";
const ZONE = "America/Los_Angeles";
const now = new Date();
const today = dayKey(now);
const family = config.runsInWidget ? config.widgetFamily : PREVIEW_SIZE;
const small = family === "small";
const large = family === "large" || family === "extraLarge";
const fetched = await Promise.all([getPage(COUNTY_URL), getPage(FIRE_URL), getPlace()]);
let county = {}, fire = "UNKNOWN";
try { if (fetched[0].html) county = parseCounty(fetched[0].html, today); } catch (e) { console.log(String(e)); }
try { if (fetched[1].html) fire = parseFire(fetched[1].html); } catch (e) { console.log(String(e)); }
const place = fetched[2];
const states = {};
for (const key of ["west", "tahoe"]) {
  const local = county[key] || { status: "UNKNOWN", detail: fetched[0].html ? "Today's posting unconfirmed" : "County source unavailable" };
  states[key] = combineSources(local, fire);
}

// Separate, fully drawn compositions avoid undersized cards / empty space.
// Coordinates scale with the widget rather than requiring an iPhone model list.
const W = small ? 360 : 720;
const H = small ? 360 : large ? 754 : 344;
const SCALE = 1.5;
const ctx = new DrawContext();
ctx.size = new Size(W * SCALE, H * SCALE);
ctx.opaque = true;
ctx.respectScreenScale = false;
const C = { ink: "F4F7FC", muted: "AABBD0", faint: "778CA7", green: "50E3A4", red: "FF7181", white: "F4F7FC" };
const date = new Intl.DateTimeFormat("en-US", { timeZone: ZONE, weekday: "short", month: "short", day: "numeric" }).format(now);
const stamp = new Intl.DateTimeFormat("en-US", { timeZone: ZONE, hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(now);
paintBackground();
if (small) paintSmall();
else if (large) paintLarge();
else paintMedium();

const widget = new ListWidget();
widget.setPadding(0, 0, 0, 0);
widget.backgroundImage = ctx.getImage();
widget.url = COUNTY_URL;
widget.refreshAfterDate = new Date(now.getTime() + 30 * 60 * 1000);
Script.setWidget(widget);
if (!config.runsInWidget) {
  if (small) await widget.presentSmall();
  else if (large) await widget.presentLarge();
  else await widget.presentMedium();
}

function box(x, y, w, h) { return new Rect(x * SCALE, y * SCALE, w * SCALE, h * SCALE); }
function point(x, y) { return new Point(x * SCALE, y * SCALE); }
function fill(hex, alpha = 1) { ctx.setFillColor(new Color(hex, alpha)); }
function rect(x, y, w, h, hex, alpha = 1) { fill(hex, alpha); ctx.fillRect(box(x, y, w, h)); }
function rounded(x, y, w, h, r, hex, alpha = 1) {
  const p = new Path();
  p.addRoundedRect(box(x, y, w, h), r * SCALE, r * SCALE);
  fill(hex, alpha); ctx.addPath(p); ctx.fillPath();
}
function label(value, x, y, w, h, size, hex = C.ink, bold = false, align = "left") {
  ctx.setFont(bold ? Font.boldSystemFont(size * SCALE) : Font.systemFont(size * SCALE));
  ctx.setTextColor(new Color(hex));
  if (align === "right") ctx.setTextAlignedRight();
  else if (align === "center") ctx.setTextAlignedCenter();
  else ctx.setTextAlignedLeft();
  ctx.drawTextInRect(String(value), box(x, y, w, h));
}
function polygon(points, hex, alpha = 1) {
  const p = new Path(); p.move(point(...points[0]));
  for (const a of points.slice(1)) p.addLine(point(...a));
  p.closeSubpath(); fill(hex, alpha); ctx.addPath(p); ctx.fillPath();
}
function color(s) { return s === "YES" ? C.green : s === "NO" ? C.red : C.white; }
function statusText(s) { return s === "YES" ? "BURN DAY" : s === "NO" ? "NO BURN" : "UNCONFIRMED"; }
function flame(x, y, size, hex) {
  const p = new Path();
  const q = (a, b) => point(x + a * size, y + b * size);
  p.move(q(.52, 0));
  p.addCurve(q(.82, .38), q(.54, .18), q(.83, .19));
  p.addCurve(q(.87, .81), q(.81, .52), q(1, .59));
  p.addCurve(q(.15, .81), q(.72, 1.08), q(.29, 1.07));
  p.addCurve(q(.24, .35), q(-.02, .58), q(.22, .48));
  p.addCurve(q(.34, .62), q(.23, .49), q(.27, .59));
  p.addCurve(q(.52, 0), q(.54, .40), q(.43, .20));
  p.closeSubpath(); fill(hex); ctx.addPath(p); ctx.fillPath();
  // Dark inner flame keeps the status symbol readable at every size.
  const inner = new Path();
  inner.move(q(.51, .49));
  inner.addCurve(q(.68, .80), q(.52, .63), q(.71, .66));
  inner.addCurve(q(.34, .80), q(.62, .99), q(.39, .99));
  inner.addCurve(q(.51, .49), q(.25, .67), q(.47, .67));
  inner.closeSubpath(); fill("152536"); ctx.addPath(inner); ctx.fillPath();
}
function scene(x, y, w, h, lake, alpha = 1) {
  // Original Sierra silhouettes, a lake, and evergreen trees; entirely offline.
  polygon([[x,y+h],[x,y+h*.52],[x+w*.15,y+h*.27],[x+w*.28,y+h*.49],[x+w*.52,y+h*.05],[x+w*.77,y+h*.48],[x+w*.90,y+h*.23],[x+w,y+h*.47],[x+w,y+h]], "486987", .42*alpha);
  polygon([[x+w*.43,y+h*.22],[x+w*.52,y+h*.05],[x+w*.62,y+h*.24],[x+w*.53,y+h*.19],[x+w*.49,y+h*.26]], "AFD2DD", .33*alpha);
  polygon([[x,y+h],[x,y+h*.73],[x+w*.24,y+h*.43],[x+w*.47,y+h*.71],[x+w*.70,y+h*.42],[x+w,y+h*.70],[x+w,y+h]], "244E64", .9*alpha);
  if (lake) {
    polygon([[x+w*.10,y+h*.83],[x+w*.55,y+h*.65],[x+w*.95,y+h*.87],[x+w*.77,y+h],[x+w*.18,y+h]], "3994AA", .45*alpha);
    for (let i=0;i<4;i++) rect(x+w*(.40+i*.055),y+h*(.78+i*.045),w*(.32-i*.045),1.4,"B2E5E8",.17*alpha);
  }
  for (let i=0;i<6;i++) {
    const tx=x+w*(.03+i*.075), th=h*(.32+(i%3)*.075), ty=y+h-th;
    polygon([[tx,ty],[tx-w*.035,ty+th*.55],[tx-w*.017,ty+th*.55],[tx-w*.044,ty+th*.82],[tx+w*.044,ty+th*.82],[tx+w*.017,ty+th*.55],[tx+w*.035,ty+th*.55]], "0A1B28", .88*alpha);
    rect(tx-w*.005,ty+th*.75,w*.010,th*.25,"0A1B28",.88*alpha);
  }
}
function paintBackground() {
  for (let i=0;i<H;i+=2) {
    const t=i/H;
    const rgb=[Math.round(19-9*t),Math.round(35-16*t),Math.round(52-21*t)];
    rect(0,i,W,2,rgb.map(n=>n.toString(16).padStart(2,"0")).join(""));
  }
  fill("7AA9BF",.055); ctx.fillEllipse(box(W*.60,-W*.28,W*.75,W*.75));
}
function header() {
  label("Burn Day",32,22,300,60,large?48:42,C.ink,true);
  label(place.label,355,32,333,34,21,C.muted,false,"right");
  label("EL DORADO COUNTY • OUTDOOR BURNING",32,79,490,26,17,C.faint,true);
  label(date,510,79,178,26,18,C.muted,false,"right");
}
function card(key,x,y,w,h,big) {
  const s=states[key], hex=color(s.status);
  rounded(x,y,w,h,24,"FFFFFF",.055);
  rounded(x+1,y+18,4,h-36,2,hex,.8);
  if (!big) scene(x+w-133,y+h-76,120,64,key==="tahoe",.35);
  label(key==="west"?"West Slope":"Tahoe Basin",x+22,y+15,w-44,38,big?28:23,C.ink,true);
  if (big) label(key==="west"?"Western El Dorado County":"El Dorado County portion",x+22,y+52,w-44,25,16,C.muted);
  const sy=y+(big?91:55), fs=big?56:43;
  flame(x+20,sy,fs,hex);
  label(statusText(s.status),x+fs+29,sy+5,w-fs-46,big?58:48,s.status==="UNKNOWN"?(big?24:20):(big?35:32),hex,true);
  label(s.detail,x+22,y+(big?158:112),w-44,big?58:43,big?20:17,C.muted);
  if (big) {
    scene(x+10,y+h-132,w-20,120,key==="tahoe");
    label(key==="west"?"SIERRA FOOTHILLS":"SOUTH SHORE",x+22,y+h-29,w-44,20,14,C.muted,true);
  }
}
function paintSmall() {
  label("Burn Day",23,17,220,49,38,C.ink,true);
  label(date,208,32,129,28,16,C.muted,false,"right");
  label(place.label,24,68,312,24,16,C.muted);
  label("EL DORADO COUNTY",24,93,312,20,13,C.faint,true);
  for (const [index,key] of ["west","tahoe"].entries()) {
    const y=121+index*86, s=states[key], hex=color(s.status);
    rounded(22,y,316,78,17,"FFFFFF",.06);
    scene(242,y+9,85,61,key==="tahoe",.65);
    label(key==="west"?"West Slope":"Tahoe · EDC portion",35,y+7,254,23,17,C.muted,true);
    flame(34,y+34,28,hex);
    label(statusText(s.status),73,y+33,249,34,s.status==="UNKNOWN"?22:28,hex,true);
  }
  label("Checked "+stamp,24,309,312,23,16,C.muted);
  label("Created by Donahue Homestead",24,335,312,17,12,C.faint);
}
function paintMedium() {
  header();
  card("west",32,111,318,161,false);
  card("tahoe",370,111,318,161,false);
  label("Checked "+stamp,32,290,370,24,17,C.muted);
  label("Tap for official status",413,290,275,24,17,C.muted,false,"right");
  label("Tahoe: EDC portion • permits apply",32,318,318,20,12,C.faint);
  label("Created by Donahue Homestead",370,318,318,20,13,C.faint,false,"right");
}
function paintLarge() {
  header();
  card("west",32,130,318,355,true);
  card("tahoe",370,130,318,355,true);
  rounded(32,505,656,145,22,"FFFFFF",.045);
  label("SOURCE",54,522,210,25,16,C.faint,true);
  label("WEST SLOPE",277,522,178,25,16,C.faint,true);
  label("TAHOE · EDC",482,522,180,25,16,C.faint,true);
  label("County AQMD",54,560,215,30,21,C.muted,true);
  label("CAL FIRE · SRA",54,604,215,30,21,C.muted,true);
  for (const [i,key] of ["west","tahoe"].entries()) {
    const cs=county[key]?.status||"UNKNOWN", x=277+i*205;
    label(cs==="YES"?"Burn day":cs==="NO"?"No burn":"Unconfirmed",x,560,180,30,21,color(cs),true);
    label(fire==="OPEN"?"Permits apply":fire==="SUSPENDED"?"Suspended":"Unconfirmed",x,604,180,30,21,color(fire==="OPEN"?"YES":fire==="SUSPENDED"?"NO":"UNKNOWN"),true);
  }
  label("Checked "+stamp,32,670,656,30,22,C.muted);
  label("Tap for official status • permits / local rules apply",32,702,656,25,17,C.faint);
  label("Created by Donahue Homestead",32,730,656,18,13,C.faint,false,"center");
}
async function getPlace() {
  if (!USE_LOCATION) return {label:"EL DORADO COUNTY"};
  const fallback={label:"LOCATION UNAVAILABLE"};
  try {
    return await withTimeout((async()=>{
      Location.setAccuracyToHundredMeters();
      const loc=await Location.current();
      if (!Number.isFinite(loc.latitude)||!Number.isFinite(loc.longitude)) return fallback;
      const places=await Location.reverseGeocode(loc.latitude,loc.longitude,"en_US");
      const p=places?.[0];
      if (!p) return fallback;
      // Use Apple's place name, never a guessed county boundary or burn region.
      const city=p.locality||p.subAdministrativeArea||p.administrativeArea;
      return city?{label:"IN "+String(city).toUpperCase().slice(0,26)}:fallback;
    })(),config.runsInWidget?3500:15000,fallback);
  } catch(e) { return fallback; }
}
function withTimeout(promise,ms,fallback) {
  return new Promise(resolve=>{
    let done=false;
    const finish=value=>{if(done)return;done=true;timer.invalidate();resolve(value);};
    const timer=Timer.schedule(ms,false,()=>finish(fallback));
    promise.then(finish,()=>finish(fallback));
  });
}

function combineSources(county, fire) {
  // Confirmed NO wins over a conflicting YES or an unavailable source.
  if (county.status === "NO") return county;
  if (fire === "SUSPENDED") return { status: "NO", detail: "CAL FIRE: suspended (SRA)" };
  if (county.status === "YES" && fire === "OPEN") return { status: "YES", detail: "Both sources allow burning" };
  return { status: "UNKNOWN", detail: county.status === "UNKNOWN" ? county.detail : "CAL FIRE check unavailable" };
}

async function getPage(url) {
  try {
    const req = new Request(url);
    req.timeoutInterval = 10;
    req.headers = { "User-Agent": "Mozilla/5.0", "Accept": "text/html", "Cache-Control": "no-cache" };
    const html = await req.loadString();
    if (!req.response || req.response.statusCode !== 200 || html.length > 1500000) throw new Error("Unexpected response");
    return { html };
  } catch (e) {
    console.log("Burn Day: " + url + " • " + String(e));
    return { html: null };
  }
}

function dayKey(date) {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const get = type => p.find(x => x.type === type).value;
  return get("year") + "-" + get("month") + "-" + get("day");
}

function plain(html) {
  return html.replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&nbsp;|&ensp;|&emsp;/gi, " ")
    .replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&apos;/gi, "'")
    .replace(/\s+/g, " ").trim();
}

function dates(value) {
  const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  const found = [];
  const add = (y, m, d) => {
    const dt = new Date(Date.UTC(y, m - 1, d));
    if (dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d)
      found.push(String(y) + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0"));
  };
  for (const m of value.matchAll(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?\s*,?\s*(20\d{2})\b/gi)) add(+m[3], months.indexOf(m[1].toLowerCase()) + 1, +m[2]);
  for (const m of value.matchAll(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/g)) add(+m[3], +m[1], +m[2]);
  for (const m of value.matchAll(/\b(20\d{2})-(\d{2})-(\d{2})\b/g)) add(+m[1], +m[2], +m[3]);
  return [...new Set(found)];
}

function parseCounty(html, targetDay) {
  const records = { west: [], tahoe: [] };
  const clean = html.replace(/<!--[\s\S]*?-->/g, " ").replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ");
  const heading = /<h[1-6]\b[^>]*>\s*El Dorado County Outdoor Burn Day Status\s*<\/h[1-6]>/i.exec(clean);
  if (!heading) return {};
  const tail = clean.slice(heading.index + heading[0].length);
  const section = tail.split(/<h[12]\b/i)[0];
  let lastEnd = 0;
  for (const match of section.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)) {
    // Dates may sit above a table or in its spanning header row.
    const prefix = plain(section.slice(lastEnd, match.index));
    lastEnd = match.index + match[0].length;
    const table = match[0];
    const rows = [...table.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)];
    const headerRows = rows.filter(r => !/WEST\s+SLOPE|(?:SOUTH\s+LAKE\s+)?TAHOE\s+BASIN/i.test(plain(r[0]))).map(r => plain(r[0])).join(" ");
    const context = prefix + " " + headerRows;
    const suspension = /(?:CAL\s*FIRE|BURN\s+PERMITS?).{0,35}(?:HAS\s+)?SUSPENDED|SUSPENDED\s+ALL\s+BURN\s+PERMITS/i.test(context)
      && !/LIFTED|RESCINDED|NO\s+LONGER|NOT\s+SUSPENDED/i.test(context);
    const ds = dates(context);
    for (const row of rows) {
      const cells = [...row[0].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(m => plain(m[1]));
      if (cells.length < 2) continue;
      const key = /WEST\s+SLOPE/i.test(cells[0]) ? "west" : /TAHOE/i.test(cells[0]) ? "tahoe" : null;
      if (!key) continue;
      const value = cells.slice(1).join(" ").toUpperCase();
      const rowDates = dates(value);
      const applicable = rowDates.length ? rowDates : ds;
      let status = "UNKNOWN", detail = "Posting not dated for today";
      const isNo = /\bNO[ -]+BURN\b|\bNON[ -]?BURN\b|\bNOT\s+(?:A\s+)?BURN\s+DAY\b/.test(value);
      const isYes = /^(?:YES[ :–-]*)?(?:BURN(?:\s+DAY)?|PERMISSIVE\s+BURN\s+DAY|BURNING\s+(?:ALLOWED|PERMITTED))[.!\s]*$/.test(value);
      if (applicable.length === 1 && applicable[0] === targetDay) {
        if (isNo) { status = "NO"; detail = "County reports no burning"; }
        else if (isYes && !suspension) { status = "YES"; detail = "Permits / local rules apply"; }
      } else if (isNo && suspension && applicable.length === 1 && applicable[0] <= targetDay) {
        // An explicitly ongoing suspension is not a stale daily forecast.
        status = "NO"; detail = "Burn permits suspended";
      } else if (applicable.length === 1) {
        detail = "Posting: " + applicable[0].slice(5) + " • verify today";
      }
      records[key].push({ status, detail });
    }
  }
  const out = {};
  for (const key of ["west", "tahoe"]) {
    const rs = records[key];
    if (!rs.length) continue;
    // A confirmed prohibition wins even if duplicate postings disagree.
    out[key] = rs.find(s => s.status === "NO") || (rs.every(s => s.status === rs[0].status) ? rs[0] : { status: "UNKNOWN", detail: "Conflicting county postings" });
  }
  return out;
}

function parseFire(html) {
  const clean = html.replace(/<!--[\s\S]*?-->/g, " ");
  const values = [];
  for (const row of clean.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)) {
    const cells = [...row[0].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(m => plain(m[1]));
    if (!/^El\s+Dorado\s+County$/i.test(cells[0] || "")) continue;
    const ds = dates(cells[2] || "");
    if (ds.length !== 1 || ds[0] > today) { values.push("UNKNOWN"); continue; }
    const s = cells[1] || "";
    values.push(/^Burning\s+Suspended\b/i.test(s) ? "SUSPENDED" : /^(?:Burning\s+Allowed|Permit\s+Required)\b/i.test(s) ? "OPEN" : "UNKNOWN");
  }
  if (values.includes("SUSPENDED")) return "SUSPENDED";
  return values.length && values.every(v => v === values[0]) ? values[0] : "UNKNOWN";
}

}
