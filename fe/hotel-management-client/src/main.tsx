import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import theme from './theme'
import { AuthProvider } from './context/AuthContext'
import AppLayout from './layouts/AppLayout'
import { routes } from './routes'

function RoutedApp() {
  const element = useRoutes(routes)
  return <AppLayout>{element}</AppLayout>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <RoutedApp />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
