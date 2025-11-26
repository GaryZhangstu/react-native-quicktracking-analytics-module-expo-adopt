package com.quicktrackinganalyticsmodule.property

import android.content.Context
import android.util.Log
import android.view.View
import android.widget.ScrollView
import com.facebook.react.bridge.ReadableMap
import com.quicktrackinganalyticsmodule.utils.RNUtils
import org.json.JSONObject
import java.util.concurrent.atomic.AtomicInteger

/**
 * Class for managing view properties in React Native tracking.
 * @property clickable Whether the view is clickable
 * @property properties JSON properties associated with the view
 */
class QTViewProperties(
    private val clickable: Boolean,
    params: ReadableMap?
) {
    companion object {
        const val TAG = "QuickTracking == "
        private const val VIEW_TAG_KEY_NAME = "qt_rn_tag_view_rn_key"
        private val viewTagKey = AtomicInteger(0)
        private val viewTagKeyCache = mutableMapOf<String, Int>()

        /**
         * Gets the view tag key for the given context.
         * @param context The context to get the resource ID from
         * @return The resource ID for the view tag key
         */
        private fun getViewTagKey(context: Context): Int {
            val packageName = context.packageName
            return viewTagKeyCache.getOrPut(packageName) {
                context.resources.getIdentifier(
                    VIEW_TAG_KEY_NAME,
                    "id",
                    packageName
                )
            }
        }
    }

    val properties: JSONObject? = RNUtils.convertToJSONObject(params)

    /**
     * Sets the clickable property of the view.
     * @param view The view to set clickable property
     */
    fun setViewClickable(view: View?) {
        try {
            if (view != null && view !is ScrollView) {
                view.isClickable = clickable
            }
        } catch (e: Exception) {
            Log.e(TAG, "设置viewClickable失败: ${e.message}")
        }
    }

    /**
     * Sets the view tag for tracking.
     * @param view The view to set tag
     */
    fun setViewTag(view: View?) {
        try {
            if (view == null) return

            if (viewTagKey.get() == 0) {
                val context = view.context
                viewTagKey.set(context.resources.getIdentifier(
                  "qt_rn_tag_view_rn_key",
                  "id",
                  context.packageName
                ));
            }

            if (viewTagKey.get() != 0) {
                view.setTag(viewTagKey.get(), true)
            }
        } catch (e: Exception) {
            Log.e(TAG, "设置viewTag失败: ${e.message}")
        }
    }
}
