export type ClipboardHistoryRecord = {
    type: 'file' | 'image' | 'text',
    timestamp: number,
    files?: FileItem[],
    image?: string,
    text?: string,
    _isFav?: any,
}
