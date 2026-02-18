<template>
    <div ref="assistantRef" class="assistant-container" :class="{
        'is-floating': isFloating && !isFullscreen,
        'is-fullscreen': isFullscreen
    }" :style="containerStyle">
        <div class="assistant-header">
            <div class="drag-handle">
                <span class="icon">🤖</span>
                <span class="title">智能助手</span>
            </div>

            <div class="header-controls">
                <button @click="toggleFloating" class="ctrl-btn" :title="isFloating ? '固定到右侧' : '自由悬浮'">
                    {{ isFloating ? '📌 固定' : '☁️ 悬浮' }}
                </button>

                <button @click="toggleFullscreen" class="ctrl-btn primary">
                    <span v-if="isFullscreen">收起 ➔</span>
                    <span v-else>⛶ 全屏</span>
                </button>
            </div>
        </div>

        <div class="assistant-body">
            <div class="info-card">
                <p>当前模式：
                    <strong v-if="isFullscreen">全屏模式</strong>
                    <strong v-else-if="isFloating">悬浮模式</strong>
                    <strong v-else>右侧固定模式</strong>
                </p>
            </div>
            <div class="content">
                <p>内容区域...</p>
            </div>
        </div>

        <template v-if="!isFullscreen">
            <div class="resize-bar left"></div>
            <div class="resize-bar right"></div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import interact from 'interactjs'

// --- 配置常量 ---
const MIN_WIDTH = 480
const NAV_BAR_HEIGHT = 80
const SNAP_THRESHOLD = 50
const AUTO_FULLSCREEN_RATIO = 0.85 // 超过 85% 宽度自动全屏

const assistantRef = ref<HTMLElement | null>(null)
const isFloating = ref(false)
const isFullscreen = ref(false)

const pos = ref({
    x: 0,
    y: NAV_BAR_HEIGHT,
    w: MIN_WIDTH,
})

// 计算样式
const containerStyle = computed(() => {
    if (isFullscreen.value) {
        return {
            width: '100vw',
            height: `calc(100vh - ${NAV_BAR_HEIGHT}px)`,
            transform: `translate(0px, ${NAV_BAR_HEIGHT}px)`,
            zIndex: 10000,
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }
    }
    return {
        width: `${pos.value.w}px`,
        height: `calc(100vh - ${NAV_BAR_HEIGHT}px)`,
        transform: `translate(${pos.value.x}px, ${pos.value.y}px)`,
        zIndex: 9999,
        // 只有在非全屏状态下，手动拖拽时不应用 transition
        transition: 'none'
    }
})

// ✅ 核心逻辑：切换全屏/内缩
const toggleFullscreen = () => {
    if (isFullscreen.value) {
        // 退出全屏（内缩）
        isFullscreen.value = false
        isFloating.value = false // 强制关闭悬浮态
        pos.value.x = window.innerWidth - pos.value.w // 回到最右侧
    } else {
        // 进入全屏
        isFullscreen.value = true
    }
}

// 切换悬浮
const toggleFloating = () => {
    debugger
    if (isFullscreen.value) isFullscreen.value = false
    isFloating.value = !isFloating.value
    if (!isFloating.value) {
        pos.value.x = window.innerWidth - pos.value.w
    }
}

onMounted(() => {
    const el = assistantRef.value
    if (!el) return

    // 初始化靠右
    pos.value.x = window.innerWidth - pos.value.w
    const instance = interact(el)

    // 1. 拖拽
    instance.draggable({
        allowFrom: '.assistant-header',
        listeners: {
            start() {
                if (isFullscreen.value) return
                isFloating.value = true
                el.style.transition = 'none'
            },
            move(event) {
                if (isFullscreen.value) return
                pos.value.x += event.dx
                const maxX = window.innerWidth - pos.value.w
                pos.value.x = Math.max(0, Math.min(pos.value.x, maxX))
            },
            end() {
                if (isFullscreen.value) return
                // 自动吸附回归固定模式
                const distToRight = window.innerWidth - (pos.value.x + pos.value.w)
                if (distToRight <= SNAP_THRESHOLD) {
                    isFloating.value = false
                    pos.value.x = window.innerWidth - pos.value.w
                    el.style.transition = 'transform 0.4s ease'
                }
            }
        }
    })

    // 2. 缩放
    instance.resizable({
        edges: { left: true, right: true },
        listeners: {
            move(event) {
                if (isFullscreen.value) return
                let { x, w } = pos.value
                const originalRight = x + w

                w = event.rect.width
                w = Math.max(MIN_WIDTH, Math.min(w, window.innerWidth))

                // ✅ 自动变全屏逻辑
                if (w > window.innerWidth * AUTO_FULLSCREEN_RATIO) {
                    isFullscreen.value = true
                    return
                }

                if (event.edges.left) {
                    x = originalRight - w
                    if (x < 0) { x = 0; w = originalRight }
                } else if (event.edges.right) {
                    if (x + w > window.innerWidth) w = window.innerWidth - x
                }

                pos.value.w = w
                pos.value.x = x
            }
        }
    })

    window.addEventListener('resize', () => {
        if (!isFloating.value && !isFullscreen.value) {
            pos.value.x = window.innerWidth - pos.value.w
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
    /* 固定态：只有左侧边框 */
    border-left: 1px solid #e5e7eb;
}

.is-floating {
    border: 1px solid #d1d5db;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.is-fullscreen {
    border: none !important;
    box-shadow: none !important;
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
    color: #4b5563;
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

.info-card {
    padding: 10px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
}

.resize-bar {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 10px;
    z-index: 20;
}

.resize-bar.left {
    left: -5px;
    cursor: ew-resize;
}

.resize-bar.right {
    right: -5px;
    cursor: ew-resize;
}
</style>