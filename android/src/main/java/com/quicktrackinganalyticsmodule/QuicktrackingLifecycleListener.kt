package com.quicktrackinganalyticsmodule

import android.app.Activity
import android.os.Bundle
import expo.modules.core.interfaces.ReactActivityLifecycleListener
import com.quick.qt.commonsdk.QtConfigure
import com.quicktrackinganalyticsmodule.utils.QTSimpleLog

/**
 * ReactActivity lifecycle listener for QuickTracking SDK
 * Handles Activity lifecycle events like onCreate, onResume, onPause, etc.
 */
class QuicktrackingLifecycleListener : ReactActivityLifecycleListener {

  override fun onCreate(activity: Activity, savedInstanceState: Bundle?) {
    super.onCreate(activity, savedInstanceState)

    QTSimpleLog.d("QuicktrackingLifecycleListener", "onCreate called for activity: ${activity.javaClass.simpleName}")

    try {
      // 从 AndroidManifest.xml 读取配置
      val config = readConfigFromManifest(activity)

      if (config != null) {
        QTSimpleLog.d("QuicktrackingLifecycleListener", "✅ 成功读取配置: $config")

        // 如果配置了收数域名，设置它
        val mainDomain = config["mainTrackDomain"]
        val subDomain = config["subTrackDomain"] ?: mainDomain

        if (mainDomain != null) {
          QTSimpleLog.d("QuicktrackingLifecycleListener", "设置收数域名: $mainDomain")
          QtConfigure.setTrackDomain(mainDomain, subDomain ?: "")
        }

        // 如果配置了 appKey，进行预初始化
        val appKey = config["appKey"]
        val channel = config["channel"] ?: "App Store"

        if (appKey != null) {
          QTSimpleLog.d("QuicktrackingLifecycleListener", "预初始化 QuickTracking SDK, appKey: $appKey, channel: $channel")
          QtConfigure.preInit(activity.application, appKey, channel)
        } else {
          QTSimpleLog.w("QuicktrackingLifecycleListener", "⚠️ 未找到 appKey 配置，请确保在 app.json 中配置了 Config Plugin")
        }

        // 如果启用了日志
        val enableLog = config["enableLog"] == "true"
        if (enableLog) {
          QTSimpleLog.d("QuicktrackingLifecycleListener", "启用 QuickTracking 日志")
          QtConfigure.setLogEnabled(true)
        }
      } else {
        QTSimpleLog.w("QuicktrackingLifecycleListener", "⚠️ 无法读取配置，确保已运行 'npx expo prebuild' 并正确配置了 Config Plugin")
      }
    } catch (e: Exception) {
      QTSimpleLog.e("QuicktrackingLifecycleListener", "❌ 读取配置失败: ${e.message}", e)
    }

    
  }

 

  /**
   * 从 AndroidManifest.xml 读取 MetaData 配置
   */
  private fun readConfigFromManifest(activity: Activity): Map<String, String?>? {
    return try {
      val packageManager = activity.packageManager
      val packageName = activity.packageName
      val applicationInfo = packageManager.getApplicationInfo(
        packageName,
        android.content.pm.PackageManager.GET_META_DATA
      )
      val metaData = applicationInfo.metaData

      if (metaData == null) {
        QTSimpleLog.w("QuicktrackingLifecycleListener", "⚠️ AndroidManifest.xml 中没有找到 MetaData")
        return null
      }

      val config = mapOf(
        "appKey" to metaData.getString("com.quicktracking.appKey"),
        "mainTrackDomain" to metaData.getString("com.quicktracking.mainTrackDomain"),
        "subTrackDomain" to metaData.getString("com.quicktracking.subTrackDomain"),
        "channel" to metaData.getString("com.quicktracking.channel"),
        "enableLog" to metaData.getString("com.quicktracking.enableLog"),
        "customDeviceId" to metaData.getString("com.quicktracking.customDeviceId")
      )

      config
    } catch (e: Exception) {
      QTSimpleLog.e("QuicktrackingLifecycleListener", "读取 AndroidManifest.xml 失败: ${e.message}", e)
      null
    }
  }

 
  
}
