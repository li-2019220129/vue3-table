<template>
    <div ref="assistantRef" class="assistant">
        <div class="assistant-header">🤖 智能助手</div>
        <div class="assistant-body">
            <p>这里是内容区域，不可拖动。</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import interact from 'interactjs'

const assistantRef = ref<HTMLElement | null>(null)

const SNAP_THRESHOLD = 50
const WIDTH = 260
const HEIGHT = 200
const MARGIN = 50

let x = 0
let y = 0
let el: HTMLElement | null = null
let interaction: any = null

onMounted(() => {
    el = assistantRef.value
    if (!el) return

    // 初始位置右下角
    x = window.innerWidth - WIDTH - MARGIN
    y = window.innerHeight - HEIGHT - MARGIN
    el.style.transform = `translate(${x}px, ${y}px)`
    el.style.position = 'fixed'
    el.style.left = '0'
    el.style.top = '0'
    el.style.zIndex = '10000'

    // 配置拖拽，只允许从 header 拖动
    interaction = interact(el).draggable({
        inertia: false, // 禁止惯性
        allowFrom: '.assistant-header', // ✅ 只允许从头部拖动
        listeners: {
            start() {
                el!.style.transition = ''
            },
            move(event) {
                x += event.dx
                y += event.dy

                // 边界限制
                const maxX = window.innerWidth - el!.offsetWidth
                const maxY = window.innerHeight - el!.offsetHeight
                x = Math.max(0, Math.min(x, maxX))
                y = Math.max(0, Math.min(y, maxY))

                el!.style.transform = `translate(${x}px, ${y}px)`
            },
            end() {
                const screenW = window.innerWidth
                const screenH = window.innerHeight
                const elW = el!.offsetWidth
                const elH = el!.offsetHeight

                const leftDist = x
                const rightDist = screenW - (x + elW)
                const topDist = y
                const bottomDist = screenH - (y + elH)
                const minDist = Math.min(leftDist, rightDist, topDist, bottomDist)

                let targetX = x
                let targetY = y
                const padding = 10

                if (minDist <= SNAP_THRESHOLD) {
                    if (minDist === leftDist) targetX = padding
                    else if (minDist === rightDist) targetX = screenW - elW - padding
                    else if (minDist === topDist) targetY = padding
                    else if (minDist === bottomDist) targetY = screenH - elH - padding
                }

                el!.style.transition = 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                el!.style.transform = `translate(${targetX}px, ${targetY}px)`
                x = targetX
                y = targetY
                setTimeout(() => {
                    el!.style.transition = ''
                }, 300)
            }
        }
    })

    // 监听 resize，防止出界
    const handleResize = () => {
        const maxX = window.innerWidth - el!.offsetWidth
        const maxY = window.innerHeight - el!.offsetHeight
        x = Math.min(x, maxX)
        y = Math.min(y, maxY)
        el!.style.transform = `translate(${x}px, ${y}px)`
    }

    window.addEventListener('resize', handleResize)
    onBeforeUnmount(() => {
        window.removeEventListener('resize', handleResize)
        interaction?.unset()
    })
})
</script>

<style scoped>
.assistant {
    width: 260px;
    height: 200px;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    cursor: default;
    user-select: none;
}

/* 头部区域：可拖动 */
.assistant-header {
    height: 40px;
    background: linear-gradient(135deg, #007bff, #00bcd4);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    cursor: grab;
}

.assistant-header:active {
    cursor: grabbing;
}

/* 内容区域：不可拖动 */
.assistant-body {
    flex: 1;
    padding: 12px;
    font-size: 14px;
    color: #333;
}
</style>
