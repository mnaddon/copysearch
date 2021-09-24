import settingViewControllerInst from "settingViewController/main"
import { readProfile, saveProfile } from "utils/profile"
import { getObjCClassDeclar, log, showHUD } from "utils/common"
import { closePanel } from "./switchPanel"
import { eventCtrl } from "./handleReceivedEvent"
import { $name } from "addon"

const SettingViewController = JSB.defineClass(
  getObjCClassDeclar("SettingViewController", "UITableViewController"),
  settingViewControllerInst
)

/**
 * MN 的生命周期有点离谱，尤其是先关闭笔记本再关闭文档，
 * 如果直接关闭窗口，是不会触发关闭笔记本和文档的
 * 1. 启用插件
 * 2. 打开窗口
 * 3. 打开笔记本
 * 4. 打开文档
 * 5. 关闭笔记本
 * 6. 关闭文档
 * 7. 关闭窗口
 */

// 打开窗口，可以用来初始化
const sceneWillConnect = () => {
  log("打开窗口", "lifeCycle")
  self.studyController = Application.sharedInstance().studyController(
    self.window
  )
  self.settingViewController = new SettingViewController()
  self.settingViewController.window = self.window
}

// 关闭窗口，不会调用关闭笔记本和关闭文档的方法
// iPad 上貌似不触发，切换到后台可以
const sceneDidDisconnect = () => {
  log("关闭窗口", "lifeCycle")
  // 只要打开过文档，再关闭窗口就保存
  if (thisDocMd5) saveProfile(thisDocMd5, true)
}

// 打开笔记本
const notebookWillOpen = (notebookid: string) => {
  log("打开笔记本", "lifeCycle")
  self.notebookId = notebookid
  eventCtrl.add()
}

// 关闭笔记本
const notebookWillClose = (notebookid: string) => {
  log("关闭笔记本", "lifeCycle")
  eventCtrl.remove()
}

const documentDidOpen = (docmd5: string) => {
  // 如果 thisDocMd5 有值，说明是换书，反正不是第一次打开书，此时读取本文档配置
  if (thisDocMd5) {
    readProfile(docmd5)
  }
  // 如果 thisDocMd5 没有值，说明是刚打开 MN，此时读取所有配置
  else {
    readProfile(docmd5, true)
  }
  log("打开文档", "lifeCycle")
  thisDocMd5 = docmd5
}

// 关闭文档，为了在关闭 MN 时，也能保存文档的配置
export let thisDocMd5 = ""
const documentWillClose = (docmd5: string) => {
  log("关闭文档", "lifeCycle")
  saveProfile(docmd5)
  closePanel()
}

const addonDidConnect = () => {
  log("插件启用", "lifeCycle")
}

// 清空配置文件，如果出现问题可以关闭再打开插件开关，重启即可
const addonWillDisconnect = () => {
  log("插件停用", "lifeCycle")
  NSUserDefaults.standardUserDefaults().removeObjectForKey(
    `marginnote_${$name}_profile_global`
  )
  NSUserDefaults.standardUserDefaults().removeObjectForKey(
    `marginnote_${$name}_profile_doc`
  )
}

// 进入后台保存配置，适合 iPad 上
// 这里有一个巨离谱的 bug
const applicationDidEnterBackground = () => {
  log("应用进入后台", "lifeCycle")
  if (thisDocMd5) {
    saveProfile(thisDocMd5, true)
  }
}

const applicationWillEnterForeground = () => {
  log("应用进入前台", "lifeCycle")
}

export const clsMethons = {
  addonDidConnect,
  addonWillDisconnect,
  applicationDidEnterBackground,
  applicationWillEnterForeground,
}

export const InstMethods = {
  sceneWillConnect,
  sceneDidDisconnect,
  notebookWillOpen,
  notebookWillClose,
  documentDidOpen,
  documentWillClose,
}
