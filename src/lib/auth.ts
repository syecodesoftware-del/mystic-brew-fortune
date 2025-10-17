import { supabase, type User } from './supabase'
import bcrypt from 'bcryptjs'

export type { User }
export type { Fortune } from './supabase'

export const registerUser = async (userData: {
  firstName: string
  lastName: string
  email: string
  password: string
  birthDate: string
  birthTime: string
  city: string
  gender: string
}) => {
  try {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', userData.email.toLowerCase())
      .single()
    
    if (existing) {
      throw new Error('Bu e-posta adresi zaten kayıtlı')
    }
    
    const passwordHash = await bcrypt.hash(userData.password, 10)
    
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: userData.email.toLowerCase(),
        password_hash: passwordHash,
        first_name: userData.firstName,
        last_name: userData.lastName,
        birth_date: userData.birthDate,
        birth_time: userData.birthTime,
        city: userData.city,
        gender: userData.gender,
        coins: 50,
        total_coins_earned: 50,
        total_coins_spent: 0
      })
      .select()
      .single()
    
    if (error) throw error
    
    localStorage.setItem('falcan_user_id', user.id)
    
    return { success: true, user }
  } catch (error: any) {
    console.error('Register error:', error)
    return { success: false, error: error.message }
  }
}

export const loginUser = async (email: string, password: string) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()
    
    if (error || !user) {
      throw new Error('E-posta veya şifre hatalı')
    }
    
    const isValid = await bcrypt.compare(password, user.password_hash)
    
    if (!isValid) {
      throw new Error('E-posta veya şifre hatalı')
    }
    
    localStorage.setItem('falcan_user_id', user.id)
    
    return { success: true, user }
  } catch (error: any) {
    console.error('Login error:', error)
    return { success: false, error: error.message }
  }
}

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userId = localStorage.getItem('falcan_user_id')
    
    if (!userId) {
      console.log('No user ID in localStorage')
      return null
    }
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Get user error:', error)
      localStorage.removeItem('falcan_user_id')
      return null
    }
    
    if (!user) {
      console.log('User not found in database')
      localStorage.removeItem('falcan_user_id')
      return null
    }
    
    return user
  } catch (error) {
    console.error('Get user exception:', error)
    return null
  }
}

export const logoutUser = () => {
  localStorage.removeItem('falcan_user_id')
  window.location.href = '/login'
}

export const updateCoins = async (userId: string, amount: number, type: 'earn' | 'spend') => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('coins, total_coins_earned, total_coins_spent')
      .eq('id', userId)
      .single()
    
    if (!user) throw new Error('User not found')
    
    const updates: any = {
      coins: user.coins + (type === 'earn' ? amount : -amount),
      updated_at: new Date().toISOString()
    }
    
    if (type === 'earn') {
      updates.total_coins_earned = user.total_coins_earned + amount
    } else {
      updates.total_coins_spent = user.total_coins_spent + amount
    }
    
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
    
    if (error) throw error
    
    return { success: true }
  } catch (error: any) {
    console.error('Update coins error:', error)
    return { success: false, error: error.message }
  }
}

export const checkCoinsAndDeduct = async (userId: string, amount: number) => {
  try {
    const user = await getCurrentUser()
    if (!user) return false
    
    if (user.coins < amount) {
      return false
    }
    
    const result = await updateCoins(userId, amount, 'spend')
    return result.success
  } catch (error) {
    console.error('Check coins error:', error)
    return false
  }
}

export const refundCoins = async (userId: string, amount: number) => {
  return updateCoins(userId, amount, 'earn')
}

export const addCoins = async (userId: string, amount: number) => {
  return updateCoins(userId, amount, 'earn')
}

