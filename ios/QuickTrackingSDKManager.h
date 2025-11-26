//
//  QuickTrackingSDKManager.h
//  QuicktrackingAnalyticsModule
//
//  Created by 钰昭 on 2023/1/6.
//  Copyright © 2023 Facebook. All rights reserved.
//


#ifndef QuickTrackingSDKManager_h
#define QuickTrackingSDKManager_h

@interface QuickTrackingSDKManager : NSObject

+ (instancetype)sharedInstance;

- (void)prepareView:(NSNumber *)reactTag clickable:(BOOL)clickable paramters:(NSDictionary *)paramters;

- (void)prepareView:(NSNumber *)reactTag clickable:(BOOL)clickable paramters:(NSDictionary *)paramters rootTag:(NSNumber *)rootTag;

- (void)trackViewClick:(NSNumber *)reactTag;

@end

#endif /* QuickTrackingSDKManager_h */
