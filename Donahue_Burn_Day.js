// DONAHUE_RELEASE_VERSION: 5
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
// EDC Burn Status • release 5 • Created by Donahue Homestead
// Paste the whole script into Scriptable. Run once to allow location access.
// Add a small, medium or large Scriptable widget and select this script.
// Location emphasizes your area; coverage ALWAYS stays El Dorado County.
// Tahoe means the El Dorado County portion, not the entire Tahoe Basin.
// Green: both sources allow. Red: either prohibits. White: unconfirmed.
// CAL FIRE's county entry applies to State Responsibility Areas (SRA).
// No MiniNAS, keys, external artwork, or stored location history required.
// iOS controls refresh timing. Check the visible date before using the status.

const USE_LOCATION = true; // Set false to disable location access.

// Official EDC GIS CountyBoundary/0 and TRPABoundary/3 geometries.
// Simplified to 0.001 degrees; near-boundary locations keep equal cards.
// Coordinates are tested locally: no GPS coordinates are saved or sent to GIS.
const AREA_BOUNDARIES = {"county":[[[[-120.1492,38.6371],[-120.1588,38.6326],[-120.171,38.632],[-120.1788,38.6335],[-120.1912,38.6308],[-120.1962,38.6255],[-120.2017,38.6244],[-120.2065,38.6279],[-120.2136,38.6278],[-120.2145,38.6223],[-120.22,38.621],[-120.2237,38.6171],[-120.223,38.6153],[-120.2264,38.6088],[-120.223,38.6039],[-120.232,38.6001],[-120.2326,38.5939],[-120.2312,38.5918],[-120.2334,38.5881],[-120.2388,38.5856],[-120.2424,38.5863],[-120.25,38.5843],[-120.2527,38.5819],[-120.261,38.5798],[-120.2612,38.5749],[-120.2662,38.5658],[-120.2664,38.5611],[-120.2738,38.5589],[-120.2803,38.5591],[-120.286,38.5562],[-120.2974,38.5562],[-120.3014,38.5496],[-120.3172,38.5434],[-120.3373,38.5455],[-120.3459,38.5414],[-120.3519,38.546],[-120.3564,38.5473],[-120.364,38.5444],[-120.3769,38.5448],[-120.3808,38.543],[-120.3839,38.5386],[-120.3891,38.5406],[-120.399,38.5371],[-120.4027,38.5375],[-120.4134,38.5311],[-120.4246,38.5304],[-120.4337,38.5267],[-120.4396,38.529],[-120.4492,38.5288],[-120.4586,38.524],[-120.4856,38.5213],[-120.4911,38.5174],[-120.4975,38.5166],[-120.4999,38.5144],[-120.5106,38.5115],[-120.5372,38.5096],[-120.5538,38.5119],[-120.5796,38.5035],[-120.5925,38.5046],[-120.6063,38.5024],[-120.6126,38.5046],[-120.6147,38.5032],[-120.6219,38.5045],[-120.6284,38.5032],[-120.639,38.5077],[-120.6511,38.51],[-120.6576,38.5133],[-120.6592,38.5156],[-120.6773,38.5178],[-120.6795,38.5234],[-120.6831,38.5264],[-120.6905,38.5278],[-120.6998,38.5322],[-120.7043,38.5362],[-120.7066,38.535],[-120.7148,38.5392],[-120.7222,38.5469],[-120.7276,38.5468],[-120.7311,38.5488],[-120.7364,38.5455],[-120.7391,38.5484],[-120.7472,38.5484],[-120.7487,38.551],[-120.7468,38.553],[-120.7498,38.5534],[-120.7549,38.5513],[-120.7602,38.5554],[-120.7693,38.5524],[-120.7794,38.5545],[-120.7838,38.5508],[-120.7884,38.5543],[-120.7928,38.5547],[-120.7943,38.5577],[-120.8009,38.5561],[-120.8015,38.5589],[-120.8047,38.5601],[-120.805,38.5584],[-120.8104,38.5576],[-120.8126,38.5598],[-120.8102,38.5616],[-120.8134,38.5623],[-120.816,38.5613],[-120.8167,38.5583],[-120.8234,38.5601],[-120.8255,38.5559],[-120.8327,38.5561],[-120.8361,38.5514],[-120.8408,38.5562],[-120.8479,38.5537],[-120.8497,38.5507],[-120.8562,38.5484],[-120.8565,38.5428],[-120.8626,38.5431],[-120.8636,38.5352],[-120.8715,38.5365],[-120.874,38.5389],[-120.8733,38.5425],[-120.8766,38.5433],[-120.8781,38.5396],[-120.8838,38.5365],[-120.8807,38.5301],[-120.8861,38.5248],[-120.8896,38.5248],[-120.8924,38.5287],[-120.8949,38.5282],[-120.9026,38.5312],[-120.9056,38.5241],[-120.909,38.524],[-120.911,38.5206],[-120.923,38.5192],[-120.9263,38.5146],[-120.9313,38.5184],[-120.9359,38.5188],[-120.9378,38.5269],[-120.9415,38.5286],[-120.9466,38.5229],[-120.9529,38.5211],[-120.9575,38.5229],[-120.9643,38.5203],[-120.9699,38.521],[-120.9745,38.5159],[-120.9805,38.5152],[-120.9875,38.5165],[-120.9944,38.5137],[-121.001,38.5187],[-121.0067,38.5192],[-121.0093,38.5179],[-121.0095,38.5145],[-121.0114,38.5124],[-121.0133,38.513],[-121.0193,38.5088],[-121.0275,38.5081],[-121.0853,38.6477],[-121.1186,38.717],[-121.1187,38.715],[-121.1235,38.7105],[-121.1332,38.7055],[-121.1402,38.7117],[-121.1458,38.7116],[-121.1435,38.7173],[-121.1455,38.7189],[-121.1487,38.7314],[-121.1356,38.7383],[-121.13,38.7499],[-121.1238,38.752],[-121.1228,38.7571],[-121.124,38.7599],[-121.1206,38.7703],[-121.1111,38.7751],[-121.105,38.7856],[-121.1066,38.7916],[-121.1049,38.7945],[-121.1053,38.7969],[-121.1014,38.7978],[-121.1023,38.7999],[-121.0991,38.8038],[-121.101,38.8065],[-121.0998,38.8102],[-121.1077,38.8145],[-121.1064,38.8172],[-121.1024,38.8165],[-121.0986,38.8183],[-121.0967,38.8145],[-121.0944,38.814],[-121.0849,38.8164],[-121.084,38.8223],[-121.0899,38.8274],[-121.0877,38.8328],[-121.0853,38.8347],[-121.0821,38.8349],[-121.0734,38.8425],[-121.0583,38.8469],[-121.0577,38.8512],[-121.0618,38.8598],[-121.0551,38.8639],[-121.0529,38.8685],[-121.0569,38.8769],[-121.0618,38.8825],[-121.0447,38.8899],[-121.0479,38.8948],[-121.0534,38.897],[-121.0535,38.8992],[-121.0482,38.9049],[-121.0437,38.9071],[-121.0408,38.9152],[-121.0378,38.9155],[-121.0333,38.9128],[-121.019,38.9181],[-121.0117,38.9165],[-121.007,38.9178],[-121.0052,38.9201],[-121.0023,38.9179],[-120.9991,38.9181],[-120.9969,38.921],[-120.9909,38.9236],[-120.9916,38.9281],[-120.9758,38.9293],[-120.971,38.933],[-120.9647,38.933],[-120.9579,38.9389],[-120.9501,38.9387],[-120.9427,38.9355],[-120.9387,38.9356],[-120.9369,38.9423],[-120.9384,38.9423],[-120.9382,38.9564],[-120.9405,38.9618],[-120.936,38.9642],[-120.9232,38.961],[-120.9139,38.9551],[-120.9015,38.9529],[-120.8911,38.9597],[-120.8883,38.9598],[-120.8824,38.957],[-120.8639,38.9543],[-120.8598,38.9517],[-120.8578,38.9566],[-120.8524,38.9593],[-120.8557,38.9675],[-120.8499,38.9763],[-120.841,38.9756],[-120.8386,38.9717],[-120.8339,38.9719],[-120.8329,38.9777],[-120.8294,38.9806],[-120.8285,38.9896],[-120.8231,38.9934],[-120.8159,38.9945],[-120.8128,39],[-120.8014,39.0008],[-120.7974,38.9962],[-120.792,38.9993],[-120.7863,38.9996],[-120.7799,39.0044],[-120.774,39.0056],[-120.7739,39.007],[-120.771,39.0065],[-120.7681,39.0093],[-120.7653,39.0097],[-120.7636,39.0085],[-120.7665,39.0066],[-120.7669,39.0043],[-120.7618,39.0018],[-120.7601,39.0032],[-120.7638,39.0041],[-120.7636,39.0064],[-120.7604,39.0055],[-120.7579,39.0078],[-120.7523,39.0054],[-120.7498,39.0096],[-120.747,39.0104],[-120.7461,39.0091],[-120.7484,39.003],[-120.7439,39.0057],[-120.7422,39.0016],[-120.736,39.0007],[-120.7295,39.004],[-120.7234,38.9993],[-120.7226,38.9933],[-120.7184,38.9903],[-120.7165,38.9867],[-120.7116,38.9859],[-120.7051,38.9813],[-120.6933,38.985],[-120.6893,38.9896],[-120.6842,38.9895],[-120.6852,38.9838],[-120.6804,38.9775],[-120.6836,38.9749],[-120.6825,38.97],[-120.6839,38.9677],[-120.6797,38.9667],[-120.677,38.9634],[-120.6739,38.9627],[-120.673,38.9585],[-120.6652,38.9574],[-120.6583,38.9534],[-120.6558,38.9543],[-120.6544,38.9482],[-120.6508,38.949],[-120.6478,38.9468],[-120.6451,38.9474],[-120.6426,38.9444],[-120.6366,38.9434],[-120.6303,38.9466],[-120.6223,38.943],[-120.6129,38.9431],[-120.6055,38.9342],[-120.5987,38.9367],[-120.5941,38.9362],[-120.5925,38.9316],[-120.5877,38.9315],[-120.5853,38.9284],[-120.5864,38.9242],[-120.584,38.9211],[-120.5808,38.9206],[-120.5789,38.9175],[-120.5709,38.9139],[-120.5673,38.915],[-120.5647,38.9136],[-120.5588,38.9159],[-120.5561,38.9151],[-120.5531,38.9203],[-120.5466,38.9205],[-120.5451,38.9269],[-120.5345,38.926],[-120.5318,38.9295],[-120.5274,38.9315],[-120.5237,38.9303],[-120.5166,38.9319],[-120.5121,38.9311],[-120.511,38.934],[-120.5051,38.9347],[-120.502,38.9412],[-120.4928,38.9432],[-120.4928,38.9496],[-120.4876,38.952],[-120.4859,38.9591],[-120.4796,38.9599],[-120.4764,38.9634],[-120.471,38.9656],[-120.4692,38.9706],[-120.4663,38.9721],[-120.4618,38.9783],[-120.4601,38.9846],[-120.4511,38.9884],[-120.4537,38.9951],[-120.4529,38.9981],[-120.4493,39.0008],[-120.4497,39.006],[-120.4452,39.0095],[-120.4453,39.0172],[-120.4425,39.0228],[-120.4392,39.0239],[-120.436,39.0283],[-120.3282,39.0225],[-120.2594,39.0235],[-120.2594,39.0248],[-120.2404,39.0237],[-120.2402,39.0309],[-120.1842,39.031],[-120.1836,39.0384],[-120.1651,39.0385],[-120.165,39.0458],[-120.1531,39.0458],[-120.1529,39.0602],[-120.1436,39.0601],[-120.1436,39.0673],[-120.0064,39.0674],[-120.0066,39.0032],[-119.9045,38.9333],[-119.9054,38.9282],[-119.8995,38.9233],[-119.892,38.9182],[-119.8875,38.9181],[-119.8832,38.9051],[-119.8796,38.8997],[-119.8845,38.8943],[-119.881,38.8913],[-119.8795,38.8869],[-119.8828,38.8813],[-119.8888,38.8791],[-119.8788,38.8752],[-119.877,38.8714],[-119.8774,38.8684],[-119.88,38.8643],[-119.892,38.8569],[-119.9001,38.8575],[-119.9057,38.8557],[-119.9085,38.845],[-119.9084,38.8344],[-119.9119,38.8322],[-119.9229,38.8295],[-119.924,38.8252],[-119.9211,38.8214],[-119.9309,38.8152],[-119.9316,38.8123],[-119.9426,38.8028],[-119.9441,38.7968],[-119.9397,38.7942],[-119.9479,38.7851],[-119.948,38.7817],[-119.9649,38.7761],[-120.0725,38.7027],[-120.082,38.7008],[-120.0819,38.702],[-120.0773,38.7019],[-120.0772,38.709],[-120.0975,38.7085],[-120.0976,38.7034],[-120.1043,38.7058],[-120.1117,38.7049],[-120.1224,38.6948],[-120.124,38.6902],[-120.1231,38.6872],[-120.1164,38.6798],[-120.1213,38.6689],[-120.1313,38.6608],[-120.1344,38.6553],[-120.1342,38.6533],[-120.131,38.6509],[-120.1315,38.6491],[-120.1391,38.638],[-120.1492,38.6371]]]],"tahoe":[[[[-120.0055,39.28],[-120.0016,39.2777],[-119.9947,39.2819],[-119.9922,39.2883],[-119.9841,39.2874],[-119.975,39.2937],[-119.9698,39.294],[-119.9599,39.2909],[-119.9572,39.2943],[-119.952,39.297],[-119.953,39.2999],[-119.9508,39.3016],[-119.9483,39.3088],[-119.9446,39.3108],[-119.947,39.3153],[-119.9424,39.325],[-119.9279,39.3223],[-119.9235,39.3201],[-119.9215,39.3175],[-119.9257,39.305],[-119.9246,39.3031],[-119.92,39.3002],[-119.916,39.3001],[-119.9135,39.292],[-119.9027,39.2929],[-119.8974,39.2904],[-119.8981,39.2889],[-119.8961,39.2868],[-119.8975,39.283],[-119.8956,39.2817],[-119.8952,39.278],[-119.9028,39.2733],[-119.8983,39.2657],[-119.9009,39.2625],[-119.9018,39.2493],[-119.9064,39.2361],[-119.8982,39.2328],[-119.8974,39.2286],[-119.9013,39.2213],[-119.9054,39.218],[-119.9105,39.2029],[-119.9048,39.1955],[-119.9004,39.1965],[-119.8947,39.1886],[-119.8873,39.1884],[-119.8856,39.1836],[-119.8864,39.18],[-119.8827,39.18],[-119.8852,39.1761],[-119.885,39.1682],[-119.8822,39.1647],[-119.8876,39.1583],[-119.8833,39.154],[-119.885,39.1511],[-119.8853,39.1435],[-119.8871,39.1405],[-119.8942,39.1356],[-119.8976,39.13],[-119.9026,39.1269],[-119.9002,39.1228],[-119.904,39.1189],[-119.8958,39.1089],[-119.8978,39.0975],[-119.8939,39.0885],[-119.8787,39.0814],[-119.8852,39.0793],[-119.8862,39.0754],[-119.8922,39.0721],[-119.8926,39.0633],[-119.8908,39.0599],[-119.8927,39.0559],[-119.8892,39.0487],[-119.8815,39.043],[-119.8931,39.0362],[-119.891,39.0329],[-119.8877,39.0326],[-119.8911,39.0244],[-119.8865,39.0207],[-119.8848,39.0151],[-119.8889,39.0103],[-119.8893,39.0016],[-119.8876,38.9989],[-119.8902,38.9932],[-119.8813,38.9892],[-119.8782,38.9893],[-119.878,38.9873],[-119.8801,38.9841],[-119.8893,38.979],[-119.8867,38.9692],[-119.8879,38.9682],[-119.8857,38.9668],[-119.8869,38.963],[-119.8933,38.9553],[-119.8959,38.9457],[-119.9074,38.9421],[-119.9043,38.9341],[-119.9052,38.928],[-119.892,38.9183],[-119.8878,38.9184],[-119.8862,38.9157],[-119.8834,38.9048],[-119.8797,38.8995],[-119.8846,38.8942],[-119.8809,38.8909],[-119.8795,38.887],[-119.8828,38.8813],[-119.8889,38.8791],[-119.8832,38.8758],[-119.8788,38.8751],[-119.8769,38.871],[-119.8802,38.8641],[-119.8916,38.8571],[-119.9002,38.8575],[-119.9057,38.8557],[-119.9086,38.845],[-119.9084,38.8344],[-119.923,38.8295],[-119.924,38.8253],[-119.9211,38.8214],[-119.9307,38.8154],[-119.9316,38.8123],[-119.9429,38.8022],[-119.9442,38.7967],[-119.9407,38.7957],[-119.9397,38.7938],[-119.9472,38.7861],[-119.948,38.7816],[-119.9595,38.7786],[-119.962,38.7767],[-119.9676,38.7764],[-119.9698,38.7725],[-119.9684,38.7683],[-119.9711,38.7641],[-119.9797,38.7631],[-119.9818,38.7616],[-119.9853,38.7533],[-119.983,38.7474],[-119.9853,38.7395],[-119.9883,38.7369],[-119.985,38.7337],[-119.9847,38.7287],[-119.9881,38.7224],[-119.9858,38.7156],[-119.9901,38.7094],[-120.0047,38.704],[-120.0121,38.7084],[-120.0167,38.709],[-120.0215,38.7126],[-120.0262,38.7211],[-120.0323,38.725],[-120.0346,38.7321],[-120.0371,38.7348],[-120.0519,38.7401],[-120.0524,38.7463],[-120.0541,38.7492],[-120.0498,38.7532],[-120.052,38.7555],[-120.0514,38.7585],[-120.0469,38.7603],[-120.0461,38.7631],[-120.047,38.7682],[-120.052,38.7735],[-120.048,38.7873],[-120.0541,38.791],[-120.0538,38.795],[-120.0454,38.803],[-120.0396,38.8031],[-120.0284,38.8077],[-120.0286,38.8112],[-120.0304,38.813],[-120.0289,38.8161],[-120.0297,38.8225],[-120.0343,38.8272],[-120.0433,38.8317],[-120.0598,38.8323],[-120.0635,38.8312],[-120.0737,38.8328],[-120.0984,38.8292],[-120.1017,38.8331],[-120.1056,38.8343],[-120.1075,38.8381],[-120.1067,38.8434],[-120.1116,38.8532],[-120.121,38.8596],[-120.1221,38.8646],[-120.1244,38.8669],[-120.1316,38.8701],[-120.1379,38.8695],[-120.1479,38.8777],[-120.1484,38.8804],[-120.1527,38.885],[-120.1539,38.8902],[-120.1511,38.9003],[-120.1555,38.9052],[-120.155,38.9086],[-120.1613,38.9145],[-120.1645,38.9228],[-120.1611,38.9279],[-120.1466,38.9344],[-120.1468,38.9383],[-120.1513,38.9484],[-120.15,38.9546],[-120.1425,38.9591],[-120.1411,38.9656],[-120.1425,38.9681],[-120.1492,38.9701],[-120.1517,38.9734],[-120.1521,38.9771],[-120.1585,38.9814],[-120.1611,38.982],[-120.1655,38.9785],[-120.1701,38.9777],[-120.1844,38.9833],[-120.1891,38.9905],[-120.193,38.9931],[-120.1989,39.0064],[-120.2039,39.0116],[-120.2069,39.0182],[-120.2062,39.0207],[-120.1956,39.0247],[-120.1894,39.0292],[-120.1951,39.0358],[-120.1925,39.0462],[-120.2005,39.0483],[-120.2012,39.0551],[-120.1981,39.0658],[-120.2078,39.061],[-120.2176,39.0637],[-120.2249,39.0638],[-120.2313,39.0667],[-120.2309,39.0736],[-120.2328,39.0764],[-120.2523,39.0844],[-120.2477,39.094],[-120.2482,39.0992],[-120.237,39.104],[-120.2368,39.1082],[-120.2336,39.1123],[-120.2422,39.1181],[-120.2477,39.1248],[-120.2441,39.1291],[-120.2433,39.134],[-120.2467,39.1406],[-120.2466,39.1471],[-120.24,39.1483],[-120.2343,39.1513],[-120.2271,39.1597],[-120.2202,39.1589],[-120.2186,39.1635],[-120.2092,39.1617],[-120.2092,39.1834],[-120.1702,39.1837],[-120.1699,39.1899],[-120.1822,39.1909],[-120.1822,39.1988],[-120.1797,39.2021],[-120.182,39.2079],[-120.1799,39.2108],[-120.1803,39.2136],[-120.1767,39.2146],[-120.177,39.217],[-120.1699,39.2188],[-120.1592,39.2183],[-120.1448,39.2202],[-120.1436,39.2233],[-120.1458,39.2294],[-120.1426,39.2387],[-120.1404,39.241],[-120.1279,39.244],[-120.1231,39.2492],[-120.0935,39.2523],[-120.0845,39.2611],[-120.0718,39.2613],[-120.0539,39.2675],[-120.05,39.273],[-120.0505,39.2806],[-120.0433,39.2809],[-120.0386,39.2842],[-120.033,39.2853],[-120.0331,39.2914],[-120.0288,39.2909],[-120.0235,39.2925],[-120.0164,39.2915],[-120.0099,39.2861],[-120.0055,39.28]]]]};

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
const focus = place.focus || null;
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
  label("EDC Burn Status",32,22,342,52,large?36:34,C.ink,true);
  label(place.label,390,32,298,34,18,C.muted,false,"right");
  label("EL DORADO COUNTY • OUTDOOR BURNING",32,79,490,26,17,C.faint,true);
  label(date,510,79,178,26,18,C.muted,false,"right");
}
function card(key,x,y,w,h,big) {
  const s=states[key], hex=color(s.status), compact=w<260;
  rounded(x,y,w,h,24,"FFFFFF",.055);
  rounded(x+1,y+18,4,h-36,2,hex,.8);
  if (!big && !compact) scene(x+w-133,y+h-76,120,64,key==="tahoe",.35);
  label(key==="west"?"West Slope":"Tahoe Basin",x+22,y+15,w-44,38,compact?20:big?28:23,C.ink,true);
  if (focus===key) label("YOUR AREA",x+w-113,y+21,91,22,12,C.muted,true,"right");
  if (big) label(key==="west"?"Western El Dorado County":"El Dorado County portion",x+22,y+52,w-44,40,compact?14:16,C.muted);
  const sy=y+(big?91:55), fs=compact?(big?38:30):big?56:43;
  flame(x+20,sy,fs,hex);
  const typeSize=compact?(s.status==="UNKNOWN"?13:big?22:20):s.status==="UNKNOWN"?(big?24:20):big?35:32;
  label(statusText(s.status),x+fs+29,sy+5,w-fs-46,big?58:48,typeSize,hex,true);
  label(s.detail,x+22,y+(big?158:112),w-44,big?70:43,compact?14:big?20:17,C.muted);
  if (big) {
    scene(x+10,y+h-132,w-20,120,key==="tahoe");
    label(key==="west"?"SIERRA FOOTHILLS":"SOUTH SHORE",x+22,y+h-29,w-44,20,compact?11:14,C.muted,true);
  }
}
function areaCards(y,h,big) {
  if (!focus) {
    card("west",32,y,318,h,big);
    card("tahoe",370,y,318,h,big);
  } else {
    card(focus,32,y,430,h,big);
    card(focus==="west"?"tahoe":"west",482,y,206,h,big);
  }
}
function paintSmall() {
  label("EDC Burn Status",23,17,314,42,32,C.ink,true);
  label(date,208,91,129,24,16,C.muted,false,"right");
  label(place.label,24,68,312,24,16,C.muted);
  label("EL DORADO COUNTY",24,93,176,20,13,C.faint,true);
  if (focus) {
    const other=focus==="west"?"tahoe":"west", s=states[focus], hex=color(s.status);
    rounded(22,121,316,112,17,"FFFFFF",.06);
    scene(234,148,93,76,focus==="tahoe",.65);
    label(focus==="west"?"West Slope":"Tahoe · EDC portion",35,132,212,25,18,C.muted,true);
    label("YOUR AREA",250,134,73,20,10,C.muted,true,"right");
    flame(34,170,44,hex);
    label(statusText(s.status),89,175,233,42,s.status==="UNKNOWN"?23:31,hex,true);
    const os=states[other], oc=color(os.status);
    rounded(22,244,316,56,15,"FFFFFF",.06);
    label(other==="west"?"West Slope":"Tahoe · EDC portion",35,249,287,20,14,C.muted,true);
    flame(35,271,21,oc);
    label(statusText(os.status),65,269,257,27,os.status==="UNKNOWN"?18:22,oc,true);
  } else {
    for (const [index,key] of ["west","tahoe"].entries()) {
      const y=121+index*86, s=states[key], hex=color(s.status);
      rounded(22,y,316,78,17,"FFFFFF",.06);
      scene(242,y+9,85,61,key==="tahoe",.65);
      label(key==="west"?"West Slope":"Tahoe · EDC portion",35,y+7,254,23,17,C.muted,true);
      flame(34,y+34,28,hex);
      label(statusText(s.status),73,y+33,249,34,s.status==="UNKNOWN"?22:28,hex,true);
    }
  }
  label("Checked "+stamp,24,309,312,23,16,C.muted);
  label("Created by Donahue Homestead",24,335,312,17,12,C.faint);
}
function paintMedium() {
  header();
  areaCards(111,161,false);
  label("Checked "+stamp,32,290,370,24,17,C.muted);
  label("Tap for official status",413,290,275,24,17,C.muted,false,"right");
  label("Tahoe: EDC portion • permits apply",32,318,318,20,12,C.faint);
  label("Created by Donahue Homestead",370,318,318,20,13,C.faint,false,"right");
}
function paintLarge() {
  header();
  areaCards(130,355,true);
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
  const fallback={label:"LOCATION UNAVAILABLE",focus:null};
  if (!USE_LOCATION) return {label:"EL DORADO COUNTY",focus:null};
  try {
    Location.setAccuracyToHundredMeters();
    const loc=await withTimeout(Location.current(),config.runsInWidget?3500:15000,null);
    if (!loc) return fallback;
    const area=regionForLocation(loc);
    return {label:area==="west"?"WEST SLOPE · YOUR AREA":area==="tahoe"?"TAHOE · YOUR AREA":"EL DORADO COUNTY",focus:area};
  } catch(e) { return fallback; }
}
function regionForLocation(loc) {
  const lat=loc.latitude, lon=loc.longitude, accuracy=loc.horizontalAccuracy;
  if (!Number.isFinite(lat)||!Number.isFinite(lon)||lat<-90||lat>90||lon<-180||lon>180||
      !Number.isFinite(accuracy)||accuracy<0||accuracy>1000) return null;
  const margin=Math.max(250,accuracy+150);
  if (!insideArea(lon,lat,AREA_BOUNDARIES.county) ||
      boundaryDistance(lon,lat,AREA_BOUNDARIES.county)<=margin ||
      boundaryDistance(lon,lat,AREA_BOUNDARIES.tahoe)<=margin) return null;
  return insideArea(lon,lat,AREA_BOUNDARIES.tahoe)?"tahoe":"west";
}
function insideRing(x,y,ring) {
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++) {
    const a=ring[i],b=ring[j];
    if((a[1]>y)!==(b[1]>y) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) inside=!inside;
  }
  return inside;
}
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

