<script setup lang="ts">
import {ref} from "vue";
import {mods, ModInfo} from "../modinfo";
import levenshtein from "js-levenshtein";

const selectedServer = ref<string | null>(null)
const servers: Array<string> = mods.flatMap(info => info.server ?? []).filter((v, i, a) => a.indexOf(v) === i)

const foundMod = ref<ModInfo | undefined | null>(null)
const url = ref('')

const getStatusIcon = (info: ModInfo) => {
  switch (info.status) {
    case 'allowed':
      return 'mdi-checkbox-marked-circle'
    case 'disallowed':
      return 'mdi-close'
    case 'partially_allowed':
      return 'mdi-alert'
    case 'unknown':
      return 'mdi-minus-circle'
  }
}

const getStatusColor = (info: ModInfo) => {
  switch (info.status) {
    case 'allowed':
      return 'green'
    case 'disallowed':
      return 'red'
    case 'partially_allowed':
      return 'orange'
    case 'unknown':
      return 'grey'
  }
}

const onCheckButton = () => {
  // extract modrinth or curseforge id from url
  if (!url.value) {
    return
  }
  let matches: Array<ModInfo> = mods.filter(mod => mod.url === url.value)
  const modrinthMatch = url.value.match(/modrinth\.com\/mod\/([^/]+)/)
  const curseforgeMatch = url.value.match(/curseforge\.com\/minecraft\/mc-mods\/([^/]+)/)
  if (matches.length === 0) {
    if (modrinthMatch !== null) {
      const modrinthId = modrinthMatch[1]
      matches = mods.filter(mod => mod.modrinth === modrinthId)
    } else if (curseforgeMatch !== null) {
      const curseforgeId = curseforgeMatch[1]
      matches = mods.filter(mod => mod.curseforge === curseforgeId)
    }
  }
  if (matches.length === 0) {
    matches =
        [...mods]
            .sort((a, b) => levenshtein(a.name, url.value) - levenshtein(b.name, url.value))
            .filter((e, _i, a) => e.name === a[0].name)
  }
  // check server
  if (!selectedServer.value) {
    foundMod.value = matches.find(mod => typeof mod.server === 'undefined')
  } else {
    foundMod.value =
        matches.find(mod => (mod.server ?? []).some(server => selectedServer.value === server))
            ?? matches.find(mod => typeof mod.server === 'undefined')
  }
}

const getFilteredMods = () => {
  if (!selectedServer.value) return mods
  const names = mods.map(e => e.name).filter((e, i, a) => a.indexOf(e) === i)
  const newMods = new Array<ModInfo>()
  for (const name of names) {
    const mod =
        mods.find(e => e.name === name && (e.server ?? []).some(server => selectedServer.value === server))
            ?? mods.find(e => e.name === name && typeof e.server === 'undefined')
    if (mod) {
      newMods.push(mod)
    }
  }
  return newMods
}
</script>

