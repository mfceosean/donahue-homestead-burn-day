// DONAHUE_RELEASE_VERSION: 9
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
// Regional Burn Status • release 9 • Created by Donahue Homestead
// Paste the whole script into Scriptable. Run once to allow location access.
// Add a small, medium or large Scriptable widget and select this script.
// Show one automatically located or manually selected burn area.
// Areas retain county and district boundaries; one area is displayed at a time.
// Green: both sources allow. Red: either prohibits. White: unconfirmed.
// CAL FIRE's county entry applies to State Responsibility Areas (SRA).
// No MiniNAS, keys, external artwork, or stored location history required.
// iOS controls refresh timing. Check the visible date before using the status.

const USE_LOCATION = true; // Set false to disable location access.

// Official EDC GIS CountyBoundary/0 and TRPABoundary/3 geometries.
// Simplified to 0.001 degrees; near-boundary locations require manual selection.
// Coordinates are tested locally: no GPS coordinates are saved or sent to GIS.
const AREA_BOUNDARIES = {"county":[[[[-120.1492,38.6371],[-120.1588,38.6326],[-120.171,38.632],[-120.1788,38.6335],[-120.1912,38.6308],[-120.1962,38.6255],[-120.2017,38.6244],[-120.2065,38.6279],[-120.2136,38.6278],[-120.2145,38.6223],[-120.22,38.621],[-120.2237,38.6171],[-120.223,38.6153],[-120.2264,38.6088],[-120.223,38.6039],[-120.232,38.6001],[-120.2326,38.5939],[-120.2312,38.5918],[-120.2334,38.5881],[-120.2388,38.5856],[-120.2424,38.5863],[-120.25,38.5843],[-120.2527,38.5819],[-120.261,38.5798],[-120.2612,38.5749],[-120.2662,38.5658],[-120.2664,38.5611],[-120.2738,38.5589],[-120.2803,38.5591],[-120.286,38.5562],[-120.2974,38.5562],[-120.3014,38.5496],[-120.3172,38.5434],[-120.3373,38.5455],[-120.3459,38.5414],[-120.3519,38.546],[-120.3564,38.5473],[-120.364,38.5444],[-120.3769,38.5448],[-120.3808,38.543],[-120.3839,38.5386],[-120.3891,38.5406],[-120.399,38.5371],[-120.4027,38.5375],[-120.4134,38.5311],[-120.4246,38.5304],[-120.4337,38.5267],[-120.4396,38.529],[-120.4492,38.5288],[-120.4586,38.524],[-120.4856,38.5213],[-120.4911,38.5174],[-120.4975,38.5166],[-120.4999,38.5144],[-120.5106,38.5115],[-120.5372,38.5096],[-120.5538,38.5119],[-120.5796,38.5035],[-120.5925,38.5046],[-120.6063,38.5024],[-120.6126,38.5046],[-120.6147,38.5032],[-120.6219,38.5045],[-120.6284,38.5032],[-120.639,38.5077],[-120.6511,38.51],[-120.6576,38.5133],[-120.6592,38.5156],[-120.6773,38.5178],[-120.6795,38.5234],[-120.6831,38.5264],[-120.6905,38.5278],[-120.6998,38.5322],[-120.7043,38.5362],[-120.7066,38.535],[-120.7148,38.5392],[-120.7222,38.5469],[-120.7276,38.5468],[-120.7311,38.5488],[-120.7364,38.5455],[-120.7391,38.5484],[-120.7472,38.5484],[-120.7487,38.551],[-120.7468,38.553],[-120.7498,38.5534],[-120.7549,38.5513],[-120.7602,38.5554],[-120.7693,38.5524],[-120.7794,38.5545],[-120.7838,38.5508],[-120.7884,38.5543],[-120.7928,38.5547],[-120.7943,38.5577],[-120.8009,38.5561],[-120.8015,38.5589],[-120.8047,38.5601],[-120.805,38.5584],[-120.8104,38.5576],[-120.8126,38.5598],[-120.8102,38.5616],[-120.8134,38.5623],[-120.816,38.5613],[-120.8167,38.5583],[-120.8234,38.5601],[-120.8255,38.5559],[-120.8327,38.5561],[-120.8361,38.5514],[-120.8408,38.5562],[-120.8479,38.5537],[-120.8497,38.5507],[-120.8562,38.5484],[-120.8565,38.5428],[-120.8626,38.5431],[-120.8636,38.5352],[-120.8715,38.5365],[-120.874,38.5389],[-120.8733,38.5425],[-120.8766,38.5433],[-120.8781,38.5396],[-120.8838,38.5365],[-120.8807,38.5301],[-120.8861,38.5248],[-120.8896,38.5248],[-120.8924,38.5287],[-120.8949,38.5282],[-120.9026,38.5312],[-120.9056,38.5241],[-120.909,38.524],[-120.911,38.5206],[-120.923,38.5192],[-120.9263,38.5146],[-120.9313,38.5184],[-120.9359,38.5188],[-120.9378,38.5269],[-120.9415,38.5286],[-120.9466,38.5229],[-120.9529,38.5211],[-120.9575,38.5229],[-120.9643,38.5203],[-120.9699,38.521],[-120.9745,38.5159],[-120.9805,38.5152],[-120.9875,38.5165],[-120.9944,38.5137],[-121.001,38.5187],[-121.0067,38.5192],[-121.0093,38.5179],[-121.0095,38.5145],[-121.0114,38.5124],[-121.0133,38.513],[-121.0193,38.5088],[-121.0275,38.5081],[-121.0853,38.6477],[-121.1186,38.717],[-121.1187,38.715],[-121.1235,38.7105],[-121.1332,38.7055],[-121.1402,38.7117],[-121.1458,38.7116],[-121.1435,38.7173],[-121.1455,38.7189],[-121.1487,38.7314],[-121.1356,38.7383],[-121.13,38.7499],[-121.1238,38.752],[-121.1228,38.7571],[-121.124,38.7599],[-121.1206,38.7703],[-121.1111,38.7751],[-121.105,38.7856],[-121.1066,38.7916],[-121.1049,38.7945],[-121.1053,38.7969],[-121.1014,38.7978],[-121.1023,38.7999],[-121.0991,38.8038],[-121.101,38.8065],[-121.0998,38.8102],[-121.1077,38.8145],[-121.1064,38.8172],[-121.1024,38.8165],[-121.0986,38.8183],[-121.0967,38.8145],[-121.0944,38.814],[-121.0849,38.8164],[-121.084,38.8223],[-121.0899,38.8274],[-121.0877,38.8328],[-121.0853,38.8347],[-121.0821,38.8349],[-121.0734,38.8425],[-121.0583,38.8469],[-121.0577,38.8512],[-121.0618,38.8598],[-121.0551,38.8639],[-121.0529,38.8685],[-121.0569,38.8769],[-121.0618,38.8825],[-121.0447,38.8899],[-121.0479,38.8948],[-121.0534,38.897],[-121.0535,38.8992],[-121.0482,38.9049],[-121.0437,38.9071],[-121.0408,38.9152],[-121.0378,38.9155],[-121.0333,38.9128],[-121.019,38.9181],[-121.0117,38.9165],[-121.007,38.9178],[-121.0052,38.9201],[-121.0023,38.9179],[-120.9991,38.9181],[-120.9969,38.921],[-120.9909,38.9236],[-120.9916,38.9281],[-120.9758,38.9293],[-120.971,38.933],[-120.9647,38.933],[-120.9579,38.9389],[-120.9501,38.9387],[-120.9427,38.9355],[-120.9387,38.9356],[-120.9369,38.9423],[-120.9384,38.9423],[-120.9382,38.9564],[-120.9405,38.9618],[-120.936,38.9642],[-120.9232,38.961],[-120.9139,38.9551],[-120.9015,38.9529],[-120.8911,38.9597],[-120.8883,38.9598],[-120.8824,38.957],[-120.8639,38.9543],[-120.8598,38.9517],[-120.8578,38.9566],[-120.8524,38.9593],[-120.8557,38.9675],[-120.8499,38.9763],[-120.841,38.9756],[-120.8386,38.9717],[-120.8339,38.9719],[-120.8329,38.9777],[-120.8294,38.9806],[-120.8285,38.9896],[-120.8231,38.9934],[-120.8159,38.9945],[-120.8128,39],[-120.8014,39.0008],[-120.7974,38.9962],[-120.792,38.9993],[-120.7863,38.9996],[-120.7799,39.0044],[-120.774,39.0056],[-120.7739,39.007],[-120.771,39.0065],[-120.7681,39.0093],[-120.7653,39.0097],[-120.7636,39.0085],[-120.7665,39.0066],[-120.7669,39.0043],[-120.7618,39.0018],[-120.7601,39.0032],[-120.7638,39.0041],[-120.7636,39.0064],[-120.7604,39.0055],[-120.7579,39.0078],[-120.7523,39.0054],[-120.7498,39.0096],[-120.747,39.0104],[-120.7461,39.0091],[-120.7484,39.003],[-120.7439,39.0057],[-120.7422,39.0016],[-120.736,39.0007],[-120.7295,39.004],[-120.7234,38.9993],[-120.7226,38.9933],[-120.7184,38.9903],[-120.7165,38.9867],[-120.7116,38.9859],[-120.7051,38.9813],[-120.6933,38.985],[-120.6893,38.9896],[-120.6842,38.9895],[-120.6852,38.9838],[-120.6804,38.9775],[-120.6836,38.9749],[-120.6825,38.97],[-120.6839,38.9677],[-120.6797,38.9667],[-120.677,38.9634],[-120.6739,38.9627],[-120.673,38.9585],[-120.6652,38.9574],[-120.6583,38.9534],[-120.6558,38.9543],[-120.6544,38.9482],[-120.6508,38.949],[-120.6478,38.9468],[-120.6451,38.9474],[-120.6426,38.9444],[-120.6366,38.9434],[-120.6303,38.9466],[-120.6223,38.943],[-120.6129,38.9431],[-120.6055,38.9342],[-120.5987,38.9367],[-120.5941,38.9362],[-120.5925,38.9316],[-120.5877,38.9315],[-120.5853,38.9284],[-120.5864,38.9242],[-120.584,38.9211],[-120.5808,38.9206],[-120.5789,38.9175],[-120.5709,38.9139],[-120.5673,38.915],[-120.5647,38.9136],[-120.5588,38.9159],[-120.5561,38.9151],[-120.5531,38.9203],[-120.5466,38.9205],[-120.5451,38.9269],[-120.5345,38.926],[-120.5318,38.9295],[-120.5274,38.9315],[-120.5237,38.9303],[-120.5166,38.9319],[-120.5121,38.9311],[-120.511,38.934],[-120.5051,38.9347],[-120.502,38.9412],[-120.4928,38.9432],[-120.4928,38.9496],[-120.4876,38.952],[-120.4859,38.9591],[-120.4796,38.9599],[-120.4764,38.9634],[-120.471,38.9656],[-120.4692,38.9706],[-120.4663,38.9721],[-120.4618,38.9783],[-120.4601,38.9846],[-120.4511,38.9884],[-120.4537,38.9951],[-120.4529,38.9981],[-120.4493,39.0008],[-120.4497,39.006],[-120.4452,39.0095],[-120.4453,39.0172],[-120.4425,39.0228],[-120.4392,39.0239],[-120.436,39.0283],[-120.3282,39.0225],[-120.2594,39.0235],[-120.2594,39.0248],[-120.2404,39.0237],[-120.2402,39.0309],[-120.1842,39.031],[-120.1836,39.0384],[-120.1651,39.0385],[-120.165,39.0458],[-120.1531,39.0458],[-120.1529,39.0602],[-120.1436,39.0601],[-120.1436,39.0673],[-120.0064,39.0674],[-120.0066,39.0032],[-119.9045,38.9333],[-119.9054,38.9282],[-119.8995,38.9233],[-119.892,38.9182],[-119.8875,38.9181],[-119.8832,38.9051],[-119.8796,38.8997],[-119.8845,38.8943],[-119.881,38.8913],[-119.8795,38.8869],[-119.8828,38.8813],[-119.8888,38.8791],[-119.8788,38.8752],[-119.877,38.8714],[-119.8774,38.8684],[-119.88,38.8643],[-119.892,38.8569],[-119.9001,38.8575],[-119.9057,38.8557],[-119.9085,38.845],[-119.9084,38.8344],[-119.9119,38.8322],[-119.9229,38.8295],[-119.924,38.8252],[-119.9211,38.8214],[-119.9309,38.8152],[-119.9316,38.8123],[-119.9426,38.8028],[-119.9441,38.7968],[-119.9397,38.7942],[-119.9479,38.7851],[-119.948,38.7817],[-119.9649,38.7761],[-120.0725,38.7027],[-120.082,38.7008],[-120.0819,38.702],[-120.0773,38.7019],[-120.0772,38.709],[-120.0975,38.7085],[-120.0976,38.7034],[-120.1043,38.7058],[-120.1117,38.7049],[-120.1224,38.6948],[-120.124,38.6902],[-120.1231,38.6872],[-120.1164,38.6798],[-120.1213,38.6689],[-120.1313,38.6608],[-120.1344,38.6553],[-120.1342,38.6533],[-120.131,38.6509],[-120.1315,38.6491],[-120.1391,38.638],[-120.1492,38.6371]]]],"tahoe":[[[[-120.0055,39.28],[-120.0016,39.2777],[-119.9947,39.2819],[-119.9922,39.2883],[-119.9841,39.2874],[-119.975,39.2937],[-119.9698,39.294],[-119.9599,39.2909],[-119.9572,39.2943],[-119.952,39.297],[-119.953,39.2999],[-119.9508,39.3016],[-119.9483,39.3088],[-119.9446,39.3108],[-119.947,39.3153],[-119.9424,39.325],[-119.9279,39.3223],[-119.9235,39.3201],[-119.9215,39.3175],[-119.9257,39.305],[-119.9246,39.3031],[-119.92,39.3002],[-119.916,39.3001],[-119.9135,39.292],[-119.9027,39.2929],[-119.8974,39.2904],[-119.8981,39.2889],[-119.8961,39.2868],[-119.8975,39.283],[-119.8956,39.2817],[-119.8952,39.278],[-119.9028,39.2733],[-119.8983,39.2657],[-119.9009,39.2625],[-119.9018,39.2493],[-119.9064,39.2361],[-119.8982,39.2328],[-119.8974,39.2286],[-119.9013,39.2213],[-119.9054,39.218],[-119.9105,39.2029],[-119.9048,39.1955],[-119.9004,39.1965],[-119.8947,39.1886],[-119.8873,39.1884],[-119.8856,39.1836],[-119.8864,39.18],[-119.8827,39.18],[-119.8852,39.1761],[-119.885,39.1682],[-119.8822,39.1647],[-119.8876,39.1583],[-119.8833,39.154],[-119.885,39.1511],[-119.8853,39.1435],[-119.8871,39.1405],[-119.8942,39.1356],[-119.8976,39.13],[-119.9026,39.1269],[-119.9002,39.1228],[-119.904,39.1189],[-119.8958,39.1089],[-119.8978,39.0975],[-119.8939,39.0885],[-119.8787,39.0814],[-119.8852,39.0793],[-119.8862,39.0754],[-119.8922,39.0721],[-119.8926,39.0633],[-119.8908,39.0599],[-119.8927,39.0559],[-119.8892,39.0487],[-119.8815,39.043],[-119.8931,39.0362],[-119.891,39.0329],[-119.8877,39.0326],[-119.8911,39.0244],[-119.8865,39.0207],[-119.8848,39.0151],[-119.8889,39.0103],[-119.8893,39.0016],[-119.8876,38.9989],[-119.8902,38.9932],[-119.8813,38.9892],[-119.8782,38.9893],[-119.878,38.9873],[-119.8801,38.9841],[-119.8893,38.979],[-119.8867,38.9692],[-119.8879,38.9682],[-119.8857,38.9668],[-119.8869,38.963],[-119.8933,38.9553],[-119.8959,38.9457],[-119.9074,38.9421],[-119.9043,38.9341],[-119.9052,38.928],[-119.892,38.9183],[-119.8878,38.9184],[-119.8862,38.9157],[-119.8834,38.9048],[-119.8797,38.8995],[-119.8846,38.8942],[-119.8809,38.8909],[-119.8795,38.887],[-119.8828,38.8813],[-119.8889,38.8791],[-119.8832,38.8758],[-119.8788,38.8751],[-119.8769,38.871],[-119.8802,38.8641],[-119.8916,38.8571],[-119.9002,38.8575],[-119.9057,38.8557],[-119.9086,38.845],[-119.9084,38.8344],[-119.923,38.8295],[-119.924,38.8253],[-119.9211,38.8214],[-119.9307,38.8154],[-119.9316,38.8123],[-119.9429,38.8022],[-119.9442,38.7967],[-119.9407,38.7957],[-119.9397,38.7938],[-119.9472,38.7861],[-119.948,38.7816],[-119.9595,38.7786],[-119.962,38.7767],[-119.9676,38.7764],[-119.9698,38.7725],[-119.9684,38.7683],[-119.9711,38.7641],[-119.9797,38.7631],[-119.9818,38.7616],[-119.9853,38.7533],[-119.983,38.7474],[-119.9853,38.7395],[-119.9883,38.7369],[-119.985,38.7337],[-119.9847,38.7287],[-119.9881,38.7224],[-119.9858,38.7156],[-119.9901,38.7094],[-120.0047,38.704],[-120.0121,38.7084],[-120.0167,38.709],[-120.0215,38.7126],[-120.0262,38.7211],[-120.0323,38.725],[-120.0346,38.7321],[-120.0371,38.7348],[-120.0519,38.7401],[-120.0524,38.7463],[-120.0541,38.7492],[-120.0498,38.7532],[-120.052,38.7555],[-120.0514,38.7585],[-120.0469,38.7603],[-120.0461,38.7631],[-120.047,38.7682],[-120.052,38.7735],[-120.048,38.7873],[-120.0541,38.791],[-120.0538,38.795],[-120.0454,38.803],[-120.0396,38.8031],[-120.0284,38.8077],[-120.0286,38.8112],[-120.0304,38.813],[-120.0289,38.8161],[-120.0297,38.8225],[-120.0343,38.8272],[-120.0433,38.8317],[-120.0598,38.8323],[-120.0635,38.8312],[-120.0737,38.8328],[-120.0984,38.8292],[-120.1017,38.8331],[-120.1056,38.8343],[-120.1075,38.8381],[-120.1067,38.8434],[-120.1116,38.8532],[-120.121,38.8596],[-120.1221,38.8646],[-120.1244,38.8669],[-120.1316,38.8701],[-120.1379,38.8695],[-120.1479,38.8777],[-120.1484,38.8804],[-120.1527,38.885],[-120.1539,38.8902],[-120.1511,38.9003],[-120.1555,38.9052],[-120.155,38.9086],[-120.1613,38.9145],[-120.1645,38.9228],[-120.1611,38.9279],[-120.1466,38.9344],[-120.1468,38.9383],[-120.1513,38.9484],[-120.15,38.9546],[-120.1425,38.9591],[-120.1411,38.9656],[-120.1425,38.9681],[-120.1492,38.9701],[-120.1517,38.9734],[-120.1521,38.9771],[-120.1585,38.9814],[-120.1611,38.982],[-120.1655,38.9785],[-120.1701,38.9777],[-120.1844,38.9833],[-120.1891,38.9905],[-120.193,38.9931],[-120.1989,39.0064],[-120.2039,39.0116],[-120.2069,39.0182],[-120.2062,39.0207],[-120.1956,39.0247],[-120.1894,39.0292],[-120.1951,39.0358],[-120.1925,39.0462],[-120.2005,39.0483],[-120.2012,39.0551],[-120.1981,39.0658],[-120.2078,39.061],[-120.2176,39.0637],[-120.2249,39.0638],[-120.2313,39.0667],[-120.2309,39.0736],[-120.2328,39.0764],[-120.2523,39.0844],[-120.2477,39.094],[-120.2482,39.0992],[-120.237,39.104],[-120.2368,39.1082],[-120.2336,39.1123],[-120.2422,39.1181],[-120.2477,39.1248],[-120.2441,39.1291],[-120.2433,39.134],[-120.2467,39.1406],[-120.2466,39.1471],[-120.24,39.1483],[-120.2343,39.1513],[-120.2271,39.1597],[-120.2202,39.1589],[-120.2186,39.1635],[-120.2092,39.1617],[-120.2092,39.1834],[-120.1702,39.1837],[-120.1699,39.1899],[-120.1822,39.1909],[-120.1822,39.1988],[-120.1797,39.2021],[-120.182,39.2079],[-120.1799,39.2108],[-120.1803,39.2136],[-120.1767,39.2146],[-120.177,39.217],[-120.1699,39.2188],[-120.1592,39.2183],[-120.1448,39.2202],[-120.1436,39.2233],[-120.1458,39.2294],[-120.1426,39.2387],[-120.1404,39.241],[-120.1279,39.244],[-120.1231,39.2492],[-120.0935,39.2523],[-120.0845,39.2611],[-120.0718,39.2613],[-120.0539,39.2675],[-120.05,39.273],[-120.0505,39.2806],[-120.0433,39.2809],[-120.0386,39.2842],[-120.033,39.2853],[-120.0331,39.2914],[-120.0288,39.2909],[-120.0235,39.2925],[-120.0164,39.2915],[-120.0099,39.2861],[-120.0055,39.28]]]]};

