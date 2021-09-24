const profileType = {
    on: false,
    rightMode: false,
    selectTextOn: false,
    copyMode: false,
    clickCardOn: false,
    clickExcerptOn: false,
    titleLinkFirst: false,
    wordUrl: "eudic://dict/$&",
    sentenceUrl: "https://translate.google.com/?hl=zh-CN&sl=en&tl=zh-CN&text=$&&op=translate",
    defaultUrl: "https://cn.bing.com/search?q=$&",
    customUrl: "",
    customCopy: `"标题：{{title}}\\n内容：{{text}}\\n创建时间：{{createTime}}\\n链接：[{{title}}]({{link}})"`
}

const docProfileType = {
}

export type IProfile = typeof profileType
export type IProfile_doc = typeof docProfileType

const profile: { [k: string]: boolean | string } & IProfile = {
    ...profileType
}

const docProfile: IProfile_doc = {
    ...docProfileType
}

export { profile, docProfile }