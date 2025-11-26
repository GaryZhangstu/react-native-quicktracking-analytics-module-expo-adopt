# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **QuickTracking React Native Analytics SDK** - a cross-platform analytics library that provides comprehensive tracking capabilities for React Native applications. The library bridges native Android (Kotlin) and iOS (Objective-C++) analytics SDKs with a unified TypeScript/JavaScript API.

**Important**: This library has been updated to support both traditional React Native and Expo environments. The TypeScript interface (`src/index.tsx`) automatically detects the environment and uses the appropriate native module implementation.

## Expo Compatibility

From v2.2.0, this library supports Expo integration with dual native module implementations:

- **Expo Modules**: `QuicktrackingAnalyticsExpoModule` (Kotlin/Swift with expo-modules-core)
- **Traditional Native Modules**: `QuicktrackingAnalyticsModule` (Kotlin/Objective-C++ with React Native bridge)

The TypeScript interface (`src/index.tsx:6-15`) automatically detects the runtime environment and loads the appropriate native module, ensuring seamless compatibility with both traditional React Native and Expo projects.

Key Expo integration files:
- `expo-module.config.json` - Expo module configuration
- `android/src/main/java/com/quicktrackinganalyticsmodule/QuicktrackingAnalyticsExpoModule.kt` - Android Expo module
- `ios/QuicktrackingAnalyticsExpoModule.swift` - iOS Expo module
- `src/index.tsx` - Auto-detection logic

## Development Commands

### Build Commands
```bash
# Clean build artifacts
yarn clean

# Build the library (CommonJS, ES modules, TypeScript declarations)
yarn prepare
# or
yarn build

# Run TypeScript type checking
yarn typecheck

# Run linting
yarn lint

# Run tests
yarn test
```

### Release Commands
```bash
# Create a new release (includes version bump, changelog, git tag, npm publish)
yarn release
```

### Platform-specific Setup
```bash
# iOS - Install CocoaPods dependencies
cd ios && pod install
```

## Architecture Overview

### Core Structure
- **JavaScript API**: `src/index.tsx` - Main entry point providing unified analytics interface
- **Android Native**: `android/src/main/java/com/quicktrackinganalyticsmodule/` - Kotlin implementation
- **iOS Native**: `ios/` - Objective-C++ implementation
- **Build Output**: `lib/` - Generated CommonJS, ES modules, and TypeScript declarations

### Key Architectural Patterns
1. **Bridge Pattern**: Clean separation between JS API and native implementations
2. **Manager Pattern**: Centralized SDK operations via `QTSDKManager` (Android) and `QuickTrackingSDKManager` (iOS)
3. **Event-Driven**: View touch interception and lifecycle tracking
4. **Hook System**: JavaScript hook (`src/hook.js`) for automatic click tracking

### Platform-Specific Considerations

#### Android
- Uses Kotlin for native implementation
- Requires pre-initialization (`preInit()`) for privacy compliance
- Touch events handled via `JSTouchDispatcher` integration
- View hierarchy traversal through `RNTouchTargetHelper`

#### iOS
- Uses Objective-C++ (.mm files) for React Native bridge
- All operations must run on main thread
- View swizzling via `NSObject+QTReactNativeSwizzler`
- React tag management for view identification

### API Categories
1. **SDK Initialization**: `init()`, `preInit()`, `setTrackDomain()`
2. **Page Tracking**: `onPageStart()`, `onPageEnd()`, `uploadPageProperties()`
3. **Event Tracking**: `sendEvent()`, `sendEventForH5()`
4. **Global Properties**: `registerGlobalProperty()`, `getGlobalProperty()`
5. **User Management**: `profileSignIn()`, `profileSignOff()`
6. **Device Management**: `setCustomDeviceId()`, `getDeviceId()`

### Important Implementation Notes

#### Type Handling Differences
- **Android**: No boolean support (use 0/1), null/undefined filtered out
- **iOS**: No null/undefined support, must be filtered manually
- **Global Properties**: Single-level objects only, no nested structures

#### Threading Requirements
- **iOS**: All SDK operations MUST run on main thread
- **Android**: Recommended to run on main thread for accuracy

#### Privacy Compliance
- SDK initialization must occur AFTER user consents to privacy policy
- Pre-initialization available for Android to support GDPR compliance
- Configurable data collection via `enableSDK()`/`disableSDK()`

### Build System
- Uses `react-native-builder-bob` for multi-format builds
- Outputs: CommonJS (`lib/commonjs/`), ES Modules (`lib/module/`), TypeScript declarations (`lib/typescript/`)
- Platform-specific dependencies managed via Gradle (Android) and CocoaPods (iOS)

### Testing and Development
- No test files currently in repository
- TypeScript configuration via `tsconfig.build.json`
- ESLint and Prettier for code quality
- Release management via `release-it` with conventional changelog

## Common Development Tasks

### Adding New Analytics Methods
1. Add method signature to `src/index.tsx`
2. Implement native method in `QuicktrackingAnalyticsModuleModule.kt` (Android)
3. Implement native method in `QuicktrackingAnalyticsModule.mm` (iOS)
4. Handle platform-specific parameter differences
5. Add TypeScript types if needed

### Debugging Native Code
- **Android**: Use Android Studio with Kotlin debugger
- **iOS**: Use Xcode with Objective-C++ debugger
- Enable SDK logging via `enableLog(true)` for detailed output

### Platform-Specific Feature Implementation
- Check `Platform.OS` for platform-specific behavior
- Use platform-specific method signatures when needed
- Handle parameter ordering differences between platforms
- Ensure thread safety (especially for iOS main thread requirement)

## External Dependencies
- **Android**: `com.lydaas.qtsdk:qt-px-common:1.8.3.PX`
- **iOS**: `QTCommon (~> 1.7.1.PX)`, `UMCommonLog`
- **React Native**: Peer dependency on React Native core

## Documentation Language
- Primary documentation is in Chinese (README.md)
- Code comments and API documentation use English
- Console warnings support both languages