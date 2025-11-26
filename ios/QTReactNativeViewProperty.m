//
//  QTReactNativeViewProperty.m
//  QuicktrackingAnalyticsModule
//
//  Created by 钰昭 on 2023/1/6.
//  Copyright © 2023 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "QTReactNativeViewProperty.h"

@implementation QTReactNativeViewProperty

- (nonnull id)copyWithZone:(nullable NSZone *)zone {
    QTReactNativeViewProperty *property = [[[self class] allocWithZone: zone] init];
    property.reactTag = self.reactTag;
    property.clickable = self.clickable;
    property.properties = self.properties;
    return property;
}

- (NSString *)description {
    return [NSString stringWithFormat:@"%@; reactTag: %@; clickable: %@; properties: %@", [super description], self.reactTag, (self.clickable ? @"YES" : @"NO"), self.properties];
}


@end
