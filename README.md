# Donahue Homestead Burn Day

A standalone [Scriptable](https://scriptable.app/) Home Screen widget for the El Dorado County West Slope and the **El Dorado County portion** of the Tahoe Basin. No MiniNAS, account, API key, or external artwork is needed.

## Install

1. Install Scriptable on your iPhone or iPad.
2. Open [Donahue_Burn_Day.js](Donahue_Burn_Day.js), tap **Raw**, and copy the entire file.
3. In Scriptable, create a new script, name it **Donahue Burn Day**, paste the code, and run it once. Allow location access if you want your city shown in the header. Location does not change the two coverage areas.
4. Add a Scriptable widget to your Home Screen. Edit it and choose **Donahue Burn Day** as the script. Small, medium, and large widgets are supported.

Tapping the widget opens the county's official burn day page. Check the date and applicable permits and local rules before burning.

## Colors

- **Green:** the county's posting and CAL FIRE's El Dorado County entry both allow burning.
- **Red:** either source confirms a prohibition.
- **White:** the available postings do not confirm a clear status.

The CAL FIRE entry applies to State Responsibility Areas; other local restrictions may also apply.

## Automatic updates

The installed script checks [the public release file](https://raw.githubusercontent.com/mfceosean/donahue-homestead-burn-day/main/Donahue_Burn_Day.js) about every six hours **when iOS runs the widget**. iOS decides the actual refresh time. A last working update is cached for offline use; the original installed widget remains available as a fallback.

To publish an updated widget, edit `Donahue_Burn_Day.js`, increment the integer on its first line (`DONAHUE_RELEASE_VERSION`), and commit to `main`. Keep the `// WIDGET_BODY_START` marker and `runWidget` function. Updates to the widget body take effect on installed devices at their next update check. A change to the installer/updater code above that marker would require people to replace their installed script.

Created by Donahue Homestead.
