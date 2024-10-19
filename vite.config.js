import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Pour que l'application soit accessible via l'IP locale
  //  port: 3000, // Vous pouvez définir un port spécifique, par défaut c'est 5173
  }
})
