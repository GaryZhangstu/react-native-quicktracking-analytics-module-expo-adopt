import ExpoModulesCore
import QTCommon

public class QuicktrackingAnalyticsExpoModule: Module {
  public func definition() -> ModuleDefinition {
    Name("QuicktrackingAnalyticsExpoModule")

    // SDK initialization
    Function("setTrackDomain") { (mainTrackDomain: String, subTrackDomain: String) in
      QTMobClick.setTrackDomain(mainTrackDomain, subTrackDomain: subTrackDomain)
    }

    Function("initWithAppkey") { (appKey: String, channel: String) in
      QTMobClick.start(withAppkey: appKey, channelId: channel)
    }

    Function("enableLog") { (enable: Bool) in
      QMCommonLog.setEnable(enable)
    }

    // User profile
    Function("profileSignIn") { (id: String, provider: String?) in
      if let provider = provider {
        QTMobClick.profileSign(inWithPUID: id, provider: provider)
      } else {
        QTMobClick.profileSign(inWithPUID: id)
      }
    }

    Function("profileSignOff") {
      QTMobClick.profileSignOff()
    }

    // Global properties
    Function("registerGlobalProperty") { (property: [String: Any?]) in
      let filteredProperty = property.compactMapValues { $0 }
      QTMobClick.registerGlobalProperty(filteredProperty)
    }

    Function("unregisterGlobalProperty") { (propertyName: String) in
      QTMobClick.unregisterGlobalProperty(propertyName)
    }

    AsyncFunction("getGlobalProperty") { (propertyName: String) -> String? in
      return QTMobClick.getGlobalProperty(propertyName)
    }

    AsyncFunction("getGlobalProperties") { () -> [String: Any] in
      return QTMobClick.getGlobalProperties()
    }

    Function("clearGlobalProperties") {
      QTMobClick.clearGlobalProperties()
    }

    // Page tracking
    Function("onPageStart") { (pageName: String) in
      QTMobClick.beginLogPageView(pageName)
    }

    Function("onPageEnd") { (pageName: String) in
      QTMobClick.endLogPageView(pageName, properties: nil)
    }

    Function("uploadPageProperties") { (pageName: String, params: [String: Any?]) in
      let filteredParams = params.compactMapValues { $0 }
      QTMobClick.uploadPageProperties(filteredParams, pageName: pageName)
    }

    // Events
    Function("sendEvent") { (eventId: String, params: [String: Any?]?, pageName: String?) in
      let filteredParams = params?.compactMapValues { $0 }

      if let pageName = pageName, let filteredParams = filteredParams {
        QTMobClick.event(eventId, attributes: filteredParams, pageName: pageName)
      } else if let filteredParams = filteredParams {
        QTMobClick.event(eventId, attributes: filteredParams)
      } else {
        QTMobClick.event(eventId)
      }
    }

    Function("sendEventForH5") { (data: String) in
      QTMobClick.h5Event(data)
    }

    // SDK control
    Function("disableSDK") {
      QTMobClick.setMobClickSDKDisabled(true)
    }

    Function("enableSDK") {
      QTMobClick.setMobClickSDKDisabled(false)
    }

    Function("setAppVersion") { (version: String) in
      QTMobClick.setAppVersion(version)
    }

    // Device
    Function("setCustomDeviceId") { (deviceId: String) in
      QTMobClick.setDeviceUtdid(deviceId)
    }

    AsyncFunction("getDeviceId") { () -> String? in
      return QTMobClick.utdid()
    }

    // Read configuration from Info.plist
    Function("getConfig") { () -> [String: String?]? in
      return [
        "appKey": Bundle.main.object(forInfoDictionaryKey: "QuickTrackingAppKey") as? String,
        "mainTrackDomain": Bundle.main.object(forInfoDictionaryKey: "QuickTrackingMainTrackDomain") as? String,
        "subTrackDomain": Bundle.main.object(forInfoDictionaryKey: "QuickTrackingSubTrackDomain") as? String,
        "channel": Bundle.main.object(forInfoDictionaryKey: "QuickTrackingChannel") as? String,
        "enableLog": Bundle.main.object(forInfoDictionaryKey: "QuickTrackingEnableLog") as? String,
        "customDeviceId": Bundle.main.object(forInfoDictionaryKey: "QuickTrackingCustomDeviceId") as? String
      ]
    }
  }
}
