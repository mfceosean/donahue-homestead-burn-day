package com.donahuehomestead.burnday;

import android.content.Context;
import android.location.Location;
import android.text.Html;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

final class BurnData {
    static final String COUNTY_URL = "https://www.eldoradocounty.ca.gov/Services/Burn-Day";
    static final String FIRE_URL = "https://burnpermit.fire.ca.gov/current-burn-status/";
    static final ZoneId ZONE = ZoneId.of("America/Los_Angeles");
    static final String YES = "YES", NO = "NO", UNKNOWN = "UNKNOWN";
    static final class Result {
        String west = UNKNOWN, tahoe = UNKNOWN, detailWest = "Official posting unconfirmed", detailTahoe = "Official posting unconfirmed";
        LocalDate day = LocalDate.now(ZONE);
        long checkedAt = System.currentTimeMillis();
    }
    private static final class Status {
        final String value, detail;
        Status(String v, String d) { value=v; detail=d; }
    }
    static Result fetch() {
        Result out = new Result();
        String countyHtml = get(COUNTY_URL), fireHtml = get(FIRE_URL);
        Status[] county = parseCounty(countyHtml, out.day);
        String fire = parseFire(fireHtml, out.day);
        Status west = combine(county[0], fire), tahoe = combine(county[1], fire);
        out.west=west.value; out.detailWest=west.detail;
        out.tahoe=tahoe.value; out.detailTahoe=tahoe.detail;
        return out;
    }
    private static Status combine(Status county, String fire) {
        if (NO.equals(county.value)) return county;
        if ("SUSPENDED".equals(fire)) return new Status(NO, "CAL FIRE: suspended (SRA)");
        if (YES.equals(county.value) && "OPEN".equals(fire)) return new Status(YES, "Both sources allow burning");
        return new Status(UNKNOWN, UNKNOWN.equals(county.value) ? county.detail : "CAL FIRE check unavailable");
    }
    private static String get(String link) {
        HttpURLConnection connection = null;
        try {
            connection=(HttpURLConnection)new URL(link).openConnection();
            connection.setConnectTimeout(9000);
            connection.setReadTimeout(10000);
            connection.setRequestProperty("User-Agent", "Mozilla/5.0");
            connection.setRequestProperty("Accept", "text/html");
            connection.setRequestProperty("Cache-Control", "no-cache");
            if (connection.getResponseCode()!=200) return null;
            ByteArrayOutputStream bytes=new ByteArrayOutputStream();
            try (InputStream in=connection.getInputStream()) {
                byte[] buf=new byte[8192]; int n;
                while ((n=in.read(buf))!=-1) {
                    bytes.write(buf,0,n);
                    if (bytes.size()>1500000) return null;
                }
            }
            return bytes.toString(StandardCharsets.UTF_8.name());
        } catch (Exception ignored) { return null; }
        finally { if (connection!=null) connection.disconnect(); }
    }
    private static final Pattern TABLE = Pattern.compile("<table\\b[^>]*>[\\s\\S]*?</table>",Pattern.CASE_INSENSITIVE);
    private static final Pattern ROW = Pattern.compile("<tr\\b[^>]*>[\\s\\S]*?</tr>",Pattern.CASE_INSENSITIVE);
    private static final Pattern CELL = Pattern.compile("<t[dh]\\b[^>]*>([\\s\\S]*?)</t[dh]>",Pattern.CASE_INSENSITIVE);
    private static final Pattern COMMENT = Pattern.compile("<!--[\\s\\S]*?-->");
    private static String clean(String html) {
        return COMMENT.matcher(html).replaceAll(" ").replaceAll("(?is)<(script|style)\\b[^>]*>[\\s\\S]*?</\\1>"," ");
    }
    private static String text(String html) {
        return Html.fromHtml(html,Html.FROM_HTML_MODE_LEGACY).toString().replaceAll("\\s+"," ").trim();
    }
    private static List<String> cells(String row) {
        ArrayList<String> out=new ArrayList<>();
        Matcher m=CELL.matcher(row);
        while (m.find()) out.add(text(m.group(1)));
        return out;
    }
    private static List<String> dates(String value) {
        Set<String> found=new LinkedHashSet<>();
        Matcher longDate=Pattern.compile("\\b(January|February|March|April|May|June|July|August|September|October|November|December)\\s+(\\d{1,2})(?:st|nd|rd|th)?\\s*,?\\s*(20\\d{2})\\b",Pattern.CASE_INSENSITIVE).matcher(value);
        while(longDate.find()) {
            try {
                String s=longDate.group(1)+" "+longDate.group(2)+" "+longDate.group(3);
                found.add(LocalDate.parse(s,DateTimeFormatter.ofPattern("MMMM d uuuu",Locale.US).withResolverStyle(java.time.format.ResolverStyle.STRICT)).toString());
            } catch(Exception ignored) {}
        }
        Matcher numeric=Pattern.compile("\\b(\\d{1,2})/(\\d{1,2})/(20\\d{2})\\b").matcher(value);
        while(numeric.find()) try {found.add(LocalDate.of(Integer.parseInt(numeric.group(3)),Integer.parseInt(numeric.group(1)),Integer.parseInt(numeric.group(2))).toString());}catch(Exception ignored){}
        Matcher iso=Pattern.compile("\\b(20\\d{2})-(\\d{2})-(\\d{2})\\b").matcher(value);
        while(iso.find()) try {found.add(LocalDate.parse(iso.group()).toString());}catch(Exception ignored){}
        return new ArrayList<>(found);
    }
    static Status[] parseCounty(String html, LocalDate day) {
        Status[] out={new Status(UNKNOWN,"County source unavailable"),new Status(UNKNOWN,"County source unavailable")};
        if (html==null) return out;
        out[0]=out[1]=new Status(UNKNOWN,"Today's posting unconfirmed");
        String cleaned=clean(html);
        Matcher heading=Pattern.compile("(?is)<h[1-6]\\b[^>]*>\\s*El Dorado County Outdoor Burn Day Status\\s*</h[1-6]>").matcher(cleaned);
        if (!heading.find()) return out;
        String tail=cleaned.substring(heading.end()).split("(?i)<h[12]\\b",2)[0];
        @SuppressWarnings("unchecked") List<Status>[] records=new List[]{new ArrayList<>(),new ArrayList<>()};
        Matcher table=TABLE.matcher(tail); int lastEnd=0;
        while(table.find()) {
            String prefix=text(tail.substring(lastEnd,table.start()));
            lastEnd=table.end();
            ArrayList<String> rows=new ArrayList<>();
            Matcher rm=ROW.matcher(table.group());
            while(rm.find()) rows.add(rm.group());
            StringBuilder header=new StringBuilder(prefix);
            for(String row:rows) if(!text(row).matches("(?is).*(WEST\\s+SLOPE|(?:SOUTH\\s+LAKE\\s+)?TAHOE\\s+BASIN).*")) header.append(' ').append(text(row));
            String context=header.toString();
            boolean suspended=Pattern.compile("(?:CAL\\s*FIRE|BURN\\s+PERMITS?).{0,35}(?:HAS\\s+)?SUSPENDED|SUSPENDED\\s+ALL\\s+BURN\\s+PERMITS",Pattern.CASE_INSENSITIVE).matcher(context).find()
                && !Pattern.compile("LIFTED|RESCINDED|NO\\s+LONGER|NOT\\s+SUSPENDED",Pattern.CASE_INSENSITIVE).matcher(context).find();
            List<String> headerDates=dates(context);
            for(String row:rows) {
                List<String> c=cells(row);
                if(c.size()<2) continue;
                int key=Pattern.compile("WEST\\s+SLOPE",Pattern.CASE_INSENSITIVE).matcher(c.get(0)).find()?0:
                    Pattern.compile("TAHOE",Pattern.CASE_INSENSITIVE).matcher(c.get(0)).find()?1:-1;
                if(key<0) continue;
                String value=String.join(" ",c.subList(1,c.size())).toUpperCase(Locale.US);
                List<String> rowDates=dates(value), applicable=rowDates.isEmpty()?headerDates:rowDates;
                String status=UNKNOWN, detail="Posting not dated for today";
                boolean no=Pattern.compile("\\bNO[ -]+BURN\\b|\\bNON[ -]?BURN\\b|\\bNOT\\s+(?:A\\s+)?BURN\\s+DAY\\b").matcher(value).find();
                boolean yes=value.matches("(?s)^(?:YES[ :–-]*)?(?:BURN(?:\\s+DAY)?|PERMISSIVE\\s+BURN\\s+DAY|BURNING\\s+(?:ALLOWED|PERMITTED))[.!\\s]*$");
                if(applicable.size()==1 && applicable.get(0).equals(day.toString())) {
                    if(no){status=NO;detail="County reports no burning";}
                    else if(yes&&!suspended){status=YES;detail="Permits / local rules apply";}
                } else if(no&&suspended&&applicable.size()==1&&applicable.get(0).compareTo(day.toString())<=0) {
                    status=NO;detail="Burn permits suspended";
                } else if(applicable.size()==1) detail="Posting: "+applicable.get(0).substring(5)+" · verify today";
                records[key].add(new Status(status,detail));
            }
        }
        for(int k=0;k<2;k++) if(!records[k].isEmpty()) {
            Status first=records[k].get(0), selected=first;
            for(Status s:records[k]) if(NO.equals(s.value)){selected=s;break;}
            else if(!s.value.equals(first.value)) selected=new Status(UNKNOWN,"Conflicting county postings");
            out[k]=selected;
        }
        return out;
    }
    static String parseFire(String html,LocalDate day) {
        if(html==null) return UNKNOWN;
        ArrayList<String> values=new ArrayList<>();
        Matcher rows=ROW.matcher(COMMENT.matcher(html).replaceAll(" "));
        while(rows.find()) {
            List<String> c=cells(rows.group());
            if(c.size()<3 || !c.get(0).matches("(?i)El\\s+Dorado\\s+County")) continue;
            List<String> d=dates(c.get(2));
            if(d.size()!=1||d.get(0).compareTo(day.toString())>0) {values.add(UNKNOWN);continue;}
            String v=c.get(1);
            values.add(v.matches("(?is)^Burning\\s+Suspended\\b.*")?"SUSPENDED":
                v.matches("(?is)^(Burning\\s+Allowed|Permit\\s+Required)\\b.*")?"OPEN":UNKNOWN);
        }
        if(values.contains("SUSPENDED")) return "SUSPENDED";
        if(values.isEmpty()) return UNKNOWN;
        for(String value:values) if(!value.equals(values.get(0))) return UNKNOWN;
        return values.get(0);
    }
    static String region(Context context, Location location) {
        try {
            if(location==null || System.currentTimeMillis()-location.getTime()>30*60*1000 ||
                !location.hasAccuracy() || location.getAccuracy()>1000) return null;
            double lat=location.getLatitude(), lon=location.getLongitude();
            if(!Double.isFinite(lat)||!Double.isFinite(lon)) return null;
            byte[] bytes;
            try(InputStream in=context.getAssets().open("area_boundaries.json")) {
                ByteArrayOutputStream output=new ByteArrayOutputStream();
                byte[] buffer=new byte[8192];int n;
                while((n=in.read(buffer))!=-1)output.write(buffer,0,n);
                bytes=output.toByteArray();
            }
            JSONObject areas=new JSONObject(new String(bytes,StandardCharsets.UTF_8));
            JSONArray county=areas.getJSONArray("county"), tahoe=areas.getJSONArray("tahoe");
            double margin=Math.max(250,location.getAccuracy()+150);
            if(!inside(lon,lat,county)||distance(lon,lat,county)<=margin||distance(lon,lat,tahoe)<=margin) return null;
            return inside(lon,lat,tahoe)?"tahoe":"west";
        } catch(Exception ignored) {return null;}
    }
    private static boolean inside(double x,double y,JSONArray polygons) throws Exception {
        for(int p=0;p<polygons.length();p++) {
            JSONArray rings=polygons.getJSONArray(p);
            if(!inRing(x,y,rings.getJSONArray(0)))continue;
            boolean hole=false;
            for(int h=1;h<rings.length();h++) if(inRing(x,y,rings.getJSONArray(h)))hole=true;
            if(!hole)return true;
        }
        return false;
    }
    private static boolean inRing(double x,double y,JSONArray ring) throws Exception {
        boolean in=false;int length=ring.length();
        for(int i=0,j=length-1;i<length;j=i++) {
            JSONArray a=ring.getJSONArray(i),b=ring.getJSONArray(j);
            double ay=a.getDouble(1),by=b.getDouble(1);
            if((ay>y)!=(by>y)&&x<(b.getDouble(0)-a.getDouble(0))*(y-ay)/(by-ay)+a.getDouble(0))in=!in;
        }
        return in;
    }
    private static double distance(double lon,double lat,JSONArray polygons) throws Exception {
        double sx=111320*Math.cos(Math.toRadians(lat)),sy=111320,best=Double.POSITIVE_INFINITY;
        for(int p=0;p<polygons.length();p++) {
            JSONArray rings=polygons.getJSONArray(p);
            for(int r=0;r<rings.length();r++) {
                JSONArray ring=rings.getJSONArray(r);int length=ring.length();
                for(int i=0,j=length-1;i<length;j=i++) {
                    JSONArray a=ring.getJSONArray(j),b=ring.getJSONArray(i);
                    double ax=(a.getDouble(0)-lon)*sx,ay=(a.getDouble(1)-lat)*sy;
                    double bx=(b.getDouble(0)-lon)*sx,by=(b.getDouble(1)-lat)*sy;
                    double dx=bx-ax,dy=by-ay,len=dx*dx+dy*dy;
                    double t=len>0?Math.max(0,Math.min(1,-(ax*dx+ay*dy)/len)):0;
                    best=Math.min(best,Math.hypot(ax+t*dx,ay+t*dy));
                }
            }
        }
        return best;
    }
}
