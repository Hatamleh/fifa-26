import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit()],
  // Port 3002 so this can run alongside qacart-todo (3001) during a course.
  server: { port: 3002 },
  preview: { port: 3002 },
})
