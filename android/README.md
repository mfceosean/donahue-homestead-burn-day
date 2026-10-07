# Android Burn Day widget (development build)

This is a native Android Home Screen widget for the same two El Dorado County burn postings shown by the iOS Scriptable widget. The Android implementation is separate because Scriptable's native widget, location, file, and drawing APIs are iOS APIs. The third-party page at android-apk.net is not an Android build of this project.

## Build and install

Open the `android` folder in Android Studio with JDK 17 and Android SDK 35 installed, sync Gradle, then build and install the `app` module on an Android 8.0+ device. The debug APK is generated at `app/build/outputs/apk/debug/app-debug.apk`. Add **Donahue Burn Day** from the Home Screen widget picker and resize it as needed.

This source branch is a development preview until an Android device build and on-device widget check pass. Do not distribute an APK as a released app before those checks. The GitHub Actions build checks compilation.

## Location

Open the app and tap **Allow location for local area**. The widget uses a recent location fix, tests it against the same bundled El Dorado County and Tahoe boundary outlines as the iOS version, and emphasizes the local area. If permission is declined, location is old or inaccurate, or the user is outside the supported county, both areas get equal prominence.

Android requires **Allow all the time** in system App Info settings for location to be available during automatic background widget updates. The app has a button that opens its settings page, where a user can select that option if the device offers it. Without that permission, opening the app and refreshing the widget can use a recent location briefly; later automatic updates revert to equal prominence. Only the two El Dorado County areas are supported. No coordinates are saved or sent to the GIS service.

The widget checks the El Dorado County and CAL FIRE pages directly at update time. A confirmed prohibition takes precedence, a burn day requires affirmative current postings from both sources, and unavailable or unexpected data yields **UNCONFIRMED**. Tap the widget for the county's official page. A scheduled 30-minute widget refresh is subject to Android's power and scheduling rules; check the displayed date and time and official sources before burning.

## Maintainer notes

Keep the date validation and conservative status combination in `BurnData.java` aligned with `Donahue_Burn_Day.js`. `area_boundaries.json` is copied from the iOS release's official county and TRPA geometry; update both if the outlines change. The app presently has no signing, Play Store publishing, or automatic Android APK updates.
