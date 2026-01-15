<template>
  <deep-table></deep-table>
</template>
<script setup lang="tsx">
import { ref } from 'vue'
import DeepTable from './deepTable.vue'

//code editor
// const code = ref(``)
const handleNodeClick = (node: TreeNode) => {
  console.log(node);
}
const value = ref('')
const treeData = ref()
const data = [
  {
    value: '11111',
    label: 'Level one 1',
    expand: true,
    children: [
      {
        value: '1-1',
        label: 'Level two 1-1',
        children: [
          {
            value: '1-1-1',
            label: 'Level three 1-1-1',
            children: [
              {
                value: '1-1-1-1',
                label: 'Level four 1-1-1-1',
                children: [
                  {
                    value: '1-1-1-1-1',
                    label: 'Level five 1-1-1-1-1',
                    children: [
                      {
                        value: '1-1-1-1-1-1',
                        label: 'Level six 1-1-1-1-1-1',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    value: '2',
    label: 'Level one 2',
    children: [
      {
        value: '2-1',
        label: 'Level two 2-1',
        children: [
          {
            value: '2-1-1',
            label: 'Level three 2-1-1',
          },
        ],
      },
      {
        value: '2-2',
        label: 'Level two 2-2',
        children: [
          {
            value: '2-2-1',
            label: 'Level three 2-2-1',
          },
        ],
      },
    ],
  },
  {
    value: '3',
    label: 'Level one 3',
    children: [
      {
        value: '3-1',
        label: 'Level two 3-1',
        children: [
          {
            value: '3-1-1',
            label: 'Level three 3-1-1',
          },
        ],
      },
      {
        value: '3-2',
        label: 'Level two 3-2',
        children: [
          {
            value: '3-2-1',
            label: 'Level three 3-2-1',
          },
        ],
      },
    ],
  },
]
// const customLanguage = {
//   id: 'mylang',
//   languageDef: {
//     tokenizer: {
//       root: [
//         [/\|?(lizhiyang|limei|mingzhiqiang)\b/i, 'keyword'],
//         [/"[^"]*"/, 'string'],
//         [/(or|by|and)\b/i, 'keyword'],
//         [/[{}()\[\]]/, 'string'],
//         [/[a-zA-Z_]\w*/, 'identifier'],
//         [/\d+/, 'keyword'],
//         [/\/\/.*$/, 'comment'], // 单行注释
//         [/\/\*/, { token: 'comment', next: '@comment' }] // 多行注释开始
//       ],
//       comment: [
//         [/[^\/*]+/, 'comment'],
//         [/\*\//, 'comment', '@pop'], // 多行注释结束
//         [/[\/*]/, 'comment']
//       ]
//     }
//   }
// }

// const customTheme = {
//   themeName: 'mycooltheme',
//   themeData: {
//     base: 'vs-dark',
//     inherit: true,
//     rules: [
//       { token: 'keyword', foreground: 'ff79c6' },
//       { token: 'string', foreground: '50fa7b' },
//       { token: 'number', foreground: 'bd93f9' },
//       { token: 'identifier', foreground: 'f8f8f2' }
//     ],
//     colors: {
//       'editor.background': '#282a36'
//     }
//   }
// }

// const customCompletions = [
//   { label: 'myfunc', kind: 14, insertText: 'myfunc ', detail: '定义函数' },
//   { label: 'myvar', kind: 13, insertText: 'myvar ', detail: '定义变量' },
//   { label: 'sayHello', kind: 1, insertText: 'sayHello', detail: '打印 hello' },
//   {
//     label: 'sayGoodbye',
//     kind: 1,
//     insertText: 'sayGoodbye',
//     detail: '打印 goodbye'
//   }
// ]

// const editableTabsValue = ref('1')
// const tabsData = reactive<TabsType[]>([
//   {
//     id: '1',
//     label:
//       '标签一1ajwerarawrjaworjawroarj12faewiwierjrjewrawerioaweraworaweroiawruioawruoiawruoiwaeruowaruwaoiuer',
//     value: '1'
//   },
//   {
//     id: '2',
//     label: '标签二1212121aweawerrwer1112121313afa',
//     value: '2'
//   },
//   {
//     id: '3',
//     label: '标签三欸阿文环绕微软2i发我份哈维和爱恶热i污染物i人',
//     value: '3'
//   },
//   {
//     id: '4',
//     label: '标签四',
//     value: '4'
//   },
//   {
//     id: '5',
//     label: '标签五',
//     value: '5'
//   },
//   {
//     id: '6',
//     label: '标签六',
//     value: '6'
//   },
//   {
//     id: '7',
//     label: '标签七',
//     value: '7'
//   },
//   {
//     id: '8',
//     label: '标签八',
//     value: '8'
//   },
//   {
//     id: '9',
//     label: '标签九',
//     value: '9'
//   },
//   {
//     id: '10',
//     label: '标签十',
//     value: '10'
//   },
//   {
//     id: '11',
//     label: '标签十一',
//     value: '11'
//   },
//   {
//     id: '12',
//     label: '标签十二',
//     value: '12'
//   },

//   {
//     id: '13',
//     label: '标签十三',
//     value: '13'
//   },
//   {
//     id: '14',
//     label: '标签十四',
//     value: '14'
//   },
//   {
//     id: '15',
//     label: '标签十五',
//     value: '15'
//   },
//   {
//     id: '16',
//     label: '标签十六',
//     value: '16'
//   },
//   {
//     id: '17',
//     label: '标签十7',
//     value: '17'
//   },
//   {
//     id: '18',
//     label: '标签十8',
//     value: '18'
//   }
// ])

// const colData = reactive([
//   {
//     type: 'selection',
//     width: '55',
//     fixed: 'left',
//     showOverflowTooltip: true
//   },
//   {
//     width: '120',
//     property: 'name',
//     label: '名称',
//     sortable: true,
//     showOverflowTooltip: true
//   },
//   {
//     width: '120',
//     property: 'name',
//     label: '名称',
//     sortable: true,
//     showOverflowTooltip: true
//   },
//   {
//     width: '120',
//     property: 'name',
//     label: '名称',
//     sortable: true,
//     showOverflowTooltip: true
//   },
//   {
//     width: '120',
//     property: 'name',
//     label: '名称',
//     sortable: true,
//     showOverflowTooltip: true
//   },
//   {
//     width: '120',
//     property: 'name',
//     label: '名称',
//     sortable: true,
//     showOverflowTooltip: true
//   },
//   {
//     width: '120',
//     property: 'name',
//     label: '名称',
//     sortable: true,
//     showOverflowTooltip: true
//   },
//   {
//     width: '120',
//     property: 'name',
//     label: '名称',
//     sortable: true,
//     showOverflowTooltip: true
//   },
//   {
//     minWidth: '120',
//     property: 'age',
//     label: '年龄',
//     showOverflowTooltip: true,
//     sortable: true,
//     slot: {
//       default: ({ row }) => {
//         return <div>{row['age']}</div>
//       }
//     }
//   },
//   {
//     minWidth: '200',
//     property: 'address',
//     label: '地址',
//     showOverflowTooltip: true
//   }
// ])
// const height = ref(500)
// const tableData = reactive([
//   {
//     name: '王小虎',
//     age: 18,
//     address: '上海市普陀区金沙江路 1518 弄'
//   },
//   {
//     name: '王小虎',
//     age: 18,
//     address: '上海市普陀区金沙江路 1518 弄'
//   },
//   {
//     name: '王小虎',
//     age: 13,
//     address: '上海市普陀区金沙江路 1518 弄'
//   },
//   {
//     name: '王中虎',
//     age: 308,
//     address: '上海市普陀区金沙江路 1518 弄'
//   },
//   {
//     name: '王大虎',
//     age: 8,
//     address: '上海市普陀区金沙江路 1518 弄'
//   }
// ])
// const handleSelectionChange = (val: any) => {
//   console.log(val)
// }

// const resize = () => {
//   const clearHeight = 500
//   height.value =
//     window.innerHeight - clearHeight < 192
//       ? 192
//       : window.innerHeight - clearHeight
// }

// onMounted(() => {
//   window.addEventListener('resize', resize)
//   resize()
// })
</script>
<style scoped></style>