const PREVIEW_SIZE = "medium"; // "small", "medium", or "large" in the app.
const COUNTY_URL = "https://www.eldoradocounty.ca.gov/Services/Burn-Day";
const FIRE_URL = "https://burnpermit.fire.ca.gov/current-burn-status/";

const PLACER_URL = "https://www.placer.ca.gov/1671/Burn-Days";
const FEATHER_URL = "https://www.fraqmdca.gov/burn-day-status";
const PLACER_DATA = "https://services9.arcgis.com/NENkjkswKTzMfG3A/arcgis/rest/services/Burn_Day_Status_Public/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&f=json";
// Official Placer public burn-zone geometry; simplified by its ArcGIS service to .002 degrees.
const regionData = await loadRegionData();
const PLACER_BOUNDARIES = regionData?.placer || {};
// US Census TIGERweb State_County/MapServer/1; .002-degree simplification.
const FEATHER_COUNTIES = regionData?.counties || {};
const AREAS = [{"key":"west","county":"El Dorado","name":"West Slope","provider":"edc"},{"key":"tahoe","county":"El Dorado","name":"Tahoe Basin","provider":"edc"},{"key":"placer-tahoe","county":"Placer","name":"Lake Tahoe shore","provider":"placer","id":3},{"key":"placer-auburn","county":"Placer","name":"Auburn","provider":"placer","id":401},{"key":"placer-lincoln","county":"Placer","name":"Lincoln","provider":"placer","id":407},{"key":"placer-rocklin","county":"Placer","name":"Rocklin","provider":"placer","id":410},{"key":"placer-roseville","county":"Placer","name":"Roseville","provider":"placer","id":411},{"key":"placer-south","county":"Placer","name":"Granite Bay / Loomis","provider":"placer","id":413},{"key":"placer-east","county":"Placer","name":"Eastern Placer","provider":"placer","id":416},{"key":"placer-west","county":"Placer","name":"Western Placer","provider":"placer","id":417},{"key":"placer-truckee","county":"Placer","name":"Truckee Fire area","provider":"placer","id":515},{"key":"yuba-1","county":"Yuba","name":"Zone 1","provider":"feather","zone":1},{"key":"yuba-2","county":"Yuba","name":"Zone 2","provider":"feather","zone":2},{"key":"yuba-3","county":"Yuba","name":"Zone 3","provider":"feather","zone":3},{"key":"yuba-4","county":"Yuba","name":"Zone 4","provider":"feather","zone":4},{"key":"sutter-1","county":"Sutter","name":"Zone 1","provider":"feather","zone":1},{"key":"sutter-2","county":"Sutter","name":"Zone 2","provider":"feather","zone":2},{"key":"sutter-3","county":"Sutter","name":"Zone 3","provider":"feather","zone":3},{"key":"sutter-4","county":"Sutter","name":"Zone 4","provider":"feather","zone":4},{"key":"sutter-5","county":"Sutter","name":"Zone 5","provider":"feather","zone":5},{"key":"sutter-6","county":"Sutter","name":"Zone 6","provider":"feather","zone":6},{"key":"sutter-7","county":"Sutter","name":"Zone 7 \u00b7 Sutter Buttes","provider":"feather","zone":7},{"key":"yuba","county":"Yuba","name":"County overview","provider":"feather"},{"key":"sutter","county":"Sutter","name":"County overview","provider":"feather"},{"key":"amador","county":"Amador","name":"Local confirmation","provider":"assisted","phone":"2092236246","url":"https://www.amadorcounty.gov/services/amador-air-district/burning-and-burn-permits"},{"key":"calaveras","county":"Calaveras","name":"Local confirmation","provider":"assisted","phone":"2097546600","url":"https://ema.calaverasgov.us/Air-Pollution-Control/Burn-Day-Permits-and-Information"},{"key":"tuolumne","county":"Tuolumne","name":"Local confirmation","provider":"assisted","phone":"2095335598","url":"https://www.tuolumnecounty.ca.gov/365/Burn-Program"},{"key":"sacramento","county":"Sacramento","name":"Local confirmation","provider":"assisted","phone":"2799722876","url":"https://www.airquality.org/residents/outdoor-burning"},{"key":"alpine","county":"Alpine","name":"Local confirmation","provider":"assisted","phone":"7608728211","url":"https://www.gbuapcd.org/PermittingAndRules/Burning/"},{"key":"nevada","county":"Nevada","name":"Local confirmation","provider":"assisted","phone":"5302747928","url":"https://www.nsaqmdca.gov/burn-day-status"},{"key":"sierra","county":"Sierra","name":"Local confirmation","provider":"assisted","phone":"5302747928","url":"https://www.nsaqmdca.gov/burn-day-status"},{"key":"plumas","county":"Plumas","name":"Local confirmation","provider":"assisted","phone":"5302747928","url":"https://www.nsaqmdca.gov/burn-day-status"},{"key":"yolo","county":"Yolo","name":"Local confirmation","provider":"assisted","phone":"5307573660","url":"https://www.ysaqmd.org/rules-compliance/burning/rural/"},{"key":"solano","county":"Solano","name":"Local confirmation","provider":"assisted","phone":null,"url":"https://www.solanocounty.gov/government/office-emergency-services/prepare-emergency/air-quality"},{"key":"butte","county":"Butte","name":"County overview","provider":"butte","phone":"5303329407","url":"https://www.bcaqmd.org/open-burning"},{"key":"butte-rural","county":"Butte","name":"Eligible rural areas","provider":"butte","eligible":true,"phone":"5303329407","url":"https://www.bcaqmd.org/open-burning"}];
function areaFor(key) { return AREAS.find(a=>a.key===key); }
function officialURL(area) { if(area?.url)return area.url;return area?.provider==="placer"?PLACER_URL:area?.provider==="feather"?FEATHER_URL:COUNTY_URL; }

