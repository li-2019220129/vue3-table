// 表单配置类型定义

// 验证规则类型
export interface ValidationRule {
    type: 'string-length-validator' | 'number-range-validator' | 'regex-validator' | 'custom-validator'
    min?: number
    max?: number
    message?: string
    pattern?: string
    validator?: string
}

// 布局项配置
export interface LayoutItem {
    label: string
    labelEN: string
    attributesPath: string
    required?: boolean
    rules?: ValidationRule[]
    'label-width'?: number
    tooltips?: string
}

// 编辑器属性
export interface EditorAttributes {
    'max-length'?: number
    'body'?: ComponentConfig[]
    [key: string]: any
}

// 组件配置基础接口
export interface ComponentConfig {
    type: string
    layoutItem?: LayoutItem
    attributes?: EditorAttributes
    components?: ComponentConfig[]
}

// 折叠面板属性
export interface CollapsePanelAttributes {
    title: string
    titleEN: string
}

// 折叠面板组件配置
export interface CollapsePanelConfig extends ComponentConfig {
    type: 'collapse-panel'
    attributes: CollapsePanelAttributes
    components: ComponentConfig[]
}

// 富文本编辑器配置
export interface RichTextEditorConfig extends ComponentConfig {
    type: 'editor-rich-text'
    layoutItem: LayoutItem
}

// 输入框编辑器配置
export interface InputEditorConfig extends ComponentConfig {
    type: 'editor-input'
    layoutItem: LayoutItem
}

// 添加器编辑器配置
export interface AdderEditorConfig extends ComponentConfig {
    type: 'editor-adder'
    layoutItem: LayoutItem
    attributes: EditorAttributes
}

// Agent配置根节点
export interface AgentConfig {
    type: 'Agent'
    components: ComponentConfig[]
}

// 表单数据模型
export interface FormData {
    [key: string]: any
}

// 组件映射类型
export type ComponentType =
    | 'collapse-panel'
    | 'editor-rich-text'
    | 'editor-input'
    | 'editor-adder'

// 编辑器组件Props
export interface EditorProps {
    modelValue: any
    config: ComponentConfig
    disabled?: boolean
}

// 编辑器组件Emits
export interface EditorEmits {
    (e: 'update:modelValue', value: any): void
    (e: 'change', value: any): void
}
