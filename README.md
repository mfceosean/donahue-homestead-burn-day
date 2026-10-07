# Donahue Homestead Burn Day

A standalone [Scriptable](https://scriptable.app/) Home Screen widget for the El Dorado County West Slope and the **El Dorado County portion** of the Tahoe Basin. Small, medium, and large widgets are supported.

No MiniNAS, GitHub account, API key, or external artwork is needed. You do not need programming experience: install Scriptable, copy the script, and select it in a Home Screen widget.

## Download Scriptable and check compatibility

| Device | Link | Compatibility |
| --- | --- | --- |
| **iPhone / iPad (iOS / iPadOS)** | [Download Scriptable from the App Store](https://apps.apple.com/us/app/scriptable/id1405459188) | Supported installation path for this widget. |
| **Android** | No official Scriptable installation path | Requires a separate Android widget implementation. |

Scriptable's [official website](https://scriptable.app/) and [documentation](https://docs.scriptable.app/) describe an iOS app. This script uses native Scriptable APIs for rendering, location, and widgets. Detecting an Android device cannot provide those missing APIs; Android needs a separate app or implementation.

Android users can check the [official El Dorado County burn day page](https://www.eldoradocounty.ca.gov/Services/Burn-Day) in their browser.

## Install on iPhone or iPad

Allow a few minutes for setup. Have an internet connection available for the first run and for current burn status checks.

### 1. Install and open Scriptable

1. On the iPhone or iPad where you want the widget, open the [Scriptable App Store link](https://apps.apple.com/us/app/scriptable/id1405459188).
2. Tap **Get** (or the cloud download button if you previously installed it).
3. Open **Scriptable** once after installation.

### 2. Copy the complete widget code

1. Open [the widget's raw code](https://raw.githubusercontent.com/mfceosean/donahue-homestead-burn-day/main/Donahue_Burn_Day.js) in Safari. This link displays the JavaScript without GitHub's surrounding page.
2. Touch and hold the code, choose **Select All**, then **Copy**. You may need to expand the text-selection menu to find **Select All**.
3. Copy the **entire file**, including its first line (`// DONAHUE_RELEASE_VERSION: ...`) and its final closing brace.

If Safari downloads the file instead of showing its contents, open [Donahue_Burn_Day.js on GitHub](https://github.com/mfceosean/donahue-homestead-burn-day/blob/main/Donahue_Burn_Day.js), choose **Raw**, and copy the complete code. GitHub's Raw control may appear as **View raw** or in the file menu on a smaller screen.

### 3. Create and name the script

1. Return to **Scriptable**.
2. Tap the **+** button to create a new script.
3. Tap inside the empty code editor and choose **Paste**.
4. Tap the script's name at the top of the editor and rename it **Donahue Burn Day**. If your version shows a settings control instead, open the script settings and change its name there.
5. Confirm that the editor contains the full code, rather than just a web address.

Use a single script for this widget. You do not need to create a separate updater script.

### 4. Run it once and check the preview

1. In the script editor, tap the **▶ play/run** button.
2. If Scriptable asks for location access, allow it if you want the widget to emphasize your local area. Location is optional: denying it keeps both areas equally sized and does not prevent the burn status checks.
3. Wait for the preview to appear. The default in-app preview is **medium**.
4. Check that you see **Burn Day**, the date, and the two areas: **West Slope** and **Tahoe Basin**.
5. Close the preview and tap **Done** to leave the editor.

**Location emphasizes your area.** Within El Dorado County, the local area gets a larger card labeled **YOUR AREA** and the other area remains visible in a smaller card. Without a usable location, both cards stay equally sized. “Tahoe Basin” means the El Dorado County portion, not the entire basin. The widget continues to display those same two areas when used elsewhere.

A white **UNCONFIRMED** status can be a valid result. It means the available official postings could not confirm the status; it does not necessarily mean installation failed.

### 5. Add the widget to your Home Screen

1. Go to your iPhone or iPad **Home Screen**.
2. Touch and hold an empty area until the app icons jiggle.
3. Tap **Edit → Add Widget**, or the **+** button, depending on your iOS/iPadOS version.
4. Search for **Scriptable** and select it.
5. Swipe through the widget sizes. Choose **small**, **medium**, or **large**, then tap **Add Widget**.
6. Tap **Done**.

| Size | What you get |
| --- | --- |
| **Small** | Compact status for both areas. |
| **Medium** | Two side-by-side status cards with brief explanations. |
| **Large** | More detail, including separate county and CAL FIRE source results. |

The Home Screen size you choose controls the installed widget's layout. The medium preview in Scriptable does not limit you to a medium Home Screen widget.

### 6. Select the Burn Day script

1. Touch and hold the new **Scriptable widget**.
2. Tap **Edit Widget**.
3. Tap the **Script** field and choose **Donahue Burn Day**.
4. Leave **Parameter** empty; this widget does not require one.
5. Tap outside the settings panel to finish.
6. Allow a little time for the widget to load.

**You're ready:** the Home Screen widget should display the same two areas as the preview. Tapping it opens the county's official burn day page.

## How location changes the layout

- **Inside the El Dorado County West Slope:** the West Slope card is larger and appears first.
- **Inside the El Dorado County portion of the Tahoe Basin:** the Tahoe card is larger and appears first.
- **Location permission declined, disabled, or unavailable:** both areas remain equally sized.
- **Outside El Dorado County, near a boundary, or with poor GPS accuracy:** both areas remain equally sized so the widget does not guess which status applies.

The location check uses bundled geometry from the county's official [CountyBoundary layer](https://services.arcgis.com/UHg8l1wC48WQyDSO/ArcGIS/rest/services/CountyBoundary/FeatureServer/0) and [TRPA boundary layer](https://services.arcgis.com/UHg8l1wC48WQyDSO/ArcGIS/rest/services/TRPABoundary/FeatureServer/3). The Tahoe outline is used only within the El Dorado County boundary. It does not extend this widget's burn-status coverage to Placer County or Nevada.

The outlines are simplified for display selection, with an uncertainty margin near their edges. They are used only to choose a layout; they do not determine permission to burn. GPS coordinates are checked on your device and are not stored or sent to the GIS servers. Location is requested when the widget runs rather than continuously tracked.

## Read the burn status

| Color | Display | Meaning |
| --- | --- | --- |
| **Green** | **BURN DAY** | The county's posting and CAL FIRE's El Dorado County entry both allow burning. |
| **Red** | **NO BURN** | Either source confirms a prohibition. |
| **White** | **UNCONFIRMED** | The available postings do not confirm a clear status. |

The CAL FIRE entry applies to **State Responsibility Areas (SRA)**. Check the visible date, official postings, applicable permits, and local rules before burning. An unconfirmed result is not permission to burn.

Official sources:
- [El Dorado County burn day status](https://www.eldoradocounty.ca.gov/Services/Burn-Day)
- [CAL FIRE current burn status](https://burnpermit.fire.ca.gov/current-burn-status/)

## Automatic updates and refresh timing

After installation, the script checks [the public release file](https://raw.githubusercontent.com/mfceosean/donahue-homestead-burn-day/main/Donahue_Burn_Day.js) about every **six hours when iOS runs it**. Most widget updates require no further copying or setup.

Burn status is fetched when the script runs. The widget requests another refresh after about **30 minutes**, but **iOS determines the actual refresh time**. Neither timer guarantees an immediate Home Screen change.

A last working widget-code update is cached locally, and the installed code remains available as a fallback. This protects against failed code downloads; it does **not** guarantee current burn status without access to the official sources.

To check the current result manually, open Scriptable and run **Donahue Burn Day** again. This fetches burn status and checks for a code update if the update interval has elapsed. The Home Screen may still take time to refresh.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| **Scriptable is missing from the widget picker** | Open Scriptable once, then return to the Home Screen and try adding the widget again. |
| **The widget asks you to select a script or stays on a placeholder** | Touch and hold it → **Edit Widget** → **Script** → **Donahue Burn Day**. |
| **The script is missing from the selection list** | Return to Scriptable, confirm the script is saved with the expected name, run it once, and retry **Edit Widget**. |
| **Running the script shows a JavaScript error** | Replace the editor contents with the complete raw file. Do not paste the GitHub page, a URL, or only part of the code. Run it again. |
| **The header says LOCATION UNAVAILABLE** | Burn status checks still work. If you want automatic local-area emphasis, check **Settings → Privacy & Security → Location Services → Scriptable**, allow location access, and run the script again. |
| **Status is white / UNCONFIRMED** | Check your internet connection and tap through to the official sources. Unavailable, stale, or unexpected source data can produce this result. |
| **The date or checked time looks old** | Run the script in Scriptable with an internet connection. Give iOS time to refresh the Home Screen widget, and use the official page for an immediate status check. |
| **A newly published design change has not appeared** | Code checks occur about every six hours when iOS runs the script. Run it again after that interval; if an update check fails, it can retry after about 30 minutes on a later run. |
| **You want a different size** | Add a new Scriptable widget in the desired size and select the same **Donahue Burn Day** script. Remove the old widget if desired. |

If you need to reinstall the code, paste the latest complete file into the **existing Donahue Burn Day script** and run it again. Keeping the same script avoids having to select a new one in your widget settings.

## For maintainers: publishing widget updates

Edit `Donahue_Burn_Day.js`, increment the integer on its first line (`DONAHUE_RELEASE_VERSION`), and commit to `main`. Keep the `// WIDGET_BODY_START` marker and `runWidget` function.

Updates to the widget body take effect on installed devices at their next update check. Changes to the installer/updater code above that marker require users to replace their installed script. Keep the public repository path and branch unchanged so installed copies can continue checking for updates.

Created by Donahue Homestead.

