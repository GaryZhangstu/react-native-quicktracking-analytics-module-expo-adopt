package com.quicktrackinganalyticsmodule.utils

import org.json.JSONObject
import java.util.concurrent.CopyOnWriteArrayList

object RNPropertyManager {
    private val interceptors = CopyOnWriteArrayList<Interceptor>()

    @Synchronized
    fun addInterceptor(interceptor: Interceptor) {
        interceptors.add(interceptor)
    }

    fun mergeProperty(properties: JSONObject?): JSONObject {
        return mergeProperty(properties ?: JSONObject(), false)
    }

    fun mergeProperty(properties: JSONObject, isAuto: Boolean): JSONObject {
        var result = properties
        try {
            for (interceptor in interceptors) {
                result = interceptor.proceed(result, isAuto)
            }
        } catch (e: Exception) {
            QTLog.printStackTrace(e)
            // 如果处理过程中出现异常，返回原始properties
            return properties
        }
        return result
    }

    interface Interceptor {
        fun proceed(properties: JSONObject, isAuto: Boolean): JSONObject
    }
}
