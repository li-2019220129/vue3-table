import { defineComponent, computed, Transition, ref, nextTick, onMounted, watch } from 'vue'
import type { PropType } from 'vue'
import './tree-node.css'
import { ElIcon } from 'element-plus'
import { CaretRight } from '@element-plus/icons-vue'

interface TreeNodeData {
    label: string,
    value: string,
    children?: TreeNodeData[],
    rawData?: TreeNodeData[],
    [key: string]: any | undefined;
}

const TreeNode = defineComponent({
    name: 'TreeNode',
    emits: ['nodeClick', 'checkChange'],
    props: {
        node: {
            type: Object as PropType<TreeNodeData>,
            required: true,
        },
        modelValue: {
            type: String,
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
        const childrenRef = ref<HTMLElement | null>(null)
        const nodeRef = ref<HTMLElement | null>(null)
        const getPaddingLeft = (level: number) => {
            return `${level * 16}px`
        }

        const updateHeight = async () => {
            await nextTick()
            if (childrenRef.value) {
                const height = childrenRef.value.scrollHeight
                childrenRef.value.style.setProperty('--el-tree-node-height', `${height}px`)
            }
        }

        const handleClick = async (e: MouseEvent) => {
            e.stopPropagation()
            if (!props.node.expand) {
                props.node.expand = true
                await nextTick()
                await updateHeight()
            } else {
                await updateHeight()
                props.node.expand = false
            }
        }

        const getIcon = computed(() => {
            return !props.node.isLeaf
        })

        const findNodeInData = (data: TreeNodeData[], value: string): TreeNodeData | undefined => {
            for (const item of data) {
                if (item.value === value) {
                    return item
                }
                if (item.children) {
                    const found = findNodeInData(item.children, value)
                    if (found) {
                        return found
                    }
                }
            }
            return undefined
        }

        const handleNodeClick = (e: MouseEvent) => {
            e.stopPropagation()
            if (props.showCheckbox) {
                emit('checkChange', !props.node.check, props.node)
            } else {
                handleClick(e)

            }
            if (props.node.rawData) {
                const nodeData = findNodeInData(props.node.rawData, props.node.value)
                if (nodeData) {
                    emit('nodeClick', nodeData)
                }
            }
        }

        const handleChildNodeClick = (data: TreeNodeData) => {
            emit('nodeClick', data)
        }

        const onCheckChange = (value: boolean, data: TreeNodeData) => {
            emit('checkChange', value, data)
        }

        const isActive = computed(() => props.modelValue === props.node.value)
        onMounted(async () => {
            console.log(props.showCheckbox)
            if (props.node.expand) {
                await updateHeight()
            }
        })

        return () => (
            <div class={{ 'tree__node': true, 'expand': props.node.expand }} ref={nodeRef}>
                <div class={{ 'tree__content': true, isActive: isActive.value }} onClick={handleNodeClick} style={{ 'padding-left': getPaddingLeft(props.node.level as number) }}>
                    <div class={{ "tree__icon": true, "tree__icon--rotate": props.node.expand }} onClick={handleClick}>
                        {getIcon.value ? <ElIcon size={14} color="#a8abb2"><CaretRight /></ElIcon> : null}
                    </div>
                    {props.showCheckbox ? <el-checkbox style="margin-right: 4px;" onClick={handleNodeClick} modelValue={props.node.check} onChange={(value: boolean) => onCheckChange(value, props.node)} size="small" /> : null}
                    <div class="tree__label" title={props.node.label}>{props.node.label}</div>
                </div>
                <Transition name="expand">
                    {props.node.expand ? <div class="tree__children" ref={childrenRef}>
                        {props.node.children?.map((child, i) => (
                            <TreeNode
                                modelValue={props.modelValue}
                                key={i}
                                showCheckbox={props.showCheckbox}
                                node={child}
                                onNodeClick={handleChildNodeClick}
                                onCheckChange={onCheckChange}
                            />
                        ))}
                    </div> : null}
                </Transition>
            </div>
        )
    },
})

export default TreeNode