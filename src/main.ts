import { createApp } from 'vue'
import router from "./router.ts";

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import './style.css'
import App from './App.vue'

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'dark'
    },
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },
})

createApp(App).use(vuetify).use(router).mount('#app')
