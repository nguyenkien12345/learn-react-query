import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
// React Router Dom
import { BrowserRouter } from 'react-router-dom'
// React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Khi chúng ta chuyển qua lại giữa các tab thì nó sẽ không có refresh lại các cái api của chúng ta
      refetchOnWindowFocus: false
    }
  }
})

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  // <React.StrictMode>
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </BrowserRouter>
  // </React.StrictMode>
)
