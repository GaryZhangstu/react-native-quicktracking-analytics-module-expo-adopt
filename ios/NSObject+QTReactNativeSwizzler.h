//
//  NSObject+QTReactNativeSwizzler.h
//  QuicktrackingAnalyticsModule
//
//  Created by 钰昭 on 2023/1/6.
//  Copyright © 2023 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface NSObject (QTReactNativeSwizzler)

+ (BOOL)qt_reactnative_swizzle:(SEL)originSelector withSelector:(SEL)destinationSelector;

@end

NS_ASSUME_NONNULL_END
