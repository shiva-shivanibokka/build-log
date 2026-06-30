import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Published to https://shiva-shivanibokka.github.io/build-log/
// so every asset must be served from that sub-path.
export default defineConfig({
  base: '/build-log/',
  plugins: [react()],
})
