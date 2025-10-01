<script setup lang="ts">
import {computed, onMounted, ref, toRaw} from 'vue'
import RecordItem from "./components/RecordItem.vue";
import {ClipboardHistoryRecord} from "./type.ts";
import {Dialog} from "./lib/dialog.ts";

const container = ref<HTMLElement | null>(null)
const loading = ref(true)
const filterType = ref<'all' | 'text' | 'image' | 'file' | 'fav'>('all')
const records = ref<ClipboardHistoryRecord[]>([])
const favRecords = ref<ClipboardHistoryRecord[]>([])
const searchKeywords = ref('')
const filterFavRecords = computed(() => {
    return favRecords.value.filter(r => {
        if (!searchKeywords.value) {
            return true
        }
        if (r.type === 'text') {
            return r.text?.toLowerCase().includes(searchKeywords.value.toLowerCase())
        }
        return false
    })
})
const filterRecords = computed(() => {
    return records.value.filter(r => {
        if (filterType.value === 'all') {
            return true
        }
        if (filterType.value === 'text') {
            return r.type === 'text'
        }
        if (filterType.value === 'image') {
            return r.type === 'image'
        }
        if (filterType.value === 'file') {
            return r.type === 'file'
        }
        return true
    })
        .filter(r => {
            if (!searchKeywords.value) {
                return true
            }
            if (r.type === 'text') {
                return r.text?.toLowerCase().includes(searchKeywords.value.toLowerCase())
            }
            return false
        })
        .map(r => {
            return {
                ...r,
                _isFav: ((r) => {
                    return computed(() => favRecords.value.find(f => f.timestamp === r.timestamp))
                })(r)
            }
        })
})

const doLoad = async () => {
    records.value = (await focusany.listClipboardItems()) || []
    loading.value = false
}
const doLoadFav = async () => {
    favRecords.value = focusany.dbStorage.getItem('favRecords') || []
}
const doFilter = (type: 'all' | 'text' | 'image' | 'file' | 'fav') => {
    filterType.value = type
}
const doCopy = async (r: ClipboardHistoryRecord, option: {
    silence?: boolean,
    close?: boolean
}) => {
    option = Object.assign({
        silence: false,
        close: false
    }, option)
    switch (r.type) {
        case 'text':
            focusany.copyText(r.text as string)
            break
        case 'image':
            let image = r.image
            if (image?.startsWith('file://')) {
                image = image.replace('file://', '')
            }
            focusany.copyImage(image as string)
            break
        case 'file':
            if (r.files) {
                focusany.copyFile(r.files.map(f => f.path))
            } else {
                Dialog.tipError('文件内容不完整，无法复制')
            }
            break
    }
    if (!option.silence) {
        Dialog.tipSuccess('已复制')
    }
    if (option.close) {
        focusany.outPlugin()
    }
}
const doDelete = async (r: ClipboardHistoryRecord) => {
    await focusany.deleteClipboardItem(r.timestamp)
    doLoad().then()
    Dialog.tipSuccess('已删除')
}
const doDeleteFav = async (r: ClipboardHistoryRecord) => {
    favRecords.value = favRecords.value.filter(f => f.timestamp !== r.timestamp)
    focusany.dbStorage.setItem('favRecords', JSON.parse(JSON.stringify(toRaw(favRecords.value))))
    Dialog.tipSuccess('已删除')
}
const doFav = async (r: ClipboardHistoryRecord) => {
    if (favRecords.value.find(f => f.timestamp === r.timestamp)) {
        Dialog.tipError('已收藏')
        return
    }
    const rr = Object.assign({}, r, {
        _isFav: undefined
    })
    favRecords.value.unshift(toRaw(rr))
    focusany.dbStorage.setItem('favRecords', JSON.parse(JSON.stringify(toRaw(favRecords.value))))
    Dialog.tipSuccess('已收藏')
}
const doPaste = async (r: ClipboardHistoryRecord) => {
    if (r.type === 'text') {
        await focusany.activateLatestWindow()
        await focusany.simulate.typeString(r.text as string);
    }
}
const doMoreAction = async (key: string) => {
    if (key === 'clear') {
        if (filterType.value === 'fav') {
            Dialog.confirm('确定要清空所有收藏的内容？', async () => {
                favRecords.value = []
                focusany.dbStorage.setItem('favRecords', [])
                Dialog.tipSuccess('已清空')
            })
        } else {
            Dialog.confirm('确定要清空吗（不会清空收藏内容）？', async () => {
                await focusany.clearClipboardItems()
                await doLoad()
                Dialog.tipSuccess('已清空')
            })
        }
    }
}

