<script setup lang="ts">
import {defineProps} from 'vue'
import FileExt from "./FileExt.vue";
import {ClipboardHistoryRecord} from "../type.ts";

const props = defineProps<{
    isFav: boolean,
    item: ClipboardHistoryRecord
}>()
const emit = defineEmits([
    'fav',
    'delete',
    'copy',
    'paste',
])
</script>

<template>
    <div
        class="pb-record-item group rounded-lg border-solid border-2 border-gray-100 hover:border-gray-300 select-none">
        <div class="flex items-center text-gray-400 text-xs mb-2 h-6 px-2 pt-1">
            <div class="mr-2">
                <span v-if="item.type==='text'">文本</span>
                <span v-else-if="item.type==='image'"><icon-image/></span>
                <span v-else-if="item.type==='file'"><icon-file/></span>
            </div>
            <div class="mr-2">
                <span v-if="item.type==='text'">{{ item.text?.length }}字符</span>
            </div>
            <div>
                <TimeAgo :datetime="item.timestamp*1000"></TimeAgo>
            </div>
            <div class="flex-grow text-right hidden group-hover:block">
                <a-tooltip content="输入文字">
                    <a-button size="mini" type="text"
                              @click="emit('paste')">
                        <template #icon>
                            <icon-edit/>
                        </template>
                    </a-button>
                </a-tooltip>
                <a-tooltip content="复制并关闭">
                    <a-button size="mini" type="text"
                              @click="emit('copy',{close:true})">
                        <template #icon>
                            <img src="./../assets/copy-and-close.svg"
                                 class="w-4 h-4 object-contain"/>
                        </template>
                    </a-button>
                </a-tooltip>
                <a-button size="mini" type="text"
                          @click="emit('copy')">
                    <template #icon>
                        <icon-copy/>
                    </template>
                </a-button>
                <a-button v-if="!props.isFav"
                          @click="emit('fav')"
                          size="mini"
                          type="text">
                    <template #icon>
                        <icon-star-fill v-if="item._isFav.value"/>
                        <icon-star v-else/>
                    </template>
                </a-button>
                <a-button size="mini" type="text"
                          @click="emit('delete')">
                    <template #icon>
                        <icon-delete/>
                    </template>
                </a-button>
            </div>
        </div>
        <div class="px-2 pb-2">
            <div v-if="item.type==='text'" class="whitespace-break-spaces break-all max-h-32 overflow-auto">
                {{ item.text }}
            </div>
            <div v-if="item.type==='image'">
                <img :src="item.image" class="mx-auto max-w-32 max-h-32 rounded-lg object-contain shadow-lg"/>
            </div>
            <div v-if="item.type==='file'">
                <div v-for="f in item.files"
                     class="flex items-center shadow rounded-lg p-1">
                    <div v-if="f.isFile" class="w-6 h-6 mr-2">
                        <FileExt :name="f.name"/>
                    </div>
                    <div v-else class="w-6 h-6 mr-2">
                        <FileExt isFolder name="f.path"/>
                    </div>
                    <div class="truncate">
                        <a-popover :title="f.name">
                            <a-button size="mini" style="width:100%;">{{ f.name }}</a-button>
                            <template #content>
                                <p>{{ f.path }}</p>
                            </template>
                        </a-popover>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

