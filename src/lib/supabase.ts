import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vpdzveomghygjfjtfrof.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZHp2ZW9tZ2h5Z2pmanRmcm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTE2MzgsImV4cCI6MjA3NjE4NzYzOH0.no2OP6vZ8pIFPzTLCS-y-bZcIhSvdUyzxHM7MyXItcM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  email: string
  first_name: string
  last_name: string
  birth_date: string
  birth_time: string
  city: string
  gender: string
  coins: number
  total_coins_earned: number
  total_coins_spent: number
  last_daily_bonus: string | null
  profile_photo: string | null
  created_at: string
  updated_at: string
}

export type Fortune = {
  id: string
  user_id: string
  fortune_text: string
  fortune_teller_id: number
  fortune_teller_name: string
  fortune_teller_emoji: string
  fortune_teller_cost: number
  images: any
  created_at: string
}

export type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
}
