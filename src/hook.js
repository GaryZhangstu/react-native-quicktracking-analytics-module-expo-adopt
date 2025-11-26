#! node option
// 系统变量
const path = require('path');
const fs = require('fs');
const packageJSON = require('../../../package.json');
const dir = path.resolve(__dirname, '../../');

const ChartSet_UTF8 = 'utf8';
const QTHookTag = 'QUICKTRACKING HOOK';
const QTBackUpSuffix = '_quicktracking_backup';

// 工具函数- add try catch
function addTryCatch(functionBody) {
  functionBody = functionBody.replace(/this/g, 'thatThis');
  return (
    '(function(thatThis){\n' +
    '    try{\n        ' +
    functionBody +
    "    \n    } catch (error) { throw new Error('QUICKTRACKING RN Hook Code 调用异常: ' + error);}\n" +
    '})(this); /* QUICKTRACKING HOOK */'
  );
}

// 工具函数 - 计算位置
function lastArgumentName(content, index) {
  --index;
  const lastComma = content.lastIndexOf(',', index);
  const lastParentheses = content.lastIndexOf('(', index);
  const start = Math.max(lastComma, lastParentheses);
  return content.substring(start + 1, index + 1);
}

// 自动PV开关
let enableAutoCLK = false;

if (packageJSON && packageJSON.QTSDKConfig) {
  enableAutoCLK = !!packageJSON.QTSDKConfig.enableAutoCLK;
}

// react native clickable component path
const RNClickTouchableFilePath =
  dir + '/react-native/Libraries/Components/Touchable/Touchable.js'; //原RNClickFilePath
const RNClickPressabilityFilePath =
  dir + '/react-native/Libraries/Pressability/Pressability.js';
const RNClickableFiles = [
  dir +
    '/react-native/Libraries/Renderer/src/renderers/native/ReactNativeFiber.js',
  dir +
    '/react-native/Libraries/Renderer/src/renderers/native/ReactNativeFiber-dev.js',
  dir +
    '/react-native/Libraries/Renderer/src/renderers/native/ReactNativeFiber-prod.js',
  dir +
    '/react-native/Libraries/Renderer/src/renderers/native/ReactNativeFiber-profiling.js',
  dir + '/react-native/Libraries/Renderer/ReactNativeFiber-dev.js',
  dir + '/react-native/Libraries/Renderer/ReactNativeFiber-prod.js',
  dir + '/react-native/Libraries/Renderer/oss/ReactNativeRenderer-dev.js',
  dir + '/react-native/Libraries/Renderer/oss/ReactNativeRenderer-prod.js',
  dir + '/react-native/Libraries/Renderer/ReactNativeStack-dev.js',
  dir + '/react-native/Libraries/Renderer/ReactNativeStack-prod.js',
  dir + '/react-native/Libraries/Renderer/oss/ReactNativeRenderer-profiling.js',
  dir + '/react-native/Libraries/Renderer/ReactNativeRenderer-dev.js',
  dir + '/react-native/Libraries/Renderer/ReactNativeRenderer-prod.js',
  dir +
    '/react-native/Libraries/Renderer/implementations/ReactNativeRenderer-profiling.js',
  dir +
    '/react-native/Libraries/Renderer/implementations/ReactNativeRenderer-dev.js',
  dir +
    '/react-native/Libraries/Renderer/implementations/ReactNativeRenderer-prod.js',
];

// react native slider files path
const RNSliderFiles = [
  dir + '/react-native/Libraries/Components/Slider/Slider.js',
  dir + '/react-native/Libraries/Components/Slider/Slider.js',
  dir + '/@react-native-community/slider/js/Slider.js',
  dir + '/@react-native-community/slider/dist/Slider.js',
  dir + '/@react-native-community/js/Slider.js',
  dir + '/@react-native-community/src/js/Slider.js',
];

// react native switch files path
const RNSwitchFiles = [
  dir + '/react-native/Libraries/Components/Switch/Switch.js',
];

