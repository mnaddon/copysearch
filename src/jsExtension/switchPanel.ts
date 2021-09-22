import { profile } from "profile";
import { delay, delayBreak, log, showHUD } from "utils/common";
import mnaddon from "../../mnaddon.json"

// 面板状态
let panelStatus = false

// 设置窗口面板的位置和大小
export const layoutViewController = () => {
    let frame = self.studyController.view.bounds
    let width = 300
    if (profile.rightMode) {
        self.settingViewController.view.frame = { x: frame.width - width - 50, y: 110, width: width, height: 450 }
    } else {
        self.settingViewController.view.frame = { x: 50, y: 110, width: width, height: 450 }
    }
}

export const closePanel = () => {
    if (panelStatus) {
        self.settingViewController.view.removeFromSuperview()
        panelStatus = false;
    }
}

const openPanel = async () => {
    if (!panelStatus) {
        self.studyController.view.addSubview(self.settingViewController.view)
        panelStatus = true;
        // 开启面板时，若键盘处于开启状态，关闭键盘
        await delay(0.2)
        self.studyController.becomeFirstResponder()
    }
}

// 双击打开面板，单击打开总开关
let isWaiting = false
let isClicked = false
const switchPanel = async () => {
    if (isWaiting) {
        isClicked = true
        return
    }
    isWaiting = true
    const success = await delayBreak(25, 0.01, () => isClicked)
    if (success) {
        log("双击", "switch")
        isClicked = false
        panelStatus ? closePanel() : openPanel()
    } else {
        log("单击", "switch")
        profile.on = !profile.on
        profile.on ? (profile.copyMode ?
            showHUD(`${mnaddon.title} 已打开，当前处于 Copy 模式`) :
            showHUD(`${mnaddon.title} 已打开，当前处于 Search 模式`)) :
            showHUD(`${mnaddon.title} 已关闭`)
        self.studyController.refreshAddonCommands()
    }
    isWaiting = false
}

// addSubview 的时候会执行，也就是打开操作面板的时候
const controllerWillLayoutSubviews = (controller: UIViewController) => {
    if (controller == self.studyController)
        layoutViewController()
}

const queryAddonCommandStatus = () => {
    const mode = Application.sharedInstance().studyController(self.window).studyMode
    // 复习模式下不显示图标
    if (mode < studyMode.review)
        return {
            image: "logo.png",
            object: self,
            selector: "switchPanel:",
            checked: profile.on ? true : false,
        };
    return null
}

export default {
    queryAddonCommandStatus,
    switchPanel,
    controllerWillLayoutSubviews
}
