import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // Sin srcDir — todo vive directamente en /Tutor-SIMECT
  css: ['~/assets/css/tailwind.css'],

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-auth-utils',
    '@vueuse/motion/nuxt',
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  app: {
    head: {
      titleTemplate: '%s – STI',
      title: 'STI SIMECT – Sistema Tutor Inteligente',
      htmlAttrs: { lang: 'es' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Plataforma educativa para el desarrollo del pensamiento crítico y metacognición en estudiantes de grado 8° y 9° de Montería.',
        },
        { name: 'theme-color', content: '#166534' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        },
      ],
    },
  },

  runtimeConfig: {
    // Variables privadas (sólo servidor)
    jwtSecret: process.env.NUXT_JWT_SECRET || '',
    databaseUrl: process.env.DATABASE_URL || '',
    // Variables públicas (cliente + servidor)
    public: {
      appName: 'STI – Sistema Tutor Inteligente',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  experimental: {
    payloadExtraction: false
  },

  nitro: {
    serveStatic: true
  }
})