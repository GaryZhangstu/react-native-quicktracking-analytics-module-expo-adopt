package com.quicktrackinganalyticsmodule

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.LifecycleEventListener
import com.quick.qt.commonsdk.QtConfigure
import com.quick.qt.analytics.QtTrackAgent
import com.quick.qt.spm.SpmAgent
import java.util.*
import com.quicktrackinganalyticsmodule.utils.*

class QuicktrackingAnalyticsModuleModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val context: ReactApplicationContext = reactContext

  init {
    try {
      reactContext.addLifecycleEventListener(QTDataLifecycleListener())
    } catch (e: Exception) {
      // Handle exception if needed
    }
  }

  override fun getName(): String {
    return NAME
  }

  //***************************** SDK 埋点相关 ****************************************************/
  @ReactMethod
  fun onPageStart(pageName: String) {
    QtTrackAgent.onPageStart(pageName)
  }

  @ReactMethod
  fun onPageEnd(pageName: String) {
    QtTrackAgent.onPageEnd(pageName)
  }

  @ReactMethod
  fun uploadPageProperties(pageName: String, property: ReadableMap) {
    val map = HashMap<String, Any>()
    val iterator = property.keySetIterator()
    while (iterator.hasNextKey()) {
      val key = iterator.nextKey()
      when (property.getType(key)) {
        ReadableType.Array -> map[key] = property.getArray(key).toString()
        ReadableType.Boolean -> map[key] = property.getBoolean(key).toString()
        ReadableType.Number -> map[key] = property.getInt(key).toString()
        ReadableType.String -> map[key] = property.getString(key) ?: ""
        ReadableType.Map -> map[key] = property.getMap(key).toString()
        else -> {} // Handle other cases if needed
      }
    }
    QtTrackAgent.setPageProperty(context, pageName, map)
  }

  @ReactMethod
  fun onEvent(eventID: String) {
    QtTrackAgent.onEvent(context, eventID)
  }

  @ReactMethod
  fun onEventWithPageName(eventID: String, pageName: String) {
    QtTrackAgent.onEvent(context, eventID, pageName)
  }

  @ReactMethod
  fun onEventWithParams(eventID: String, property: ReadableMap) {
    val map = convertReadableMapToMap(property)
    QtTrackAgent.onEventObject(context, eventID, map)
  }

  @ReactMethod
  fun onEventWithParamsAndPageName(eventID: String, property: ReadableMap, pageName: String) {
    val map = convertReadableMapToMap(property)
    QtTrackAgent.onEventObject(context, eventID, map, pageName)
  }

  @ReactMethod
  fun onEventForH5(content: String) {
    try {
      Log.e(TAG, "ReactMethod：onEventForH5" + content)
      SpmAgent.CALL(content)
    } catch (e: Exception) {
      Log.e(TAG, "桥接事件发送失败！", e)
    }
  }

  @ReactMethod
  fun onEventAutoCLK(viewId: Int) {
    QTSDKManager.trackViewClick(viewId, context)
  }

  //***************************** SDK 属性 相关 *********************************************/
  @ReactMethod
  fun registerGlobalProperties(map: ReadableMap) {
    try {
      val nativeMap = map as ReadableNativeMap
      val map3 = nativeMap.toHashMap()
      val globalProperties = HashMap<String, Any>()
      map3.forEach { (key, value) ->
        globalProperties[key.toString()] = value as Any
      }
      QtTrackAgent.registerGlobalProperties(context, globalProperties)
    } catch (e: Exception) {
      Log.e(TAG, "注册全局属性失败！", e)
    }
  }

  @ReactMethod
  fun unregisterGlobalProperty(propertyName: String) {
    if (propertyName.isNullOrEmpty()) return
    QtTrackAgent.unregisterGlobalProperty(context, propertyName)
  }

  @ReactMethod
  fun getGlobalProperty(propertyName: String, promise: Promise) {
    try {
      if (propertyName.isNullOrEmpty()) return
      val result = QtTrackAgent.getGlobalProperty(context, propertyName).toString()
      promise.resolve(result)
    } catch (e: Exception) {
      Log.e(TAG, "获取单个全局属性失败", e)
    }
  }

  @ReactMethod
  fun getGlobalProperties(promise: Promise) {
    try {
      val result = QtTrackAgent.getGlobalProperties(context)
      promise.resolve(result)
    } catch (e: Exception) {
      Log.e(TAG, "获取所有全局属性失败", e)
    }
  }

  @ReactMethod
  fun clearGlobalProperties() {
    QtTrackAgent.clearGlobalProperties(context)
  }

  //***************************** SDK用户 相关 *********************************************/

  @ReactMethod
  fun profileSignIn(ID: String) {
    QtTrackAgent.onProfileSignIn(ID)
  }

  @ReactMethod
  fun profileSignInWithProvider(ID: String, Provider: String) {
    // 原生层这个是反的，Provider在前，ID在后
    QtTrackAgent.onProfileSignIn(Provider, ID)
  }

  @ReactMethod
  fun profileSignOff() {
    QtTrackAgent.onProfileSignOff()
  }

  //***************************** SDK初始化 相关 *********************************************/

  @ReactMethod
  fun preInit(appkey: String, channel: String) {
    QtConfigure.preInit(context, appkey, channel);
  }

  @ReactMethod
  fun initWithAppkey(appkey: String, channel: String) {
    QtConfigure.init(context, appkey, channel, QtConfigure.DEVICE_TYPE_PHONE, "")
  }

  @ReactMethod
  fun setTrackDomain(primaryDomain: String, secondaryDomain: String) {
    QtConfigure.setCustomDomain(primaryDomain, secondaryDomain);
  }

  @ReactMethod
  fun enableLog(flag: Boolean) {
    QtConfigure.setLogEnabled(flag);
  }

  @ReactMethod
  fun setAppVersion(version: String, appVersionCode: Int) {
    QtConfigure.setAppVersion(version, appVersionCode)
  }

  //***************************** SDK 其他 *********************************************/

  @ReactMethod
  fun disableSDK() {
    QtTrackAgent.disableSDK()
  }

  @ReactMethod
  fun enableSDK() {
    QtTrackAgent.enableSDK()
  }

  @ReactMethod
  fun setCustomDeviceId(deviceId: String) {
    QtConfigure.setCustomDeviceId(context, deviceId);
  }

  @ReactMethod
  fun getDeviceId(promise: Promise) {
    try {
      val deviceId = QtConfigure.getUMIDString(context);
      promise.resolve(deviceId)
    } catch (e: Exception) {
      promise.reject("getDeviceId", e.message)
    }
  }

  @ReactMethod
  fun saveViewProperties(viewId: Int, clickable: Boolean, viewProperties: ReadableMap?) {
    QTSDKManager.saveViewProperties(viewId, clickable, viewProperties)
  }

  private fun convertReadableMapToMap(property: ReadableMap): Map<String, Any> {
    val map = HashMap<String, Any>()
    val iterator = property.keySetIterator()
    while (iterator.hasNextKey()) {
      val key = iterator.nextKey()
      when (property.getType(key)) {
        ReadableType.Array -> map[key] = property.getArray(key).toString()
        ReadableType.Boolean -> map[key] = property.getBoolean(key).toString()
        ReadableType.Number -> map[key] = property.getInt(key).toString()
        ReadableType.String -> map[key] = property.getString(key) ?: ""
        ReadableType.Map -> map[key] = property.getMap(key).toString()
        else -> {} // Handle other cases if needed
      }
    }
    return map
  }

  inner class QTDataLifecycleListener : LifecycleEventListener {
    override fun onHostResume() {
      RNViewUtils.getCurrentActivity()?.let { RNViewUtils.onActivityResumed(it) }
    }

    override fun onHostPause() {
      RNViewUtils.onActivityPaused()
    }

    override fun onHostDestroy() {
      // Implementation will be added later
    }
  }

  companion object {
    const val NAME = "QuicktrackingAnalyticsModule"
    const val TAG = "[QT_RN] ------ "
  }
        //***************************** 其他 ****************************************************/
}