const ZONE = "America/Los_Angeles";
const now = new Date();
const today = dayKey(now);
let nextStatusCheck = now.getTime() + 30 * 60 * 1000;
const family = config.runsInWidget ? config.widgetFamily : PREVIEW_SIZE;
const small = family === "small";
const large = family === "large" || family === "extraLarge";
let selection = readSelection();
if (config.runsInApp) {
  const chosen = await chooseArea(selection);
  if (chosen === null) return;
  selection = chosen;
}
const place = await getPlace(selection);
const focus = place.focus || null;
const selected = areaFor(focus);
const areaName = selected?.name || "Select an area";
const areaDescription = selected ? selected.county+" County" : "Automatic location";
const fetched = selected ? await Promise.all([selected.provider==="assisted"?Promise.resolve({html:null}):getPage(selected.provider==="placer"?PLACER_DATA:officialURL(selected)),getPage(FIRE_URL)]) : [{html:null},{html:null}];
let county = {}, fire = "UNKNOWN", local = {status:"UNKNOWN",detail:place.detail};
if (selected) {
  try { if (fetched[1].html) fire=parseFire(fetched[1].html,selected.county); } catch(e) { console.log(String(e)); }
  try {
    if (selected.provider==="edc" && fetched[0].html) {
      county=parseCounty(fetched[0].html,today);
      local=county[focus]||{status:"UNKNOWN",detail:"Today's posting unconfirmed"};
    } else if (selected.provider==="placer") {
      local=fetched[0].html?parsePlacer(JSON.parse(fetched[0].html),selected):{status:"UNKNOWN",detail:"Placer source unavailable"};
    } else if (selected.provider==="feather") {
      let html=fetched[0].html;
      if (!html || !/<table\b/i.test(html)) html=(await getPage("https://fraqmd.specialdistrict.org/burn-day-status")).html;
      local=html?parseFeather(html,selected):{status:"UNKNOWN",detail:"Air district unavailable"};
    } else if(selected.provider==="assisted") local={status:"UNKNOWN",detail:selected.phone?"Tap for the official burn line":"Tap for the correct local air district",needsCall:true};
    else if(selected.provider==="butte")local=fetched[0].html?parseButte(fetched[0].html,selected):{status:"UNKNOWN",detail:"Butte source unavailable",needsCall:true};
    else local={status:"UNKNOWN",detail:"Official source unavailable"};
  } catch(e) { local={status:"UNKNOWN",detail:"Official posting unreadable"};console.log(String(e)); }
}
const active=selected?combineSources(local,fire):{status:"UNKNOWN",detail:place.detail};
if (selected && local.status==="YES" && active.status==="YES") active.detail=local.detail;
if(active.status==="UNKNOWN" && local.needsCall)active.needsCall=true;
// One area in every size; no fallback to another county or burn zone.
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
widget.url = URLScheme.forRunningScript();
widget.refreshAfterDate = new Date(nextStatusCheck);
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
function displayStatus(s) { return s.status==="UNKNOWN"&&s.needsCall?"CALL TO CONFIRM":statusText(s.status); }
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
  label("Burn Status",32,22,400,52,large?36:34,C.ink,true);
  label(place.label,438,32,250,34,17,C.muted,false,"right");
  label(selected ? selected.county.toUpperCase()+" COUNTY • OUTDOOR BURNING" : "OUTDOOR BURNING",32,79,490,26,17,C.faint,true);
  label(date,510,79,178,26,18,C.muted,false,"right");
}
function activeCard(x,y,w,h,big) {
  const s=active, hex=color(s.status);
  rounded(x,y,w,h,24,"FFFFFF",.055);
  rounded(x+1,y+18,4,h-36,2,hex,.8);
  label(areaName,x+22,y+15,w-44,42,big?34:29,C.ink,true);
  if (big) label(areaDescription,x+22,y+61,w-44,30,20,C.muted);
  const sy=y+(big?108:59), fs=big?64:48;
  flame(x+20,sy,fs,hex);
  label(displayStatus(s),x+fs+35,sy+3,w-fs-56,big?68:54,s.status==="UNKNOWN"?(big?39:32):(big?52:44),hex,true);
  label(s.detail,x+22,y+(big?193:119),w-44,big?60:40,big?22:18,C.muted);
  if (big && focus) scene(x+10,y+h-113,w-20,100,(focus==="tahoe"||focus==="placer-tahoe"),.65);
}
function paintSmall() {
  const s=active,hex=color(s.status);
  label("Burn Status",23,17,314,42,32,C.ink,true);
  label(place.label,24,64,312,24,15,C.muted);
  label(date,24,91,312,24,16,C.faint);
  rounded(22,124,316,178,19,"FFFFFF",.06);
  label(areaName,35,135,290,29,23,C.ink,true);
  label(areaDescription,35,168,290,23,15,C.muted);
  flame(34,205,40,hex);
  label(displayStatus(s),86,210,237,40,s.status==="UNKNOWN"?23:31,hex,true);
  label(focus ? s.detail : "Tap to choose an area",35,258,290,36,14,C.muted);
  label("Checked "+stamp,24,310,312,23,15,C.muted);
  label("Created by Donahue Homestead",24,336,312,17,12,C.faint);
}
function paintMedium() {
  header();
  activeCard(32,111,656,161,false);
  label("Checked "+stamp,32,290,370,24,17,C.muted);
  label("Tap to choose area",413,290,275,24,17,C.muted,false,"right");
  label("Permits / local rules apply",32,318,318,20,12,C.faint);
  label("Created by Donahue Homestead",370,318,318,20,13,C.faint,false,"right");
}
function paintLarge() {
  header();
  activeCard(32,130,656,355,true);
  rounded(32,505,656,145,22,"FFFFFF",.045);
  label("SOURCES • SELECTED AREA ONLY",54,522,612,25,16,C.faint,true);
  label("County AQMD",54,560,310,30,21,C.muted,true);
  label("CAL FIRE · SRA",54,604,310,30,21,C.muted,true);
  const cs=selected?local.status:"UNKNOWN";
  const fs=focus?fire:"UNKNOWN";
  label(cs==="YES"?"Burn day":cs==="NO"?"No burn":"Unconfirmed",385,560,281,30,21,color(cs),true);
  label(fs==="OPEN"?"Permits apply":fs==="SUSPENDED"?"Suspended":fs==="PENDING"?"Not yet open":"Unconfirmed",385,604,281,30,21,color(fs==="OPEN"?"YES":(fs==="SUSPENDED"||fs==="PENDING")?"NO":"UNKNOWN"),true);
  label("Checked "+stamp,32,670,656,30,22,C.muted);
  label("Tap to choose area • permits / local rules apply",32,702,656,25,17,C.faint);
  label("Created by Donahue Homestead",32,730,656,18,13,C.faint,false,"center");
}
function selectionFile() {
  // Kept in the downloaded body so existing loaders need no reinstall.
  const fm=FileManager.local();
  const dir=fm.joinPath(fm.documentsDirectory(),"DonahueBurnDay");
  if (!fm.fileExists(dir)) fm.createDirectory(dir);
  return {fm,path:fm.joinPath(dir,"area-selection.json")};
}
function readSelection() {
  try {
    const {fm,path}=selectionFile();
    if (fm.fileExists(path)) {
      const value=JSON.parse(fm.readString(path)).area;
      if (value==="auto" || areaFor(value)) return value;
    }
  } catch(e) { console.log("Burn Day selection: "+e); }
  return "auto";
}
async function chooseArea(current) {
  const menu=new Alert();
  menu.title="Burn status area";
  menu.message="Automatic follows your county. Some areas require local telephone confirmation; these never display an inferred burn permission.";
  const groups=[...new Set(AREAS.map(a=>a.county))];
  menu.addAction((current==="auto"?"✓ ":"")+"Automatic — current location");
  groups.forEach(g=>menu.addAction(g+" County"));
  menu.addAction("Open official burn status");
  menu.addAction("Call official burn line");
  menu.addCancelAction("Cancel");
  const answer=await menu.presentSheet();
  if (answer===groups.length+1 || answer===groups.length+2) {
    const area=areaFor(current==="auto"?(await getPlace("auto")).focus:current);
    if(!area){const notice=new Alert();notice.title="Select your county first";notice.message="Your current area could not be confirmed. Choose a county manually to open its official information.";notice.addAction("OK");await notice.presentSheet();return null;}
    if(answer===groups.length+2 && area?.phone) await Safari.open("tel:"+area.phone);
    else await Safari.openInApp(officialURL(area),false);
    return null;
  }
  if (answer<0 || answer>groups.length) return null;
  let chosen="auto";
  if (answer>0) {
    const group=groups[answer-1],areas=AREAS.filter(a=>a.county===group);
    const sub=new Alert();sub.title=group+" County";
    sub.message=group==="Butte"?"Eligible rural areas excludes all incorporated cities, Chico sphere of influence and Magalia/Upper Ridge. Choose County overview and call if uncertain. Your permit can impose stricter hours.":group==="Yolo"?"Rural burning needs a daily burn-line check, then authorization from county dispatch at 530-666-8998.":group==="Solano"?"Two air districts serve this county. Use the official page to identify the correct district and authorization process.":group==="Yuba"||group==="Sutter"?"Choose a residential zone, or County overview. Automatic mode shows a county result only when all zones agree.":"Select the area for your property.";
    areas.forEach(a=>sub.addAction((a.key===current?"✓ ":"")+a.name));
    if (group==="Yuba"||group==="Sutter") sub.addAction("Open official zone maps");
    sub.addCancelAction("Cancel");
    const index=await sub.presentSheet();
    if (index===areas.length && (group==="Yuba"||group==="Sutter")) { await Safari.openInApp("https://www.fraqmdca.gov/burn-zone-information",false);return null; }
    if (index<0 || index>=areas.length) return null;
    chosen=areas[index].key;
  }
  const {fm,path}=selectionFile();
  fm.writeString(path,JSON.stringify({area:chosen}));
  return chosen;
}
async function getPlace(selection) {
  if (areaFor(selection)) return {label:"MANUALLY SELECTED",focus:selection};
  const fallback={label:"LOCATION UNAVAILABLE",focus:null,detail:"Tap to choose your burn area"};
  if (!USE_LOCATION) return fallback;
  try {
    Location.setAccuracyToHundredMeters();
    const loc=await withTimeout(Location.current(),config.runsInWidget?3500:15000,null);
    if (!loc) return fallback;
    const area=regionForLocation(loc);
    if (!area) return {label:"AREA NOT CONFIRMED",focus:null,detail:"Outside coverage or near a boundary"};
    return {label:"CURRENT LOCATION",focus:area};
  } catch(e) { return fallback; }
}
function regionForLocation(loc) {
  const lat=loc.latitude, lon=loc.longitude, accuracy=loc.horizontalAccuracy;
  if (!Number.isFinite(lat)||!Number.isFinite(lon)||lat<-90||lat>90||lon<-180||lon>180||
      !Number.isFinite(accuracy)||accuracy<0||accuracy>1000) return null;
  const margin=Math.max(250,accuracy+150);
  if (boundaryDistance(lon,lat,AREA_BOUNDARIES.county)<=margin ||
      boundaryDistance(lon,lat,AREA_BOUNDARIES.tahoe)<=margin) return null;
  if (insideArea(lon,lat,AREA_BOUNDARIES.county)) return insideArea(lon,lat,AREA_BOUNDARIES.tahoe)?"tahoe":"west";
  const hits=[];
  for (const [key,rings] of Object.entries(PLACER_BOUNDARIES)) {
    if (boundaryDistance(lon,lat,[rings])<=Math.max(450,accuracy+300)) return null;
    if (insideRings(lon,lat,rings)) hits.push(key);
  }
  if(hits.length)return hits.length===1?hits[0]:null;
  for(const [key,rings] of Object.entries(FEATHER_COUNTIES)) {
    if(boundaryDistance(lon,lat,[rings])<=Math.max(450,accuracy+300))return null;
    if(insideRings(lon,lat,rings))return key;
  }
  return null;
}
function insideRing(x,y,ring) {
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++) {
    const a=ring[i],b=ring[j];
    if((a[1]>y)!==(b[1]>y) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) inside=!inside;
  }
  return inside;
}
function insideRings(x,y,rings) { return rings.reduce((inside,ring)=>inside!==insideRing(x,y,ring),false); }
function insideArea(x,y,polygons) {
  return polygons.some(rings=>insideRing(x,y,rings[0])&&!rings.slice(1).some(r=>insideRing(x,y,r)));
}
function boundaryDistance(lon,lat,polygons) {
  const sx=111320*Math.cos(lat*Math.PI/180),sy=111320;
  let best=Infinity;
  for(const rings of polygons) for(const ring of rings) for(let i=0,j=ring.length-1;i<ring.length;j=i++) {
    const ax=(ring[j][0]-lon)*sx,ay=(ring[j][1]-lat)*sy;
    const bx=(ring[i][0]-lon)*sx,by=(ring[i][1]-lat)*sy;
    const dx=bx-ax,dy=by-ay,len=dx*dx+dy*dy;
    const t=len?Math.max(0,Math.min(1,-(ax*dx+ay*dy)/len)):0;
    best=Math.min(best,Math.hypot(ax+t*dx,ay+t*dy));
  }
  return best;
}
function withTimeout(promise,ms,fallback) {
  return new Promise(resolve=>{
    let done=false;
    const finish=value=>{if(done)return;done=true;timer.invalidate();resolve(value);};
    const timer=Timer.schedule(ms,false,()=>finish(fallback));
    promise.then(finish,()=>finish(fallback));
  });
}

