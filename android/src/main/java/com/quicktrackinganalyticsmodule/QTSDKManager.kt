package com.quicktrackinganalyticsmodule

import android.util.SparseArray
import android.view.MotionEvent
import android.view.ViewGroup
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.JSTouchDispatcher
import com.facebook.react.uimanager.events.EventDispatcher
import com.quick.qt.analytics.QtTrackAgent
import com.quicktrackinganalyticsmodule.property.QTViewProperties
import com.quicktrackinganalyticsmodule.utils.*
import org.json.JSONObject
import java.lang.reflect.Field
import java.util.WeakHashMap

/**
 * Manager class for handling SDK operations and view tracking.
 */
object QTSDKManager {
    private val jsTouchDispatcherViewGroupWeakHashMap = WeakHashMap<JSTouchDispatcher, ViewGroup>()
    private val viewPropertiesArray = SparseArray<QTViewProperties>()

    /**
     * Handles touch events for view tracking.
     * @param jsTouchDispatcher The JS touch dispatcher
     * @param event The motion event
     * @param eventDispatcher The event dispatcher
     */
    fun handleTouchEvent(
        jsTouchDispatcher: JSTouchDispatcher,
        event: MotionEvent,
        eventDispatcher: EventDispatcher
    ) {
        try {
            if (event.action == MotionEvent.ACTION_DOWN) {
                var viewGroup = jsTouchDispatcherViewGroupWeakHashMap[jsTouchDispatcher]
                if (viewGroup == null) {
                    try {
                        val viewGroupField = jsTouchDispatcher.javaClass.getDeclaredField("mRootViewGroup")
                        viewGroupField.isAccessible = true
                        viewGroup = viewGroupField.get(jsTouchDispatcher) as? ViewGroup
                        viewGroup?.let {
                            jsTouchDispatcherViewGroupWeakHashMap[jsTouchDispatcher] = it
                        }
                    } catch (e: Exception) {
                        QTLog.printStackTrace(e)
                    }
                } else {
                    val nativeTargetView = RNTouchTargetHelper.findTouchTargetView(
                        floatArrayOf(event.x, event.y),
                        viewGroup
                    )
                    val reactTargetView = RNTouchTargetHelper.findClosestReactAncestor(nativeTargetView)
                    RNViewUtils.setOnTouchView(reactTargetView ?: nativeTargetView)
                }
            }
        } catch (e: Exception) {
            // Ignored
        }
    }

    /**
     * Tracks a view click event.
     * @param viewId The ID of the clicked view
     * @param ctx The React application context
     */
    fun trackViewClick(viewId: Int, ctx: ReactApplicationContext) {
        try {
            val clickView = RNViewUtils.getViewByTag(viewId)
            QTLog.t("current clickView === $clickView")
            if (clickView != null) {
                val properties = JSONObject().apply {
                    RNViewUtils.getTitle()?.let { put("title", it) }
                    RNViewUtils.getScreenName()?.let { put("\$screen_name", it) }
                }

                val viewProperties = viewPropertiesArray.get(viewId)
                if (viewProperties?.properties != null && viewProperties.properties.length() > 0) {
                    //TODO: ignore 这个字段名是否需要重构
                    if (viewProperties.properties.optBoolean("ignore", false)) {
                        return
                    }
                    viewProperties.properties.remove("ignore")
                    RNUtils.mergeJSONObject(viewProperties.properties, properties)
                }

                val eventID = RNUtils.MD5(viewId.toString())
                val mergedProperties = RNPropertyManager.mergeProperty(properties, true)
                val map = RNUtils.convertToMap(mergedProperties)
                QtTrackAgent.onEventObject(ctx, eventID, map)
            }
        } catch (e: Exception) {
            QTLog.printStackTrace(e)
        }
    }

    /**
     * Saves view properties for tracking.
     * @param viewTag The tag of the view
     * @param clickable Whether the view is clickable
     * @param viewProperties The properties of the view
     */
    fun saveViewProperties(viewTag: Int, clickable: Boolean, viewProperties: ReadableMap?) {
        QTLog.t("currentView Tag === $viewTag")
        QTLog.t("currentView clickable === $clickable")
        if (clickable) {
            QTLog.t("before invoke viewPropertiesArray")
            viewPropertiesArray.put(viewTag, QTViewProperties(clickable, viewProperties))
        }
    }
}
