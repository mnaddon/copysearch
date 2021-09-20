const profileType = {
    on: false,
    rightMode: false,
    selectTextOn: false,
    copyMode: false,
    clickCardOn: false,
    clickExcerptOn: false,
    titleLinkFirst: false,
    wordUrl: "https://cn.bing.com/dict/search?q=$&",
    sentenceUrl: "https://translate.google.com/?hl=zh-CN&sl=en&tl=zh-CN&text=$&&op=translate",
    defaultUrl: "https://cn.bing.com/search?q=$&",
    customUrl: "",
    customCopy: "%title"
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