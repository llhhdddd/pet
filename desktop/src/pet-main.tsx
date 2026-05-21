import React from 'react'
import ReactDOM from 'react-dom/client'
import DesktopPet from './components/pet/DesktopPet'

ReactDOM.createRoot(document.getElementById('pet-root')!).render(
  <React.StrictMode>
    <DesktopPet />
  </React.StrictMode>,
)
