import { utils } from "addon"
import { profile } from "profile"
import { openUrl, showHUD } from "utils/common"

const copySearch = ({ text, note }: { text?: string, note?: MbBookNote }) => {
    if (profile.copyMode) {
        const pasteBoard = UIPasteboard.generalPasteboard()
        if (text)
            pasteBoard.string = text.trim()
        // 卡片信息
        else if (note && profile.customCopy)
            pasteBoard.string = utils.getCustomText(note)
        return
    }
    if (text) {
        const url = utils.getUrl(text.trim())
        if (url) openUrl(url)
    } else if (note) {
        let title = note.noteTitle
        if (title) {
            if (profile.titleLinkFirst && /[;；]/.test(title))
                title = title.split(/\s?[;；]\s?/)[0]
            const url = utils.getUrl(title.trim())
            if (url) openUrl(url)
        } else showHUD("没有标题")
    }
}

export default copySearch