export const saveFortune = async (fortuneData: {
  userId: string
  fortuneText: string
  fortuneTellerId: number
  fortuneTellerName: string
  fortuneTellerEmoji: string
  fortuneTellerCost: number
  images?: any
}) => {
  try {
    const { data, error } = await supabase
      .from('fortunes')
      .insert({
        user_id: fortuneData.userId,
        fortune_text: fortuneData.fortuneText,
        fortune_teller_id: fortuneData.fortuneTellerId,
        fortune_teller_name: fortuneData.fortuneTellerName,
        fortune_teller_emoji: fortuneData.fortuneTellerEmoji,
        fortune_teller_cost: fortuneData.fortuneTellerCost,
        images: fortuneData.images || null
      })
      .select()
      .single()
    
    if (error) throw error
    
    return { success: true, fortune: data }
  } catch (error: any) {
    console.error('Save fortune error:', error)
    return { success: false, error: error.message }
  }
}

export const getUserFortunes = async (userId: string) => {
  try {
    const { data: fortunes, error } = await supabase
      .from('fortunes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return fortunes || []
  } catch (error) {
    console.error('Get fortunes error:', error)
    return []
  }
}

export const createNotification = async (userId: string, title: string, message: string, type: string = 'info') => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type
      })
    
    if (error) throw error
    
    return { success: true }
  } catch (error: any) {
    console.error('Create notification error:', error)
    return { success: false, error: error.message }
  }
}

export const getUserNotifications = async (userId: string) => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return notifications || []
  } catch (error) {
    console.error('Get notifications error:', error)
    return []
  }
}

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
    
    if (error) throw error
    
    return { success: true }
  } catch (error: any) {
    console.error('Mark notification error:', error)
    return { success: false, error: error.message }
  }
}

export const checkAndGiveDailyBonus = async (userId: string) => {
  try {
    const user = await getCurrentUser()
    if (!user) return null
    
    const lastBonus = user.last_daily_bonus ? new Date(user.last_daily_bonus) : null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (lastBonus) {
      const lastBonusDate = new Date(lastBonus)
      lastBonusDate.setHours(0, 0, 0, 0)
      
      if (lastBonusDate.getTime() === today.getTime()) {
        return null
      }
    }
    
    const DAILY_BONUS = 10
    await updateCoins(userId, DAILY_BONUS, 'earn')
    
    await supabase
      .from('users')
      .update({ last_daily_bonus: new Date().toISOString() })
      .eq('id', userId)
    
    return {
      message: 'Günlük bonus kazandın! 🎁',
      amount: DAILY_BONUS
    }
  } catch (error) {
    console.error('Daily bonus error:', error)
    return null
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
    
    if (error) throw error
    
    return { success: true }
  } catch (error: any) {
    console.error('Update profile error:', error)
    return { success: false, error: error.message }
  }
}

export const deleteFortune = async (fortuneId: string) => {
  try {
    const { error } = await supabase
      .from('fortunes')
      .delete()
      .eq('id', fortuneId)
    
    if (error) throw error
    
    return { success: true }
  } catch (error: any) {
    console.error('Delete fortune error:', error)
    return { success: false, error: error.message }
  }
}

export const deleteUser = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)
    
    if (error) throw error
    
    return { success: true }
  } catch (error: any) {
    console.error('Delete user error:', error)
    return { success: false, error: error.message }
  }
}

export const adminUpdateUser = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    
    return { success: true, user: data }
  } catch (error: any) {
    console.error('Admin update user error:', error)
    return { success: false, error: error.message }
  }
}

export const downloadFortune = (fortune: any) => {
  const content = `
╔════════════════════════════════════╗
║     ✨ Dijital Kahve Falın ✨      ║
╚════════════════════════════════════╝

Tarih: ${new Date(fortune.created_at).toLocaleString('tr-TR')}

${fortune.fortune_text}

────────────────────────────────────
🌙 Telvenin içindeki semboller
   senin enerjini fısıldıyor...
  `
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `kahve-fali-${fortune.id}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// Migration function (no longer needed with Supabase)
export const migrateUsersToCoins = () => {
  console.log('Migration not needed with Supabase')
}

// Keep compatibility with existing code
export const adminGiveCoins = async (userId: string, amount: number) => {
  return updateCoins(userId, amount, 'earn')
}
