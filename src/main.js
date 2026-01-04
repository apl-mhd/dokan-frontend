import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'  // <-- Import icons
import { createPinia } from 'pinia'


const pinia = createPinia()
createApp(App).use(router).use(pinia).mount('#app')