// react native segmentedControl files path
const RNSegmentedControlFilePath = [
  dir +
    '/react-native/Libraries/Components/SegmentedControlIOS/SegmentedControlIOS.ios.js',
  dir + '/@react-native-community/segmented-control/js/SegmentedControl.ios.js',
];

// react native gestureButtons files path
const RNGestureButtonsFilePaths = [
  dir + '/react-native-gesture-handler/GestureButtons.js',
  dir + '/react-native-gesture-handler/src/components/GestureButtons.tsx',
];

const QTClickTouchableHookCode = `(function(thatThis) {
  try {
    const ReactNative = require('react-native');
    const qtModule = ReactNative.NativeModules.QuicktrackingAnalyticsModule;
    thatThis.props.onPress && qtModule && qtModule?.onEventAutoCLK(ReactNative.findNodeHandle(thatThis));
  } catch (error) {
    throw new Error('QuickTracking RN Hook Code 调用异常: ' + error);
  }
})(this)
/* QUICKTRACKING HOOK */ `;

const QTClickPressabilityHookCode = `const tag = event.currentTarget && event.currentTarget._nativeTag ? event.currentTarget._nativeTag:event.currentTarget;
  (function(thatThis, e, that){
    if(thatThis){
      try {
        const qtModule = ReactNative.NativeModules.QuicktrackingAnalyticsModule;
        qtModule && qtModule?.onEventAutoCLK(thatThis);
      }catch (error){
        throw new Error('QuickTracking RN Hook Code 调用异常:'  + error);
      }
    }
  })(tag, event, this); /* QUICKTRACKING HOOK */ `;
// iOS 全埋点已覆盖
const QTSliderHookCode =
  '(function(thatThis){\n' +
  '  try {\n' +
  "    const ReactNative = require('react-native');\n" +
  '    const qtModule = ReactNative.NativeModules.QuicktrackingAnalyticsModule;\n' +
  '    qtModule && qtModule?.onEventAutoCLK(event.nativeEvent.target);\n' +
  '  } catch (error) { \n' +
  "      throw new Error('QUICKTRACKING RN Hook Code 调用异常: ' + error);\n" +
  '  }\n' +
  '})(this); /* QUICKTRACKING HOOK */';
// iOS 全埋点覆盖
const QTSegmentedControlHookCode =
  'if(this.props.onChange != null || this.props.onValueChange != null){\n' +
  '(function(thatThis){\n' +
  '  try {\n' +
  "    const ReactNative = require('react-native');\n" +
  '    const qtModule = ReactNative.NativeModules.QuicktrackingAnalyticsModule;\n' +
  '    qtModule && qtModule?.onEventAutoCLK(event.nativeEvent.target);\n' +
  '  } catch (error) { \n' +
  "      throw new Error('QUICKTRACKING RN Hook Code 调用异常: ' + error);}\n" +
  '})(this); /* QUICKTRACKING HOOK */}';
// iOS 全埋点已覆盖
const QTSwitchHookCode = `if(this.props.onChange != null || this.props.onValueChange != null){
    (function(thatThis){
      try {
       const ReactNative = require('react-native');
        const qtModule = ReactNative.NativeModules.QuicktrackingAnalyticsModule;
       qtModule && qtModule?.onEventAutoCLK(ReactNative.findNodeHandle(thatThis));
     } catch (error) {
       throw new Error('QUICKTRACKING RN Hook Code 调用异常: ' + error);
      }
   })(this);
    /* QUICKTRACKING HOOK */}`;
// iOS 已覆盖
const QTSwitchHookCode66 = `if(nativeSwitchRef.current && onValueChange){
    (function(thatThis){
      try {
       const ReactNative = require(react-native);
        const qtModule = ReactNative.NativeModules.QuicktrackingAnalyticsModule;
       qtModule && qtModule?.onEventAutoCLK(ReactNative.findNodeHandle(nativeSwitchRef.current));
     } catch (error) {
       throw new Error('QUICKTRACKING RN Hook Code 调用异常:'  + error);
      }
    })(this); /* QUICKTRACKING HOOK */}`;

// import ReactNative if need
const QTImportReactNativeHookCode = "import ReactNative from 'react-native';\n";

