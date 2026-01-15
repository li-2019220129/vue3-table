<template>
  <div class="deep-table-container">
    <el-table
      :data="tableData"
      style="width: 100%"
      row-key="id"
      :expand-row-keys="expandedRowKeys"
      @expand-change="handleExpandChange"
    >
      <el-table-column type="expand">
        <template #default="{ row }">
          <nested-table
            :data="row.nestedData || []"
            :loading="row.loading"
          />
        </template>
      </el-table-column>
      
      <el-table-column prop="id" label="用户ID" width="100" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="age" label="年龄" width="80" />
      <el-table-column prop="email" label="邮箱" width="200" />
      <el-table-column prop="phone" label="电话" width="150" />
      <el-table-column prop="address" label="地址" min-width="200" />
      <el-table-column prop="totalOrders" label="订单总数" width="120" />
      <el-table-column prop="totalAmount" label="总消费" width="120" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import NestedTable from './NestedTable.vue'

// 定义数据类型
interface NestedData {
  orderId: string
  productName: string
  quantity: number
  price: number
  total: number
  status: string
}

interface TableRow {
  id: number
  name: string
  age: number
  email: string
  phone: string
  address: string
  totalOrders: number
  totalAmount: number
  nestedData?: NestedData[]
  loading?: boolean
}

// 展开行的键数组
const expandedRowKeys = ref<number[]>([])



// 初始表格数据
const tableData = ref<TableRow[]>([])

// 生成模拟数据
const generateMockData = () => {
  const mockData: TableRow[] = []
  
  for (let i = 1; i <= 20; i++) {
    const nestedCount = Math.floor(Math.random() * 30) + 5 // 每个用户有5-35个嵌套数据
    const totalAmount = Math.floor(Math.random() * 50000) + 1000 // 随机总消费
    
    mockData.push({
      id: i,
      name: `用户${i}`,
      age: Math.floor(Math.random() * 50) + 18,
      email: `user${i}@example.com`,
      phone: `138${String(i).padStart(8, '0')}`,
      address: `地址${i}，城市${i}，省份${i}`,
      totalOrders: nestedCount,
      totalAmount,
      nestedData: undefined,
      loading: false
    })
  }
  
  return mockData
}

// 模拟API调用获取嵌套数据
const fetchNestedData = async (rowId: number): Promise<NestedData[]> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // 生成模拟嵌套数据
  const nestedData: NestedData[] = []
  const row = tableData.value.find(r => r.id === rowId)
  if (!row) return []
  
  for (let j = 1; j <= row.totalOrders; j++) {
    const price = Math.floor(Math.random() * 1000) + 100
    const quantity = Math.floor(Math.random() * 10) + 1
    const status = ['已完成', '待发货', '待付款', '已取消'][Math.floor(Math.random() * 4)]
    
    nestedData.push({
      orderId: `ORD${rowId}${String(j).padStart(3, '0')}`,
      productName: `产品${rowId}-${j}`,
      quantity,
      price,
      total: price * quantity,
      status
    })
  }
  
  return nestedData
}

// 初始化数据
onMounted(() => {
  tableData.value = generateMockData()
})

// 处理展开/折叠行
const handleExpandChange = async (row: TableRow, expandedRows: TableRow[]) => {
  if (expandedRows.includes(row)) {
    // 行被展开
    expandedRowKeys.value.push(row.id)
    
    // 如果没有嵌套数据，调用API获取
    if (!row.nestedData) {
      // 设置加载状态
      row.loading = true
      
      try {
        // 调用API获取嵌套数据
        const nestedData = await fetchNestedData(row.id)
        row.nestedData = nestedData
      } catch (error) {
        console.error('获取嵌套数据失败:', error)
        row.nestedData = []
      } finally {
        // 关闭加载状态
        row.loading = false
      }
    }
  } else {
    // 行被折叠
    const index = expandedRowKeys.value.indexOf(row.id)
    if (index > -1) {
      expandedRowKeys.value.splice(index, 1)
    }
  }
}




</script>

<style scoped>
.deep-table-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}
</style>