package com.quicktrackinganalyticsmodule.utils

import android.util.Log

object QTLog {
    private var debug = false
    private var enableLog = false
    private var disableSDK = false
    private const val CHUNK_SIZE = 4000

    fun d(tag: String, msg: String) {
        if (debug && !disableSDK) {
            info(tag, msg, null)
        }
    }

    fun t(msg: String, vararg args: Any) {
        if (enableLog && !disableSDK) {
            i("===TEST===", msg, *args)
        }
    }

    fun d(tag: String, msg: String, tr: Throwable?) {
        if (debug && !disableSDK) {
            info(tag, msg, tr)
        }
    }

    fun i(tag: String, msg: String) {
        if (enableLog && !disableSDK) {
            info(tag, msg, null)
        }
    }

    fun i(tag: String, tr: Throwable) {
        if (enableLog && !disableSDK) {
            info(tag, "", tr)
        }
    }

    fun i(tag: String, msg: String, tr: Throwable?) {
        if (enableLog && !disableSDK) {
            info(tag, msg, tr)
        }
    }

    fun i(tag: String, msg: String, vararg args: Any) {
        if (enableLog && !disableSDK) {
            info(tag, String.format(msg, *args), null)
        }
    }

    private fun info(tag: String, msg: String?, tr: Throwable?) {
        try {
            if (msg != null && msg.isNotEmpty()) {
                val bytes = msg.toByteArray()
                val length = bytes.size
                if (length <= CHUNK_SIZE) {
                    Log.i(tag, msg, tr)
                } else {
                    var index = 0
                    var lastIndexOfLF = 0
                    //当最后一次剩余值小于 CHUNK_SIZE 时，不需要再截断
                    while (index < length - CHUNK_SIZE) {
                        lastIndexOfLF = lastIndexOfLF(bytes, index)
                        val chunkLength = lastIndexOfLF - index
                        Log.i(tag, String(bytes, index, chunkLength), null)
                        index = if (chunkLength < CHUNK_SIZE) {
                            //跳过换行符
                            lastIndexOfLF + 1
                        } else {
                            lastIndexOfLF
                        }
                    }
                    if (length > index) {
                        Log.i(tag, String(bytes, index, length - index), tr)
                    }
                }
            } else {
                Log.i(tag, null, tr)
            }
        } catch (e: Exception) {
            printStackTrace(e)
        }
    }

    private fun lastIndexOfLF(bytes: ByteArray, fromIndex: Int): Int {
        val index = minOf(fromIndex + CHUNK_SIZE, bytes.size - 1)
        for (i in index downTo index - CHUNK_SIZE) {
            //返回换行符的位置
            if (bytes[i] == 10.toByte()) {
                return i
            }
        }
        return index
    }

    fun printStackTrace(e: Exception) {
        if (enableLog && !disableSDK) {
            Log.e("QuickTracking Exception", "", e)
        }
    }

    fun setDebug(isDebug: Boolean) {
        debug = isDebug
    }

    fun setEnableLog(isEnableLog: Boolean) {
        enableLog = isEnableLog
    }

    fun setDisableSDK(configDisableSDK: Boolean) {
        disableSDK = configDisableSDK
    }

    fun isLogEnabled(): Boolean = enableLog

    fun isDebug(): Boolean = debug
}