<template>
  <v-card
    prepend-icon="mdi-information"
    title="「サーバーで絞り込む」を活用してください"
    color="blue"
  >
    <v-card-text>
      「サーバーで絞り込む」を使うことで、特定のサーバーでのModの許可状況を確認できます。
      「全体」（デフォルト）のままにすると、たとえばLGW2では許可されていないのに全体だと許可されているのでLGW2でも許可されていると思い込んでいた、ということが起こり得ます。
    </v-card-text>
  </v-card>
  <v-form @submit.prevent="onCheckButton">
    <v-combobox
        v-model="selectedServer"
        :items="servers"
        label="サーバーで絞り込む (デフォルト: 全体)"
        prepend-icon="mdi-filter-variant"
        variant="solo"
        chips
        clearable
    >
      <!-- @vue-ignore -->
      <template v-slot:selection="{ attrs, item, select, selected }">
        <v-chip
            v-bind="attrs"
            :model-value="selected"
            closable
            @click="select"
        >
          <strong>{{ item }}</strong>
        </v-chip>
      </template>
    </v-combobox>
    <v-text-field v-model="url" placeholder="Modの名前またはURL"></v-text-field>
    <v-btn type="submit" block color="green">チェック</v-btn>
  </v-form>
  <div v-if="foundMod" class="d-flex flex-wrap justify-center">
    <v-card class="margin-10px fixed-width-360">
      <v-img :src="foundMod.icon" height="360px" width="360px" style="align-self: center;"></v-img>
      <v-card-title>{{ foundMod.name }}<v-icon :color="getStatusColor(foundMod)" :icon="getStatusIcon(foundMod)"></v-icon></v-card-title>
      <v-card-subtitle v-if="typeof foundMod.server === 'undefined'">サーバー: <v-chip>全体</v-chip></v-card-subtitle>
      <v-card-subtitle v-else>サーバー: <v-chip v-for="server in foundMod.server" :key="server">{{ server }}</v-chip></v-card-subtitle>
      <v-card-text style="text-align: left">
        <template v-if="typeof foundMod.version !== 'undefined'">
          <p><u>対象バージョン: {{ foundMod.version }}</u></p>
          <br />
        </template>
        <p v-if="foundMod.status === 'allowed'">このModは許可されています。</p>
        <p v-else-if="foundMod.status === 'disallowed'">このModは許可されていません。(処罰対象となります)</p>
        <p v-else-if="foundMod.status === 'partially_allowed'">このModは一部機能のみ許可されているか、一部機能が禁止されています。</p>
        <p v-else>このModはまだレビューされていません。</p>
        <template v-if="foundMod.note">
          <br />
          <v-divider />
          <br />
          <p v-html="foundMod.note.replace(/\r\n|\r|\n/g, '<br>')"></p>
        </template>
        <br />
        <v-divider />
        <br />
        <ul>
          <li v-if="typeof foundMod.url !== 'undefined'">
            <a :href="foundMod.url" target="_blank">
              Modリンク
              <v-icon icon="mdi-open-in-new"></v-icon>
            </a>
          </li>
          <li v-if="typeof foundMod.modrinth !== 'undefined'">
            <a :href="`https://modrinth.com/mod/${foundMod.modrinth}`" target="_blank">
              Modrinth
              <v-icon icon="mdi-open-in-new"></v-icon>
            </a>
          </li>
          <li v-if="typeof foundMod.curseforge !== 'undefined'">
            <a :href="`https://www.curseforge.com/minecraft/mc-mods/${foundMod.curseforge}`" target="_blank">
              CurseForge
              <v-icon icon="mdi-open-in-new"></v-icon>
            </a>
          </li>
        </ul>
      </v-card-text>
    </v-card>
  </div>
  <br />
  <v-divider />
  <br />
  <div class="d-flex flex-wrap justify-center">
    <v-card
        v-for="(info, index) in getFilteredMods()"
        :key="index"
        class="margin-10px fixed-width-360"
    >
      <v-img style="cursor: pointer; align-self: center;" :src="info.icon" height="360px" width="360px" @click="foundMod = info"></v-img>
      <v-card-title style="cursor: pointer;" @click="foundMod = info">
        <span style="text-decoration: underline;">{{ info.name }}</span>
        <v-icon :color="getStatusColor(info)" :icon="getStatusIcon(info)"></v-icon>
      </v-card-title>
      <v-card-subtitle v-if="typeof info.server === 'undefined'">サーバー: <v-chip>全体</v-chip></v-card-subtitle>
      <v-card-subtitle v-else>サーバー: <v-chip v-for="server in info.server" :key="server">{{ server }}</v-chip></v-card-subtitle>
      <v-card-text style="text-align: left">
        <p v-if="typeof info.version !== 'undefined'"><u>対象バージョン: {{ info.version }}</u></p>
        <br />
        <ul>
          <li v-if="typeof info.url !== 'undefined'">
            <a :href="info.url" target="_blank">
              Modリンク
              <v-icon icon="mdi-open-in-new"></v-icon>
            </a>
          </li>
          <li v-if="typeof info.modrinth !== 'undefined'">
            <a :href="`https://modrinth.com/mod/${info.modrinth}`" target="_blank">
              Modrinth
              <v-icon icon="mdi-open-in-new"></v-icon>
            </a>
          </li>
          <li v-if="typeof info.curseforge !== 'undefined'">
            <a :href="`https://www.curseforge.com/minecraft/mc-mods/${info.curseforge}`" target="_blank">
              CurseForge
              <v-icon icon="mdi-open-in-new"></v-icon>
            </a>
          </li>
        </ul>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.margin-10px {
  margin: 10px;
}

.fixed-width-360 {
  width: 360px;
}
</style>
