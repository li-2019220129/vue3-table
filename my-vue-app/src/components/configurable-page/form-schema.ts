/**
 * form-schema.ts
 * ------------------------
 * 定义动态表单结构（schema）与默认模型生成逻辑。
 * 支持嵌套 group / object / array 类型，具备容错处理与类型安全默认值生成。
 */

export interface FormField {
    type: string
    label?: string
    prop?: string
    default?: any
    rules?: any[]
    collapsible?: boolean
    children?: FormField[]
    itemSchema?: FormField[]
    [key: string]: any
}

/**
 * 根据 schema 递归生成初始 model。
 * - 支持 group/object 嵌套；
 * - 支持 array；
 * - 支持默认值与类型推断；
 * - 容错：无 prop 的 group 会合并子字段到当前层级。
 */
export function createInitialModel(schema: any[]): any {
    const model: any = {}

    schema.forEach(field => {
        switch (field.type) {
            case 'group':
            case 'object':
                if (field.prop) {
                    model[field.prop] = createInitialModel(field.children || [])
                } else {
                    Object.assign(model, createInitialModel(field.children || []))
                }
                break
            case 'array':
                model[field.prop] = []
                break
            default:
                model[field.prop] = field.default ?? ''
        }
    })

    return model
}

/**
 * 示例 schema，用于演示嵌套与默认值结构
 */
export const exampleSchema: FormField[] = [
    {
        type: 'group',
        label: '基本信息',
        children: [
            {
                type: 'input',
                label: '标题',
                prop: 'title',
                default: '默认标题',
                rules: [{ required: true, message: '请输入标题' }]
            },
            {
                type: 'textarea',
                label: '描述',
                prop: 'desc'
            },
        ],
    },
    {
        type: 'group',
        label: '外观配置',
        prop: 'style',
        collapsible: true,
        children: [
            { type: 'input', label: '宽度', prop: 'width', default: '100%' },
            { type: 'input', label: '高度', prop: 'height', default: '300px' },
            { type: 'switch', label: '启用阴影', prop: 'shadow', default: true },
            {
                type: 'group',
                label: '测试数据',
                prop: 'testData', // ⚡ 不和上层 style 冲突
                collapsible: true,
                children: [
                    {
                        type: 'input',
                        label: '宽度',
                        prop: 'set',
                        default: '100%',
                        rules: [{ required: true, message: '请输入标题' }]
                    },
                ],
            },
        ],
    },
    {
        type: 'array',
        label: '列表项',
        prop: 'items',
        itemSchema: [
            {
                type: 'input',
                label: '项目名称',
                prop: 'name',
                rules: [{ required: true, message: '请输入名称' }]
            },
            {
                type: 'number',
                label: '数量',
                prop: 'count',
                default: 1
            },
        ],
    },
]