// hook Touchable.js
function QTTouchableHookRN() {
  if (fs.existsSync(RNClickTouchableFilePath)) {
    // read file content
    let fileContent = fs.readFileSync(RNClickTouchableFilePath, ChartSet_UTF8);
    // already hook, pass
    if (fileContent.indexOf(QTHookTag) > -1) {
      return;
    }
    console.log(`found Touchable.js: ${RNClickTouchableFilePath}`);
    // get position of the injected code
    const hookIndex = fileContent.indexOf('this.touchableHandlePress(');
    // if method of touchableHandlePress not exist, throw exception
    if (hookIndex === -1) {
      throw "Can't not find touchableHandlePress function";
    }

    const injectedContent = `${fileContent.substring(
      0,
      hookIndex
    )}\n${QTClickTouchableHookCode}\n${fileContent.substring(hookIndex)}`;

    // backup original Touchable.js file
    fs.renameSync(
      RNClickTouchableFilePath,
      `${RNClickTouchableFilePath}${QTBackUpSuffix}`
    );

    // rewrite Touchable.js file
    fs.writeFileSync(RNClickTouchableFilePath, injectedContent, ChartSet_UTF8);
    console.log(`modify Touchable.js succeed`);
  }
}

// hook 0.62\0.63 Pressable click
function QTPressableHookRN() {
  if (fs.existsSync(RNClickPressabilityFilePath)) {
    // read file content
    var fileContent = fs.readFileSync(RNClickPressabilityFilePath, 'utf8');
    // already hook, pass
    if (fileContent.indexOf(QTHookTag) > -1) {
      return;
    }
    console.log(`found Pressability.js: ${RNClickPressabilityFilePath}`);
    // get position of the injected code
    var scriptStr = 'onPress(event);';
    var hookIndex = fileContent.lastIndexOf(scriptStr);
    // if method of onPress not exist, throw exception

    if (hookIndex === -1) {
      throw "Can't not find onPress(event); code";
    }

    var hookedContent = `${fileContent.substring(
      0,
      hookIndex
    )}\n${QTClickPressabilityHookCode}\n${fileContent.substring(hookIndex)}`;
    // backup original Pressability.js file
    if (fileContent.indexOf(`${QTImportReactNativeHookCode}`) === -1) {
      hookedContent = QTImportReactNativeHookCode + hookedContent;
    }
    fs.renameSync(
      RNClickPressabilityFilePath,
      `${RNClickPressabilityFilePath}${QTBackUpSuffix}`
    );
    // rewrite Pressability.js file
    fs.writeFileSync(RNClickPressabilityFilePath, hookedContent, ChartSet_UTF8);
    console.log(`modify Pressability.js succeed`);
  }
}

