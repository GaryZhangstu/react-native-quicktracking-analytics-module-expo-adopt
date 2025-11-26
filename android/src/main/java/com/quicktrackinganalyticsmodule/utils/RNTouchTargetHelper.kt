package com.quicktrackinganalyticsmodule.utils

import android.annotation.SuppressLint
import android.graphics.Matrix
import android.graphics.PointF
import android.graphics.Rect
import android.view.View
import android.view.ViewGroup
import com.facebook.react.bridge.JSApplicationIllegalArgumentException
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.touch.ReactHitSlopView
import com.facebook.react.uimanager.PointerEvents
import com.facebook.react.uimanager.ReactCompoundView
import com.facebook.react.uimanager.ReactCompoundViewGroup
import com.facebook.react.uimanager.ReactPointerEventsView

object RNTouchTargetHelper {
    private val mEventCoords = FloatArray(2)
    private val mInverseMatrix = Matrix()
    private val mMatrixTransformCoords = FloatArray(2)
    private val mTempPoint = PointF()

    fun findTargetTagForTouch(eventX: Float, eventY: Float, viewGroup: ViewGroup): Int {
        return findTargetTagAndCoordinatesForTouch(eventX, eventY, viewGroup, mEventCoords)
    }

    fun findTargetTagAndCoordinatesForTouch(
        eventX: Float,
        eventY: Float,
        viewGroup: ViewGroup,
        viewCoords: FloatArray
    ): Int {
        UiThreadUtil.assertOnUiThread()
        val targetTag = viewGroup.id
        viewCoords[0] = eventX
        viewCoords[1] = eventY
        val nativeTargetView = findTouchTargetView(viewCoords, viewGroup)
        val reactTargetView = findClosestReactAncestor(nativeTargetView)
        return if (reactTargetView != null) {
            getTouchTargetForView(reactTargetView, viewCoords[0], viewCoords[1])
        } else {
            targetTag
        }
    }

    @SuppressLint("ResourceType")
    fun findClosestReactAncestor(view: View?): View? {
        var currentView = view
        while (currentView != null && currentView.id <= 0) {
            currentView = currentView.parent as? View
        }
        return currentView
    }

    fun findTouchTargetView(eventCoords: FloatArray, viewGroup: ViewGroup): View {
        for (i in viewGroup.childCount - 1 downTo 0) {
            val child = viewGroup.getChildAt(i)
            val childPoint = mTempPoint
            if (isTransformedTouchPointInView(eventCoords[0], eventCoords[1], viewGroup, child, childPoint)) {
                val restoreX = eventCoords[0]
                val restoreY = eventCoords[1]
                eventCoords[0] = childPoint.x
                eventCoords[1] = childPoint.y
                val targetView = findTouchTargetViewWithPointerEvents(eventCoords, child)
                if (targetView != null) {
                    return targetView
                }
                eventCoords[0] = restoreX
                eventCoords[1] = restoreY
            }
        }
        return viewGroup
    }

    private fun isTransformedTouchPointInView(
        x: Float,
        y: Float,
        parent: ViewGroup,
        child: View,
        outLocalPoint: PointF
    ): Boolean {
        var localX = (parent.scrollX + x) - child.left
        var localY = (parent.scrollY + y) - child.top
        val matrix = child.matrix
        if (!matrix.isIdentity) {
            val localXY = mMatrixTransformCoords
            localXY[0] = localX
            localXY[1] = localY
            val inverseMatrix = mInverseMatrix
            matrix.invert(inverseMatrix)
            inverseMatrix.mapPoints(localXY)
            localX = localXY[0]
            localY = localXY[1]
        }

        return when {
            child is ReactHitSlopView && child.hitSlopRect != null -> {
                val hitSlopRect = child.hitSlopRect
                if (localX < -hitSlopRect!!.left ||
                    localX >= (child.right - child.left + hitSlopRect.right) ||
                    localY < -hitSlopRect.top ||
                    localY >= (child.bottom - child.top + hitSlopRect.bottom)) {
                    false
                } else {
                    outLocalPoint.set(localX, localY)
                    true
                }
            }
            localX < 0f || localX >= (child.right - child.left) ||
            localY < 0f || localY >= (child.bottom - child.top) -> false
            else -> {
                outLocalPoint.set(localX, localY)
                true
            }
        }
    }

    private fun findTouchTargetViewWithPointerEvents(eventCoords: FloatArray, view: View): View? {
        val pointerEvents = if (view is ReactPointerEventsView) {
            view.pointerEvents
        } else {
            PointerEvents.AUTO
        }

        return when (pointerEvents) {
            PointerEvents.NONE -> null
            PointerEvents.BOX_ONLY -> view
            PointerEvents.BOX_NONE -> {
                if (view is ViewGroup) {
                    val targetView = findTouchTargetView(eventCoords, view)
                    if (targetView != view) {
                        return targetView
                    }
                    if (view !is ReactCompoundView ||
                        view.reactTagForTouch(eventCoords[0], eventCoords[1]) == view.id) {
                        return null
                    }
                    return view
                }
                null
            }
            PointerEvents.AUTO -> {
                if ((view !is ReactCompoundViewGroup ||
                    !view.interceptsTouchEvent(eventCoords[0], eventCoords[1])) &&
                    view is ViewGroup) {
                    findTouchTargetView(eventCoords, view)
                } else {
                    view
                }
            }
            else -> throw JSApplicationIllegalArgumentException("Unknown pointer event type: $pointerEvents")
        }
    }

    fun getTouchTargetForView(targetView: View, eventX: Float, eventY: Float): Int {
        return if (targetView is ReactCompoundView) {
            targetView.reactTagForTouch(eventX, eventY)
        } else {
            targetView.id
        }
    }
}
