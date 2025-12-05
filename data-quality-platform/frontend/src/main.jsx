import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { SnackbarProvider } from 'notistack'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000
    }
  }
})

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#424242' },
    secondary: { main: '#757575' },
    success: { main: '#4caf50' },
    error: { main: '#f44336' },
    warning: { main: '#ff9800' },
    info: { main: '#2196f3' },
    background: { default: '#f5f5f5', paper: '#ffffff' }
  },
  shape: { borderRadius: 0 },
  typography: {
    fontFamily: 'Inter, Roboto, Segoe UI, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 600, letterSpacing: '0.2px' },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 0,
          border: '1px solid #e0e0e0'
        }
      }
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500, borderRadius: 0 }
      }
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500, borderRadius: 0 } }
    },
    MuiTableHead: {
      styleOverrides: {
        root: { background: '#fafafa' }
      }
    },
    MuiTableCell: {
      styleOverrides: { head: { color: '#212121', fontWeight: 600 } }
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <App />
          </SnackbarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)