async function loadRegionData() {
  const fm=FileManager.local(),dir=fm.joinPath(fm.documentsDirectory(),"DonahueBurnDay");
  if(!fm.fileExists(dir))fm.createDirectory(dir);
  const path=fm.joinPath(dir,"boundaries-v9.json");
  function valid(data) {
    if(data?.schemaVersion!==1||data.release!==9||!data.placer||!data.counties)return false;
    const expectedPlacer=["placer-tahoe","placer-auburn","placer-lincoln","placer-rocklin","placer-roseville","placer-south","placer-east","placer-west","placer-truckee"];
    const expectedCounties=["yuba","sutter","amador","calaveras","tuolumne","sacramento","alpine","nevada","sierra","plumas","yolo","solano","butte"];
    let points=0;
    for(const [group,keys] of [[data.placer,expectedPlacer],[data.counties,expectedCounties]]) {
      if(Object.keys(group).length!==keys.length)return false;
      for(const key of keys) {
        const rings=group[key];
        if(!Array.isArray(rings)||!rings.length)return false;
        for(const ring of rings) {
          if(!Array.isArray(ring)||ring.length<4)return false;
          for(const p of ring) {
            if(!Array.isArray(p)||p.length!==2||!Number.isFinite(p[0])||!Number.isFinite(p[1])||p[0]<-125||p[0]>-113||p[1]<32||p[1]>43)return false;
            if(++points>50000)return false;
          }
          if(ring[0][0]!==ring[ring.length-1][0]||ring[0][1]!==ring[ring.length-1][1])return false;
        }
      }
    }
    return true;
  }
  try {if(fm.fileExists(path)){const data=JSON.parse(fm.readString(path));if(valid(data))return data;}}catch(e){console.log("Burn Day boundary cache: "+e);}
  try {
    const req=new Request("https://raw.githubusercontent.com/mfceosean/donahue-homestead-burn-day/main/boundaries-v9.json");
    req.timeoutInterval=8;
    const text=await req.loadString();
    if(req.response?.statusCode!==200||text.length>300000)throw Error("Boundary download unavailable");
    const data=JSON.parse(text);if(!valid(data))throw Error("Invalid boundary data");
    try{fm.writeString(path,text);}catch(e){console.log("Burn Day boundary save: "+e);}
    return data;
  } catch(e){console.log("Burn Day boundaries: "+e);return null;}
}

