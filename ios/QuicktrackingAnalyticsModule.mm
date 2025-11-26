#import "QuicktrackingAnalyticsModule.h"
#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTLog.h>
#import "QTRNUtils.h"
#import "QuickTrackingSDKManager.h"

#if __has_include(<QTCommon/MobClick.h>)
#import <QTCommon/MobClick.h>
#import <QTCommon/UMConfigure.h>
#import <QTCommon/UMSpm.h>
#endif

#if __has_include(<UMCommonLog/UMCommonLogHeaders.h>)
#import <UMCommonLog/UMCommonLogHeaders.h>
#endif

@implementation QuicktrackingAnalyticsModule

RCT_EXPORT_MODULE()

//======================================全局属性相关===========================================//
RCT_EXPORT_METHOD(registerGlobalProperty:(NSDictionary*)globalproperty)
{
    if (globalproperty == nil && [globalproperty isKindOfClass:[NSNull class]]) {
        globalproperty = nil;
    }
    [QTMobClick registerGlobalProperty:globalproperty];
}

RCT_EXPORT_METHOD(clearGlobalProperties)
{
    [QTMobClick clearGlobalProperties];
}

RCT_EXPORT_METHOD(getGlobalProperty:(NSString*)propertyName resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    if (propertyName == nil || [propertyName isKindOfClass:[NSNull class]]) {
        return;
    }
    @try {
        NSString* property = [QTMobClick getGlobalProperty:propertyName];
        resolve(property);
    } @catch (NSException *exception) {
        NSLog(@"[QuickTracking ReactNative] error:%@",exception);
    }
}

RCT_EXPORT_METHOD(unregisterGlobalProperty:(NSString*)propertyName)
{
    if (propertyName == nil && [propertyName isKindOfClass:[NSNull class]]) {
        propertyName = nil;
    }
    [QTMobClick unregisterGlobalProperty:propertyName];
}

RCT_EXPORT_METHOD(getGlobalProperties:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    @try {
        NSDictionary* dict = [QTMobClick getGlobalProperties];
        resolve(dict);
    } @catch (NSException *exception) {
        NSLog(@"[QuickTracking ReactNative] error:%@",exception);
    }
}

//======================================用户账号和用户属性相关===========================================//
RCT_EXPORT_METHOD(profileSignIn:(NSString*)puid provider:(NSString*)provider)
{
    if (puid == nil || [puid isKindOfClass:[NSNull class]]) {
        return;
    }
    if (provider == nil || [provider isKindOfClass:[NSNull class]]) {
        [QTMobClick profileSignInWithPUID:puid];
    } else {
        [QTMobClick profileSignInWithPUID:puid provider:provider];
    }
}

RCT_EXPORT_METHOD(profileSignOff)
{
    [QTMobClick profileSignOff];
}

/**
 * React Native 保存可点击控件列表信息
 */
RCT_EXPORT_METHOD(saveViewProperties:(NSInteger)reactTag
                  clickable:(BOOL)clickable parameters:(NSDictionary *)paramters) {
    @try {
        [[QuickTrackingSDKManager sharedInstance] prepareView:@(reactTag) clickable:clickable paramters:paramters];
    } @catch (NSException *exception) {
        NSLog(@"[QuickTracking ReactNative] error: %@", exception);
    }
}

/**
 * React Native 保存可点击控件列表信息
 *
 * @param reactTag  当前控件唯一标识符
 * @param clickable  当前控件可点击状态
 * @param paramters  当前控件自定义参数
 * @param rootTag  当前 RN 页面的唯一标识
 *
 */
RCT_EXPORT_METHOD(saveRootViewProperties:(NSInteger)reactTag
                  clickable:(BOOL)clickable
                  parameters:(NSDictionary *)paramters
                  rootTag:(NSInteger) rootTag) {
    @try {
        [[QuickTrackingSDKManager sharedInstance] prepareView:@(reactTag) clickable:clickable paramters:paramters rootTag:@(rootTag)];
    } @catch (NSException *exception) {
        NSLog(@"[QuickTracking ReactNative] error:%@",exception);
    }
}

//======================================页面事件相关===========================================//
//页面启动事件，在该页面展示时调用
RCT_EXPORT_METHOD(onPageStart:(NSString *)pageName)
{
    if (pageName == nil || [pageName isKindOfClass:[NSNull class]]) {
        return;
    }
    [QTMobClick beginLogPageView:pageName];
}
//页面离开事件，在该页面离开时候调用
RCT_EXPORT_METHOD(onPageEnd:(NSString *)pageName)
{
    if (pageName == nil || [pageName isKindOfClass:[NSNull class]]) {
        return;
    }
    [QTMobClick endLogPageView:pageName];
}

// 上传页面属性
RCT_EXPORT_METHOD(uploadPageProperties:(NSString *)pageName params:(NSDictionary*)parameters)
{
    if (pageName == nil || [pageName isKindOfClass:[NSNull class]]) {
        return;
    }
    if (parameters == nil && [parameters isKindOfClass:[NSNull class]]) {
        parameters = nil;
    }
    [UMSpm updatePageProperties:pageName properties: parameters];
}

