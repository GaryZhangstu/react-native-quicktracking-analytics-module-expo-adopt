//
//  QTRNUtils.m
//  QuicktrackingAnalyticsModule
//
//  Created by 钰昭 on 2023/1/11.
//  Copyright © 2023 Facebook. All rights reserved.
//

#import "QTRNUtils.h"
#import <CommonCrypto/CommonDigest.h>

@implementation QTRNUtils

#pragma mark - string tools

+ (BOOL)notEmptyString:(NSString *)string
{
    BOOL bRet = YES;
    if ((string == nil) ||
        (string == NULL) ||
        ([string isKindOfClass:[NSNull class]]) ||
        (![string isKindOfClass:[NSString class]]) ||
        (([string isKindOfClass:[NSString class]])&&([[string stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]] length] == 0)))
    {
        bRet = NO;
    }
    return bRet;
}

+ (NSString *)md5:(NSString *)string
{
    if ([QTRNUtils notEmptyString:string]) {
        const char *cStr = [string UTF8String];
        unsigned char result[16];
        CC_MD5(cStr, (CC_LONG)strlen(cStr), result);
        return [NSString stringWithFormat:
                   @"%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X",
                   result[0], result[1], result[2], result[3],
                   result[4], result[5], result[6], result[7],
                   result[8], result[9], result[10], result[11],
                   result[12], result[13], result[14], result[15]
                   ];
    }
    return @"";
   
}

@end
