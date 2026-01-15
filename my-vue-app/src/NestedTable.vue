<template>
  <div class="nested-table-wrapper">
    <div v-if="loading" class="loading-wrapper">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span style="margin-left: 8px">加载中...</span>
    </div>

    <el-table v-if="!loading" :data="paginatedData" style="width: 100%" border
      :default-sort="{ prop: 'orderId', order: 'ascending' }">
      <el-table-column prop="orderId" label="订单ID" width="120" sortable>
        <template #header-cell>
          <div class="header-with-filter">
            <span>订单ID</span>
            <el-input v-model="filters.orderId" placeholder="筛选订单ID" clearable size="small" @input="handleFilterChange"
              style="width: 100px; margin-top: 4px" />
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="productName" label="产品名称" width="180" sortable>
        <template #header-cell>
          <div class="header-with-filter">
            <span>产品名称</span>
            <el-input v-model="filters.productName" placeholder="筛选产品" clearable size="small"
              @input="handleFilterChange" style="width: 150px; margin-top: 4px" />
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="quantity" label="数量" width="80" sortable>
        <template #header-cell>
          <div class="header-with-filter">
            <span>数量</span>
            <el-input-number v-model="filters.quantity" placeholder="数量" :min="0" size="small"
              @change="handleFilterChange" style="width: 80px; margin-top: 4px" />
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="price" label="单价" width="100" sortable>
        <template #header-cell>
          <div class="header-with-filter">
            <span>单价</span>
            <el-input-number v-model="filters.price" placeholder="单价" :min="0" :step="100" size="small"
              @change="handleFilterChange" style="width: 100px; margin-top: 4px" />
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="total" label="总价" width="120" sortable />

      <el-table-column prop="status" label="状态" width="120" sortable>
        <template #header-cell>
          <div class="header-with-filter">
            <span>状态</span>
            <el-select v-model="filters.status" placeholder="筛选状态" clearable size="small" @change="handleFilterChange"
              style="width: 100px; margin-top: 4px">
              <el-option label="已完成" value="已完成" />
              <el-option label="待发货" value="待发货" />
              <el-option label="待付款" value="待付款" />
              <el-option label="已取消" value="已取消" />
            </el-select>
          </div>
        </template>
        <template #default="{ row }">
          <el-tag :type="row.status === '已完成' ? 'success' : row.status === '待发货' ? 'warning' : 'info'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="!loading" class="pagination-wrapper">
      <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
        :page-sizes="[5, 10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" :total="filteredDataTotal"
        @size-change="handlePageSizeChange" @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Loading } from '@element-plus/icons-vue'

// 定义嵌套数据类型
interface NestedData {
  orderId: string
  productName: string
  quantity: number
  price: number
  total: number
  status: string
}

// 定义组件Props
const props = defineProps<{
  data: NestedData[]
  loading: boolean
}>()

// 定义筛选条件类型
interface Filters {
  orderId: string
  productName: string
  quantity: number | null
  price: number | null
  status: string
}

// 筛选条件
const filters = ref<Filters>({
  orderId: '',
  productName: '',
  quantity: null,
  price: null,
  status: ''
})

// 分页参数
const pagination = ref({
  currentPage: 1,
  pageSize: 10
})

// 处理筛选变化
const handleFilterChange = () => {
  // 筛选变化时重置到第一页
  pagination.value.currentPage = 1
}

// 处理每页条数变化
const handlePageSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
}

// 处理当前页变化
const handleCurrentChange = (current: number) => {
  pagination.value.currentPage = current
}

// 监听外部数据变化，重置分页和筛选
watch(() => props.data, () => {
  pagination.value.currentPage = 1
  // 重置筛选条件
  filters.value = {
    orderId: '',
    productName: '',
    quantity: null,
    price: null,
    status: ''
  }
})

// 计算筛选后的数据总量
const filteredDataTotal = computed(() => {
  return filteredData.value.length
})

// 计算筛选并分页后的数据
const filteredData = computed(() => {
  let data = [...props.data]

  // 多条件筛选
  if (filters.value.orderId) {
    data = data.filter(item =>
      item.orderId.toLowerCase().includes(filters.value.orderId.toLowerCase())
    )
  }

  if (filters.value.productName) {
    data = data.filter(item =>
      item.productName.toLowerCase().includes(filters.value.productName.toLowerCase())
    )
  }

  if (filters.value.quantity !== null) {
    data = data.filter(item => item.quantity === filters.value.quantity)
  }

  if (filters.value.price !== null) {
    data = data.filter(item => item.price === filters.value.price)
  }

  if (filters.value.status) {
    data = data.filter(item => item.status === filters.value.status)
  }

  return data
})

// 计算分页后的数据
const paginatedData = computed(() => {
  const { currentPage, pageSize } = pagination.value
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize

  return filteredData.value.slice(startIndex, endIndex)
})
</script>

<style scoped>
.nested-table-wrapper {
  padding: 16px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-top: 8px;
}

.header-with-filter {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  color: #606266;
  font-size: 14px;
}

.loading-wrapper .is-loading {
  animation: rotate 1s linear infinite;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>