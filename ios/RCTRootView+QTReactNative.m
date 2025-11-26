//
//  RCTRootView+QTReactNative.m
//  QuicktrackingAnalyticsModule
//
//  Created by 钰昭 on 2023/1/6.
//  Copyright © 2023 Facebook. All rights reserved.
//

#import <objc/runtime.h>
#import "RCTRootView+QTReactNative.h"
#import "NSObject+QTReactNativeSwizzler.h"
#import "QTReactNativeRootViewManager.h"

@implementation RCTRootView (QTReactNative)

+ (void)load {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        // React Native 0.66.0 及以后版本的 RCTRootView 指定构造器方法
        SEL originalSEL = NSSelectorFromString(@"initWithFrame:bridge:moduleName:initialProperties:");
        SEL swizzleSEL = @selector(qt_reactnative_initWithFrame:bridge:moduleName:initialProperties:);

        if (![RCTRootView instancesRespondToSelector:originalSEL]) {
            // React Native 0.66.0 以前版本的 RCTRootView 指定构造器方法
            originalSEL = @selector(initWithBridge:moduleName:initialProperties:);
            swizzleSEL = @selector(qt_reactnative_initWithBridge:moduleName:initialProperties:);
        }

        [RCTRootView qt_reactnative_swizzle:originalSEL withSelector:swizzleSEL];
    });
}

- (instancetype)qt_reactnative_initWithBridge:(RCTBridge *)bridge
                                   moduleName:(NSString *)moduleName
                            initialProperties:(NSDictionary *)initialProperties {
    RCTRootView *rootView = [self qt_reactnative_initWithBridge:bridge
                                                     moduleName:moduleName
                                              initialProperties:initialProperties];
    [[QTReactNativeRootViewManager sharedInstance] addRootView:rootView];
    return rootView;
}


- (instancetype)qt_reactnative_initWithFrame:(CGRect)frame
                                     bridge:(RCTBridge *)bridge
                                 moduleName:(NSString *)moduleName
                          initialProperties:(nullable NSDictionary *)initialProperties {
    RCTRootView *rootView = [self qt_reactnative_initWithFrame:frame
                                                        bridge:bridge
                                                    moduleName:moduleName
                                             initialProperties:initialProperties];
    [[QTReactNativeRootViewManager sharedInstance] addRootView:rootView];
    return rootView;
}

@end
