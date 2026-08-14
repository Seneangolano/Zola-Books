# ProGuard / R8 Rules for Zola Books Mobile App

# 1. Keep AndroidX WebKit, WebView & JavaScript Interfaces
-keep class android.webkit.** { *; }
-keep class androidx.webkit.** { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# 2. Keep Zola Books Native Activities & Classes
-keep class com.zolabooks.angola.** { *; }
-keepclassmembers class com.zolabooks.angola.** { *; }

# 3. Keep AndroidX, Material Components & SwipeRefreshLayout
-keep class androidx.appcompat.** { *; }
-keep class com.google.android.material.** { *; }
-keep class androidx.swiperefreshlayout.** { *; }
-keep class androidx.core.** { *; }
-keep class androidx.activity.** { *; }
-keep class androidx.lifecycle.** { *; }

# 4. Keep JNI Native C/C++ Methods & Libraries (Android 15 16 KB Page Alignment)
-keepclasseswithmembernames,includedescriptorclasses class * {
    native <methods>;
}

# 5. Keep Capacitor / Cordova Third-Party Native Plugins & Bridge (if imported)
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.community.** { *; }
-keep class org.apache.cordova.** { *; }
-keep public class * extends com.getcapacitor.Plugin

# 6. Keep Firebase Suite (Firestore, Auth, Messaging, Crashlytics, Analytics, Remote Config)
-keep class com.google.firebase.** { *; }
-keepclassmembers class com.google.firebase.** { *; }
-keep attributes *Annotation*, Signature, InnerClasses, EnclosingMethod
-keep class com.google.android.gms.** { *; }
-keepclassmembers class com.google.android.gms.** { *; }
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    !private <fields>;
    !private <methods>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# 7. Keep Kotlin Reflection, Metadata & Coroutines
-keep class kotlin.Metadata { *; }
-keep class kotlin.reflect.** { *; }
-keepclassmembers class **$WhenMappings {
    <fields>;
}

# 8. Keep Android Network Stack & HTTP Client Libraries (OkHttp, Retrofit, Volley, Ktor)
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class retrofit2.** { *; }
-keepclasseswithmembers class * {
    @retrofit2.http.* <methods>;
}
-dontwarn retrofit2.**
-keep class com.android.volley.** { *; }
-keep class io.ktor.** { *; }

# 9. Keep Android Local Storage & Persistence Stack (Room, SQLite, DataStore, SharedPreferences)
-keep class androidx.room.** { *; }
-keep class * extends androidx.room.RoomDatabase
-dontwarn androidx.room.**
-keep class androidx.sqlite.** { *; }
-dontwarn androidx.sqlite.**
-keep class androidx.datastore.** { *; }
-dontwarn androidx.datastore.**
-keep class android.content.SharedPreferences** { *; }
-keep class android.database.sqlite.** { *; }

# 10. Keep Sentry SDK & Crash Reporting Stack
-keep class io.sentry.** { *; }
-keepclassmembers class io.sentry.** { *; }
-keep interface io.sentry.** { *; }
-dontwarn io.sentry.**

# 11. Keep Reflection-Based UI Components, Custom Views & Animations
-keep public class * extends android.view.View {
    public <init>(android.content.Context);
    public <init>(android.content.Context, android.util.AttributeSet);
    public <init>(android.content.Context, android.util.AttributeSet, int);
    public void set*(...);
}
-keepclasseswithmembers class * {
    public <init>(android.content.Context, android.util.AttributeSet);
}
-keepclasseswithmembers class * {
    public <init>(android.content.Context, android.util.AttributeSet, int);
}
-keepclassmembers class * extends android.app.Activity {
    public void *(android.view.View);
}
-keep class androidx.constraintlayout.** { *; }
-keep class com.airbnb.lottie.** { *; }
-dontwarn com.airbnb.lottie.**
-keep class androidx.fragment.app.Fragment { *; }
-keepclassmembers class * extends androidx.fragment.app.Fragment {
    public <init>();
}
-keep class * extends android.animation.Keyframe { *; }
-keepclassmembers class * {
    *** set*(***);
    *** get*();
}

# 12. Suppress Warnings for Dynamic Reflection, Network, Sentry & WebKit Internal Classes
-dontwarn android.webkit.**
-dontwarn androidx.webkit.**
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**
-dontwarn okhttp3.**
-dontwarn retrofit2.**
-dontwarn androidx.room.**
-dontwarn androidx.datastore.**
-dontwarn io.sentry.**
-dontwarn com.airbnb.lottie.**

