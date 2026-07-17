import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { AuthProvider } from './context/AuthContext'
import { BookingProvider } from './context/BookingContext'
import { NotificationProvider } from './context/NotificationContext'
import { FavoriteProvider } from './context/FavoriteContext'
import { CartProvider } from './context/CartContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <AuthProvider>
        <BookingProvider>
          <NotificationProvider>
            <FavoriteProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </FavoriteProvider>
          </NotificationProvider>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
