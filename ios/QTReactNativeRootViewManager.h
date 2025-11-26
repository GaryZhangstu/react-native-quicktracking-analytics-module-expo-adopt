//
//  QTReactNativeRootViewManager.h
//  QuicktrackingAnalyticsModule
//
//  Created by 未知 on 2023/1/6.
//  Copyright © 2023 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RCTRootView+QTReactNative.h"
#import "QTReactNativeViewProperty.h"

NS_ASSUME_NONNULL_BEGIN

@interface QTReactNativeRootViewManager : NSObject

#pragma mark - rootView

+ (instancetype)sharedInstance;

/// 缓存 RCTRootView
/// @param rootView rootView
- (void)addRootView:(RCTRootView *)rootView;

/// 获取当前RootView
- (RCTRootView *)currentRootView;

#pragma mark - viewProperties

/// 缓存 RN 页面中的元素信息
/// @param property 元素信息
/// @param rootTag 当前 RN 页面 RCTRootView 对应的 reactTag
- (void)addViewProperty:(QTReactNativeViewProperty *)property withRootTag:(NSNumber *)rootTag;

/// 获取 RN 页面中的元素信息
/// @param rootTag 当前 RN 页面 RCTRootView 对应的 reactTag
- (NSSet<QTReactNativeViewProperty *> *)viewPropertiesWithRootTag:(NSNumber *)rootTag;

@end

NS_ASSUME_NONNULL_END
