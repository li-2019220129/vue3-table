import { defineComponent, onMounted } from 'vue'
import type { PropType } from 'vue'
import TreeNode from './tree-node'
import './tree-node.css'
import { ref } from 'vue'

interface TreeNodeData {
    label: string,
    value: string,
    children?: TreeNodeData[],
    [key: string]: any | undefined;
}

const TreeList = defineComponent({
    name: 'TreeList',
    emits: ['node-click'],
    props: {
        nodeData: {
            type: Array as PropType<TreeNodeData[]>,
            required: true,
        },
        modelValue: {
            type: String as PropType<string | undefined>,
            default: ''
        },
        checkStrictly: {
            type: Boolean as PropType<boolean>,
            default: false
        },
        showCheckbox: {
            type: Boolean as PropType<boolean>,
            default: false
        }
    },
    setup(props, { emit }) {
        const treeData = ref<TreeNodeData[]>([])

        const setData = (node: TreeNodeData[], level = 0) => {
            for (let data of node) {
                data.level = level + 1
                data.expand = data.expand ?? false
                data.rawData = props.nodeData
                data.isLeaf = !data.children || data.children.length === 0
                if (props.showCheckbox) {
                    data.check = data.check ?? false
                }
                if (data.children) {
                    setData(data.children, data.level)
                }
            }
        }
        const setCheckData = (data: TreeNodeData[] | undefined, checked: boolean) => {
            if (!data) return
            for (let item of data) {
                const keys = Reflect.ownKeys(item)
                if (keys.includes('check')) {
                    item['check'] = checked
                }
                setCheckData(item.children, checked)
            }
        }
        const handleCheckChange = (value: boolean, nodeData: TreeNodeData) => {
            setCheckData(treeData.value, false)
            nodeData.check = value
        }
        const handleNodeClick = (data: TreeNodeData) => {
            emit('node-click', data)
        }
        onMounted(() => {
            treeData.value = JSON.parse(JSON.stringify(props.nodeData))
            setData(treeData.value, 0)
        })
        return () => (
            treeData.value.map((node, i) => (
                <TreeNode modelValue={props.modelValue} checkStrictly={props.checkStrictly} onCheckChange={handleCheckChange} onNodeClick={(data: TreeNodeData) => handleNodeClick(data)} key={i} showCheckbox={props.showCheckbox} node={node} />
            ))
        )
    },
})

export default TreeList