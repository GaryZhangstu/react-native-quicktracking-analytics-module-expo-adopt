package com.quicktrackinganalyticsmodule.utils

import android.app.Activity
import android.view.View
import android.view.ViewGroup
import org.json.JSONObject
import java.lang.ref.WeakReference
import java.util.WeakHashMap
import java.util.concurrent.locks.ReentrantReadWriteLock

/**
 * Utility class for managing React Native view operations and screen tracking.
 */
object RNViewUtils {
    private val lock = ReentrantReadWriteLock()
    private var mWeakCurrentActivityReference: WeakReference<Activity>? = null
    private var currentTitle: String? = null
    private var currentScreenName: String? = null
    var isScreenVisible = false
        private set
    private var screenProperties: JSONObject? = null
    private var onTouchViewReference: WeakReference<View>? = null
    private val mScreenMap = WeakHashMap<Activity, JSONObject>()

    /**
     * Sets the current touch view for tracking.
     * @param nativeTargetView The view that was touched
     */
    fun setOnTouchView(nativeTargetView: View) {
        lock.writeLock().lock()
        try {
            onTouchViewReference = WeakReference(nativeTargetView)
        } finally {
            lock.writeLock().unlock()
        }
    }

    /**
     * Gets the current activity.
     * @return The current activity or null if not available
     */
    fun getCurrentActivity(): Activity? {
        lock.readLock().lock()
        try {
            return mWeakCurrentActivityReference?.get()
        } finally {
            lock.readLock().unlock()
        }
    }

    /**
     * Finds a view by its ID in the view hierarchy.
     * @param viewId The ID of the view to find
     * @param onTouchView The view where the touch occurred
     * @return The found view or null if not found
     */
    private fun getClickView(viewId: Int, onTouchView: View): View? {
        var currentView = onTouchView
        while (currentView.id != viewId) {
            val parent = currentView.parent
            if (parent !is View) {
                return null
            }
            currentView = parent
        }
        return currentView
    }

    /**
     * Recursively searches for a view by its ID in a ViewGroup's children.
     * @param viewId The ID of the view to find
     * @param currentView The ViewGroup to search in
     * @return The found view or null if not found
     */
    private fun getClickViewInChild(viewId: Int, currentView: ViewGroup): View? {
        for (i in 0 until currentView.childCount) {
            val childView = currentView.getChildAt(i) ?: continue
            if (childView.id == viewId) {
                return childView
            }
            if (childView is ViewGroup) {
                getClickViewInChild(viewId, childView)?.let { return it }
            }
        }
        return null
    }

    /**
     * Gets the view that was touched by its tag.
     * @param viewTag The tag of the view to find
     * @return The found view or null if not found
     */
    fun getTouchViewByTag(viewTag: Int): View? {
        lock.readLock().lock()
        try {
            val onTouchView = onTouchViewReference?.get() ?: return null
            var clickView = getClickView(viewTag, onTouchView)
            if (clickView == null && onTouchView is ViewGroup) {
                clickView = getClickViewInChild(viewTag, onTouchView)
            }
            return clickView
        } finally {
            lock.readLock().unlock()
        }
    }

    /**
     * Gets a view by its tag, searching in both the current activity and touch view.
     * @param viewTag The tag of the view to find
     * @return The found view or null if not found
     */
    fun getViewByTag(viewTag: Int): View? {
        return try {
            var clickView: View? = null
            val currentActivity = getCurrentActivity()
            if (currentActivity != null) {
                clickView = currentActivity.findViewById(viewTag)
            }
            clickView ?: getTouchViewByTag(viewTag)
        } catch (e: Exception) {
            QTLog.printStackTrace(e)
            null
        }
    }

    /**
     * Gets the current screen title.
     * @return The current title or null if not set
     */
    fun getTitle(): String? = currentTitle

    /**
     * Gets the current screen name.
     * @return The current screen name or null if not set
     */
    fun getScreenName(): String? = currentScreenName

    /**
     * Sets the current activity and updates screen properties.
     * @param currentActivity The activity to set as current
     */
    private fun setCurrentActivity(currentActivity: Activity) {
        lock.writeLock().lock()
        try {
            clearCurrentActivityReference()
            mWeakCurrentActivityReference = WeakReference(currentActivity)
            val properties = mScreenMap[currentActivity]
            if (properties != null && properties.has("\$screen_name")) {
                saveScreenAndTitle(
                    properties.optString("\$screen_name"),
                    properties.optString("\$title")
                )
            } else {
                currentScreenName = null
                currentTitle = null
                screenProperties = null
            }
        } finally {
            lock.writeLock().unlock()
        }
    }

    /**
     * Saves the current screen name and title.
     * @param screenName The name of the screen
     * @param title The title of the screen
     */
    fun saveScreenAndTitle(screenName: String, title: String) {
        lock.writeLock().lock()
        try {
            currentScreenName = screenName
            currentTitle = title
            try {
                screenProperties = JSONObject().apply {
                    put("\$title", title)
                    put("\$screen_name", screenName)
                    put("isSetRNViewTag", true)
                }
            } catch (e: Exception) {
                QTLog.printStackTrace(e)
            }
            getCurrentActivity()?.let { currentActivity ->
                screenProperties?.let { properties ->
                    mScreenMap[currentActivity] = properties
                }
            }
        } finally {
            lock.writeLock().unlock()
        }
    }

    /**
     * Clears the current activity reference.
     */
    fun clearCurrentActivityReference() {
        lock.writeLock().lock()
        try {
            mWeakCurrentActivityReference?.clear()
            mWeakCurrentActivityReference = null
        } finally {
            lock.writeLock().unlock()
        }
    }

    /**
     * Sets the screen visibility.
     * @param isVisiable Whether the screen is visible
     */
    fun setScreenVisiable(isVisiable: Boolean) {
        lock.writeLock().lock()
        try {
            this.isScreenVisible = isVisiable
        } finally {
            lock.writeLock().unlock()
        }
    }

    /**
     * Called when an activity is resumed.
     * @param currentActivity The activity that was resumed
     */
    fun onActivityResumed(currentActivity: Activity) {
        setScreenVisiable(true)
        setCurrentActivity(currentActivity)
    }

    /**
     * Called when an activity is paused.
     */
    fun onActivityPaused() {
        setScreenVisiable(false)
    }
}
