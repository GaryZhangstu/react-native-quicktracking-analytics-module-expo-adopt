package com.quicktrackinganalyticsmodule

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.quick.qt.commonsdk.QtConfigure
import com.quick.qt.analytics.QtTrackAgent
import com.quick.qt.spm.SpmAgent
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions

class QuicktrackingAnalyticsExpoModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("QuicktrackingAnalyticsExpoModule")

    // SDK initialization
    Function("setTrackDomain") { mainTrackDomain: String, subTrackDomain: String ->
      QtConfigure.setTrackDomain(mainTrackDomain, subTrackDomain)
    }

    Function("initWithAppkey") { appKey: String, channel: String ->
      QtConfigure.initWithAppkey(app.currentActivity?.application, appKey, channel)
    }

    Function("preInit") { appKey: String, channel: String ->
      QtConfigure.preInit(app.currentActivity?.application, appKey, channel)
    }

    Function("enableLog") { enable: Boolean ->
      QtConfigure.setLogEnabled(enable)
    }

    // User profile
    Function("profileSignIn") { id: String, provider: String? ->
      if (provider != null) {
        QtTrackAgent.onProfileSignIn(provider, id)
      } else {
        QtTrackAgent.onProfileSignIn(id)
      }
    }

    Function("profileSignOff") {
      QtTrackAgent.onProfileSignOff()
    }

    // Global properties
    Function("registerGlobalProperty") { property: Map<String, Any?> ->
      val filteredProperty = property.filterValues { it != null }
      QtTrackAgent.registerGlobalProperty(filteredProperty as Map<String, Any>)
    }

    Function("unregisterGlobalProperty") { propertyName: String ->
      QtTrackAgent.unregisterGlobalProperty(propertyName)
    }

    AsyncFunction("getGlobalProperty") { propertyName: String, promise: Promise ->
      try {
        val value = QtTrackAgent.getGlobalProperty(propertyName)
        promise.resolve(value)
      } catch (e: Exception) {
        promise.reject("GET_GLOBAL_PROPERTY_ERROR", e.message, e)
      }
    }

    AsyncFunction("getGlobalProperties") { promise: Promise ->
      try {
        val properties = QtTrackAgent.getGlobalProperties()
        promise.resolve(properties)
      } catch (e: Exception) {
        promise.reject("GET_GLOBAL_PROPERTIES_ERROR", e.message, e)
      }
    }

    Function("clearGlobalProperties") {
      QtTrackAgent.clearGlobalProperties()
    }

    // Page tracking
    Function("onPageStart") { pageName: String ->
      QtTrackAgent.onPageStart(pageName)
    }

    Function("onPageEnd") { pageName: String ->
      QtTrackAgent.onPageEnd(pageName)
    }

    Function("uploadPageProperties") { pageName: String, params: Map<String, Any?> ->
      val filteredParams = params.filterValues { it != null }
      QtTrackAgent.uploadPageProperties(pageName, filteredParams as Map<String, Any>)
    }

    // Events
    Function("sendEvent") { eventId: String, params: Map<String, Any?>?, pageName: String? ->
      val filteredParams = params?.filterValues { it != null } as? Map<String, Any>
      if (pageName != null && filteredParams != null) {
        QtTrackAgent.onEvent(pageName, eventId, filteredParams)
      } else if (filteredParams != null) {
        QtTrackAgent.onEvent(eventId, filteredParams)
      } else {
        QtTrackAgent.onEvent(eventId)
      }
    }

    Function("sendEventForH5") { data: String ->
      QtTrackAgent.onH5Event(data)
    }

    // SDK control
    Function("disableSDK") {
      QtConfigure.setSdkStatus(false)
    }

    Function("enableSDK") {
      QtConfigure.setSdkStatus(true)
    }

    Function("setAppVersion") { version: String ->
      QtConfigure.setAppVersion(version)
    }

    // Device
    Function("setCustomDeviceId") { deviceId: String ->
      QtConfigure.setCustomDeviceId(deviceId)
    }

    AsyncFunction("getDeviceId") { promise: Promise ->
      try {
        val deviceId = QtConfigure.getDeviceId(app.currentActivity?.applicationContext)
        promise.resolve(deviceId)
      } catch (e: Exception) {
        promise.reject("GET_DEVICE_ID_ERROR", e.message, e)
      }
    }

    // Read configuration from AndroidManifest.xml
    Function("getConfig") { ->
      val activity = app.currentActivity ?: return@Function null
      val packageManager = activity.packageManager
      val packageName = activity.packageName
      val applicationInfo = packageManager.getApplicationInfo(
        packageName,
        android.content.pm.PackageManager.GET_META_DATA
      )
      val metaData = applicationInfo.metaData

      val config = mutableMapOf<String, String?>()

      config["appKey"] = metaData?.getString("com.quicktracking.appKey")
      config["mainTrackDomain"] = metaData?.getString("com.quicktracking.mainTrackDomain")
      config["subTrackDomain"] = metaData?.getString("com.quicktracking.subTrackDomain")
      config["channel"] = metaData?.getString("com.quicktracking.channel")
      config["enableLog"] = metaData?.getString("com.quicktracking.enableLog")
      config["customDeviceId"] = metaData?.getString("com.quicktracking.customDeviceId")

      return@Function config
    }
  }
}