// hook slider
function QTHookSliderRN(reset = false) {
  RNSliderFiles.forEach(function (onefile) {
    if (fs.existsSync(onefile)) {
      // 读取文件内容
      const fileContent = fs.readFileSync(onefile, ChartSet_UTF8);
      if (reset) {
        // 未被 hook 过代码，不需要处理
        if (fileContent.indexOf(QTHookTag) === -1) {
          return;
        }
        // 检查备份文件是否存在
        const backFilePath = `${onefile}${QTBackUpSuffix}`;
        if (!fs.existsSync(backFilePath)) {
          throw `File: ${backFilePath} not found, Please rm -rf node_modules and npm install again`;
        }
        // 将备份文件重命名恢复 + 自动覆盖被 hook 过的同名文件
        fs.renameSync(backFilePath, onefile);
        console.log(`found and reset Slider.js: ${onefile}`);
      } else {
        // 已经 hook 过了，不需要再次 hook
        if (fileContent.indexOf(QTHookTag) > -1) {
          return;
        }
        console.log(`found Slider.js: ${onefile}`);
        // 获取 hook 的代码插入的位置
        const scriptStr = 'onSlidingComplete(event.nativeEvent.value);';
        const hookIndex = fileContent.indexOf(scriptStr);
        // 判断文件是否异常，不存在 touchableHandlePress 方法，导致无法 hook 点击事件
        if (hookIndex === -1) {
          throw "Can't not find onSlidingComplete function";
        }
        // 插入 hook 代码
        const hookedContent = `${fileContent.substring(
          0,
          hookIndex + scriptStr.length
        )}\n${QTSliderHookCode}\n${fileContent.substring(
          hookIndex + scriptStr.length
        )}`;
        // 备份源文件
        fs.renameSync(onefile, `${onefile}${QTBackUpSuffix}`);
        // 重写文件
        fs.writeFileSync(onefile, hookedContent, ChartSet_UTF8);
        console.log(`modify Slider.js succeed`);
      }
    }
  });
}
// hook switch
function QTHookSwitchRN(reset = false) {
  RNSwitchFiles.forEach(function (onefile) {
    if (fs.existsSync(onefile)) {
      // 读取文件内容
      const fileContent = fs.readFileSync(onefile, 'utf8');
      if (reset) {
        // 未被 hook 过代码，不需要处理
        if (fileContent.indexOf(`${QTHookTag}`) === -1) {
          return;
        }
        // 检查备份文件是否存在
        const backFilePath = `${onefile}${QTBackUpSuffix}`;
        if (!fs.existsSync(backFilePath)) {
          throw `File: ${backFilePath} not found, Please rm -rf node_modules and npm install again`;
        }
        // 将备份文件重命名恢复 + 自动覆盖被 hook 过的同名文件
        fs.renameSync(backFilePath, onefile);
        console.log(`found and reset Switch.js: ${onefile}`);
      } else {
        // 已经 hook 过了，不需要再次 hook
        if (fileContent.indexOf(`${QTHookTag}`) > -1) {
          return;
        }
        console.log(`found Switch.js: ${onefile}`);
        // 特殊情况的单独插入
        // if (this.props.onValueChange != null) {
        let scriptStr = 'if (this.props.onValueChange != null) {';
        let hookIndex = fileContent.indexOf(scriptStr);
        if (hookIndex > -1) {
          // 插入 hook 代码
          const hookedContent = `${fileContent.substring(
            0,
            hookIndex
          )}\n${QTSwitchHookCode}\n${fileContent.substring(hookIndex)}`;
          // 备份源文件
          fs.renameSync(onefile, `${onefile}${QTBackUpSuffix}`);
          // 重写文件
          fs.writeFileSync(onefile, hookedContent, 'utf8');
          console.log(`modify Switch.js: ${onefile}`);
        } else {
          // 获取 hook 的代码插入的位置
          scriptStr = 'this.props.onValueChange(event.nativeEvent.value);';
          hookIndex = fileContent.indexOf(scriptStr);
          let hookcontent;
          if (hookIndex === -1) {
            scriptStr = 'onValueChange?.(event.nativeEvent.value);';
            hookIndex = fileContent.indexOf(scriptStr);
            hookcontent = QTSwitchHookCode66;
          } else {
            hookcontent = QTSwitchHookCode;
          }
          // 判断文件是否异常，不存在 touchableHandlePress 方法，导致无法 hook 点击事件
          if (hookIndex === -1) {
            throw "Can't not find onValueChange function";
          }
          // 插入 hook 代码
          const hookedContent = `${fileContent.substring(
            0,
            hookIndex + scriptStr.length
          )}\n${hookcontent}\n${fileContent.substring(
            hookIndex + scriptStr.length
          )}`;
          // 备份源文件
          fs.renameSync(onefile, `${onefile}${QTBackUpSuffix}`);
          // 重写文件
          fs.writeFileSync(onefile, hookedContent, 'utf8');
          console.log(`modify Switch.js succeed`);
        }
      }
    }
  });
}
// hook SegmentedControl
function QTHookSegmentedControlRN(reset = false) {
  RNSegmentedControlFilePath.forEach(function (onefile) {
    if (fs.existsSync(onefile)) {
      // 读取文件内容
      const fileContent = fs.readFileSync(onefile, ChartSet_UTF8);
      if (reset) {
        // 未被 hook 过代码，不需要处理
        if (fileContent.indexOf(`${QTHookTag}`) === -1) {
          return;
        }
        // 检查备份文件是否存在
        const backFilePath = `${onefile}${QTBackUpSuffix}`;
        if (!fs.existsSync(backFilePath)) {
          throw `File: ${backFilePath} not found, Please rm -rf node_modules and npm install again`;
        }
        // 将备份文件重命名恢复 + 自动覆盖被 hook 过的同名文件
        fs.renameSync(backFilePath, onefile);
        console.log(`found and reset SegmentedControl.js: ${onefile}`);
      } else {
        // 已经 hook 过了，不需要再次 hook
        if (fileContent.indexOf(`${QTHookTag}`) > -1) {
          return;
        }
        console.log(`found SegmentedControl.js: ${onefile}`);
        // 获取 hook 的代码插入的位置
        const scriptStr = 'this.props.onValueChange(event.nativeEvent.value);';
        const hookIndex = fileContent.indexOf(scriptStr);
        // 判断文件是否异常，不存在 touchableHandlePress 方法，导致无法 hook 点击事件
        if (hookIndex === -1) {
          throw "Can't not find onValueChange function";
        }
        // 插入 hook 代码
        const hookedContent = `${fileContent.substring(
          0,
          hookIndex + scriptStr.length
        )}\n${QTSegmentedControlHookCode}\n${fileContent.substring(
          hookIndex + scriptStr.length
        )}`;
        // 备份 Touchable.js 源文件
        fs.renameSync(onefile, `${onefile}${QTBackUpSuffix}`);
        // 重写 Touchable.js 文件
        fs.writeFileSync(onefile, hookedContent, ChartSet_UTF8);
        console.log(`modify SegmentedControl.js succeed`);
      }
    }
  });
}

