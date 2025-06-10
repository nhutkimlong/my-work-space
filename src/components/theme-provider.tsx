import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    async function loadTheme() {
      try {
        // First try to get from localStorage
        const localTheme = localStorage.getItem(storageKey) as Theme
        if (localTheme) {
          setTheme(localTheme)
          return
        }

        // If not in localStorage, try to get from Supabase
        const { data, error } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', storageKey)
          .maybeSingle()

        if (error) {
          console.error('Error loading theme:', error)
          return
        }

        if (data?.value) {
          const themeValue = data.value as Theme
          setTheme(themeValue)
          localStorage.setItem(storageKey, themeValue)
        }
      } catch (error) {
        console.error('Error in loadTheme:', error)
      }
    }

    loadTheme()
  }, [storageKey])

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: async (theme: Theme) => {
      try {
        // Save to localStorage first
        localStorage.setItem(storageKey, theme)

        // Then try to save to Supabase
        const { error } = await supabase
          .from('app_settings')
          .upsert({ 
            key: storageKey, 
            value: theme 
          }, {
            onConflict: 'key',
            ignoreDuplicates: false
          })

        if (error) {
          console.error('Error saving theme:', error)
          // If Supabase save fails, we still have the theme in localStorage
          return
        }

        setTheme(theme)
      } catch (error) {
        console.error('Error in setTheme:', error)
        // If there's an error, we still have the theme in localStorage
      }
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
