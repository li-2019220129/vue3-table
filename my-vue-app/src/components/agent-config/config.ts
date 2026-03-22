import type { AgentConfig } from './types'

export const agentConfig: AgentConfig = {
  "type": "Agent",
  "components": [
    {
      "type": "collapse-panel",
      "attributes": {
        "title": "登录提示",
        "titleEN": "loginPrompt"
      },
      "components": [
        {
          "type": "editor-rich-text",
          "layoutItem": {
            "label": "提示文案",
            "labelEN": "loginPromptText",
            "attributesPath": "loginPromptText",
            "required": true
          }
        },
        {
          "type": "editor-input",
          "layoutItem": {
            "label": "助手名称",
            "labelEN": "assistantName",
            "attributesPath": "assistantName",
            "required": true,
            "rules": [
              {
                "type": "string-length-validator",
                "min": 1,
                "max": 20,
                "message": "请输入1-20个字符"
              }
            ]
          }
        },
        {
          "type": "editor-adder",
          "layoutItem": {
            "label": "技能列表",
            "labelEN": "skills",
            "attributesPath": "skills",
            "label-width": 100,
            "tooltips": "技能列表"
          },
          "attributes": {
            "max-length": 20,
            "body": [
              {
                "type": "editor-input",
                "layoutItem": {
                  "label": "技能名称",
                  "labelEN": "skillName",
                  "attributesPath": "skillName",
                  "required": true,
                  "rules": [
                    {
                      "type": "string-length-validator",
                      "min": 1,
                      "max": 20
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
