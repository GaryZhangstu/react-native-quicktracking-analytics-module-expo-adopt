"use strict";

import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';
const QuicktrackingAnalyticsModule = requireNativeModule('QuicktrackingAnalyticsExpoModule');

//****************初始化相关**************** */
/**
 * SDK正式初始化
 * @param appKey QuickTracking后台提供的唯一key值，请勿泄露给第三方
 * @param channel 下载渠道
 * @description 请务必在用户同意隐私政策后，再初始化SDK，务必调用。
 * ！！！
 * 1. SDK的初始化需要在用户同意隐私政策后，再初始化SDK，务必调用。
 * 2. 且必须在主线程中调用，iOS端强依赖主线程， Android端建议在主线程中初始化SDK，否则可能会导致数据不准确。
 * 3. 调用初始化SDK能力之前，需要调用 setTrackDomain 方法设置收数域名。
 */
export function init(appKey, channel) {
  QuicktrackingAnalyticsModule.initWithAppkey(appKey, channel);
}

/**
 * SDK预初始化方法
 * @param appKey QuickTracking后台提供的唯一key值，请勿泄露给第三方
 * @param channel 下载渠道
 * @description 仅Android端需要预初始化方法
 *  1. 预初始化方法可以在用户同意隐私政策之前调用。
 *  2. 请在主线程中完成预初始化方法的调用
 */
export function preInit(appKey, channel) {
  if (Platform.OS === 'android') {
    QuicktrackingAnalyticsModule.preInit(appKey, channel);
  } else {
    console.warn('preInit only support Android');
  }
}

/**
 * 设置SDK的收数域名
 * @param mainTrackDomain SDK的主收数域名，例如：https://log.quicktracking.cn
 * @param subTrackDomain SDK的副收数域名，例如：https://log.quicktracking.cn
 * @description 设置SDK的收数域名, 调用SDK init 初始化API之前需要先设置收数域名。
 */
export function setTrackDomain(mainTrackDomain, subTrackDomain) {
  QuicktrackingAnalyticsModule.setTrackDomain(mainTrackDomain, subTrackDomain);
}

/**
 * SDK开启日志
 * @param enable 日志开关
 * @description SDK日志开关
 */
export function enableLog(enable) {
  QuicktrackingAnalyticsModule.enableLog(enable);
}

//*******************埋点相关*************** */
/**
 * 页面浏览事件埋点-打开页面
 * @param pageName 页面编码
 */
export function onPageStart(pageName) {
  QuicktrackingAnalyticsModule.onPageStart(pageName);
}

/**
 * 页面浏览事件埋点-离开页面
 * @param pageName 页面编码
 */
export function onPageEnd(pageName) {
  QuicktrackingAnalyticsModule.onPageEnd(pageName);
}

/**
 * 上传页面属性
 * @param pageName 页面编码
 * @param params 对当前事件的参数描述，定义为“参数名:参数值”的“<键-值>”对
 */
export function uploadPageProperties(pageName, params) {
  QuicktrackingAnalyticsModule.uploadPageProperties(pageName, params);
}

/**
 * 自定义事件埋点
 * @param eventId 当前统计的事件编码
 * @param params 对当前事件的参数描述，定义为“参数名:参数值”的“<键-值>”对
 * @param pageName 当前统计事件的页面编码
 */
export function sendEvent(eventId, params, pageName) {
  if (params) {
    if (pageName) {
      if (Platform.OS === 'android') {
        QuicktrackingAnalyticsModule.onEventWithParamsAndPageName(eventId, params, pageName);
      } else {
        QuicktrackingAnalyticsModule.onEventWithParamsAndPageName(eventId, pageName, params);
      }
    } else {
      QuicktrackingAnalyticsModule.onEventWithParams(eventId, params);
    }
  } else {
    if (pageName) {
      QuicktrackingAnalyticsModule.onEventWithPageName(eventId, pageName);
    } else {
      QuicktrackingAnalyticsModule.onEvent(eventId);
    }
  }
}

/**
 * 桥接事件埋点
 * @param data H5转发事件的日志体
 */
