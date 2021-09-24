import { actions } from "addon"
import { layoutViewController } from "jsExtension/switchPanel"
import { profile } from "profile"
import {
  getNoteById,
  getSelectNodes,
  RefreshAfterDBChange,
  undoGrouping,
} from "utils/note"
import { delayBreak, log, showHUD } from "utils/common"
import copySearch from "./copySearchHandler"
import eventHandlerController from "utils/event"
import { $name } from "addon"

interface IUserInfo {
  [k: string]: any
}

interface eventHandler {
  ({ userInfo }: { userInfo: IUserInfo }): void
}

export const eventCtrl = eventHandlerController([
  { event: `${$name}InputOver` },
  { event: `${$name}SwitchChange` },
  { event: `${$name}ButtonClick` },
  { event: "PopupMenuOnSelection" },
  { event: "ActiveDigestNote" },
  { event: "PopupMenuOnNote" },
])

const onButtonClick: eventHandler = ({ userInfo }) => {
  // 传入你需要的内容
  actions[userInfo.key]({
    content: userInfo.content,
  })
  RefreshAfterDBChange()
}

const onSwitchChange: eventHandler = ({ userInfo }) => {
  profile[userInfo.key] = userInfo.status
  switch (userInfo.key) {
    case "rightMode":
      layoutViewController()
      break
    case "copyMode":
      profile.copyMode
        ? showHUD("切换到 Copy 模式")
        : showHUD("切换到 Search 模式")
  }
}

const onInputOver: eventHandler = ({ userInfo }) => {
  profile[userInfo.key] = userInfo.content
  if (userInfo.content) {
    showHUD("输入已保存")
  } else showHUD("输入已清空")
}

// 选择文本
const onPopupMenuOnSelection: eventHandler = ({ userInfo }) => {
  log("选中了文字", "action")
  // 选中文字不会触发矫正，所以可能是乱码
  if (profile.on && profile.selectTextOn) {
    const text = userInfo.documentController.selectionText
    if (text)
      copySearch({
        text,
      })
  }
}

let isClickCard = false
// 点击卡片会触发点击摘录，但是变成框架再点击就不会触发点击卡片，只会触发点击摘录，有点离谱
const onActiveDigestNote: eventHandler = async ({ userInfo }) => {
  log("点击了卡片", "action")
  isClickCard = true
  if (profile.on && profile.clickCardOn) {
    let note = getNoteById(userInfo.noteid)
    // 貌似这个事件可以取到点击的摘录，不过这里只需要主摘录
    note = note.groupNoteId ? getNoteById(note.groupNoteId) : note
    copySearch({
      note,
    })
  }
}

const onPopupMenuOnNote: eventHandler = ({ userInfo }) => {
  if (isClickCard) {
    isClickCard = false
    return
  }
  log("点击了摘录", "action")
  if (profile.on && profile.clickExcerptOn) {
    const note = <MbBookNote>userInfo.note
    // 必然存在一个，否则不可能存在此摘录
    const text = note.excerptText ?? note.noteTitle
    copySearch({
      text,
    })
  }
}

// 有关摘录处理的功能请直接开发 ohmymn 插件，避免冲突
const onProcessExcerptText: eventHandler = ({ userInfo }) => {}

export default {
  onButtonClick,
  onInputOver,
  onSwitchChange,
  onPopupMenuOnNote,
  onActiveDigestNote,
  onPopupMenuOnSelection,
}
