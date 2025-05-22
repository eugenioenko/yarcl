import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Debug from './components/Debug'
import { ThemeProvider } from './theme/Theme.context'
import type { ThemeOptions } from './theme/Theme.types'

const themeConfig: ThemeOptions = {
  button: {
    radius: 'sm',
    shadow: 'sm',
  },
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider config={themeConfig}>
      <Debug />
    </ThemeProvider>
  </StrictMode>
)
