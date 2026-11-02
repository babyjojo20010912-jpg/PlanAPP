import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(url && anonKey && !url.includes('your-project'))

// 即使未配置也创建一个客户端占位，避免渲染层到处做空值判断；
// 实际发起请求前会先检查 supabaseConfigured。
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key'
)