export function sendEventForH5(data) {
  try {
    const json = JSON.parse(data);
    if (Platform.OS === 'ios') {
      const eventId = json.sdkArgs && json.sdkArgs.id;
      let params = {};
      params.ap = json.ap || {};
      params.cusp = json.cusp || {};
      params = Object.assign(params, json.sdkArgs);
      QuicktrackingAnalyticsModule.onEventForH5(eventId, params);
    } else if (Platform.OS === 'android') {
      if (json.sdkArgs.id === '$$_page_start') {
        QuicktrackingAnalyticsModule.onEventForH5(JSON.stringify({
          params: json,
          methodName: 'sendPV',
          sid: `${Date.now()}`,
          className: 'Umeng4Aplus'
        }));
      } else {
        QuicktrackingAnalyticsModule.onEventForH5(JSON.stringify({
          params: json,
          methodName: 'sendEvent',
          sid: `${Date.now()}`,
          className: 'Umeng4Aplus'
        }));
      }
    }
  } catch (e) {
    console.log(e);
  }
}

//*******************属性相关******************* */
/**
 * 注册一个全局事件属性
 * @param property 要注册的全局属性
 * @description
 * 注册全局属性后，后续触发的所有事件都将自动包含这些属性；
 * 且这些属性及属性值存入缓存，APP退出后清除。
 * 在分析数据时，可根据此属性进行查看和筛选。
 */
export function registerGlobalProperty(gp) {
  if (Platform.OS === 'ios') {
    Object.keys(gp).forEach((_propertyName, propertyValue) => {
      if (!propertyValue && propertyValue !== 0) {
        console.warn('属性值不能为null或undefined');
      } else if (typeof propertyValue === 'object') {
        console.warn('全局属性只能是单层对象');
      } else {
        QuicktrackingAnalyticsModule.registerGlobalProperty(gp);
      }
    });
  } else {
    QuicktrackingAnalyticsModule.registerGlobalProperties(gp);
  }
}

/**
 * 删除一个全局事件属性
 * @param propertyName 要删除的全局事件属性名，只支持大小写字母、数字及下划线
 */
export function unregisterGlobalProperty(propertyName) {
  QuicktrackingAnalyticsModule.unregisterGlobalProperty(propertyName);
}

/**
 * 根据Key获取单个全局属性
 * @param propertyName 属性名，只支持大小写字母、数字及下划线！
 */
export const getGlobalProperty = async propertyName => {
  try {
    const value = await QuicktrackingAnalyticsModule.getGlobalProperty(propertyName);
    return value;
  } catch (e) {
    console.log(e);
  }
};

/**
 * 获取所有的全局事件属性, 返回包含所有全局事件属性的JSONObject
 */
export const getGlobalProperties = async () => {
  try {
    const gp = await QuicktrackingAnalyticsModule.getGlobalProperties();
    return gp;
  } catch (e) {
    console.log(e);
  }
};

/**
 * 清空全部全局事件属性。
 */
export const clearGlobalProperties = () => {
  QuicktrackingAnalyticsModule.clearGlobalProperties();
};

//*********************用户相关************************* */
/**
 * 账号登录时调用此接口，用于统计应用自身的账号
 * @param ID 用户账号ID，长度小于64字节
 * @param provider
 */
export const profileSignIn = (ID, Provider) => {
  switch (Platform.OS) {
    case 'android':
      {
        if (Provider) {
          QuicktrackingAnalyticsModule.profileSignInWithProvider(ID, Provider);
        } else {
          QuicktrackingAnalyticsModule.profileSignIn(ID);
        }
        break;
      }
    case 'ios':
      {
        if (Provider) {
          QuicktrackingAnalyticsModule.profileSignIn(ID);
        } else {
          QuicktrackingAnalyticsModule.profileSignIn(ID, null);
        }
        break;
      }
  }
};

/**
 * 账号登出时需调用此接口，调用之后不再发送账号相关内容。
 */
export const profileSignOff = () => {
  QuicktrackingAnalyticsModule.profileSignOff();
};

//*******************其他 ************************* */
/**
 * 设置应用版本
 */
export const setAppVersion = (version, versionCode) => {
  if (Platform.OS === 'android') {
    QuicktrackingAnalyticsModule.setAppVersion(version, versionCode);
  } else {
    QuicktrackingAnalyticsModule.setAppVersion(version);
  }
};

/**
 * 关闭SDK
 */
export const disableSDK = () => {
  QuicktrackingAnalyticsModule.disableSDK();
};

/**
 * 开启SDK
 */
export const enableSDK = () => {
  QuicktrackingAnalyticsModule.enableSDK();
};

/**
 * 自定义设备ID
 */
export const setCustomDeviceId = deviceId => {
  QuicktrackingAnalyticsModule.setCustomDeviceId(deviceId);
};

/**
 * 读取设备ID
 */
export const getDeviceId = async () => {
  try {
    return await QuicktrackingAnalyticsModule.getDeviceId();
  } catch (error) {
    console.log(error);
  }
};
//# sourceMappingURL=index.js.map