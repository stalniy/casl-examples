import Vue, { VueConstructor } from 'vue';
import { AppAbility } from './config/ability';

export interface AppVue extends Vue {
  $ability: AppAbility
}

export default Vue as VueConstructor<AppVue>;