// hook GestureButtons
function QTHookGestureButtonsRN(reset = false) {
  RNGestureButtonsFilePaths.forEach(function (onefile) {
    if (fs.existsSync(onefile)) {
      // 读取文件内容
      const fileContent = fs.readFileSync(onefile, ChartSet_UTF8);
      if (reset) {
        // 未被 hook 过代码，不需要处理
        if (fileContent.indexOf(`${QTHookTag}`) === -1) {
          return;
        }
        // 检查备份文件是否存在
        const backFilePath = `${onefile}${QTBackUpSuffix}`;
        if (!fs.existsSync(backFilePath)) {
          throw `File: ${backFilePath} not found, Please rm -rf node_modules and npm install again`;
        }
        // 将备份文件重命名恢复 + 自动覆盖被 hook 过的同名文件
        fs.renameSync(backFilePath, onefile);
        console.log(`found and reset GestureButtons: ${onefile}`);
      } else {
        // 已经 hook 过了，不需要再次 hook
        if (fileContent.indexOf(`${QTHookTag}`) > -1) {
          return;
        }
        console.log(`found GestureButtons: ${onefile}`);
        // 获取 hook 的代码插入的位置
        const scriptStr = 'this.props.onPress(active);';
        const hookIndex = fileContent.indexOf(scriptStr);
        // 判断文件是否异常，不存在 this.props.onPress(active); 导致无法 hook 点击事件
        if (hookIndex === -1) {
          throw "Can't not find this.props.onPress(active); ";
        }
        // 插入 hook 代码
        const hookedContent = `${fileContent.substring(
          0,
          hookIndex + scriptStr.length
        )}\n${QTClickTouchableHookCode}\n${fileContent.substring(
          hookIndex + scriptStr.length
        )}`;
        // 备份目标源文件
        fs.renameSync(onefile, `${onefile}${QTBackUpSuffix}`);
        // 重写修改后的文件
        fs.writeFileSync(onefile, hookedContent, ChartSet_UTF8);
        console.log(`modify GestureButtons succeed`);
      }
    }
  });
}

