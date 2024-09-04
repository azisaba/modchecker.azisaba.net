<script setup lang="ts">
import {ref} from "vue";

type ModInfo = {
  name: string;
  url?: string;
  modrinth?: string;
  curseforge?: string;
  version?: string;
  icon?: string;
  status: 'allowed' | 'disallowed' | 'partially_allowed' | 'unknown';
  note?: string;
  server?: Array<string>;
}

const mods: Array<ModInfo> = [
  {
    name: 'Fabric API',
    modrinth: 'fabric-api',
    curseforge: 'fabric-api',
    icon: 'https://cdn.modrinth.com/data/P7dR8mSH/icon.png',
    status: 'allowed',
  },
  {
    name: 'Litematica',
    modrinth: 'litematica',
    curseforge: 'litematica',
    icon: 'https://cdn.modrinth.com/data/bEpr0Arc/25b5529d7a3b030ac136a6ce879d8ed2a1aa4a8d.png',
    status: 'partially_allowed',
    note: 'Easy Place Modeは処罰対象です。',
  },
  {
    name: 'Litematica Printer',
    modrinth: 'litematica-printer',
    icon: 'https://cdn.modrinth.com/data/3llatzyE/c71a268626b7a5413c68b47445327f5c948a2731.jpeg',
    status: 'disallowed',
  },
  {
    name: 'Inventory Tweaks',
    curseforge: 'inventory-tweaks',
    icon: 'https://media.forgecdn.net/avatars/thumbnails/9/423/256/256/635428742381702656.png',
    status: 'disallowed',
  },
  {
    name: 'Inventory Tweaks ReFoxed',
    curseforge: 'inventory-tweaks-refoxed',
    icon: 'https://media.forgecdn.net/avatars/thumbnails/951/92/256/256/638440158830430802.png',
    status: 'disallowed',
  },
  {
    name: 'U Team Core',
    curseforge: 'u-team-core',
    icon: 'https://media.forgecdn.net/avatars/thumbnails/108/684/256/256/636374315485450120.png',
    status: 'allowed',
  },
  {
    name: 'Music Player',
    curseforge: 'music-player',
    icon: 'https://media.forgecdn.net/avatars/thumbnails/154/699/256/256/636627791026604222.png',
    status: 'allowed',
  },
  {
    name: 'InterChatMod',
    url: 'https://github.com/AzisabaNetwork/InterChatMod',
    status: 'allowed',
  },
]

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
  // check server
  if (!selectedServer.value) {
    foundMod.value = matches.find(mod => typeof mod.server === 'undefined')
  } else {
    foundMod.value =
        matches.find(mod => (mod.server ?? []).some(server => selectedServer.value === server))
            ?? matches.find(mod => typeof mod.server === 'undefined')
  }
  if (!foundMod.value) {
    foundMod.value = {
      name: (modrinthMatch ?? curseforgeMatch ?? [])[1] ?? url.value,
      modrinth: (modrinthMatch ?? [])[1],
      curseforge: (curseforgeMatch ?? [])[1],
      status: 'unknown',
    }
  }
}
</script>

<template>
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
    <v-text-field v-model="url" placeholder="ModのURL"></v-text-field>
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
          <pre>{{ foundMod.note }}</pre>
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
        v-for="info in mods"
        :key="info.name"
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
