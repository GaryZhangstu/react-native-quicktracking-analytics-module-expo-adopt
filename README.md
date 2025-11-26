# 集成说明
> QuickTracking React Native SDK是基于QuickTracking 原生客户端埋点SDK上的扩展，封装了QT埋点常用的api，如全局属性、页面属性、自定义事件等，需要分别在RN、Android、iOS三端做集成。

# React Native SDK集成
## 下载npm包到项目中
```bash
# npm
npm install react-native-quicktracking-analytics-module

# yarn
yarn add react-native-quicktracking-analytics-module

# pnpm
pnpm add react-native-quicktracking-analytics-module
```
## 引入SDK环境变量
```tsx
import * as QT from "react-native-quicktracking-analytics-module";
```

## AppKey和收数域名获取
### 进入控制台
进入QT后台，点击“管理控制台”<br>

![替代文字](https://img.alicdn.com/imgextra/i2/O1CN01HFFNLT27JvH1BKg0E_!!6000000007777-2-tps-2862-1500.png)

### 集成应用
找到需要集成埋点的应用：进入“应用列表”，选择所需组织，点击操作中的“详情或者去集成”<br>

![替代文字](https://img.alicdn.com/imgextra/i2/O1CN01HFFNLT27JvH1BKg0E_!!6000000007777-2-tps-2862-1500.png)

## Android 基座配置
在工程 build.gradle 配置脚本中 buildscript 和 allprojects 段中添加 sdk maven 仓库地址
```groovy
buildscript {
  repositories {
    google()
    jcenter()
    maven { url 'https://repo1.maven.org/maven2/' }
  }
  dependencies {
    classpath 'com.android.tools.build:gradle:3.4.0'}
    // NOTE: Do not place your application dependencies here; they belong
    // in the individual module build.gradle files
  }
}
allprojects {
  repositories {
    google()
    jcenter()
    maven { url 'https://repo1.maven.org/maven2/' }
  }
}
```

### 埋点验证配置
在Android.manifest中，找到MainActivity对应的activity标签，并将以下代码粘贴进去，appkey换成自己的
```xml
//1.唤起码默认为"atm.该app对应的appkey"，不可改变
//2.请使用单独intent-filter,和其他intent-filter并列
//不要将以下代码填入其他intent-filter里；

<intent-filter>
	<action android:name="android.intent.action.VIEW" />
	<category android:name="android.intent.category.DEFAULT" />
	<category android:name="android.intent.category.BROWSABLE" />
	<data android:scheme="atm.appkey" />
</intent-filter>
```

### 配置权限
统计SDK需要宿主APP授予如下权限：

| 权限 | 用途 |
| --- | --- |
| ACCESS_NETWORK_STATE | 检测联网方式，在网络异常状态下避免数据发送，节省流量和电量。 |
| READ_PHONE_STATE（可选） | 获取用户设备的IMEI，通过IMEI对用户进行唯一标识，以便提供统计分析服务。 |
| ACCESS_WIFI_STATE | 获取WIFI mac地址，在平板设备或电视盒子上，无法通过IMEI标识设备，我们会将WIFI mac地址作为用户的唯一标识，以便正常提供统计分析服务。 |
| INTERNET | 允许应用程序联网和发送统计数据的权限，以便提供统计分析服务。 |

下面给出AndroidManifest.xml清单文件示例：
```xml
<manifest ……>
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
  <uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
  <uses-permission android:name="android.permission.READ_PHONE_STATE"/>
  <uses-permission android:name="android.permission.INTERNET"/>
  <application ……>
```
###
混淆配置
如果您的应用使用了代码混淆，请添加如下配置，以避免Quick Tracking SDK被错误混淆导致SDK不可用。
```groovy
-keep class com.umeng.** {*;}
-keep class org.repackage.** {*;}

-keep class com.quick.qt.** {*;}
-keep class rpk.quick.qt.** {*;}

-keepclassmembers class * {
   public <init> (org.json.JSONObject);
}
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
```

SDK需要引用导入工程的资源文件，通过了反射机制得到资源引用文件R.java，但是在开发者通过proguard等混淆/	优化工具处理apk时，proguard可能会将R.java删除，如果遇到这个问题，请添加如下配置：
```groovy
-keep public class [您的应用包名].R$*{
	public static final int *;
}
```

## iOS 基座配置
### 使用CocoaPods集成
进入iOS工程目录
```shell
 cd ios && pod install 
```

### 埋点验证配置
添加您的 URL Scheme 到项目中，URL Scheme 位于项目设置 target -> 选项卡 Info - > URL Types。
填入的scheme：atm.yourappkey。<br>

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/281773/1668518096477-d9471acb-e7d0-4bba-8590-15891559b6b6.png#clientId=uf686b11a-7b20-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=412&id=ub7bbb0cc&margin=%5Bobject%20Object%5D&name=image.png&originHeight=823&originWidth=1366&originalType=binary&ratio=1&rotation=0&showTitle=false&size=127257&status=done&style=none&taskId=u9c88f1a5-85f6-4db1-a079-1dbef87724e&title=&width=683)<br>

在AppDelegate中调用函数[QTMobClick handleUrl:url]来接收 URL

```objectivec
- (BOOL)application:(UIApplication *)application openURL:(nonnull NSURL *)url options:(nonnull NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
    if ([QTMobClick handleUrl:url]) {
        return YES;
    }
    return YES;
}

```
# 埋点API
## SDK初始化 
注意初始化方法要放在App.tsx中，保证最先被执行到

### 示例
```typescript
import * as QT from 'react-native-quicktracking-analytics-module';
import { Platform } from 'react-native';

// 初始化相关代码写在此处
QT.setTrackDomain(
  '收数域名',
  '备用收数域名（可以传空）'
);
if (Platform.OS === 'android') {
  QT.preInit('appkey', '应用商店名称');
  QT.init('appkey', '应用商店名称');
} else {
  QT.init('appkey', 'App Store');
}

export default function App() {
  return (
    ...
  );
}

```

## 设置收数域名
调用初始化SDK能力之前，需要调用 setTrackDomain 方法设置收数域名
```typescript
function setTrackDomain(mainTrackDomain: string, subTrackDomain: string): void;
```

| 参数 | 含义 |
| --- | --- |
| mainTrackDomain | 收数域名 |
| chsubTrackDomainannel | 备用收数域 |

### 示例
```typescript
import * as QT from "react-native-quicktracking-analytics-module";

QT.setTrackDomain(
  '收数域名',
  '备用收数域名（如果没有可以传空''）'
);
```

## 预初始化
仅Android端需要预初始化方法
```typescript
function preInit(appKey: string, channel: string): void;
```
| 参数 | 含义 |
| --- | --- |
| appKey | QT后台提供的唯一应用key值 |
| channel | 下载渠道 |

```typescript
if (Platform.OS === 'android') {
  QT.preInit('appkey', '应用商店名称');
} 
```

## 正式初始化
务必调用，请务必在用户同意隐私政策后，再初始化SDK。
```typescript
function init(appKey: string, channel: string): void
```
| 参数 | 含义 |
| --- | --- |
| appKey | QT后台提供的唯一应用key值 |
| channel | 下载渠道 |

### 示例
```tsx
import * as QT from "react-native-quicktracking-analytics-module";

QT.init('appkey', '应用商店名称');
```

## 日志开关（按需开启， 上线的时候记得关闭）

```typescript
function enableLog(enable: boolean): void;
```

| 参数 | 含义 |
| --- | --- |
| enable | true打开 false关闭 |

### 示例
```typescript
import * as QT from "react-native-quicktracking-analytics-module";

QT.enableLog(true);
```

## 用户账号上报
### 用户登录
该值的上传对应产品中“登录用户”：计算“登录用户”数，就是计算下述API上传值的去重数
```typescript
function profileSignIn(ID: string, provider?: string): void
```
| 参数 | 含义 |
| --- | --- |
| ID | 用户账号，长度小于64字节。
该值的上传对应产品中“登录用户”：计算“登录用户”数，就是计算该用户账号的去重数 |
| provider |  |


### 用户登出
账号登出时需调用此接口，调用之后不再发送账号相关内容。
```typescript
function profileSignOff(): void
```

#### 示例
```typescript
import * as QT from "react-native-quicktracking-analytics-module";

QT.profileSignIn('用户ID');
QT.profileSignOff();
```

### 用户属性上传
使用事件编码固定为"$$_user_profile"的自定义事件上传，该事件所携带的事件属性会被作为用户属性放在用户表中。
```typescript
function sendEvent(eventId: string, params: any): void
```
| 参数 | 含义 |
| --- | --- |
| eventId | 当前统计的事件编码 |
| params | 对当前事件的参数描述，定义为“参数名:参数值”的“<键-值>”对 |

注：用户属性上传一定要在用户账号上报后。

#### 示例
```typescript
import * as QT from "react-native-quicktracking-analytics-module";

QT.onProfileSignIn("张三");

const user = {
	gender: "male",
  age: "8"
}
QT.sendEvent("$$_user_profile", user);
```
上述上传的业务含义为：张三 男 8岁
## 全局属性
全局属性为每一个事件都会携带的属性
### 注册全局属性
```java
function registerGlobalProperty(globalProperty: any): void
```
| 参数 | 含义 |
| --- | --- |
| globalProperty | 要注册的全局属性，定义为“属性名:属性值”的“<键-值>”对。为单层对象结构，不支持多层嵌套。 |

**注意：**

1. 属性名、string类型的属性值，只支持大小写字母、数字及下划线。
2. 在Android中，属性值不支持JavaScript的boolean类型，需要手动在JS中转为0、1。
3. 在Android中，对于全局属性值为null或undefined的场景，底层Android sdk会过滤这个全局属性字段，如需要空值分析场景，需自定义默认空值
4. 在iOS中，全局属性值不支持null和undefined，需要手动过滤。

#### 示例
```typescript
import * as QT from "react-native-quicktracking-analytics-module";

QT.registerGlobalProperty({
    name: 'MyApp',
    description: 'this is a app',
    aBoolean: 1, //boolean类型需传为0或1,
    aNull: '', //null或undefined类型需传空字符串
    //默认为number类型，对于返回值为null或undefined场景，需业务自定义数值型默认空值
    aNumber: 66,
});
```

### 删除特定的全局属性
```java
function unregisterGlobalProperty(propertyName: string): void
```
| 参数 | 含义 |
| --- | --- |
| propertyName | 要删除的全局属性名 |

#### 示例
```typescript
import * as QT from "react-native-quicktracking-analytics-module";

QT.unregisterGlobalProperty('name'); // 删除全局属性name
```

### 获取特定的全局属性
```typescript
const getGlobalProperty(propertyName: string): Promise<any>
```
| 参数 | 含义 |
| --- | --- |
| propertyName | 要获取的全局属性名 |

#### 示例
```typescript
import * as QT from "react-native-quicktracking-analytics-module";

const nameValue = await QT.getGlobalProperty('name');
console.log('getGlobalProperty 调用成功', nameValue);
```

### 获取所有全局属性
```java
const getGlobalProperties: () => Promise<any>;
```

#### 示例
```typescript
import * as QT from "react-native-quicktracking-analytics-module";

const globalProperties = await QT.getGlobalProperties();
console.log('getGlobalProperties 调用成功', globalProperties);
```

### 清除所有全局属性
```typescript
function clearGlobalProperties(): void
```
#### 示例
```tsx
import * as QT from "react-native-quicktracking-analytics-module";

QT.clearGlobalProperties(); // 所有全局属性都被清除（慎用）
```


## 页面浏览事件埋点
开发者如果希望对页面路径和页面停留时长进行采集和统计。可以通过调用该接口手动埋点
```typescript
function onPageStart(pageName: string): void
function onPageEnd(pageName: string): void
```
| 参数 | 含义 |
| --- | --- |
| pageName | 页面编码 |

### 示例
```typescript
import * as QT from "react-native-quicktracking-analytics-module";

QT.onPageStart('MainPage');
QT.onPageEnd('MainPage');
```
注意：
onPageStart 和 onPageEnd 必须成对调用。

## 页面属性上传
给当前页面附加自定义属性
```typescript
function uploadPageProperties(pageName: string, params: any): void
```
| 参数 | 含义 |
| --- | --- |
| pageName | 页面编码 |
| params | 对当前事件的参数描述，定义为“参数名:参数值”的“<键-值>”对 |

### 示例
```typescript
import * as QT from "react-native-quicktracking-analytics-module";

QT.uploadPageProperties('detail_page', { test: 1 })
```
注意：
该接口必须在onPageStart和onPageEnd之间调用


## 自定义事件埋点
自定义事件可以用于追踪用户行为，记录行为发生的具体细节。
使用 **sendEvent **接口进行事件的统计，接口如下：
```typescript
function sendEvent(eventId: string, params?: any, pageName?: string): void
```
| 参数 | 含义 |
| --- | --- |
| eventId | 为当前统计的事件编码。 |
| params | 对当前事件的参数描述，定义为“参数名:参数值”的“<键-值>对”。为单层对象结构，不支持多层嵌套。 |
| pageName | 当前统计事件的页面编码。 |

### 示例
```typescript
import * as QT from "react-native-quicktracking-analytics-module";

// 携带事件参数的自定义事件
QT.sendEvent(
  'event1',
  {
    name: 'quick tracking',
    method: 'func',
  },
);

// 携带事件参数和页面编码的自定义事件
QT.sendEvent(
  'event2',
  {
    name: 'quick tracking',
    method: 'func',
  },
  'main_page'
);
```
> **_备注：_**
> 
> 多参数类型事件能满足原来计算事件/计数事件的分析场景；
> 对于计算型事件不同的参数类型对应不同的计算方式，总共可以分为两大类，数值型和字符型
> - 数字型：支持累加值、最大值、最小值、平均值和去重数计算
> - 字符型：支持去重数计算

注意：
同全局属性，事件属性在Android和iOS不同平台上，也有着类型处理的差异：

1. 在Android中，不支持JavaScript的boolean类型，需要手动在JS中转为0、1。
2. 在Android中，对于全局属性值为null或undefined的场景，底层Android sdk会过滤这个全局属性字段，如需要空值分析场景，需自定义默认空值
3. 在iOS中，全局属性值不支持null和undefined，需要手动过滤。

## 桥接事件埋点
桥接事件用于h5桥接RN的场景，使用此接口将H5日志发送至App中。
```typescript
function sendEventForH5(data: string): void
```
| 参数 | 含义 |
| --- | --- |
| data | H5转发事件的日志体 |

### 示例
```typescript
import * as QT from "react-native-quicktracking-analytics-module";

const content = data.nativeEvent.data;
QT.sendEventForH5(content);
```

# RN App中嵌入h5页面（RN桥接模式）
## H5集成 QuickTracking Web SDK
该步骤请参考[QuickTrackingWeb SDK集成手册](https://help.aliyun.com/document_detail/428531.html)
## 转发H5端发送的日志给React Native WebView
```javascript
<script charset="UTF-8">
  ...
  // sdk接入及配置部分
  ...

  //转发页面自定义事件（点击、元素曝光、其他）
  aplus_queue.push({
    action: 'aplus.aplus_pubsub.subscribe',
    arguments: ['mw_change_hjlj', function (content) {
      var eventData = content && content.what_to_send && content.what_to_send.hjljdataToUmNative;
      if (/*iOS环境*/) {
        window.ReactNativeWebView.postMessage(JSON.stringify(eventData), '*');
      } else {
        window.ReactNativeWebView.postMessage(JSON.stringify(eventData));
      }
    }]
  })

  aplus_queue.push({
    action: 'aplus.aplus_pubsub.subscribe',
    arguments: ['mw_change_pv', function (content) {
      var pvData = content && content.what_to_send && content.what_to_send.pvdataToUmNative;
      if (/*iOS环境*/) {
        window.ReactNativeWebView.postMessage(JSON.stringify(pvData), '*');
      } else {
        window.ReactNativeWebView.postMessage(JSON.stringify(pvData));
      }
    }]
  })
</script>
```
## React Native WebView接收消息并调用QT SDK上报日志
```javascript
import * as React from 'react'
import { WebView } from 'react-native-webview';
import { QT } from 'react-native-quicktracking-analytics-module';
import { Platform, SafeAreaView } from 'react-native';

export default function WebPage() {
  const onMessage = (data) => {
    try {
      const content = data.nativeEvent.data;
      QT.sendEventForH5(content);
    } catch (error) {
      console.log('webview message error:', error);
    }
  };
	...
  return (
    <SafeAreaView style={{ flex: 1 }}>
    	<WebView
      	...
        onMessage={onMessage}
      	...
      />
  	</SafeAreaView>
	);
}
```

# 其他
## 关闭SDK
```typescript
const disableSDK: () => void;
```
### 示例

```typescript
import * as QT from "react-native-quicktracking-analytics-module";

QT.disableSDK();
```
## 开启SDK
```typescript
const enableSDK: () => void;
```
### 示例
```typescript
import * as QT from "react-native-quicktracking-analytics-module";

QT.enableSDK();
```
## 自定义设备ID
```typescript
const setCustomDeviceId: (deviceId: string) => void;
```
| 参数 | 含义 |
| --- | --- |
| deviceId | 设备ID |
### 示例

```typescript
import * as QT from "react-native-quicktracking-analytics-module";

QT.setCustomDeviceId('deviceId');
```
## 读取设备ID
```typescript
const getDeviceId: () => Promise<any>;
```
### 示例
```typescript
import * as QT from "react-native-quicktracking-analytics-module";

const deviceID = await QT.getDeviceId(); 
console.log(‘getDeviceId 调用成功’, 
  JSON.stringify(deviceID)); 
```

# FAQ
## ruby版本过低
进入项目时提示，Required ruby-2.7.5 is not installed. To install do: 'rvm install "ruby-2.7.5"'
注意您的ruby版本，MacOS自带的Ruby为2.6.8，不符合RN项目需求。
建议在本地终端中执行 ruby --version
下载ruby包管理器，如rbenv或rvm等，改成ruby版本为RN需要的[版本](https://github.com/facebook/react-native/blob/main/template/_ruby-version)
```shell
rvm install 2.7.5
rvm use 2.7.5
```


## 嵌入的html可以收发数，但Android端不能
查看Android Manifest里有没有配置网络权限。
# 参考
> [QuickTracking Android SDK集成手册](https://help.aliyun.com/document_detail/260238.html)
> [QuickTracking iOS SDK集成手册](https://help.aliyun.com/document_detail/260233.html)
> [React Native Android 本地模块](https://reactnative.dev/docs/0.78/legacy/native-modules-android)
> [React Native iOS 本地模块](https://reactnative.dev/docs/0.78/legacy/native-modules-ios)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
