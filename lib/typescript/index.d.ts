type GlobalProperty = Record<string, string | number | string[]>;
type EventParams = Record<string, string | number | string[]>;
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
export declare function init(appKey: string, channel: string): void;
/**
 * SDK预初始化方法
 * @param appKey QuickTracking后台提供的唯一key值，请勿泄露给第三方
 * @param channel 下载渠道
 * @description 仅Android端需要预初始化方法
 *  1. 预初始化方法可以在用户同意隐私政策之前调用。
 *  2. 请在主线程中完成预初始化方法的调用
 */
export declare function preInit(appKey: string, channel: string): void;
/**
 * 设置SDK的收数域名
 * @param mainTrackDomain SDK的主收数域名，例如：https://log.quicktracking.cn
 * @param subTrackDomain SDK的副收数域名，例如：https://log.quicktracking.cn
 * @description 设置SDK的收数域名, 调用SDK init 初始化API之前需要先设置收数域名。
 */
export declare function setTrackDomain(mainTrackDomain: string, subTrackDomain: string): void;
/**
 * SDK开启日志
 * @param enable 日志开关
 * @description SDK日志开关
 */
export declare function enableLog(enable: boolean): void;
/**
 * 页面浏览事件埋点-打开页面
 * @param pageName 页面编码
 */
export declare function onPageStart(pageName: string): void;
/**
 * 页面浏览事件埋点-离开页面
 * @param pageName 页面编码
 */
export declare function onPageEnd(pageName: string): void;
/**
 * 上传页面属性
 * @param pageName 页面编码
 * @param params 对当前事件的参数描述，定义为“参数名:参数值”的“<键-值>”对
 */
export declare function uploadPageProperties(pageName: string, params: EventParams): void;
/**
 * 自定义事件埋点
 * @param eventId 当前统计的事件编码
 * @param params 对当前事件的参数描述，定义为“参数名:参数值”的“<键-值>”对
 * @param pageName 当前统计事件的页面编码
 */
export declare function sendEvent(eventId: string, params?: EventParams, pageName?: string): void;
/**
 * 桥接事件埋点
 * @param data H5转发事件的日志体
 */
export declare function sendEventForH5(data: string): void;
/**
 * 注册一个全局事件属性
 * @param property 要注册的全局属性
 * @description
 * 注册全局属性后，后续触发的所有事件都将自动包含这些属性；
 * 且这些属性及属性值存入缓存，APP退出后清除。
 * 在分析数据时，可根据此属性进行查看和筛选。
 */
export declare function registerGlobalProperty(gp: GlobalProperty): void;
/**
 * 删除一个全局事件属性
 * @param propertyName 要删除的全局事件属性名，只支持大小写字母、数字及下划线
 */
export declare function unregisterGlobalProperty(propertyName: string): void;
/**
 * 根据Key获取单个全局属性
 * @param propertyName 属性名，只支持大小写字母、数字及下划线！
 */
export declare const getGlobalProperty: (propertyName: string) => Promise<any>;
/**
 * 获取所有的全局事件属性, 返回包含所有全局事件属性的JSONObject
 */
export declare const getGlobalProperties: () => Promise<any>;
/**
 * 清空全部全局事件属性。
 */
export declare const clearGlobalProperties: () => void;
/**
 * 账号登录时调用此接口，用于统计应用自身的账号
 * @param ID 用户账号ID，长度小于64字节
 * @param provider
 */
export declare const profileSignIn: (ID: string, Provider?: string) => void;
/**
 * 账号登出时需调用此接口，调用之后不再发送账号相关内容。
 */
export declare const profileSignOff: () => void;
/**
 * 设置应用版本
 */
export declare const setAppVersion: (version: string, versionCode: number) => void;
/**
 * 关闭SDK
 */
export declare const disableSDK: () => void;
/**
 * 开启SDK
 */
export declare const enableSDK: () => void;
/**
 * 自定义设备ID
 */
export declare const setCustomDeviceId: (deviceId: string) => void;
/**
 * 读取设备ID
 */
export declare const getDeviceId: () => Promise<any>;
export {};
//# sourceMappingURL=index.d.ts.map