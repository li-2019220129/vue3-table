<template>

    <div class="dra-box">
        <div class="item-list" @dragend="(e) => handleDrop(e, index)" @dragover="(e) => handleDragOver(e, index)"
            @dragstart="(e) => handleDragStart(e, index)" :data-key="item.label" :key="item.label" draggable="true"
            v-for="(item, index) in filteData">
            <div class="left-box">
                <div class="icon">
                    12
                </div>
                {{ item.label }}
            </div>
            <ElIcon size={14} color="#fff"><el-icon>
                    <CloseBold />
                </el-icon></ElIcon>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { TinyGrid, TinyGridColumn, TinyGridToolbar } from '@opentiny/vue'
import { ElIcon } from 'element-plus'
import gsap from 'gsap'
import { CloseBold } from '@element-plus/icons-vue'
import CityFilter from './CityFilter.vue'
const filteData = ref([
    { label: '福州', value: '福州' },
    { label: '深圳', value: '深圳' },
    { label: '中山', value: '中山' },
    { label: '龙岩', value: '龙岩' },
    { label: '韶关', value: '韶关' }
])


const startIndex = ref(0)
const isOffset = ref(false)
const target = ref(null)
const handleDragStart = (e, index) => {
    startIndex.value = index
    target.value = e.target
    setTimeout(() => {
        target.value.classList.add('move')
    }, 0)
}

const handleDragOver = (e, index) => {
    e.preventDefault();
    // if (offset < build.height / 2) {
    //     [filteData.value[startIndex.value], filteData.value[index]] = [filteData.value[index], filteData.value[startIndex.value]]
    // } else {
    //     [filteData.value[index], filteData.value[startIndex.value]] = [filteData.value[startIndex.value], filteData.value[index]]
    // }
    [filteData.value[startIndex.value], filteData.value[index]] = [filteData.value[index], filteData.value[startIndex.value]];
    startIndex.value = index
}
const handleDrop = (e) => {
    target.value?.classList.remove('move')
}
</script>
<style>
.dra-box {
    width: 100%;
    max-height: 500px;
    margin-top: 100px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}


.item-list {
    width: 500px;
    height: 32px;
    border: 1px solid #999999;
    background: #0060dd;
    border-radius: 4px;
    margin-bottom: 10px;
    display: flex;
    color: #fff;
    padding: 0 20px;
    align-items: center;
    justify-content: space-between;
}

.move {
    background: #cccccc;
    color: transparent
}

.left-box {
    display: flex;
    gap: 5px;
}
</style>