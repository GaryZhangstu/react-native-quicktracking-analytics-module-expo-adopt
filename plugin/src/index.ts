import {
  withInfoPlist,
  withAndroidManifest,
  AndroidConfig,
  ConfigPlugin,
} from '@expo/config-plugins';

/**
 * Config plugin for react-native-quicktracking-analytics-module-expo-adopt
 * Injects QuickTracking configuration into AndroidManifest.xml and Info.plist
 */
export interface QuickTrackingPluginProps {
  /**
   * QuickTracking App Key (required)
   */
  appKey: string;
  /**
   * Main tracking domain (required)
   * e.g., https://log.quicktracking.cn
   */
  mainTrackDomain: string;
  /**
   * Optional backup tracking domain
   */
  subTrackDomain?: string;
  /**
   * Channel name for tracking
   * e.g., 'App Store', 'Google Play'
   */
  channel?: string;
  /**
   * Enable debug logging
   * @default false
   */
  enableLog?: boolean;
  /**
   * Custom device ID (optional)
   */
  customDeviceId?: string;
}

const withQuickTracking: ConfigPlugin<QuickTrackingPluginProps> = (
  config,
  props
) => {
  if (!props.appKey) {
    throw new Error('QuickTracking appKey is required!');
  }

  if (!props.mainTrackDomain) {
    throw new Error('QuickTracking mainTrackDomain is required!');
  }

  // Inject into iOS Info.plist
  config = withInfoPlist(config, (config) => {
    config.modResults['QuickTrackingAppKey'] = props.appKey;
    config.modResults['QuickTrackingMainTrackDomain'] = props.mainTrackDomain;
    config.modResults['QuickTrackingChannel'] = props.channel || 'App Store';
    config.modResults['QuickTrackingEnableLog'] = props.enableLog || false;

    if (props.subTrackDomain) {
      config.modResults['QuickTrackingSubTrackDomain'] = props.subTrackDomain;
    }

    if (props.customDeviceId) {
      config.modResults['QuickTrackingCustomDeviceId'] = props.customDeviceId;
    }

    return config;
  });

  // Inject into AndroidManifest.xml
  config = withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults
    );

    // Add meta-data entries
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'com.quicktracking.appKey',
      props.appKey
    );

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'com.quicktracking.mainTrackDomain',
      props.mainTrackDomain
    );

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'com.quicktracking.channel',
      props.channel || 'Google Play'
    );

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'com.quicktracking.enableLog',
      (props.enableLog || false).toString()
    );

    if (props.subTrackDomain) {
      AndroidConfig.Manifest.addMetaDataItemToMainApplication(
        mainApplication,
        'com.quicktracking.subTrackDomain',
        props.subTrackDomain
      );
    }

    if (props.customDeviceId) {
      AndroidConfig.Manifest.addMetaDataItemToMainApplication(
        mainApplication,
        'com.quicktracking.customDeviceId',
        props.customDeviceId
      );
    }

    // Add required permissions
    const permissions = [
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.ACCESS_WIFI_STATE',
      'android.permission.INTERNET',
      'android.permission.READ_PHONE_STATE',
    ];

    // Ensure uses-permission array exists
    if (!config.modResults.manifest['uses-permission']) {
      config.modResults.manifest['uses-permission'] = [];
    }

    for (const permission of permissions) {
      const hasPermission = config.modResults.manifest['uses-permission'].some(
        (p: any) => p.$['android:name'] === permission
      );

      if (!hasPermission) {
        config.modResults.manifest['uses-permission'].push({
          $: {
            'android:name': permission,
          },
        });
      }
    }

    return config;
  });

  // Add Deep Link intent-filter for app wake-up
  config = withAndroidManifest(config, (config) => {
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(
      config.modResults
    );

    // Ensure intent-filter array exists
    if (!mainActivity['intent-filter']) {
      mainActivity['intent-filter'] = [];
    }

    // Add separate intent-filter for deep linking
    // Format: atm.{appKey}
    const scheme = `atm.${props.appKey}`;
    mainActivity['intent-filter'].push({
      action: [
        {
          $: {
            'android:name': 'android.intent.action.VIEW',
          },
        },
      ],
      category: [
        {
          $: {
            'android:name': 'android.intent.category.DEFAULT',
          },
        },
        {
          $: {
            'android:name': 'android.intent.category.BROWSABLE',
          },
        },
      ],
      data: [
        {
          $: {
            'android:scheme': scheme,
          },
        },
      ],
    });

    return config;
  });

  return config;
};

export default withQuickTracking;
