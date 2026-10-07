package com.donahuehomestead.burnday;

import android.Manifest;
import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.provider.Settings;
import android.net.Uri;
import android.view.Gravity;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
    private TextView info;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(32, 48, 32, 32);
        info = new TextView(this);
        info.setTextSize(18);
        Button location = new Button(this);
        location.setText("Allow location for local area");
        Button background = new Button(this);
        background.setText("Allow all-the-time location in Settings");
        Button refresh = new Button(this);
        refresh.setText("Refresh widget now");
        root.addView(info);
        root.addView(location);
        root.addView(background);
        root.addView(refresh);
        root.setGravity(Gravity.CENTER_VERTICAL);
        setContentView(root);
        location.setOnClickListener(v -> {
            if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED)
                requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, 7);
            else update();
        });
        background.setOnClickListener(v -> startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
            Uri.parse("package:" + getPackageName()))));
        refresh.setOnClickListener(v -> update());
        update();
    }
    @Override public void onRequestPermissionsResult(int request, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(request, permissions, results);
        update();
    }
    private void update() {
        boolean fine = checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean coarse = checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean background = android.os.Build.VERSION.SDK_INT < 29 ||
            checkSelfPermission(Manifest.permission.ACCESS_BACKGROUND_LOCATION) == PackageManager.PERMISSION_GRANTED;
        info.setText("El Dorado County Burn Day\n\nAdd the Donahue Burn Day widget from your Android Home Screen widget picker.\n\n"
            + "Location: " + (fine || coarse ? "allowed" : "off") + "\nAutomatic location while the widget refreshes: "
            + (background ? "allowed" : "off") + "\n\n"
            + "Without a reliable location, West Slope and Tahoe have equal prominence. "
            + "Tap the widget for the official county posting. Location is checked on device.");
        int[] ids = AppWidgetManager.getInstance(this).getAppWidgetIds(new ComponentName(this, BurnWidget.class));
        if (ids.length > 0) BurnWidget.refresh(this, ids, true);
    }
}
