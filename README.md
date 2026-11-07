# Donahue Homestead Burn Day

A standalone [Scriptable](https://scriptable.app/) Home Screen widget for **El Dorado, Placer, Yuba, and Sutter counties**, with separate burn zones where required. Small, medium, and large widgets are supported. Each size displays **one area only**, selected automatically from your location or manually in the app.

No MiniNAS, GitHub account, API key, or external artwork is needed. You do not need programming experience: install Scriptable, copy the script, and select it in a Home Screen widget.

Please read the [disclaimer and limitation of liability](#disclaimer-and-limitation-of-liability) before using the widget.

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
2. Choose **Automatic — current location**, or choose a county and then its burn area/zone. Your choice is saved on this device. Automatic mode requests location access; manual choices do not need GPS.
3. Wait for the preview to appear. The default in-app preview is **medium**.
4. Check that you see **Burn Status**, the date, and just the selected county and area.
5. Close the preview and tap **Done** to leave the editor.

**One area at a time.** Automatic mode follows your location within the supported counties, respecting the limits described below. A manual choice stays selected until you change it. “Tahoe Basin” under El Dorado means that county's portion. Placer's Lake Tahoe shore is a separate choice. If automatic mode cannot confidently identify a supported area, the widget asks you to choose one and shows **UNCONFIRMED**, rather than displaying another area's result.

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
| **Small** | One area, its status, and a short explanation. |
| **Medium** | One full-width area card with its status and explanation. |
| **Large** | One area with county and CAL FIRE source results for that area only. |

The Home Screen size you choose controls the installed widget's layout. The medium preview in Scriptable does not limit you to a medium Home Screen widget.

### 6. Select the Burn Day script

1. Touch and hold the new **Scriptable widget**.
2. Tap **Edit Widget**.
3. Tap the **Script** field and choose **Donahue Burn Day**.
4. Leave **Parameter** empty; this widget does not require one.
5. Tap outside the settings panel to finish.
6. Allow a little time for the widget to load.

**You're ready:** the Home Screen widget displays one selected area. Tap it to open the area selector in Scriptable. Choose **Open official burn status** in that menu to visit the county page. iOS may take time to refresh the Home Screen after changing your choice.

## Coverage and area selection

| County | Coverage | Automatic location |
| --- | --- | --- |
| **El Dorado** | West Slope and El Dorado's Tahoe Basin portion | Selects the supported zone |
| **Placer** | Western, Eastern, Lake Tahoe shore, Truckee Fire area, Granite Bay/Loomis, Auburn, Lincoln, Rocklin, Roseville | Selects the official mapped area; city prohibitions are retained |
| **Yuba** | Four residential burn zones plus county overview | County overview; select a zone if decisions differ |
| **Sutter** | Seven residential burn zones plus county overview | County overview; select a zone if decisions differ |

Tap the widget, or run **Donahue Burn Day** in Scriptable, to open the selector. Choose **Automatic — current location**, or choose a county and then an area. **Open official burn status** opens the current manual area's source (the El Dorado page when Automatic is selected). Yuba/Sutter menus include an official zone-map link. **Cancel** preserves the saved selection.

The saved choice applies to all widgets using this script on the same device and survives automatic updates. Leave the Home Screen widget **Parameter** empty. Manual selection bypasses GPS. Automatic mode does not reuse a previous location.

Yuba and Sutter's county overview is affirmative only if **every residential zone** confirms burning within its posted hours. It is negative only if every zone reports no burning at the current time. Mixed or incomplete results remain unconfirmed and ask you to select a zone. The district-permit/agricultural column is never substituted for the residential decision.

When location is unavailable, inaccurate, near a mapped boundary, overlapping, or outside coverage, the widget shows one unconfirmed selection prompt. Placer geography comes from its official public burn-status map. El Dorado geography comes from the official county/TRPA layers. Yuba/Sutter county outlines come from US Census TIGERweb; individual zone geometry is not inferred. Coordinates are checked locally and are not stored or sent to a GIS service.

Placer status codes are matched to the current Pacific date, including posted 8 AM–5 PM/6 PM windows. Daylight-only codes use NOAA solar equations over the area's bounding corners; a five-minute uncertainty margin and times outside the confirmed daylight window remain unconfirmed. This calculation does not assess local terrain or replace permit conditions.

**Not yet covered:** Amador, Calaveras, Sacramento, Alpine, Northern Sierra's Nevada/Truckee/Sierra/Plumas areas, and Nevada-state fire districts. The Northern Sierra table currently publishes weekday-only headings without a full date; it has not been enabled as a confirmed daily feed. Phone-only and undated sources require further validation. Do not use an adjacent county's status for these areas.

## Read the burn status

| Color | Display | Meaning |
| --- | --- | --- |
| **Green** | **BURN DAY** | The selected area's official residential decision and its own county's CAL FIRE entry both allow burning within confirmed hours. |
| **Red** | **NO BURN** | Either source confirms a prohibition. |
| **White** | **UNCONFIRMED** | The available postings do not confirm a clear status. |

The CAL FIRE entry applies to **State Responsibility Areas (SRA)**. Check the visible date, official postings, applicable permits, and local rules before burning. An unconfirmed result is not permission to burn.

Official sources:
- [Placer County burn-day map](https://www.placer.ca.gov/1671/Burn-Days) and its [public data service](https://services9.arcgis.com/NENkjkswKTzMfG3A/arcgis/rest/services/Burn_Day_Status_Public/FeatureServer/0)
- [Feather River residential burn decisions](https://www.fraqmdca.gov/burn-day-status), with its district-hosted [fallback](https://fraqmd.specialdistrict.org/burn-day-status)
- [Feather River zone maps](https://www.fraqmdca.gov/burn-zone-information)
- [NOAA solar equations](https://gml.noaa.gov/grad/solcalc/solareqns.PDF)
- [El Dorado County burn day status](https://www.eldoradocounty.ca.gov/Services/Burn-Day)
- [CAL FIRE current burn status](https://burnpermit.fire.ca.gov/current-burn-status/)

## Automatic updates and refresh timing

After installation, the script checks [the public release file](https://raw.githubusercontent.com/mfceosean/donahue-homestead-burn-day/main/Donahue_Burn_Day.js) about every **six hours when iOS runs it**. Most widget updates require no further copying or setup.

**Release 8 (November 6, 2026):** adds all nine official Placer areas and eleven Yuba/Sutter residential zones, with county overviews for the latter. Automatic mode recognizes all four supported counties. Selection is grouped by county, and the title is now **Burn Status**. Daily dates, local bans, posted hours, daylight restrictions, unknown data, and county-specific CAL FIRE status are evaluated separately. The existing loader and saved selections are preserved. The downloaded body remains within the original loader's size limit; no reinstall is needed.

**Release 7 (November 6, 2026):** all sizes show one automatically located or manually selected area. Tap the widget to choose automatic mode, West Slope, Tahoe Basin (EDC portion), or the official page. Manual selection is saved locally and bypasses GPS. Unavailable or unsupported automatic locations show an unconfirmed selection prompt. The existing loader is unchanged apart from its release number; installed copies receive this through the usual automatic update process without reinstalling.

**Release 6 (November 6, 2026):** separate daily county postings are evaluated by their dates, so yesterday's table no longer conflicts with today's burn day. Explicit county and CAL FIRE start times are checked in Pacific time; before a posted opening, the widget shows **NO BURN** and requests a refresh at that start time (or in 30 minutes, whichever comes first). Unreadable explicit start times remain unconfirmed. The existing loader, update URL, six-hour code check, and cached fallback are preserved; no reinstall is needed.

**Release 5 (October 7, 2026):** the top heading was **EDC Burn Status** in small, medium, and large widgets. Existing installations receive this heading automatically at their next successful code update check; no reinstall or script rename is needed. EDC means El Dorado County. The longer heading has adjusted spacing in each layout.

Burn status is fetched when the script runs. The widget requests another refresh after about **30 minutes**, but **iOS determines the actual refresh time**. Neither timer guarantees an immediate Home Screen change.

A last working widget-code update is cached locally, and the installed code remains available as a fallback. This protects against failed code downloads; it does **not** guarantee current burn status without access to the official sources.

To check the current result manually, open Scriptable and run **Donahue Burn Day** again. Choose a county/area or automatic mode to fetch burn status. The script checks for a code update if the update interval has elapsed. The Home Screen may still take time to refresh.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| **Scriptable is missing from the widget picker** | Open Scriptable once, then return to the Home Screen and try adding the widget again. |
| **The widget asks you to select a script or stays on a placeholder** | Touch and hold it → **Edit Widget** → **Script** → **Donahue Burn Day**. |
| **The script is missing from the selection list** | Return to Scriptable, confirm the script is saved with the expected name, run it once, and retry **Edit Widget**. |
| **Running the script shows a JavaScript error** | Replace the editor contents with the complete raw file. Do not paste the GitHub page, a URL, or only part of the code. Run it again. |
| **The header says LOCATION UNAVAILABLE or AREA NOT CONFIRMED** | Tap the widget and select a supported county/area manually, or check Scriptable location permission and use Automatic mode. Unsupported counties remain unconfirmed. |
| **Status is white / UNCONFIRMED** | Check your internet connection and tap through to the official sources. Unavailable, stale, or unexpected source data can produce this result. |
| **The date or checked time looks old** | Run the script in Scriptable with an internet connection. Give iOS time to refresh the Home Screen widget, and use the official page for an immediate status check. |
| **A newly published design change has not appeared** | Code checks occur about every six hours when iOS runs the script. Run it again after that interval; if an update check fails, it can retry after about 30 minutes on a later run. |
| **You want a different size** | Add a new Scriptable widget in the desired size and select the same **Donahue Burn Day** script. Remove the old widget if desired. |

If you need to reinstall the code, paste the latest complete file into the **existing Donahue Burn Day script** and run it again. Keeping the same script avoids having to select a new one in your widget settings.

## For maintainers: publishing widget updates

Edit `Donahue_Burn_Day.js`, increment the integer on its first line (`DONAHUE_RELEASE_VERSION`), and commit to `main`. Keep the `// WIDGET_BODY_START` marker and `runWidget` function.

Updates to the widget body take effect on installed devices at their next update check. Changes to the installer/updater code above that marker require users to replace their installed script. Keep the public repository path and branch unchanged so installed copies can continue checking for updates.

## Regression checks

Run `node tests/burn-status.cjs`, `node tests/loader.cjs`, `node tests/selection.cjs`, and `node tests/regional.cjs` with Node.js. The fixtures capture the official November 5/6 county tables and November 6 CAL FIRE entry. Checks cover different daily dates, actual same-day prohibitions, ongoing suspensions, Pacific start-time boundaries, invalid times, and upgrade/cache/fallback execution in all four Scriptable widget sizes. Selection checks cover a single area in every size, differing West Slope/Tahoe decisions, manual persistence and GPS bypass, missing/outside/ambiguous location, source suppression without a selected area, menu actions, and unchanged loader code. Regional checks cover Placer codes and dates, local bans, county-specific CAL FIRE isolation, residential column selection, missing zones, county consensus, burn-hour limits, solar windows, automatic geometry, and the original loader size limit. Drawing and device APIs are mocked; physical iOS rendering and refresh scheduling require device verification.

Created by Donahue Homestead.

## Disclaimer and limitation of liability

**This widget is an informational convenience only. It is not an official burn authorization, permit, emergency alert system, or substitute for checking with the responsible authorities. A green “BURN DAY” display does not, by itself, mean you may legally or safely burn.**

Burn statuses, dates, location-based area selection, and other displayed information may be inaccurate, incomplete, outdated, delayed, or unavailable because of source errors, website changes, network failures, device refresh limits, GPS errors, software defects, or other causes. Donahue Homestead does not control official source data or guarantee that changes will appear immediately.

Before every burn, independently verify the current status for your actual burn location through the [official county page](https://www.eldoradocounty.ca.gov/Services/Burn-Day), [CAL FIRE](https://burnpermit.fire.ca.gov/current-burn-status/), and applicable local authorities. You are responsible for required permits, restrictions, weather conditions, safe practices, and compliance with all applicable rules.

**The widget is provided “AS IS” and “AS AVAILABLE,” without warranties to the fullest extent permitted by law.** Use is at your own risk. To the fullest extent permitted by applicable law, Donahue Homestead and its owners, developers, maintainers, and contributors disclaim liability for claims, losses, injuries, property damage, fines, costs, or other damages arising from use of, inability to use, or reliance on the widget or its data. Nothing in this disclaimer excludes liability or limits rights that cannot legally be excluded or limited.
