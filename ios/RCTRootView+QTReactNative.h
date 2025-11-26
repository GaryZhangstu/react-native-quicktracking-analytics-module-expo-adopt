//
//  RCTRootView+QTReactNative.h
//  QuicktrackingAnalyticsModule
//
//  Created by 钰昭 on 2023/1/6.
//  Copyright © 2023 Facebook. All rights reserved.
//
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#if __has_include(<React/RCTRootView.h>)
#import <React/RCTRootView.h>
#else
#import "RCTRootView.h"
#endif

NS_ASSUME_NONNULL_BEGIN

@interface RCTRootView (QTReactNative)

@end

NS_ASSUME_NONNULL_END
