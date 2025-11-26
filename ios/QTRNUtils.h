//
//  QTRNUtils.h
//  QuicktrackingAnalyticsModule
//
//  Created by 钰昭 on 2023/1/11.
//  Copyright © 2023 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface QTRNUtils : NSObject

#pragma mark - string tools
+ (NSString *)md5:(NSString *)string;
+ (BOOL)notEmptyString:(NSString *)string;

@end

NS_ASSUME_NONNULL_END
