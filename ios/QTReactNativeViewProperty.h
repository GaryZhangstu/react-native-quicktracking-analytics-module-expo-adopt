//
//  QTReactNativeViewProperty.h
//  QuicktrackingAnalyticsModule
//
//  Created by 钰昭 on 2023/1/6.
//  Copyright © 2023 Facebook. All rights reserved.
//


#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>


NS_ASSUME_NONNULL_BEGIN

#pragma mark - View Property
@interface QTReactNativeViewProperty : NSObject <NSCopying>

/// View 唯一标识符
@property (nonatomic, strong) NSNumber *reactTag;
/// View 可点击状态
@property (nonatomic, assign) BOOL clickable;
/// View 自定义属性
@property (nonatomic, copy) NSDictionary *properties;

@end

NS_ASSUME_NONNULL_END
