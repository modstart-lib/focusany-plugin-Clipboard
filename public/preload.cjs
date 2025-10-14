const pasteHistory = async (index) => {
    const clipboardRecords = await focusany.listClipboardItems({limit: 10})
    if (clipboardRecords.length === 0) {
        focusany.showToast('没有剪贴板记录')
        return
    }
    index = Math.max(0, index)
    index = Math.min(index, clipboardRecords.length - 1)
    const record = clipboardRecords[index]
    const texts = [];
    if (record.type === 'text') {
        texts.push(record.text)
    } else {
        texts.push(`[剪切板]${record.type}`)
    }
    focusany.simulate.typeString(texts.join(''));
}

window.focusanyApi = {
    typeString(text) {
        focusany.simulate.typeString(text);
    }
}

window.exports = {
    "code": {
        "paste-1": async (data) => {
            pasteHistory(0)
        },
        "paste-2": async (data) => {
            pasteHistory(1)
        },
        "paste-3": async (data) => {
            pasteHistory(2)
        },
        "paste-4": async (data) => {
            pasteHistory(3)
        },
        "paste-5": async (data) => {
            pasteHistory(4)
        }
    }
}
