// components/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from "next-themes"
import { createContext } from "react"

const NextThemesContext = createContext({
  theme: "system",
  setTheme: () => {}
})

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export const useTheme = () => {
  const { theme, setTheme } = React.useContext(NextThemesContext)
  return { theme, setTheme }
}