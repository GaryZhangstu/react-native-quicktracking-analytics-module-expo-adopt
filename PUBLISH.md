# 发布指南

## 基本信息

**包名**: `react-native-quicktracking-analytics-module-expo-adopt`
**版本**: 1.0.0
**描述**: QuickTracking ReactNative Analytics SDK with Expo support

## 发布前检查清单

- [x] 修改 package.json 中的包名
- [x] 更新版本号到 1.0.0
- [x] 更新 README.md 中的安装命令
- [x] 确保代码构建成功
- [x] 测试所有功能正常工作
- [x] 更新 CHANGELOG.md（如果你有的话）

## 发布步骤

### 1. 登录 npm

如果你还没有 npm 账号，先到 [npmjs.com](https://www.npmjs.com/) 注册。

```bash
npm login
```

### 2. 构建项目

```bash
yarn build
```

确保 `lib/` 目录包含所有构建文件：
- `lib/commonjs/` - CommonJS 模块
- `lib/module/` - ES 模块
- `lib/typescript/` - TypeScript 定义文件

### 3. 发布到 npm

```bash
npm publish
```

如果你使用的是 npm 组织或作用域包（例如 `@yourusername/package-name`），需要：

```bash
npm publish --access public
```

### 4. 验证发布

访问 https://www.npmjs.com/package/react-native-quicktracking-analytics-module-expo-adopt 确认包已发布成功。

## 安装你的包

用户现在可以通过以下命令安装你的包：

```bash
# npm
npm install react-native-quicktracking-analytics-module-expo-adopt

# yarn
yarn add react-native-quicktracking-analytics-module-expo-adopt

# pnpm
pnpm add react-native-quicktracking-analytics-module-expo-adopt
```

## 使用

```typescript
import * as QT from 'react-native-quicktracking-analytics-module-expo-adopt';

// 初始化 SDK
QT.setTrackDomain('https://log.quicktracking.cn', '');
QT.init('your-app-key', 'App Store');

// 发送事件
QT.sendEvent('button_click', { button_name: 'submit' });
```

## 注意事项

1. **首次发布**：npm 要求版本号必须是新的，不能重复
2. **私有包**：如果你不想公开发布，可以使用 `npm publish --access restricted`
3. **版本控制**：建议使用语义化版本（Semantic Versioning）：主版本.次版本.修订号
4. **Git 标签**：发布前建议创建 git tag：
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

## 后续更新

当需要发布新版本时：

1. 更新版本号（遵循语义化版本规范）：
   ```bash
   npm version patch  # 修订号 +1 (例如 1.0.0 -> 1.0.1)
   npm version minor  # 次版本 +1 (例如 1.0.0 -> 1.1.0)
   npm version major  # 主版本 +1 (例如 1.0.0 -> 2.0.0)
   ```

2. 重新构建并发布：
   ```bash
   yarn build
   npm publish
   ```

## 需要帮助？

- npm 文档：https://docs.npmjs.com/
- 发布问题：https://docs.npmjs.com/troubleshooting/common-errors
