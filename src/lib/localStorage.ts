import { supabase } from './supabase'

export async function getLocalData(key: string) {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select()
      .eq('key', key)
      .maybeSingle()

    if (error) {
      console.error('Error fetching data:', error)
      return []
    }

    if (!data) {
      return []
    }

    try {
      return JSON.parse(data.value || '[]')
    } catch (e) {
      console.error('Error parsing JSON data:', e)
      return []
    }
  } catch (e) {
    console.error('Unexpected error:', e)
    return []
  }
}

export async function setLocalData(key: string, value: any) {
  try {
    const { error } = await supabase
      .from('app_settings')
      .upsert({ 
        key, 
        value: JSON.stringify(value)
      }, {
        onConflict: 'key'
      })

    if (error) {
      console.error('Error saving data:', error)
      throw error
    }
  } catch (e) {
    console.error('Unexpected error saving data:', e)
    throw e
  }
} 