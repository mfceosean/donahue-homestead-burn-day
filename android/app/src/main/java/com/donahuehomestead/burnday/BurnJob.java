package com.donahuehomestead.burnday;

import android.Manifest;
import android.app.job.JobParameters;
import android.app.job.JobService;
import android.content.pm.PackageManager;
import android.os.Build;

public class BurnJob extends JobService {
    @Override public boolean onStartJob(JobParameters params) {
        new Thread(() -> {
            try {
                BurnData.Result status=BurnData.fetch();
                String focus=null;
                boolean background=Build.VERSION.SDK_INT<29 ||
                    checkSelfPermission(Manifest.permission.ACCESS_BACKGROUND_LOCATION)==PackageManager.PERMISSION_GRANTED;
                if(background)focus=BurnWidget.locationFocus(this);
                if(focus==null) {
                    android.content.SharedPreferences prefs=getSharedPreferences("location",0);
                    if(System.currentTimeMillis()-prefs.getLong("time",0)<30*60*1000)
                        focus=prefs.getString("focus","");
                }
                BurnWidget.update(this,status,focus);
            } catch(Exception ignored) {} finally {jobFinished(params,false);}
        }).start();
        return true;
    }
    @Override public boolean onStopJob(JobParameters params) {return true;}
}
