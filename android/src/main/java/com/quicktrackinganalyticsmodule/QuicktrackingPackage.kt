package com.quicktrackinganalyticsmodule

import android.content.Context
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

/**
 * Expo Package for QuickTracking Analytics Module
 * Registers lifecycle listeners and other native components
 */
class QuicktrackingPackage : Package {

  override fun createReactActivityLifecycleListeners(activityContext: Context): List<ReactActivityLifecycleListener> {
    return listOf(QuicktrackingLifecycleListener())
  }

  // You can also add Application lifecycle listeners if needed
  // override fun createApplicationLifecycleListeners(context: Context): List<expo.modules.core.interfaces.ApplicationLifecycleListener> {
  //   return listOf(QuicktrackingApplicationLifecycleListener())
  // }
}