//======================================自定义事件相关===========================================//
/**
 * @description QtAnalytics.onEventObject(String eventId, Object params)
 * @eventId 自定义事件名(字符串类型)
 * @params 一级平铺自定义参数属性键值对，不支持嵌套，并且iOS端不支持值为 null 和 "" 类型的键
 */
RCT_EXPORT_METHOD(onEventWithParams:(NSString*)eventId parameters:(NSDictionary*)parameters)
{
    if (eventId == nil || [eventId isKindOfClass:[NSNull class]]) {
        return;
    }
    if (parameters == nil && [parameters isKindOfClass:[NSNull class]]) {
        parameters = nil;
    }
    [QTMobClick event:eventId attributes:parameters];
}

RCT_EXPORT_METHOD(onEvenWithPageName:(NSString*)eventId pageName:(NSString *)pageName)
{
    if (eventId == nil || [eventId isKindOfClass:[NSNull class]]) {
        return;
    }
    if (pageName == nil || [pageName isKindOfClass:[NSNull class]]) {
        return;
    }
    [QTMobClick event:eventId pageName:pageName];
}

RCT_EXPORT_METHOD(onEventWithParamsAndPageName:(NSString*)eventId pageName:(NSString *)pageName parameters:(NSDictionary*)parameters)
{
    if (eventId == nil || [eventId isKindOfClass:[NSNull class]]) {
        return;
    }
    if (pageName == nil || [pageName isKindOfClass:[NSNull class]]) {
        return;
    }
    if (parameters == nil && [parameters isKindOfClass:[NSNull class]]) {
        parameters = nil;
    }
    [QTMobClick event:eventId pageName:pageName attributes:parameters];
}

RCT_EXPORT_METHOD(onEvent:(NSString *)eventId)
{
  if (eventId == nil || [eventId isKindOfClass:[NSNull class]]) {
    return;
  }
  [QTMobClick event:eventId];
}

RCT_EXPORT_METHOD(onEventForH5:(NSString*)eventId attributes:(NSDictionary *)attributes) {

  Class _MobClickEvent = NSClassFromString(@"QTMobClickEvent");
    if (_MobClickEvent){
        SEL sel = NSSelectorFromString(@"eventForH5:attributes:");
        if (sel && [_MobClickEvent respondsToSelector:sel] ) {
    #pragma clang diagnostic push
    #pragma clang diagnostic ignored "-Warc-performSelector-leaks"
            [_MobClickEvent performSelector:sel withObject:eventId withObject:attributes];
    #pragma clang diagnostic pop
        }
    }
}

RCT_EXPORT_METHOD(onEventAutoCLK:(NSInteger)reactTag) {
  @try {
    [[QuickTrackingSDKManager sharedInstance] trackViewClick:@(reactTag)];
  } @catch (NSException *exception) {
    NSLog(@"[QuickTracking ReactNative] error:%@",exception);
  }
}

//======================================初始化相关===========================================//
// 设置收数域名
RCT_EXPORT_METHOD(setTrackDomain:(NSString *)mainTrackDomain subTrackDomain:(NSString *)secondaryDomain)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [QTConfigure setCustomDomain:mainTrackDomain standbyDomain:secondaryDomain];
    });
}

// !!! SDK 初始化方法，必须在其他方法调用之前调用，否则其他方法调用无效
// 并且 1. 调用初始化方法之前必须调用 setTrackDomain 方法，设置SDK 收数域名
// 2. 调用初始化方法必须要在应用主线程中完成
// 3. 调用SDK初始化方法必须在主线程中调用，否则会报错
// 4. 请在隐私授权同意后才能调用初始化方法
RCT_EXPORT_METHOD(initWithAppkey:(NSString *)appKey channel:(NSString *)channel)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [QTConfigure initWithAppkey:appKey channel:channel];
    });
}

//======================================其他方法===========================================//
// 开启日志
RCT_EXPORT_METHOD(enableLog:(BOOL)enable)
{
#if __has_include(<UMCommonLog/UMCommonLogHeaders.h>)
    [UMCommonLogManager setUpUMCommonLogManager];
#endif
    [QTConfigure setLogEnabled:enable];
}
// 设置应用版本号
RCT_EXPORT_METHOD(setAppVersion:(NSString *)appVersion)
{
    [QTConfigure setAppVersion:appVersion];
}
// 关闭SDK
RCT_EXPORT_METHOD(disableSDK)
{
    [QTConfigure disableSDK];
}
// 开启SDK
RCT_EXPORT_METHOD(enableSDK)
{
    [QTConfigure enableSDK];
}

// 设置自定义设备ID
RCT_EXPORT_METHOD(setCustomDeviceId:(NSString *)deviceId)
{
    [QTConfigure setCustomDeviceId:deviceId];
}

// 获取设备ID
RCT_EXPORT_METHOD(getDeviceId:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
    resolve([QTConfigure umidString]);
}
@end
