package com.quicktrackinganalyticsmodule.utils

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableNativeMap
import com.facebook.react.bridge.WritableMap
import org.json.JSONArray
import org.json.JSONObject
import java.security.MessageDigest

object RNUtils {
    const val TAG = "QuickTracking == "

    /**
     * ReadableMap 转换成 JSONObject
     */
    fun convertToJSONObject(params: ReadableMap?): JSONObject? {
        if (params == null) {
            return null
        }
        var json: JSONObject? = null
        var nativeMap: ReadableNativeMap? = null
        try {
            nativeMap = params as ReadableNativeMap
            json = JSONObject(params.toString()).getJSONObject("NativeMap")
        } catch (e: Exception) {
            Log.e(TAG, "JSON 解析失败！", e)
            val superName = nativeMap?.javaClass?.superclass?.simpleName
            try {
                json = JSONObject(params.toString()).getJSONObject(superName!!)
            } catch (e1: Exception) {
                Log.e(TAG, "JSON 解析失败！", e1)
            }
        }
        return json
    }

    /**
     * JSONObject 转换成 WritableMap
     */
    fun convertToWritableMap(json: JSONObject?): WritableMap? {
        if (json == null || json.length() == 0) {
            return null
        }
        val writableMap = Arguments.createMap()
        val it = json.keys()
        while (it.hasNext()) {
            try {
                val key = it.next()
                writableMap.putString(key, json.optString(key))
            } catch (e: Exception) {
                QTLog.i(TAG, "JSON to WritableMap 解析失败！", e as Any)
            }
        }
        return writableMap
    }

    /**
     * ReadableMap 转换成 HashMap
     */
    fun convertToHashMap(params: ReadableMap?): HashMap<String, Any?>? {
        if (params == null) {
            return null
        }
        var map: HashMap<String, Any?>? = null
        try {
            map = (params as ReadableNativeMap).toHashMap()
        } catch (e: Exception) {
            Log.e(TAG, "ReadableMap to HashMap 解析失败！", e)
        }
        return map
    }

    /**
     * merge JSONObject
     */
    fun mergeJSONObject(source: JSONObject, dest: JSONObject) {
        try {
            val sourceIterator = source.keys()
            while (sourceIterator.hasNext()) {
                val key = sourceIterator.next()
                val value = source.get(key)
                dest.put(key, value)
            }
        } catch (e: Exception) {
            Log.e(TAG, "JSONObject Merge失败！", e)
        }
    }

    fun convertToMap(jsonObject: JSONObject): Map<String, Any>? {
        return try {
            val map = HashMap<String, Any>()
            val keys = jsonObject.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                val value = jsonObject.get(key)
                map[key] = when (value) {
                    is JSONArray -> toList(value)
                    is JSONObject -> toMap(value)
                    else -> value
                } ?: continue
            }
            map
        } catch (e: Exception) {
            QTLog.printStackTrace(e)
            null
        }
    }

    fun toList(jsonArray: JSONArray): List<Any>? {
        return try {
            val list = ArrayList<Any>()
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.get(i)
                val processedObj = when (obj) {
                    is JSONArray -> toList(obj)
                    is JSONObject -> toMap(obj)
                    else -> obj
                } ?: continue
                list.add(processedObj)
            }
            list
        } catch (e: Exception) {
            QTLog.printStackTrace(e)
            null
        }
    }

    fun toMap(jsonObject: JSONObject): Map<String, Any>? {
        return try {
            val map = HashMap<String, Any>()
            val keysItr = jsonObject.keys()
            while (keysItr.hasNext()) {
                val key = keysItr.next()
                val value = jsonObject.get(key)
                map[key] = when (value) {
                    is JSONArray -> toList(value)
                    is JSONObject -> toMap(value)
                    else -> value
                } ?: continue
            }
            map
        } catch (e: Exception) {
            QTLog.printStackTrace(e)
            null
        }
    }

    fun MD5(str: String?): String? {
        if (str == null) return null
        return try {
            val defaultBytes = str.toByteArray()
            val algorithm = MessageDigest.getInstance("MD5")
            algorithm.reset()
            algorithm.update(defaultBytes)
            val messageDigest = algorithm.digest()
            val hexString = StringBuilder()
            for (b in messageDigest) {
                hexString.append(String.format("%02X", b))
            }
            hexString.toString()
        } catch (e: Exception) {
            str.replace(Regex("[^a-zA-Z0-9._]"), "")
        } catch (e: Throwable) {
            Log.e(TAG, "MD5 e is $e")
            null
        }
    }
}
