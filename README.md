# 🧠 SIMECT — Sistema Inteligente de Monitoreo y Entrenamiento en Comprensión Textual

**SIMECT** es un Sistema Tutor Inteligente (STI) de vanguardia diseñado para fortalecer el pensamiento crítico y la comprensión lectora en estudiantes. Utilizando un motor pedagógico dinámico y modelos de monitoreo metacognitivo, SIMECT adapta el camino de aprendizaje a las necesidades específicas de cada usuario.

---

## Características Principales

- **🗺️ Mapa de Aprendizaje Dinámico:** Ruta pedagógica que evoluciona en tiempo real según el desempeño del estudiante.
- **🧠 Monitoreo Metacognitivo:** Implementación del modelo de Flavell para fomentar la autorreflexión antes y después de cada desafío.
- **📊 Progreso en Tiempo Real:** Barras de avance dinámicas para Actividades, Fases y Niveles.
- **🏆 Sistema de Gamificación:** Logros (Badges), rachas de estudio y sistema de puntos para incentivar la constancia.
- **🎨 Interfaz Premium:** Diseño moderno, limpio y enfocado en la legibilidad (Light Mode-First) con micro-animaciones.

---

## 🛠️ Stack Tecnológico

- **Frontend:** [Nuxt 3](https://nuxt.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Estado:** [Pinia](https://pinia.vuejs.org/)
- **Base de Datos:** [PostgreSQL](https://www.postgresql.org/) con [Prisma ORM](https://www.prisma.io/)
- **Contenedores:** [Docker](https://www.docker.com/) & Docker Compose
- **Autenticación:** Nuxt Auth Utils

---

## 🚀 Instalación y Desarrollo

### Requisitos previos
- Node.js (v18 o superior)
- Docker & Docker Compose (para la base de datos)

### Pasos para iniciar
1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/JESULIKE/STI_SUNECT.git
   cd STI_SUNECT
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar el entorno:**
   Crea un archivo `.env` basado en `.env.example` y configura tu `DATABASE_URL`.

4. **Levantar la infraestructura (Docker):**
   ```bash
   docker-compose up -d
   ```

5. **Sincronizar base de datos:**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

6. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

---

## 📁 Estructura del Proyecto

```
Tutor-SIMEP/
├── components/          # Componentes Vue (Actividades, Metacognición, UI)
├── composables/         # Lógica de negocio reactiva (useLearningSession)
├── layouts/             # Estructuras de página (Main, Auth)
├── pages/               # Rutas de la aplicación (Dashboard, Progress, Learn)
├── server/
│   ├── api/             # Endpoints (Backend en Nitro)
│   └── utils/           # Motor pedagógico y utilidades de Prisma
├── prisma/              # Esquema de base de datos y seeds
└── public/              # Activos estáticos (Logo, Imágenes)
```

---

## 👨‍💻 Autor
**Jesus Estudiante** — *Desarrollo y Pedagogía*

---
*Desarrollado para el fortalecimiento educativo mediante tecnología inteligente.*
