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
                <p v-if="isFreeMode && isFloating">自由模式：可移动至屏幕任何角落（包含导航栏）</p>
                <p v-else-if="!isFloating">右侧固定模式：高度占满，仅水平拉伸</p>
                <p v-else>受限悬浮模式：水平移动，高度占满</p>
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

const MIN_WIDTH = 480
const MIN_HEIGHT = 300
const NAV_BAR_HEIGHT = 80
const SNAP_THRESHOLD = 50

const assistantRef = ref<HTMLElement | null>(null)
const isFloating = ref(false)
const isFullscreen = ref(false)
const isFreeMode = ref(false)

const pos = ref({
    x: 0,
    y: NAV_BAR_HEIGHT,
    w: 480,
    h: window.innerHeight - NAV_BAR_HEIGHT
})

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
        height: isFreeMode.value && isFloating.value
            ? `${pos.value.h}px`
            : `calc(100vh - ${NAV_BAR_HEIGHT}px)`,
        // ✅ 修正：非全屏下，始终信任 pos.y 的值
        transform: `translate(${pos.value.x}px, ${pos.value.y}px)`,
        zIndex: 9999,
        transition: 'none',
        borderRadius: isFloating.value ? '12px' : '0px'
    }
})

const toggleFullscreen = () => {
    if (isFullscreen.value) {
        isFullscreen.value = false
        isFloating.value = false
        isFreeMode.value = false
        pos.value.x = window.innerWidth - pos.value.w
        pos.value.y = NAV_BAR_HEIGHT // 退出全屏强制回归 Y=80
    } else {
        isFullscreen.value = true
    }
}

const toggleFloating = () => {
    if (isFullscreen.value) isFullscreen.value = false
    isFloating.value = !isFloating.value
    if (!isFloating.value) {
        pos.value.x = window.innerWidth - pos.value.w
        pos.value.y = NAV_BAR_HEIGHT // 固定模式强制重置 Y
        // isFreeMode.value = false
    }
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
                if (isFullscreen.value) return
                isFloating.value = true
            },
            move(event) {
                if (isFullscreen.value) return

                pos.value.x += event.dx

                // 自由模式累加 Y，非自由模式锁定 Y
                if (isFreeMode.value) {
                    pos.value.y += event.dy
                } else {
                    pos.value.y = NAV_BAR_HEIGHT
                }

                // 边界限制计算
                const maxX = window.innerWidth - pos.value.w
                const currentH = (isFreeMode.value && isFloating.value) ? pos.value.h : (window.innerHeight - NAV_BAR_HEIGHT)
                const maxY = window.innerHeight - currentH

                pos.value.x = Math.max(0, Math.min(pos.value.x, maxX))

                // 自由模式允许 Y 从 0 开始
                if (isFreeMode.value) {
                    pos.value.y = Math.max(0, Math.min(pos.value.y, maxY))
                } else {
                    pos.value.y = NAV_BAR_HEIGHT
                }
            },
            end() {
                if (isFullscreen.value) return

                // ✅ 关键逻辑：无论是否是自由模式，只要靠近右侧就吸附归位
                const distToRight = window.innerWidth - (pos.value.x + pos.value.w)

                if (distToRight <= SNAP_THRESHOLD) {
                    // 1. 关闭所有浮动和自由状态
                    isFloating.value = false
                    // isFreeMode.value = false

                    // 2. 坐标重置回右侧固定位
                    pos.value.x = window.innerWidth - pos.value.w
                    pos.value.y = NAV_BAR_HEIGHT

                    // 3. 增加一个丝滑的动画效果
                    el.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                    setTimeout(() => {
                        el.style.transition = 'none'
                    }, 400)
                }
            }
        }
    })

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
}

.is-floating {
    border: 1px solid #d1d5db;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
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