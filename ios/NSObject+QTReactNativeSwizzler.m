//
//  NSObject+QTReactNativeSwizzler.m
//  QuicktrackingAnalyticsModule
//
//  Created by 钰昭 on 2023/1/6.
//  Copyright © 2023 Facebook. All rights reserved.
//

#import "NSObject+QTReactNativeSwizzler.h"
#import <objc/runtime.h>

@implementation NSObject (QTReactNativeSwizzler)

+ (BOOL)qt_reactnative_swizzle:(SEL)originSelector withSelector:(SEL)destinationSelector {
    Method origMethod = class_getInstanceMethod(self, originSelector);
    if (!origMethod) {
        return NO;
    }

    Method altMethod = class_getInstanceMethod(self, destinationSelector);
    if (!altMethod) {
        return NO;
    }

    class_addMethod(self,
                    originSelector,
                    class_getMethodImplementation(self, originSelector),
                    method_getTypeEncoding(origMethod));
    class_addMethod(self,
                    destinationSelector,
                    class_getMethodImplementation(self, destinationSelector),
                    method_getTypeEncoding(altMethod));

    method_exchangeImplementations(class_getInstanceMethod(self, originSelector), class_getInstanceMethod(self, destinationSelector));
    return YES;
}

@end
