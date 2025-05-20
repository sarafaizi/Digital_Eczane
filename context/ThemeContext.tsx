import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { useColorScheme } from 'react-native'

interface ThemeContextProps {
    isDark: boolean
    toggleDark: () => void
}

export const ThemeContext = createContext<ThemeContextProps>({
    isDark: false,
    toggleDark: () => { },
})

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const systemScheme = useColorScheme()
    const [isDark, setIsDark] = useState(systemScheme === 'dark')


    useEffect(() => {
        setIsDark(systemScheme === 'dark')
    }, [systemScheme])

    const toggleDark = () => setIsDark(prev => !prev)

    return (
        <ThemeContext.Provider value={{ isDark, toggleDark }}>
            {children}
        </ThemeContext.Provider>
    )
}
