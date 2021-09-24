declare interface ReplaceParam {
  regexp: RegExp
  newSubStr: string
  fnKey: number
}

/**
 * 解析自定义输入为 replace 的参数
 */
const string2ReplaceParam = (text: string): ReplaceParam[] => {
  const brackets = text
    .replace(/\)\s*;/g, ")delimiter")
    .split("delimiter")
    .map(item => item.trim())
  const willReturn = []
  for (const bracket of brackets) {
    const tmp = bracket
      .substring(1, bracket.length - 1)
      .replace(/(\/[gi]{0,2})\s*,/g, "$1delimiter")
      .replace(/"\s*,/g, '"delimiter')
      .split("delimiter")
      .map(item => item.trim())
    const [regString, newSubStr, fnKey] = tmp
    if (fnKey && isNaN(Number(fnKey))) throw new Error("")
    const regParts = regString.match(/^\/(.*?)\/([gim]*)$/)
    let regexp = null
    if (regParts) regexp = new RegExp(regParts[1], regParts[2])
    else regexp = new RegExp(regString)
    // 反转义
    const parsing = JSON.parse(`{ "key": ${newSubStr} }`)
    willReturn.push({
      regexp,
      newSubStr: parsing.key,
      fnKey: fnKey ? Number(fnKey) : 0
    })
  }
  return willReturn
}

/**
 * 检查输入正确
 */
const checkInputCorrect = (text: string, key: string): boolean => {
  try {
    switch (key) {
      case "customUrl":
        const params = string2ReplaceParam(text)
        for (const item of params) {
          "test".replace(item.regexp, item.newSubStr)
        }
        break
      case "customCopy":
        JSON.parse(`{"text": ${text}}`).text
        break
      default:
        if (!text.includes("$&")) throw new Error("")
        break
    }
  } catch {
    return false
  }
  return true
}

export { string2ReplaceParam, checkInputCorrect }
