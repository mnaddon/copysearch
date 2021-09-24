import mnaddon from "../../mnaddon.json"
const $name = mnaddon.addonid.split(".")[2]

const log = (obj: any, suffix = "normal") => {
  JSB.log(`${$name}-${suffix} %@`, obj)
}

const showHUD = (message: string, duration: number = 1) => {
  Application.sharedInstance().showHUD(message, self.window, duration)
}

const alert = (message: string) => {
  Application.sharedInstance().alert(message)
}

const getObjCClassDeclar = (
  name: string,
  type: string,
  delegate: Array<string> = []
) => {
  let str: string = `${$name} : ${type}`
  // 可以不用写 delegate 协议名
  if (delegate.length) {
    delegate.forEach(value => {
      str = `${str} ${value}Delegate`
    })
  }
  return str
}

const delay = (sec: number) => {
  return new Promise(resolve =>
    NSTimer.scheduledTimerWithTimeInterval(sec, false, resolve)
  )
}

const delayBreak = async (
  times: number,
  sec: number,
  f: () => boolean
): Promise<boolean> => {
  for (let i = 0; i < times; i++) {
    await delay(sec)
    if (f()) return true
  }
  return false
}

const openUrl = (url: string) => {
  Application.sharedInstance().openURL(NSURL.URLWithString(encodeURI(url)))
}

const postNotification = (key: string, userInfo: any) => {
  NSNotificationCenter.defaultCenter().postNotificationNameObjectUserInfo(
    key,
    self,
    userInfo
  )
}

export {
  log,
  showHUD,
  alert,
  getObjCClassDeclar,
  delay,
  delayBreak,
  openUrl,
  postNotification,
}
