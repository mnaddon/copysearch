import { $name, actions } from "addon"
import { layoutViewController } from "jsExtension/switchPanel"
import { profile } from "profile"
import { isThisWindow, log, showHUD } from "utils/common"
import eventHandlerController from "utils/event"
import { getNoteById } from "utils/note"
import copySearch from "./copySearchHandler"

interface eventHandler {
  (sender: {
    userInfo: {
      [k: string]: any
    }
  }): void
}

export const eventCtrl = eventHandlerController([
  { event: `${$name}InputOver` },
  { event: `${$name}SwitchChange` },
  { event: `${$name}ButtonClick` },
  { event: "PopupMenuOnSelection" },
  { event: "ActiveDigestNote" },
  { event: "PopupMenuOnNote" }
])

const onButtonClick: eventHandler = sender => {
  if (!isThisWindow(sender, self.window)) return
  const { key, content } = sender.userInfo
  // 传入你需要的内容
  actions[key]({
    content: content
  })
}

const onSwitchChange: eventHandler = sender => {
  if (!isThisWindow(sender, self.window)) return
  const { key, status } = sender.userInfo
  profile[key] = status
  switch (key) {
    case "rightMode":
      layoutViewController()
      break
    case "copyMode":
      profile.copyMode
        ? showHUD("切换到 Copy 模式")
        : showHUD("切换到 Search 模式")
  }
}

const onInputOver: eventHandler = sender => {
  if (!isThisWindow(sender, self.window)) return
  const { key, content } = sender.userInfo
  profile[key] = content
  content ? showHUD("输入已保存") : showHUD("输入已清空")
}

// 选择文本
const onPopupMenuOnSelection: eventHandler = sender => {
  if (!isThisWindow(sender, self.window)) return
  log("选中了文字", "action")
  // 选中文字不会触发矫正，所以可能是乱码
  if (!profile.on || !profile.selectTextOn) return
  const text = sender.userInfo.documentController.selectionText
  if (!text) return
  copySearch({
    text
  })
}

let isClickCard = false
// 点击卡片会触发点击摘录，但是变成框架再点击就不会触发点击卡片，只会触发点击摘录，有点离谱
const onActiveDigestNote: eventHandler = async sender => {
  if (!isThisWindow(sender, self.window)) return
  isClickCard = true
  if (!profile.on || !profile.clickCardOn) return
  let note = getNoteById(sender.userInfo.noteid)
  // 貌似这个事件可以取到点击的摘录，不过这里只需要主摘录
  note = note.groupNoteId ? getNoteById(note.groupNoteId) : note
  copySearch({
    note
  })
}

const onPopupMenuOnNote: eventHandler = sender => {
  if (!isThisWindow(sender, self.window)) return
  if (isClickCard) {
    isClickCard = false
    return
  }
  if (!profile.on || !profile.clickExcerptOn) return
  const note = <MbBookNote>sender.userInfo.note
  // 必然存在一个，否则不可能存在此摘录
  const text = note.excerptText ?? note.noteTitle
  copySearch({
    text
  })
}

// 有关摘录处理的功能请直接开发 ohmymn 插件，避免冲突
const onProcessExcerptText: eventHandler = sender => {}

export default {
  onInputOver,
  onButtonClick,
  onSwitchChange,
  onPopupMenuOnNote,
  onActiveDigestNote,
  onPopupMenuOnSelection
}
