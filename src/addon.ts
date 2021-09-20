import genDataSource from "utils/dataSource"
import { profile } from "profile"
import { isHalfWidth, wordCount } from "utils/text"
import { getSelectNodes } from "utils/note"
import { showHUD } from "utils/common"
import { string2ReplaceParam } from "utils/input"

const configs: IConfig[] = [
  {
    name: "_CAPNAME_",
    intro: "version: 0.9.0 仅用于技术测试\nmade by ourongxing",
    link: "https://github.com/ourongxing",
    settings: [
      {
        key: "rightMode",
        type: cellViewType.switch,
        label: "面板置于右侧"
      },
      {
        key: "copyMode",
        type: cellViewType.switch,
        label: "切换为复制模式",
      },
      {
        key: "selectTextOn",
        type: cellViewType.switch,
        label: "选中文字时执行",
      },
      {
        key: "clickExcerptOn",
        type: cellViewType.switch,
        label: "点击摘录时执行",
      },
      {
        key: "titleLinkFirst",
        type: cellViewType.switch,
        label: "标题链接取第一个",
      }
    ],
    actions: [
      {
        key: "copySelected",
        type: cellViewType.button,
        label: "复制卡片信息",
      }
    ]
  },
  {
    name: "Copy",
    intro: "自定义在复制模式下点击卡片时复制的内容\n点击查看支持的变量",
    link: "https://github.com/ourongxing",
    settings: [
      {
        key: "customCopy",
        type: cellViewType.input,
      },
    ],
  },
  {
    name: "Search",
    intro: "自定义 Url，点击查看更多 UrlScheme",
    link: "https://github.com/ourongxing",
    settings: [
      {
        key: "wordUrl",
        type: cellViewType.inlineInput,
        label: "单词或短语",
      },
      {
        key: "sentenceUrl",
        type: cellViewType.inlineInput,
        label: "英语句子",
      },
      {
        key: "defaultUrl",
        type: cellViewType.inlineInput,
        label: "默认情况",
      },
      {
        key: "customUrl",
        type: cellViewType.input,
        help: "自定义，点击查看具体输入格式"
      },
    ],
  }
]

const utils = {
  getUrl(text: string) {
    if (profile.customUrl) {
      const params = string2ReplaceParam(profile.customUrl)
      for (const item of params) {
        if (text.match(item.regexp)) {
          const title = text.replace(item.regexp, item.newSubStr)
          return text.replace(/^.*$/, title)
        }
      }
    }

    if (isHalfWidth(text)) {
      if (profile.wordUrl && wordCount(text) < 4)
        return text.replace(/^.*$/, profile.wordUrl)
      if (profile.sentenceUrl && wordCount(text) > 3)
        return text.replace(/^.*$/, profile.sentenceUrl)
    }
    if (profile.defaultUrl)
      return text.replace(/^.*$/, profile.defaultUrl)
    return false
  },

  getCustomText(note: MbBookNote) {
    // 后期可以慢慢加
    const vars = {
      title: note.noteTitle ?? "",
      text: note.notesText ?? "",
      createTime: note.createDate,
      modifiedTime: note.modifiedDate,
      link: "marginnote3app://note/" + note.noteId,
    }
    let _text = JSON.parse(`{"text": ${profile.customCopy}}`).text
    Object.entries(vars).forEach(([key, value]) => {
      const reg = new RegExp("%" + key, "g")
      _text = _text.replace(reg, <string>value)
    })
    return _text.replace(/\n{2,}/g, "\n")
  }
}

const actions: IActionMethod = {
  copySelected({ }) {
    try {
      const nodes = getSelectNodes()
      let texts: string[] = []
      nodes.forEach((node, index) => {
        texts.push(String(index + 1) + ". " + utils.getCustomText(node))
      })
      const pasteBoard = UIPasteboard.generalPasteboard()
      pasteBoard.string = texts.join("\n").trim()
    } catch {
      return
    }
    showHUD("复制成功")
  }
}
const dataSource = genDataSource(configs, {
  // action 板块详情
  name: "MagicAction",
  intro: "可多选卡片，复制内容格式同复制模式"
})

export { utils, actions, dataSource }