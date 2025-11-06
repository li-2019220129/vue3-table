<template>
  <!-- <button
    v-if="language === 'json'"
    @click="formatAndValidateJson"
    class="format-button"
  >
    格式化并校验
  </button> -->
  <div ref="editorContainer" class="editor-container"></div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import loader from '@monaco-editor/loader'
import * as monaco from 'monaco-editor'

interface LanguageConfig {
  id: string
  languageDef: monaco.languages.IMonarchLanguage
  conf?: monaco.languages.LanguageConfiguration
}

interface CompletionItem {
  label: string
  kind?: monaco.languages.CompletionItemKind
  insertText?: string
  detail?: string
  documentation?: string
}

interface Props {
  modelValue: string
  language?: string
  options?: monaco.editor.IStandaloneEditorConstructionOptions
  customLanguage?: LanguageConfig
  completions?: CompletionItem[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const editorContainer = ref<HTMLDivElement | null>(null)
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
// // 格式化并校验 JSON
// function formatAndValidateJson() {
//   const model = editorInstance?.getModel()
//   if (!model) return

//   try {
//     const raw = model.getValue()
//     const parsed = JSON.parse(raw) // 检查合法性
//     const formatted = JSON.stringify(parsed, null, 2)

//     // 替换全文，保持光标稳定

//     const fullRange = model.getFullModelRange()
//     editorInstance?.executeEdits('', [{ range: fullRange, text: formatted }])
//     emit('update:modelValue', formatted)
//     alert('✅ JSON 校验通过并已格式化！')
//   } catch (err: any) {
//     alert(`❌ JSON 格式错误：${err.message}`)
//   }
// }
onMounted(async () => {
  if (editorContainer.value) {
    loader.config({ monaco })
    loader.config({
      'vs/nls': { availableLanguages: { '*': 'zh-cn' } }
    })
    loader.init().then((monacoInstance: typeof monaco) => {
      if (props.customLanguage) {
        registerCustomLanguage(props.customLanguage, monacoInstance)
      }
      if (props.completions && props.language) {
        registerCompletionProvider(props.language, monacoInstance)
      }

      // 确保 editorContainer.value 非空
      if (!editorContainer.value) return

      editorInstance = monacoInstance.editor.create(editorContainer.value, {
        value: props.modelValue,
        language: props.language || 'javascript',
        theme: 'vs',
        wordWrap: 'on',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        ...(props.options || {})
      })
      editorInstance.onDidChangeModelContent(() => {
        const value = editorInstance?.getValue() || ''
        emit('update:modelValue', value)
      })
    })
  }
})

watch(
  () => props.modelValue,
  (newValue) => {
    const currentValue = editorInstance?.getValue()
    if (newValue !== currentValue) {
      editorInstance?.setValue(newValue)
    }
  }
)

onBeforeUnmount(() => {
  editorInstance?.dispose()
})

function registerCustomLanguage(
  config: LanguageConfig,
  monacoInstance: typeof monaco
) {
  if (
    !monacoInstance.languages
      .getLanguages()
      .some((lang: { id: string }) => lang.id === config.id)
  ) {
    monacoInstance.languages.register({ id: config.id })
    monacoInstance.languages.setMonarchTokensProvider(
      config.id,
      config.languageDef
    )

    // 合并用户配置和默认配置
    const defaultConfig: monaco.languages.LanguageConfiguration = {
      comments: {
        lineComment: '//',
        blockComment: ['/*', '*/']
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
      ],
      autoClosingPairs: [
        { open: '"', close: '"' },
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '/*', close: '*/', notIn: ['string'] }
      ],
      wordPattern: /(-?\d*\.\d\w*)|([^\s{}[\]()'"`.,:;+\-*/|\\&!@#$%^&]+)/g
    }

    const finalConfig = {
      ...defaultConfig,
      ...(config.conf || {})
    }

    monacoInstance.languages.setLanguageConfiguration(config.id, finalConfig)
  }
}

function registerCompletionProvider(
  languageId: string,
  monacoInstance: typeof monaco
) {
  monacoInstance.languages.registerCompletionItemProvider(languageId, {
    triggerCharacters: ['.'], // 只在输入点号时触发
    provideCompletionItems: (
      model: monaco.editor.ITextModel,
      position: monaco.Position
    ) => {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      })

      // 只在输入点号或者正在输入单词时提供建议
      const wordMatch = textUntilPosition.match(/[\w\d]+$/)
      const dotMatch = textUntilPosition.endsWith('.')

      if (!wordMatch && !dotMatch) {
        return { suggestions: [] }
      }

      const currentWord = wordMatch ? wordMatch[0].toLowerCase() : ''
      let suggestions: monaco.languages.CompletionItem[] = []

      if (props.completions) {
        // 使用 Set 来存储已经添加的标签，避免重复
        const addedLabels = new Set<string>()

        suggestions = props.completions
          .filter((item) => {
            if (
              currentWord &&
              !item.label.toLowerCase().includes(currentWord)
            ) {
              return false
            }
            if (addedLabels.has(item.label)) {
              return false
            }
            addedLabels.add(item.label)
            return true
          })
          .map((item) => ({
            label: item.label,
            kind: item.kind || monacoInstance.languages.CompletionItemKind.Text,
            insertText: item.insertText || item.label,
            detail: item.detail,
            documentation: item.documentation,
            range: {
              startLineNumber: position.lineNumber,
              startColumn: wordMatch
                ? position.column - currentWord.length
                : position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column
            }
          }))
      }

      return {
        suggestions,
        incomplete: false // 表示这是完整的建议列表
      }
    }
  })
}
</script>

<style scoped>
.editor-container {
  width: 100%;
  height: 100%;
}
</style>
