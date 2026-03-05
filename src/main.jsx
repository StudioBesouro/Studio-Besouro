import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // O erro aponta para esta linha
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)