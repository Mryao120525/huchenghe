import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    // 开发服务器配置
    port: 5173,
    open: true,
    // 热更新配置
    hmr: {
      overlay: true
    },
    // 强制预构建
    force: true
  },
  // 构建配置
  build: {
    // 生成sourcemap
    sourcemap: true,
    // 清理控制台和调试信息
    minify: 'terser',
    // 防止缓存
    rollupOptions: {
      output: {
        // 文件名添加hash，防止缓存
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  // 优化依赖预构建
  optimizeDeps: {
    force: true
  }
})