// hook clickable
function QTHookClickableRN(reset = false) {
  RNClickableFiles.forEach(function (onefile) {
    if (fs.existsSync(onefile)) {
      if (reset) {
        // 读取文件内容
        const fileContent = fs.readFileSync(onefile, ChartSet_UTF8);
        // 未被 hook 过代码，不需要处理
        if (fileContent.indexOf(`${QTHookTag}`) === -1) {
          return;
        }
        // 检查备份文件是否存在
        const backFilePath = `${onefile}${QTBackUpSuffix}`;
        if (!fs.existsSync(backFilePath)) {
          throw `File: ${backFilePath} not found, Please rm -rf node_modules and npm install again`;
        }
        // 将备份文件重命名恢复 + 自动覆盖被 hook 过的同名文件
        fs.renameSync(backFilePath, onefile);
        console.log(`found and reset clickable: ${onefile}`);
      } else {
        // 读取文件内容
        const content = fs.readFileSync(onefile, 'utf8');
        // 已经 hook 过了，不需要再次 hook
        if (content.indexOf(`${QTHookTag}`) > -1) {
          return;
        }
        console.log(`found clickable.js: ${onefile}`);
        // 获取 hook 的代码插入的位置
        let objRe =
          /ReactNativePrivateInterface\.UIManager\.createView\([\s\S]{1,60}\.uiViewClassName,[\s\S]*?\)[,;]/;
        let match = objRe.exec(content);
        if (!match) {
          objRe =
            /UIManager\.createView\([\s\S]{1,60}\.uiViewClassName,[\s\S]*?\)[,;]/;
          match = objRe.exec(content);
        }
        if (!match) {
          throw "can't inject clickable js";
        }
        const lastParentheses = content.lastIndexOf(')', match.index);
        const nextCommaIndex = content.indexOf(',', match.index);
        if (nextCommaIndex === -1)
          throw "can't inject clickable js, and nextCommaIndex is -1";
        const tagName = lastArgumentName(content, nextCommaIndex).trim();
        const functionBody = `
          var qtElement;
          if(typeof internalInstanceHandle !== 'undefined') {
            qtElement = internalInstanceHandle;
          } else if(typeof workInProgress !== 'undefined') {
            qtElement = workInProgress;
          } else if(typeof thatThis._currentElement !== 'undefined') {
            qtElement = thatThis._currentElement;
          }
          var eachProgress = function (workInProgress) {
            if(workInProgress == null){
              return;
            }
            var props;
            if(workInProgress.memoizedProps) {
              props = workInProgress.memoizedProps;
            } else if(workInProgress.props){
              props = workInProgress.props;
            }
            if(props && props.qtParams) {
              return props.qtParams;
            } else {
              if(!props ||
                !workInProgress.type ||
                workInProgress.type.displayName === 'TouchableOpacity' ||
                workInProgress.type.displayName === 'TouchableHighlight' ||
                workInProgress.type.displayName === 'TouchableWithoutFeedback'||
                workInProgress.type.displayName === 'TouchableNativeFeedback'||
                workInProgress.type.displayName === 'Pressable'||
                workInProgress.type.name === 'TouchableOpacity' ||
                workInProgress.type.name === 'TouchableHighlight' ||
                workInProgress.type.name === 'TouchableNativeFeedback'||
                workInProgress.type.name === 'TouchableWithoutFeedback'||
                workInProgress.type.displayName === undefined||
                workInProgress.type.name === undefined ||
                !props.onPress
                ) {
                if(workInProgress.return) {
                  return eachProgress(workInProgress.return);
                } else {
                  if(workInProgress._owner && workInProgress._owner._currentElement) {
                    return eachProgress(workInProgress._owner._currentElement);
                  } else {
                    return eachProgress(workInProgress._owner);
                  }
                }
              }
            }
          };
          var elementProps;
          if(qtElement && qtElement.memoizedProps) {
            elementProps = qtElement.memoizedProps;
          } else if(qtElement && qtElement.props) {
            elementProps = qtElement.props;
          }
          if(elementProps) {
	         // iOS 兼容 SegmentedControl 逻辑
            var isSegmentedControl = (
              qtElement && (
                qtElement.type === 'RNCSegmentedControl' ||
                qtElement.type === 'RCTSegmentedControl' ||
                qtElement.type.name === 'RNCSegmentedControl' ||
                qtElement.type.name === 'RCTSegmentedControl' ||
                qtElement.type.displayName === 'RNCSegmentedControl' ||
                qtElement.type.displayName === 'RCTSegmentedControl'
              )
            );
            if(elementProps.onStartShouldSetResponder || isSegmentedControl) {
              var qtProps = eachProgress(qtElement);
              var ReactNative = require('react-native');

              var qtModule = ReactNative.NativeModules.QuicktrackingAnalyticsModule;
              if(qtModule && qtModule.saveRootViewProperties) {
                var qtRootTag;
                if(typeof nativeTopRootTag !== 'undefined') {
                  qtRootTag = nativeTopRootTag;
                } else if(typeof rootContainerInstance !== 'undefined') {
                  qtRootTag = rootContainerInstance;
                } else if(typeof renderExpirationTime !== 'undefined') {
                  qtRootTag = renderExpirationTime;
                } else if(typeof renderLanes !== 'undefined') {
                  qtRootTag = renderLanes;
                }
                if (qtRootTag && (typeof qtRootTag === 'number')) {
                  qtModule.saveRootViewProperties(${tagName}, true , qtProps, qtRootTag);
                  return;
                }
              }
              qtModule && qtModule.saveViewProperties && qtModule.saveViewProperties(${tagName}, true, qtProps);
            }
        }`;
        const call = addTryCatch(functionBody);
        const lastReturn = content.lastIndexOf('return', match.index);
        let splitIndex = match.index;
        if (lastReturn > lastParentheses) {
          splitIndex = lastReturn;
        }
        const hookedContent = `${content.substring(
          0,
          splitIndex
        )}\n${call}\n${content.substring(splitIndex)}`;

        // 备份源文件
        fs.renameSync(onefile, `${onefile}${QTBackUpSuffix}`);
        // 重写文件
        fs.writeFileSync(onefile, hookedContent, ChartSet_UTF8);
        console.log(`modify clickable.js succeed`);
      }
    }
  });
}

