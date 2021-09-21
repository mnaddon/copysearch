import { $name, dataSource } from "addon"
import { log, showHUD } from "utils/common"
import { profile, docProfile, IProfile, IProfile_doc } from "profile"

// 读配置包含两种情况
// 1.刚打开一个笔记本，读两个配置文件，然后合并
// 2.切换文档，只需要读取 doc 配置

const profile_doc: { [k: string]: IProfile_doc } = {}
const reset = { ...docProfile }

const refreshDocDataSource = (docProfile: IProfile_doc) => {
    for (const section of dataSource) {
        if (section.header == "MagicAction") continue
        for (const row of section.rows) {
            const key = <keyof IProfile_doc>row.key
            if (key && docProfile[key] != undefined) {
                switch (row.type) {
                    case cellViewType.switch:
                        row.status = <boolean>docProfile[key]
                        break
                    case cellViewType.input:
                    case cellViewType.inlineInput:
                        row.content = <string>docProfile[key]
                        break
                }
            }
        }
    }
}

export const readProfile = (docmd5: string, readAll = false) => {
    if (readAll) {
        let tmp_global = NSUserDefaults.standardUserDefaults()
            .objectForKey(`marginnote_${$name}_profile_global`)
        if (tmp_global) Object.assign(profile, JSON.parse(tmp_global))
        for (const section of dataSource) {
            if (section.header == "MagicAction") continue
            for (const row of section.rows) {
                switch (row.type) {
                    case cellViewType.switch:
                        row.status = <boolean>profile[row.key!]
                        break;
                    case cellViewType.input:
                    case cellViewType.inlineInput:
                        row.content = <string>profile[row.key!]
                }
            }
        }
    }
    let tmp_doc = NSUserDefaults.standardUserDefaults()
        .objectForKey(`marginnote_${$name}_profile_doc`)
    if (tmp_doc && JSON.parse(tmp_doc)[docmd5]) {
        Object.assign(profile, JSON.parse(tmp_doc)[docmd5])
        Object.assign(profile_doc, JSON.parse(tmp_doc))
        refreshDocDataSource(JSON.parse(tmp_doc)[docmd5])
        log("检测到配置，正在读取", "profile")
        log(JSON.parse(tmp_doc)[docmd5], "profile")
    } else {
        // 如果当前文档没有，就用默认值
        Object.assign(profile, reset)
        log("当前文档第一次打开，使用默认值", "profile")
        refreshDocDataSource(reset)
    }
}

// 切换的时候仅保存当前文档的，退出的时候全部保存
export const saveProfile = (docmd5: string, saveAll = false) => {
    const thisDocProfile: IProfile_doc = { ...docProfile }
    Object.keys(reset).forEach((key: string) => {
        //@ts-ignore
        thisDocProfile[key] = profile[key]
    })
    NSUserDefaults.standardUserDefaults().setObjectForKey(
        JSON.stringify(Object.assign(profile_doc, { [docmd5]: thisDocProfile })),
        `marginnote_${$name}_profile_doc`)
    log("保存文档配置", "profile")
    log(thisDocProfile, "profile")
    if (saveAll) {
        log("保存全部配置", "profile")
        NSUserDefaults.standardUserDefaults().setObjectForKey(
            JSON.stringify(profile), `marginnote_${$name}_profile_global`)
    }
}