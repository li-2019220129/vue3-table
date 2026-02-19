<template>
    <div ref="assistantRef" class="assistant-container" :class="{
        'is-floating': isFloating && !isFullscreen,
        'is-fullscreen': isFullscreen,
        'is-free-mode': isFreeMode && isFloating && !isFullscreen
    }" :style="containerStyle">

        <div class="assistant-header">
            <div class="drag-handle">
                <span class="icon">🤖</span>
                <span class="title">智能助手</span>
            </div>

            <div class="header-controls">
                <button @click="isFreeMode = !isFreeMode" class="ctrl-btn mode-toggle" :class="{ active: isFreeMode }">
                    {{ isFreeMode ? '🔓 自由' : '🔒 锁定' }}
                </button>

                <button @click="toggleFloating" class="ctrl-btn">
                    {{ isFloating ? '📌 固定' : '☁️ 悬浮' }}
                </button>

                <button @click="toggleFullscreen" class="ctrl-btn primary">
                    <span v-if="isFullscreen">收起 ➔</span>
                    <span v-else>⛶ 全屏</span>
                </button>
            </div>
        </div>

        <div class="assistant-body">
            <div class="mode-info">
                <p v-if="isFullscreen">全屏模式：拖动手柄向下或向右可退出并复原</p>
                <p v-else-if="!isFloating"><b>右侧固定模式</b>：拖动手柄即可进入悬浮模式</p>
                <p v-else><b>悬浮模式</b>：拖动到右边缘自动吸附并复原</p>
            </div>
        </div>

        <template v-if="!isFullscreen">
            <div class="resize-bar left"></div>
            <div class="resize-bar right"></div>
            <div v-if="isFreeMode" class="resize-bar bottom"></div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import interact from 'interactjs'

// --- 配置常量 ---
const DEFAULT_WIDTH = 480
const MIN_WIDTH = 400
const MIN_HEIGHT = 300
const NAV_BAR_HEIGHT = 80
const SNAP_THRESHOLD = 60    // 右侧吸附阈值
const FULLSCREEN_THRESHOLD = 60 // 左侧全屏阈值

const assistantRef = ref<HTMLElement | null>(null)
const isFloating = ref(false)
const isFullscreen = ref(false)
const isFreeMode = ref(false)

const pos = ref({
    x: 0,
    y: NAV_BAR_HEIGHT,
    w: DEFAULT_WIDTH,
    h: window.innerHeight - NAV_BAR_HEIGHT
})

/**
 * 重置函数：将所有状态、尺寸、位置回归到初始固定状态
 */
const resetToSidebar = () => {
    isFloating.value = false
    isFreeMode.value = false
    isFullscreen.value = false
    pos.value.w = DEFAULT_WIDTH
    pos.value.h = window.innerHeight - NAV_BAR_HEIGHT
    pos.value.x = window.innerWidth - DEFAULT_WIDTH
    pos.value.y = NAV_BAR_HEIGHT
}

// 动态样式计算
const containerStyle = computed(() => {
    if (isFullscreen.value) {
        return {
            width: '100vw',
            height: `calc(100vh - ${NAV_BAR_HEIGHT}px)`,
            transform: `translate(0px, ${NAV_BAR_HEIGHT}px)`,
            zIndex: 10000,
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            borderRadius: '0px'
        }
    }

    return {
        width: `${pos.value.w}px`,
        // 非自由模式下高度强制填满下方空间
        height: isFreeMode.value && isFloating.value
            ? `${pos.value.h}px`
            : `calc(100vh - ${NAV_BAR_HEIGHT}px)`,
        transform: `translate(${pos.value.x}px, ${pos.value.y}px)`,
        zIndex: 9999,
        transition: 'none',
        borderRadius: isFloating.value ? '12px' : '0px'
    }
})

const toggleFullscreen = () => {
    if (isFullscreen.value) resetToSidebar()
    else isFullscreen.value = true
}

const toggleFloating = () => {
    if (isFullscreen.value) isFullscreen.value = false
    isFloating.value = !isFloating.value
    if (!isFloating.value) resetToSidebar()
}