function pacificMinute() {
  const parts=new Intl.DateTimeFormat("en-US",{timeZone:ZONE,hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(now);
  return +parts.find(p=>p.type==="hour").value*60 + +parts.find(p=>p.type==="minute").value;
}
function clockMinute(text) {
  const m=/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(text.trim());
  if (!m || +m[1]<1 || +m[1]>12 || +m[2]>59) return null;
  return (+m[1]%12)*60 + +m[2] + (/PM/i.test(m[3])?720:0);
}
function hourlyDecision(start,end,detail) {
  if (!Number.isFinite(start)||!Number.isFinite(end)||start<0||end>1440||start>=end) return {status:"UNKNOWN",detail:"Burn hours unconfirmed"};
  const minute=pacificMinute();
  if (minute<start) { beforeStart(today,start);return {status:"NO",detail:"Not yet within posted burn hours"}; }
  if (minute>=end) return {status:"NO",detail:"Posted burn hours have ended"};
  const until=end-minute;
  nextStatusCheck=Math.min(nextStatusCheck,now.getTime()+until*60000);
  return {status:"YES",detail};
}
// NOAA fractional-year solar equations; use the full zone's bounding corners.
// A five-minute uncertainty band at sunrise/sunset remains unconfirmed.
function solarWindow(key) {
  const rings=PLACER_BOUNDARIES[key]||FEATHER_COUNTIES[key];
  if (!rings?.length) return null;
  const pts=rings.flat(),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  const y=+today.slice(0,4),m=+today.slice(5,7),d=+today.slice(8,10);
  const midnight=Date.UTC(y,m-1,d),n=Math.floor((midnight-Date.UTC(y,0,0))/86400000);
  const gamma=2*Math.PI/((Date.UTC(y+1,0,1)-Date.UTC(y,0,1))/86400000)*(n-1),rad=Math.PI/180;
  const eq=229.18*(.000075+.001868*Math.cos(gamma)-.032077*Math.sin(gamma)-.014615*Math.cos(2*gamma)-.040849*Math.sin(2*gamma));
  const dec=.006918-.399912*Math.cos(gamma)+.070257*Math.sin(gamma)-.006758*Math.cos(2*gamma)+.000907*Math.sin(2*gamma)-.002697*Math.cos(3*gamma)+.00148*Math.sin(3*gamma);
  const rises=[],sets=[];
  for(const lon of [Math.min(...xs),Math.max(...xs)]) for(const lat of [Math.min(...ys),Math.max(...ys)]) {
    const c=(Math.cos(90.833*rad)-Math.sin(lat*rad)*Math.sin(dec))/(Math.cos(lat*rad)*Math.cos(dec));
    if(c<=-1||c>=1)return null;
    const ha=Math.acos(c)/rad;
    rises.push(midnight+(720-4*lon-eq-4*ha)*60000);
    sets.push(midnight+(720-4*lon-eq+4*ha)*60000);
  }
  return {rise:Math.max(...rises),set:Math.min(...sets)};
}
function daylightDecision(area,startAtEight) {
  const window=solarWindow(area.key);
  if(!window)return {status:"UNKNOWN",detail:"Daylight hours unconfirmed"};
  const time=now.getTime(),buffer=5*60000;
  if (startAtEight && pacificMinute()<480) {beforeStart(today,480);return {status:"NO",detail:"Burning starts at 8 AM"};}
  const start=window.rise+buffer,end=window.set-buffer;
  if(time<start || time>=end) {
    if(time<start)nextStatusCheck=Math.min(nextStatusCheck,start);
    return {status:"UNKNOWN",detail:"Daylight-only burning; check locally"};
  }
  nextStatusCheck=Math.min(nextStatusCheck,end);
  return {status:"YES",detail:startAtEight?"8 AM to dark · permits apply":"Daylight hours only · permits apply"};
}
function parsePlacer(data,area) {
  const rows=(data?.features||[]).filter(f=>f.attributes?.OBJECTID===area.id);
  if(rows.length!==1)return {status:"UNKNOWN",detail:"Placer area not confirmed"};
  const a=rows[0].attributes;
  if ([407,410,411].includes(area.id) && /NO BURNING PERMITTED WITHIN THE CITY OF/i.test(a.areaDescription||"")) return {status:"NO",detail:"City prohibits residential burning"};
  const decisions=[];
  for(const suffix of ["Today","Tomorrow"]) {
    const dt=a["statusDate"+suffix];
    if(!Number.isFinite(dt)||dayKey(new Date(dt))!==today)continue;
    const code=a["burnStatus"+suffix],info=String(a["burnInfo"+suffix]||"");
    if(/await|pending|call|contact/i.test(info)){decisions.push({status:"UNKNOWN",detail:"District confirmation pending"});continue;}
    if(["6-noburn","7-suspended"].includes(code) || /suspend|prohibit/i.test(info)) {decisions.push({status:"NO",detail:code==="7-suspended"?"Local burning suspension":"District prohibits burning"});continue;}
    if(code==="1-unrestricted")decisions.push({status:"YES",detail:"Burn day · permits / local rules apply"});
    else if(code==="4-8to6")decisions.push(hourlyDecision(480,1080,"8 AM–6 PM · permits apply"));
    else if(code==="5-8to5")decisions.push(hourlyDecision(480,1020,"8 AM–5 PM · permits apply"));
    else if(code==="2-daylight"||code==="3-dark")decisions.push(daylightDecision(area,code==="3-dark"));
    else decisions.push({status:"UNKNOWN",detail:"District status pending or unknown"});
  }
  return decisions.find(s=>s.status==="NO") || (decisions.length && decisions.every(s=>s.status==="YES")?decisions[0]:{status:"UNKNOWN",detail:"Today's Placer status unconfirmed"});
}
function parseButte(html,area) {
  const found=[];
  for(const table of html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)) {
    let day=null;
    for(const row of table[0].matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)) {
      const cells=[...row[0].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(c=>plain(c[1]));
      if(cells.length!==2)continue;
      if(!cells[0]) {const ds=dates(cells[1]);if(ds.length)day=ds.length===1?ds[0]:null;continue;}
      if(cells[0]!=="Residential Burning"||day!==today)continue;
      const text=cells[1];
      if(/no[- ]burn|not (?:a )?permissive|burning (?:is )?(?:prohibited|suspended)/i.test(text)){found.push({status:"NO",detail:"District: residential burning prohibited"});continue;}
      if(!/^Permissive burn day where burning is allowed\./i.test(text)) {found.push({status:"UNKNOWN",detail:"Butte residential posting unclear",needsCall:true});continue;}
      if(!area.eligible){found.push({status:"UNKNOWN",detail:"District permits; confirm your local area",needsCall:true});continue;}
      if(!/Burn hours are 8:45\s*am\s*[-–]\s*1 hour before sunset/i.test(text)) {found.push({status:"UNKNOWN",detail:"Butte burn hours need confirmation",needsCall:true});continue;}
      if(pacificMinute()<525){beforeStart(today,525);found.push({status:"NO",detail:"Residential burning starts at 8:45 AM"});continue;}
      const solar=solarWindow("butte");
      if(!solar||now.getTime()>=solar.set-65*60000){found.push({status:"UNKNOWN",detail:"Confirm sunset-based burn cutoff",needsCall:true});continue;}
      nextStatusCheck=Math.min(nextStatusCheck,solar.set-65*60000);
      found.push({status:"YES",detail:"8:45 AM–1 hr before sunset; permits apply"});
    }
  }
  return found.find(s=>s.status==="NO")||(found.length&&found.every(s=>s.status==="YES")?found[0]:found.find(s=>s.status==="UNKNOWN")||{status:"UNKNOWN",detail:"Today's Butte posting unconfirmed",needsCall:true});
}

function parseFeather(html,area) {
  if(!area.zone) {
    const zones=AREAS.filter(a=>a.provider==="feather"&&a.county===area.county&&a.zone);
    const values=zones.map(a=>parseFeather(html,a));
    if(values.length && values.every(v=>v.status==="NO"))return {status:"NO",detail:"All residential zones: no burn now"};
    if(values.length && values.every(v=>v.status==="YES"))return {status:"YES",detail:"All residential zones allow now"};
    return {status:"UNKNOWN",detail:"Select a zone; county decision varies"};
  }
  const decisions=[];
  // Bind each table to the nearest preceding dated heading, never the whole page.
  for(const match of html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)) {
    const prefix=html.slice(0,match.index);
    const headings=[...prefix.matchAll(/<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>/gi)];
    const heading=headings.length?plain(headings[headings.length-1][0]):"";
    const ds=dates(heading);
    if(ds.length!==1||ds[0]!==today)continue;
    const rows=[...match[0].matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)].map(r=>[...r[0].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(c=>plain(c[1].replace(/&lt;/gi,"<").replace(/&gt;/gi,">"))));
    const header=rows.find(r=>r.includes("Residential")&&r.includes("Residential Hours")&&r.includes("Zone"));
    if(!header)continue;
    const ri=header.indexOf("Residential"),hi=header.indexOf("Residential Hours"),zi=header.indexOf("Zone"),ci=header.indexOf("County");
    if(ci<0)continue;
    let currentCounty="";
    for(const cells of rows.slice(rows.indexOf(header)+1)) {
      if(cells.length!==header.length)continue;
      if(cells[ci])currentCounty=cells[ci];
      if(currentCounty.toLowerCase()!==area.county.toLowerCase())continue;
      const zm=/^(\d+)(?:\s*-\s*(SRA|SB))?$/.exec(cells[zi]);
      if(!zm||+zm[1]!==area.zone)continue;
      const status=cells[ri].toUpperCase(),hours=cells[hi];
      if(status==="NO"){decisions.push({status:"NO",detail:"District: residential burning prohibited"});continue;}
      if(status!=="YES"){decisions.push({status:"UNKNOWN",detail:"Residential decision unconfirmed"});continue;}
      const span=/^(\d{1,2}:\d{2}\s*(?:AM|PM))\s+to\s+(\d{1,2}:\d{2}\s*(?:AM|PM))$/i.exec(hours);
      decisions.push(span?hourlyDecision(clockMinute(span[1]),clockMinute(span[2]),hours+" · residential only"):{status:"UNKNOWN",detail:"Residential burn hours unconfirmed"});
    }
  }
  return decisions.find(s=>s.status==="NO") || (decisions.length&&decisions.every(s=>s.status==="YES")?decisions[0]:{status:"UNKNOWN",detail:"Today's residential posting unconfirmed"});
}

