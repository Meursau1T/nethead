import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import "primeicons/primeicons.css"
import { 
  FASTDesignSystemProvider,
  FASTCard,
  FASTButton,
  FASTTextField,
} from '@microsoft/fast-components';
        
createApp(App)
    .use(store)
    .component('FASTDesignSystemProvider',FASTDesignSystemProvider)
    .component('FASTCard',FASTCard)
    .component('FASTButton',FASTButton)
    .component('FASTTextField',FASTTextField)
    .mount('#app')
