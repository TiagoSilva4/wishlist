import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { init } from './init'
// At the top of src/index.js
import './index.css';  // If you have this file

init()

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <App />
)