onMounted(() => {
    const el = assistantRef.value
    if (!el) return

    pos.value.x = window.innerWidth - pos.value.w
    const instance = interact(el)

    instance.draggable({
        allowFrom: '.assistant-header',
        listeners: {
            start() {
                // ✅ 关键：开始拖动的一瞬间，不管之前是什么模式，直接转为悬浮
                isFloating.value = true
                // 确保拖动开始时没有动画干扰
                el.style.transition = 'none'
            },
            move(event) {
                // 如果是从全屏拖离
                if (isFullscreen.value) {
                    isFullscreen.value = false
                    isFloating.value = true
                    pos.value.w = DEFAULT_WIDTH
                    // 将中心点对准鼠标
                    pos.value.x = event.clientX - pos.value.w / 2
                    pos.value.y = event.clientY - 25
                }

                // 更新坐标增量
                pos.value.x += event.dx
                if (isFreeMode.value) {
                    pos.value.y += event.dy
                } else {
                    // 非自由模式拖动时，依然保持 Y 轴锁定在导航栏下，只允许 X 轴位移
                    pos.value.y = NAV_BAR_HEIGHT
                }

                // 边界限制
                const maxX = window.innerWidth - pos.value.w
                const currentH = (isFreeMode.value && isFloating.value) ? pos.value.h : (window.innerHeight - NAV_BAR_HEIGHT)
                const maxY = window.innerHeight - currentH

                pos.value.x = Math.max(-10, Math.min(pos.value.x, maxX + 10))
                if (isFreeMode.value) {
                    pos.value.y = Math.max(0, Math.min(pos.value.y, maxY))
                }
            },
            end() {
                const distToRight = window.innerWidth - (pos.value.x + pos.value.w)
                const distToLeft = pos.value.x

                // 开启吸附过渡动画
                el.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'

                // 逻辑判定
                if (distToLeft <= FULLSCREEN_THRESHOLD) {
                    // 1. 拖到最左侧 -> 全屏
                    isFullscreen.value = true
                    isFloating.value = false
                }
                else if (distToRight <= SNAP_THRESHOLD) {
                    // 2. 拖到最右侧 -> 复原固定模式（尺寸、位置、状态全部初始化）
                    resetToSidebar()
                }
                else {
                    // 3. 留在中间 -> 保持悬浮
                    isFloating.value = true
                }

                setTimeout(() => {
                    if (el) el.style.transition = 'none'
                }, 400)
            }
        }
    })

    // 缩放逻辑
    instance.resizable({
        edges: { left: true, right: true, bottom: true },
        listeners: {
            move(event) {
                if (isFullscreen.value) return
                let { x, w } = pos.value
                const originalRight = x + w
                w = Math.max(MIN_WIDTH, Math.min(event.rect.width, window.innerWidth))

                if (event.edges.left) {
                    x = originalRight - w
                    if (x < 0) { x = 0; w = originalRight }
                }

                pos.value.w = w
                pos.value.x = x

                if (isFreeMode.value) {
                    pos.value.h = Math.max(MIN_HEIGHT, event.rect.height)
                }
            }
        }
    })
})

onBeforeUnmount(() => {
    if (assistantRef.value) interact(assistantRef.value).unset()
})
</script>

<style scoped>
.assistant-container {
    position: fixed;
    top: 0;
    left: 0;
    background: #fff;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    touch-action: none;
    border-left: 1px solid #e5e7eb;
    overflow: hidden;
    z-index: 9998;
}

/* 悬浮态样式：增加明显的阴影和圆角反馈 */
.is-floating {
    border: 1px solid #d1d5db;
    box-shadow: 0 15px 45px rgba(0, 0, 0, 0.2);
    z-index: 10001 !important;
}

.is-free-mode {
    border-radius: 12px;
}

.is-fullscreen {
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
}

.assistant-header {
    height: 52px;
    padding: 0 16px;
    background: #fff;
    border-bottom: 1px solid #f3f4f6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: grab;
    user-select: none;
}

.assistant-header:active {
    cursor: grabbing;
}

.header-controls {
    display: flex;
    gap: 8px;
}

.ctrl-btn {
    padding: 4px 10px;
    border: 1px solid #e5e7eb;
    background: #fff;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.ctrl-btn:hover {
    background: #f9fafb;
}

.mode-toggle.active {
    background: #fff7ed;
    border-color: #fb923c;
    color: #ea580c;
}

.ctrl-btn.primary {
    background: #2563eb;
    color: #fff;
    border-color: #2563eb;
}

.assistant-body {
    flex: 1;
    padding: 16px;
    background: #fafafa;
}

.resize-bar {
    position: absolute;
    z-index: 20;
}

.resize-bar.left {
    top: 0;
    bottom: 0;
    left: -5px;
    width: 10px;
    cursor: ew-resize;
}

.resize-bar.right {
    top: 0;
    bottom: 0;
    right: -5px;
    width: 10px;
    cursor: ew-resize;
}

.resize-bar.bottom {
    bottom: -5px;
    left: 0;
    right: 0;
    height: 10px;
    cursor: ns-resize;
}
</style>