onMounted(() => {
    doLoad().then()
    doLoadFav().then()
})

focusany.onPluginReady((data) => {
    console.log('onPluginReady', data)
    focusany.setSubInput((keywords) => {
        searchKeywords.value = keywords
    }, '搜索', false, true)
    focusany.detach.setTitle('')
    focusany.onPluginEvent('ClipboardChange', (data) => {
        console.log('ClipboardChange', data)
        doLoad().then()
    })
})


</script>

<template>
    <div class="border-t border-solid border-gray-300"
         ref="container"
         style="height:100vh;">
        <div
            class="fixed z-10 left-0 right-0 top-0 p-2 flex items-center bg-white border-b border-solid border-gray-300">
            <div class="flex-grow">
                <a-button size="small"
                          @click="doFilter('all')"
                          :type="filterType==='all'?'primary':'text'">
                    <template #icon>
                        <icon-file/>
                    </template>
                    全部
                </a-button>
                <a-button size="small"
                          @click="doFilter('text')"
                          :type="filterType==='text'?'primary':'text'">
                    <template #icon>
                        <icon-pen/>
                    </template>
                    文本
                </a-button>
                <a-button size="small"
                          @click="doFilter('image')"
                          :type="filterType==='image'?'primary':'text'">
                    <template #icon>
                        <icon-image/>
                    </template>
                    图片
                </a-button>
                <a-button size="small"
                          @click="doFilter('file')"
                          :type="filterType==='file'?'primary':'text'">
                    <template #icon>
                        <icon-file/>
                    </template>
                    文件
                </a-button>
                <a-button size="small"
                          @click="doFilter('fav')"
                          :type="filterType==='fav'?'primary':'text'">
                    <template #icon>
                        <icon-star/>
                    </template>
                    收藏
                </a-button>
            </div>
            <div>
                <a-dropdown position="bl" @select="doMoreAction as any">
                    <a-button size="small" type="text">
                        <template #icon>
                            <icon-more/>
                        </template>
                    </a-button>
                    <template #content>
                        <a-doption value="clear">清空</a-doption>
                    </template>
                </a-dropdown>
            </div>
        </div>
        <div class="h-14"></div>
        <div class="p-2">
            <div v-if="loading"
                 class="py-20 text-center">
                <a-spin/>
            </div>
            <div v-else-if="(filterType==='fav' && filterFavRecords.length===0) || filterRecords.length === 0"
                 class="py-20">
                <a-empty description="暂无记录"/>
            </div>
            <div v-else-if="filterType==='fav'">
                <div v-for="r in filterFavRecords" class="pb-3">
                    <RecordItem :is-fav="true"
                                @copy="doCopy(r,$event)"
                                @delete="doDeleteFav(r)"
                                @paste="doPaste(r)"
                                :item="r"/>
                </div>
            </div>
            <div v-else>
                <div v-for="r in filterRecords" class="pb-3">
                    <RecordItem :is-fav="false"
                                @copy="doCopy(r,$event)"
                                @delete="doDelete(r)"
                                @fav="doFav(r)"
                                @paste="doPaste(r)"
                                :item="r"/>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="less">
.arco-btn-size-small {
    padding: 0 5px !important;
    font-size: 12px !important;
}

.arco-btn {
    .arco-btn-icon {
        margin-right: 2px !important;
    }
}
</style>
