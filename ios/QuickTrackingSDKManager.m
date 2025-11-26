//
//  QuickTrackingSDKManager.m
//  QuicktrackingAnalyticsModule
//
//  Created by 钰昭 on 2023/1/6.
//  Copyright © 2023 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <QTCommon/MobClick.h>
#import "QuickTrackingSDKManager.h"
#import "QTReactNativeRootViewManager.h"
#import "QTRNUtils.h"
#import <React/RCTUIManager.h>

#pragma mark - Constants
NSString *const kQTEventElementContentProperty = @"$element_content";

@interface QuickTrackingSDKManager()

@property (nonatomic, strong) NSSet *reactNativeIgnoreClasses;

@end

@implementation QuickTrackingSDKManager

+ (instancetype) sharedInstance {
    static QuickTrackingSDKManager *manager;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        manager = [[QuickTrackingSDKManager alloc] init];
    });
    return manager;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _reactNativeIgnoreClasses = [NSSet setWithObjects:@"RCTScrollView", @"RCTBaseTextInputView", nil];
    }
    return self;
}

- (QTReactNativeViewProperty *)viewPropertyWithReactTag:(NSNumber *)reactTag fromViewProperties:(NSSet <QTReactNativeViewProperty *>*)properties {
    if (!properties || ![reactTag isKindOfClass:[NSNumber class]]) {
        return nil;
    }

    NSSet *tempProperties = [[NSSet alloc] initWithSet:properties copyItems:YES];
    for(QTReactNativeViewProperty *property in tempProperties) {
        if ([property isKindOfClass:[QTReactNativeViewProperty class]] &&
            [property.reactTag isKindOfClass:[NSNumber class]] &&
            property.reactTag.integerValue == reactTag.integerValue) {
            return property;
        }
    }
    return nil;
}


- (void)prepareView:(NSNumber *)reactTag clickable:(BOOL)clickable paramters:(NSDictionary *)paramters {
    dispatch_async(dispatch_get_main_queue(), ^{
        RCTRootView *rootView = [[QTReactNativeRootViewManager sharedInstance] currentRootView];
        [self prepareView:reactTag clickable:clickable paramters:paramters rootTag:rootView.reactTag];
    });
}

- (void)prepareView:(NSNumber *)reactTag clickable:(BOOL)clickable paramters:(NSDictionary *)paramters rootTag:(NSNumber *)rootTag {
    if (!clickable || !reactTag) {
        return;
    }
    QTReactNativeViewProperty *viewProperty = [[QTReactNativeViewProperty alloc] init];
    viewProperty.reactTag = reactTag;
    viewProperty.clickable = clickable;
    viewProperty.properties = paramters;
    [[QTReactNativeRootViewManager sharedInstance] addViewProperty:viewProperty withRootTag:rootTag];
}

- (BOOL)clickableForView:(UIView*)view {
    if (!view) {
        return NO;
    }
    for (NSString *className in _reactNativeIgnoreClasses) {
        if ([view isKindOfClass:NSClassFromString(className)]) {
            return NO;
        }
    }

    QTReactNativeRootViewManager *rootViewManager = [QTReactNativeRootViewManager sharedInstance];
    RCTRootView *rootView = [rootViewManager currentRootView];
    NSSet<QTReactNativeViewProperty *> *viewProperties = [rootViewManager viewPropertiesWithRootTag:rootView.reactTag];


    // 兼容 Native 可视化全埋点 UISegmentedControl 整体不可圈选的场景
    if  ([view isKindOfClass:NSClassFromString(@"UISegmentedControl")]) {
        return NO;
    }

    // UISegmentedControl 只有子视图 UISegment 是可点击的
    if ([view isKindOfClass:NSClassFromString(@"UISegment")]) {
        return [self viewPropertyWithReactTag:view.superview.reactTag fromViewProperties:viewProperties].clickable;
    }

    return [self viewPropertyWithReactTag:view.reactTag fromViewProperties:viewProperties].clickable;
}

#pragma mark - AppClick
- (void)trackViewClick:(NSNumber *)reactTag {
  dispatch_async(dispatch_get_main_queue(), ^{
    QTReactNativeRootViewManager *rootViewManager = [QTReactNativeRootViewManager sharedInstance];
    RCTRootView *rootView = [rootViewManager currentRootView];
    NSSet *viewProperties = [rootViewManager viewPropertiesWithRootTag:rootView.reactTag];

    QTReactNativeViewProperty *viewProperty = [self viewPropertyWithReactTag:reactTag fromViewProperties:viewProperties];
    id ignoreParam = viewProperty.properties[@"ignore"];
    if ([ignoreParam respondsToSelector:@selector(boolValue)] && [ignoreParam boolValue]) {
        return;
    }

    UIView *view = [rootView.bridge.uiManager viewForReactTag:reactTag];
    for (NSString *className in self.reactNativeIgnoreClasses) {
      if ([view isKindOfClass:NSClassFromString(className)]) {
        return;
      }
    }
    NSMutableDictionary *properties = [NSMutableDictionary dictionary];
    NSString *content = [view.accessibilityLabel stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
    properties[kQTEventElementContentProperty] = content;
    properties[@"is_auto"] = @1;
    [properties addEntriesFromDictionary:viewProperty.properties];
    NSLog(@"properties ====  %@", properties);
    NSLog(@"rootTag ==== %@", rootView.reactTag);
    NSLog(@"viewTag ==== %@", reactTag);
    NSString* eventId = [NSString stringWithFormat:@"%@_%@", rootView.reactTag, reactTag];
    NSString* md5EventId = [QTRNUtils md5:eventId];
    [QTMobClick event:md5EventId attributes:properties];
  });
}

@end