function combineSources(county, fire) {
  // Confirmed NO wins over a conflicting YES or an unavailable source.
  if (county.status === "NO") return county;
  if (fire === "PENDING") return { status: "NO", detail: "CAL FIRE start time not reached" };
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

// Compare official effective times in Pacific local time, independently of device timezone.
// null means no time was posted; -1 means an explicit time could not be verified.
function startMinute(value) {
  const matches = [...value.matchAll(/\b(\d{1,2})(?::(\d{2}))?\s*(A\.?M\.?|P\.?M\.?)(?![A-Za-z])/gi)];
  if (!matches.length) return /\b(?:starting|effective)\b.{0,30}\bat\b/i.test(value) ? -1 : null;
  const minutes = matches.map(m => {
    const h = +m[1], min = +(m[2] || 0);
    return h >= 1 && h <= 12 && min < 60 ? (h % 12) * 60 + (/^P/i.test(m[3]) ? 720 : 0) + min : -1;
  });
  return minutes.every(m => m === minutes[0]) ? minutes[0] : -1;
}
function beforeStart(day, minute) {
  if (day !== today || minute === null || minute < 0) return false;
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: ZONE, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const get = type => +parts.find(p => p.type === type).value;
  const seconds = get("hour") * 3600 + get("minute") * 60 + get("second");
  const remaining = minute * 60 - seconds;
  if (remaining <= 0) return false;
  nextStatusCheck = Math.min(nextStatusCheck, now.getTime() + remaining * 1000);
  return true;
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
      const minute = startMinute(context + " " + value);
      let status = "UNKNOWN", detail = "Posting not dated for today";
      const isNo = /\bNO[ -]+BURN\b|\bNON[ -]?BURN\b|\bNOT\s+(?:A\s+)?BURN\s+DAY\b/.test(value);
      const isYes = /^(?:YES[ :–-]*)?(?:BURN(?:\s+DAY)?|PERMISSIVE\s+BURN\s+DAY|BURNING\s+(?:ALLOWED|PERMITTED))[.!\s]*$/.test(value);
      if (applicable.length === 1 && applicable[0] === targetDay) {
        if (isNo) { status = "NO"; detail = "County reports no burning"; }
        else if (isYes && !suspension && minute !== -1) {
          status = beforeStart(targetDay, minute) ? "NO" : "YES";
          detail = status === "NO" ? "County start time not reached" : "Permits / local rules apply";
        }
      } else if (isNo && suspension && applicable.length === 1 && applicable[0] <= targetDay) {
        // An explicitly ongoing suspension is not a stale daily forecast.
        status = "NO"; detail = "Burn permits suspended";
      } else if (applicable.length === 1) {
        // Other daily dates are separate forecasts, not conflicting current postings.
        continue;
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

function parseFire(html, countyName = "El Dorado") {
  const clean = html.replace(/<!--[\s\S]*?-->/g, " ");
  const values = [];
  for (const row of clean.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)) {
    const cells = [...row[0].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(m => plain(m[1]));
    if ((cells[0]||"").toLowerCase() !== (countyName+" County").toLowerCase()) continue;
    const ds = dates(cells[2] || "");
    if (ds.length !== 1 || ds[0] > today) { values.push("UNKNOWN"); continue; }
    const s = cells[1] || "";
    const minute = startMinute(cells[2] || "");
    if (minute === -1) { values.push("UNKNOWN"); continue; }
    if (beforeStart(ds[0], minute)) { values.push("PENDING"); continue; }
    values.push(/^Burning\s+Suspended\b/i.test(s) ? "SUSPENDED" : /^(?:Burning\s+Allowed|Permit\s+Required)\b/i.test(s) ? "OPEN" : "UNKNOWN");
  }
  if (values.includes("SUSPENDED")) return "SUSPENDED";
  if (values.includes("PENDING")) return "PENDING";
  return values.length && values.every(v => v === values[0]) ? values[0] : "UNKNOWN";
}

}