function resetQTHookCodeRN(resetFilePath) {
  // 判断需要被恢复的文件是否存在
  if (!fs.existsSync(resetFilePath)) {
    return;
  }
  const fileContent = fs.readFileSync(resetFilePath, 'utf8');
  // 未被 hook 过代码，不需要处理
  if (fileContent.indexOf(`${QTHookTag}`) === -1) {
    return;
  }
  // 检查备份文件是否存在
  const backFilePath = `${resetFilePath}${QTBackUpSuffix}`;
  if (!fs.existsSync(backFilePath)) {
    throw `File: ${backFilePath} not found, Please rm -rf node_modules and npm install again`;
  }
  // 将备份文件重命名恢复 + 自动覆盖被 hook 过的同名 Touchable.js 文件
  fs.renameSync(backFilePath, resetFilePath);
  console.log(`found and reset file: ${resetFilePath}`);
}

// hook all auto click event entry
function QTHookClickEventRN() {
  QTTouchableHookRN(RNClickTouchableFilePath);
  QTHookClickableRN();
  QTHookSliderRN();
  QTHookSegmentedControlRN();
  QTHookGestureButtonsRN();
  QTPressableHookRN();
}

function resetAllQTHookFiles() {
  resetQTHookCodeRN(RNClickTouchableFilePath);

  QTHookClickableRN(true);

  QTHookSliderRN(true);
  QTHookSwitchRN(true);
  QTHookSegmentedControlRN(true);
  QTHookGestureButtonsRN(true);

  resetQTHookCodeRN(RNClickPressabilityFilePath);
}

// hook all files entry
function QTHookAllFiles() {
  if (!enableAutoCLK) {
    console.log('customers ignore auto click event');
  } else {
    QTHookClickEventRN();
  }
}

// 命令行
switch (process.argv[2]) {
  case '-run':
    resetAllQTHookFiles();
    QTHookAllFiles();
    break;
  case '-reset':
    resetAllQTHookFiles();
    break;
  default:
    console.log('can not find this options: ' + process.argv[2]);
}
