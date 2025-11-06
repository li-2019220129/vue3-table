<template>
  <div class="tabs-box">
    <div class="left-arrow" @click="handleLeftMove()">
      <el-icon :size="12"><ArrowLeft /></el-icon>
    </div>
    <div ref="contentRef" class="content">
      <div ref="listRef" class="list-box">
        <div
          class="list-item"
          @click="handleTabs(item)"
          v-for="item in data"
          :key="item.id"
          :title="item.label"
        >
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>
    <div class="right-arrow" @click="handleRightMove()">
      <el-icon :size="12"><ArrowRight /></el-icon>
    </div>
  </div>
  <div class="tabs-content"></div>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted, computed, ref, type PropType } from 'vue'
import type { TabsType } from './index'
defineProps({
  data: {
    type: Array as PropType<TabsType[]>,
    default: () => []
  }
})
const listRef = useTemplateRef<HTMLElement>('listRef')
const contentRef = useTemplateRef<HTMLElement>('contentRef')
const tabsValue = defineModel()
const emits = defineEmits(['tabsChange'])
const handleTabs = (item: TabsType) => {
  tabsValue.value = item.value
  emits('tabsChange', item)
}
const moveNum = ref(0)
const moveCom = computed(() => {
  return moveNum.value + contentRef.value!.clientWidth
})

const handleRightMove = () => {
  if (listRef.value!.scrollWidth - moveCom.value <= 0) {
    return
  }
  if (
    listRef.value!.scrollWidth - moveCom.value >
    contentRef.value!.clientWidth
  ) {
    moveNum.value += contentRef.value!.clientWidth
    listRef.value!.style.transform = `translateX(${-moveNum.value}px)`
  } else {
    listRef.value!.style.transform = `translateX(${-moveNum.value - (listRef.value!.scrollWidth - moveCom.value + 1)}px)`
    moveNum.value += listRef.value!.scrollWidth - moveCom.value + 1
  }
}

const handleLeftMove = () => {
  if (moveNum.value <= 0) {
    return
  }
  if (moveNum.value > contentRef.value!.clientWidth) {
    moveNum.value -= contentRef.value!.clientWidth
    listRef.value!.style.transform = `translateX(-${moveNum.value}px)`
  } else {
    moveNum.value = 0
    listRef.value!.style.transform = `translateX(${moveNum.value}px)`
  }
}
onMounted(() => {
  console.log(contentRef.value!.clientWidth)
  console.log(listRef.value!.scrollWidth, listRef.value!.scrollLeft)
})
</script>
<style scoped lang="less">
.tabs-box {
  width: 100%;
  height: 40px;
  padding: 0 20px;
  box-sizing: border-box;
  position: relative;
  border-bottom: 1px solid #ccc;
  .content {
    width: 100%;
    height: 100%;
    overflow: hidden;
    .list-box {
      //   width: auto;
      display: flex;
      white-space: nowrap;
      position: relative;
      float: left;
      height: calc(100% - 1px);
      border-radius: 4px 4px 0 0;
      border: 1px solid #ccc;
      border-bottom: none;
      transition: 0.3s;
      .list-item {
        cursor: pointer;
        padding: 0 20px;
        height: 40px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        list-style: none;
        font-size: 14px;
        font-weight: 500;
        max-width: 200px;
        color: #303133;
        position: relative;
        transition: all 0.3s;
        span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      .list-item:not(:first-child) {
        border-left: 1px solid #ccc;
      }
      .list-item:hover {
        padding-left: 13px;
        padding-right: 13px;
        color: #409eff;
      }
    }
  }
  .left-arrow,
  .right-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    width: 20px;
    height: 100%;
    top: 0;
    cursor: pointer;
  }
  .left-arrow {
    left: 0;
  }
  .right-arrow {
    right: 0;
  }
}
</style>
