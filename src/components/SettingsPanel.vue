<script setup lang="ts">
import { ref } from 'vue'
import { useSettings } from '../composables/useSettings'
import { userEmail, syncing, syncError, signInWithMagicLink, signOut, syncNow } from '../composables/useSupabaseSync'
import { supabaseConfigured } from '../lib/supabase'

const emit = defineEmits<{ (e: 'close'): void }>()
const { settings, update } = useSettings()

const emailInput = ref('')
const magicLinkSent = ref(false)

async function sendMagicLink() {
  if (!emailInput.value.trim()) return
  await signInWithMagicLink(emailInput.value.trim())
  magicLinkSent.value = true
}
</script>

<template>
  <div class="no-drag absolute inset-0 z-10 flex flex-col rounded-[1.75rem] bg-black/55 p-4 backdrop-blur-xl">
    <div class="flex items-center justify-between pb-3">
      <span class="text-[13px] font-semibold text-white/90">设置</span>
      <button class="icon-btn" @click="emit('close')">
        <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <div class="flex-1 space-y-4 overflow-y-auto text-[12px] text-white/80">
      <label class="flex items-center justify-between">
        <span>开机自动启动</span>
        <input
          type="checkbox"
          :checked="settings.autoLaunch"
          @change="update({ autoLaunch: ($event.target as HTMLInputElement).checked })"
        />
      </label>

      <label class="flex items-center justify-between">
        <span>默认置顶显示</span>
        <input
          type="checkbox"
          :checked="settings.alwaysOnTop"
          @change="update({ alwaysOnTop: ($event.target as HTMLInputElement).checked })"
        />
      </label>

      <div class="border-t border-white/10 pt-3">
        <p class="mb-2 font-medium text-white/90">云同步</p>

        <template v-if="!supabaseConfigured">
          <p class="text-white/50">
            尚未配置 Supabase，请在项目根目录创建 .env 文件并填写 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 后重启应用。
          </p>
        </template>

        <template v-else-if="userEmail">
          <p>已登录：{{ userEmail }}</p>
          <div class="mt-2 flex gap-2">
            <button
              class="flex-1 rounded-xl bg-sky-500 py-1.5 text-white transition-colors hover:bg-sky-400 disabled:opacity-50"
              :disabled="syncing"
              @click="syncNow"
            >
              {{ syncing ? '同步中…' : '立即同步' }}
            </button>
            <button class="flex-1 rounded-xl bg-white/10 py-1.5 hover:bg-white/15" @click="signOut">退出登录</button>
          </div>
          <p v-if="syncError" class="mt-1 text-rose-400">{{ syncError }}</p>
        </template>

        <template v-else>
          <input
            v-model="emailInput"
            type="email"
            placeholder="邮箱地址"
            class="w-full rounded-xl bg-white/10 px-3 py-2 text-white placeholder-white/40 outline-none focus:bg-white/15"
          />
          <button
            class="mt-2 w-full rounded-xl bg-sky-500 py-1.5 text-white transition-colors hover:bg-sky-400"
            @click="sendMagicLink"
          >
            发送登录链接
          </button>
          <p v-if="magicLinkSent" class="mt-1 text-emerald-400">登录链接已发送，请查收邮箱并点击确认</p>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  color: rgba(255, 255, 255, 0.7);
}
.icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.12);
}
</style>
