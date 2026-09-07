import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Intercept the broken y-monaco import and map it to the main package
      'monaco-editor/esm/vs/editor/editor.api.js': 'monaco-editor'
    }
  }
})