import genDataSource from "utils/dataSource"
import { profile } from "profile"
import { isHalfWidth, wordCount } from "utils/text"
import { getAllText, getSelectNodes } from "utils/note"
import { showHUD } from "utils/common"
import { string2ReplaceParam } from "utils/input"
import mnaddon from "../mnaddon.json"

const configs: IConfig[] = [
  {
    name: mnaddon.title,
    intro: `version: ${mnaddon.version} 仅用于技术测试\nmade by ${mnaddon.author}`,
    link: "https://github.com/ourongxing/copysearch",
    settings: [
      {
        key: "rightMode",
        type: cellViewType.switch,
        label: "面板置于右侧",
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
        key: "clickCardOn",
        type: cellViewType.switch,
        label: "点击卡片时执行",
      },
    ],
    actions: [
      {
        key: "copySelected",
        type: cellViewType.button,
        label: "复制卡片信息",
      },
    ],
  },
  {
    name: "Copy",
    intro: "自定义在复制模式下点击卡片时复制的内容\n点击查看支持的变量",
    link: "https://busiyi.notion.site/Copy-61ef85cf19f24de2a14814db0e3ea05a",
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
    link: "https://busiyi.notion.site/Search-26440b198773492cbc1e39015ae55654",
    settings: [
      {
        key: "titleLinkFirst",
        type: cellViewType.switch,
        label: "标题链接取第一个",
      },
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
        help: "自定义，点击查看具体输入格式",
        link: "https://busiyi.notion.site/Search-26440b198773492cbc1e39015ae55654",
      },
    ],
  },
]

const utils = {
  getUrl(text: string) {
    if (profile.customUrl) {
      const params = string2ReplaceParam(profile.customUrl)
      for (const item of params) {
        if (text.match(item.regexp))
          return text.replace(item.regexp, item.newSubStr)
      }
    }

    if (isHalfWidth(text)) {
      if (profile.wordUrl && wordCount(text) < 4)
        return text.replace(/^.*$/, profile.wordUrl)
      if (profile.sentenceUrl && wordCount(text) > 3)
        return text.replace(/^.*$/, profile.sentenceUrl)
    }
    if (profile.defaultUrl) return text.replace(/^.*$/, profile.defaultUrl)
    return false
  },
  getCustomText(note: MbBookNote) {
    // 后期可以慢慢加
    const vars = {
      title: note.noteTitle ?? "",
      text: getAllText(note),
      createTime: note.createDate,
      modifiedTime: note.modifiedDate,
      link: "marginnote3app://note/" + note.noteId,
    }
    let _text = JSON.parse(`{"text": ${profile.customCopy}}`).text
    Object.entries(vars).forEach(([key, value]) => {
      const reg = new RegExp(`{{${key}}}`, "g")
      _text = _text.replace(reg, <string>value)
    })
    return _text.replace(/\n{2,}/g, "\n")
  },
}

const actions: IActionMethod = {
  copySelected({}) {
    try {
      const nodes = getSelectNodes()
      let texts: string[] = []
      if (nodes.length == 1) texts.push(utils.getCustomText(nodes[0]))
      else
        nodes.forEach((node, index) => {
          texts.push(String(index + 1) + ". " + utils.getCustomText(node))
        })
      const pasteBoard = UIPasteboard.generalPasteboard()
      pasteBoard.string = texts.join("\n").trim()
    } catch {
      return
    }
    showHUD("复制成功")
  },
}
const dataSource = genDataSource(configs, {
  // action 板块详情
  name: "MagicAction",
  intro: "可多选卡片，复制内容格式同复制模式下的格式",
})

const $name = mnaddon.addonid.split(".")[2]
export { $name, utils, actions, dataSource }
