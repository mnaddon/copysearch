const genSection = (config: IConfig): ISection => {
  const rows: Array<IRow> = []
  if (config.intro)
    rows.push({
      type: cellViewType.plainText,
      label: config.intro,
      link: config.link ?? ""
    })
  for (const setting of config.settings) {
    // magicaction 的 help 显示在弹窗上
    if (setting.help && config.name.toLowerCase() != "magicaction")
      rows.push(
        {
          type: cellViewType.plainText,
          label: setting.help,
          link: setting.link ?? ""
        },
        setting
      )
    else rows.push(setting)
  }
  return {
    header: config.name,
    rows
  }
}

const genDataSource = (
  configs: IConfig[],
  actionInfo: {
    name?: string
    intro?: string
    link?: string
  }
): Array<ISection> => {
  const dataSource: Array<ISection> = []
  const magicaction: IConfig = {
    name: actionInfo.name ?? "MagicActon",
    intro: actionInfo.intro ?? "",
    link: actionInfo.link,
    settings: [],
    actions: []
  }
  for (let config of configs) {
    dataSource.push(genSection(config))
    if (config.actions?.length) {
      for (let action of config.actions) magicaction.actions!.push(action)
    }
  }
  if (magicaction.actions?.length) {
    magicaction.settings = magicaction.actions!.sort(
      (a: ISetting, b: ISetting) => {
        const val1 = a.label!.length
        const val2 = b.label!.length
        return val1 - val2
      }
    )
    // magicaction 默认放在最上面。
    dataSource.splice(0, 0, genSection(magicaction))
  }

  // 最后加块空白，防止被键盘遮挡，按理说输入框会自动上移了，但现在不知道为啥不行了
  dataSource[dataSource.length - 1].rows.push({
    type: cellViewType.button,
    key: "space",
    label: ""
  })

  return dataSource
}

export default genDataSource
