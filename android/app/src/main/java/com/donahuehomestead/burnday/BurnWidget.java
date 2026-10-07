package com.donahuehomestead.burnday;

import android.Manifest;
import android.app.PendingIntent;
import android.app.job.JobInfo;
import android.app.job.JobScheduler;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.location.Location;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Build;
import android.os.PersistableBundle;
import android.widget.RemoteViews;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class BurnWidget extends AppWidgetProvider {
    static final String ACTION_REFRESH="com.donahuehomestead.burnday.REFRESH";
    @Override public void onUpdate(Context context,AppWidgetManager manager,int[] ids) {
        refresh(context,ids,false);
    }
    @Override public void onAppWidgetOptionsChanged(Context context,AppWidgetManager manager,int id,android.os.Bundle options) {
        refresh(context,new int[]{id},false);
    }
    @Override public void onReceive(Context context,Intent intent) {
        super.onReceive(context,intent);
        if(ACTION_REFRESH.equals(intent.getAction()))
            refresh(context,AppWidgetManager.getInstance(context).getAppWidgetIds(new ComponentName(context,BurnWidget.class)),false);
    }
    static void refresh(Context context,int[] ids,boolean fromActivity) {
        if(ids.length==0)return;
        if(fromActivity) {
            String focus=locationFocus(context);
            context.getSharedPreferences("location",0).edit().putString("focus",focus==null?"":focus)
                .putLong("time",System.currentTimeMillis()).apply();
        }
        JobInfo job=new JobInfo.Builder(501,new ComponentName(context,BurnJob.class))
            .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
            .setOverrideDeadline(0)
            .build();
        ((JobScheduler)context.getSystemService(Context.JOB_SCHEDULER_SERVICE)).schedule(job);
    }
    static String locationFocus(Context context) {
        if(context.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED &&
           context.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION)!=PackageManager.PERMISSION_GRANTED)return null;
        try {
            LocationManager manager=(LocationManager)context.getSystemService(Context.LOCATION_SERVICE);
            Location best=null;
            for(String provider:manager.getProviders(true)) {
                Location loc=manager.getLastKnownLocation(provider);
                if(loc!=null && (best==null||loc.getTime()>best.getTime()))best=loc;
            }
            return BurnData.region(context,best);
        } catch(Exception ignored){return null;}
    }
    static void update(Context context,BurnData.Result data,String focus) {
        AppWidgetManager manager=AppWidgetManager.getInstance(context);
        int[] ids=manager.getAppWidgetIds(new ComponentName(context,BurnWidget.class));
        for(int id:ids) {
            android.os.Bundle options=manager.getAppWidgetOptions(id);
            int width=options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH,250);
            int height=options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT,120);
            boolean tall=height>width*.85;
            Bitmap bitmap=render(data,focus,tall);
            RemoteViews views=new RemoteViews(context.getPackageName(),R.layout.widget);
            views.setImageViewBitmap(R.id.image,bitmap);
            Intent web=new Intent(Intent.ACTION_VIEW,Uri.parse(BurnData.COUNTY_URL));
            PendingIntent tap=PendingIntent.getActivity(context,0,web,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.image,tap);
            manager.updateAppWidget(id,views);
        }
    }
    private static Bitmap render(BurnData.Result data,String focus,boolean tall) {
        int w=tall?600:900,h=tall?600:330;
        Bitmap result=Bitmap.createBitmap(w,h,Bitmap.Config.ARGB_8888);
        Canvas c=new Canvas(result);
        Paint p=new Paint(Paint.ANTI_ALIAS_FLAG);
        c.drawColor(Color.rgb(14,28,42));
        drawText(c,p,"Burn Day",28,58,39,0xfff4f7fc,true);
        drawText(c,p,"EL DORADO COUNTY",28,88,18,0xff91aac2,true);
        String date=data.day.format(DateTimeFormatter.ofPattern("EEE, MMM d",Locale.US));
        drawText(c,p,date,w-180,52,22,0xffaabbd0,false);
        String[] keys={"west","tahoe"};
        if("tahoe".equals(focus)) keys=new String[]{"tahoe","west"};
        if(tall) {
            int firstHeight=focus==null?194:254;
            drawCard(c,p,keys[0],data,26,108,w-52,firstHeight,keys[0].equals(focus));
            drawCard(c,p,keys[1],data,26,116+firstHeight,w-52,focus==null?194:130,keys[1].equals(focus));
        } else {
            int firstWidth=focus==null?410:540;
            drawCard(c,p,keys[0],data,26,108,firstWidth,160,keys[0].equals(focus));
            drawCard(c,p,keys[1],data,36+firstWidth,108,w-62-firstWidth,160,keys[1].equals(focus));
        }
        String stamp=DateTimeFormatter.ofPattern("h:mm a z",Locale.US).withZone(BurnData.ZONE).format(Instant.ofEpochMilli(data.checkedAt));
        drawText(c,p,"Checked "+stamp+"  •  Tap for official status",28,h-25,tall?19:17,0xffaabbd0,false);
        return result;
    }
    private static void drawCard(Canvas c,Paint p,String key,BurnData.Result data,int x,int y,int w,int h,boolean selected) {
        p.setColor(0xff1b3446);p.setStyle(Paint.Style.FILL);
        c.drawRoundRect(new RectF(x,y,x+w,y+h),20,20,p);
        String status="west".equals(key)?data.west:data.tahoe;
        int color=BurnData.YES.equals(status)?0xff50e3a4:BurnData.NO.equals(status)?0xffff7181:0xfff4f7fc;
        p.setColor(color);
        c.drawRoundRect(new RectF(x+2,y+15,x+7,y+h-15),3,3,p);
        String name="west".equals(key)?"West Slope":"Tahoe · EDC";
        drawText(c,p,name,x+24,y+40,w<320?23:26,0xfff4f7fc,true);
        if(selected&&w>=380) drawText(c,p,"YOUR AREA",x+w-142,y+39,16,0xffaabbd0,true);
        String text=BurnData.YES.equals(status)?"BURN DAY":BurnData.NO.equals(status)?"NO BURN":"UNCONFIRMED";
        drawText(c,p,"● "+text,x+24,y+Math.min(h-35,96),w<320?22:32,color,true);
        if(h>140&&w>320) {
            String detail="west".equals(key)?data.detailWest:data.detailTahoe;
            drawText(c,p,detail,x+24,y+Math.min(h-17,139),18,0xffaabbd0,false);
        }
    }
    private static void drawText(Canvas c,Paint p,String text,int x,int y,int size,int color,boolean bold) {
        p.setColor(color);p.setStyle(Paint.Style.FILL);p.setTextSize(size);
        p.setTypeface(bold?android.graphics.Typeface.create("sans-serif",android.graphics.Typeface.BOLD):
            android.graphics.Typeface.create("sans-serif",android.graphics.Typeface.NORMAL));
        c.drawText(text,x,y,p);
    }
}
