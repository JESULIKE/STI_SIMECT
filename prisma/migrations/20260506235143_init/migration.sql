-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('BASIC', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "Phase" AS ENUM ('ANALYSIS', 'EVALUATION', 'JUDGMENT');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('DRAG_AND_DROP', 'MULTIPLE_CHOICE_REASONED', 'TEXT_MARKUP', 'ARGUMENT_BUILDER', 'FALLACY_IDENTIFICATION', 'OPEN_JUDGMENT');

-- CreateEnum
CREATE TYPE "ErrorType" AS ENUM ('CONCEPTUAL', 'LOGICAL', 'PROCEDURAL', 'READING_COMPREHENSION', 'DISTRACTOR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codigoEstudiantil" TEXT,
    "grado" TEXT,
    "institucion" TEXT,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "level" "Level" NOT NULL DEFAULT 'BASIC',
    "phase" "Phase" NOT NULL DEFAULT 'ANALYSIS',
    "percentCompleted" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "accumulatedScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fase" "Phase" NOT NULL,
    "nivel" "Level" NOT NULL,
    "tipo" "ActivityType" NOT NULL,
    "contenido" JSONB NOT NULL,
    "claveRespuestas" JSONB NOT NULL,
    "puntajeMaximo" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityAttempt" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "intentoNumero" INTEGER NOT NULL DEFAULT 1,
    "respuesta" JSONB,
    "puntajeObtenido" DOUBLE PRECISION,
    "tiempoSegundos" INTEGER NOT NULL DEFAULT 0,
    "confianzaPrevia" INTEGER,
    "feedbackRecibido" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetacognitionChecklist" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "sessionId" TEXT,
    "queSe" TEXT,
    "queEsperoAprender" TEXT,
    "confianzaInicial" INTEGER,
    "estrategias" JSONB,
    "tiempoEstimado" INTEGER,
    "entornoSinDistracciones" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetacognitionChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reflection" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "activityAttemptId" TEXT,
    "queAprendi" TEXT,
    "queFueDificil" TEXT,
    "autoEvaluacion" INTEGER,
    "transferencia" TEXT,
    "queHariaDiferente" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reflection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "icono" TEXT,
    "condiciones" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EarnedBadge" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EarnedBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NarrativeChapter" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "desbloqueadoEnNivel" "Level" NOT NULL,
    "desbloqueadoEnFase" "Phase" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NarrativeChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "deviceInfo" JSONB,

    CONSTRAINT "SessionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorPattern" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "activityAttemptId" TEXT,
    "tipoError" "ErrorType" NOT NULL,
    "frecuencia" INTEGER NOT NULL DEFAULT 1,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ErrorPattern_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_codigoEstudiantil_key" ON "StudentProfile"("codigoEstudiantil");

-- CreateIndex
CREATE INDEX "StudentProfile_codigoEstudiantil_idx" ON "StudentProfile"("codigoEstudiantil");

-- CreateIndex
CREATE INDEX "Progress_studentProfileId_level_phase_idx" ON "Progress"("studentProfileId", "level", "phase");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_studentProfileId_level_phase_key" ON "Progress"("studentProfileId", "level", "phase");

-- CreateIndex
CREATE INDEX "Activity_nivel_fase_idx" ON "Activity"("nivel", "fase");

-- CreateIndex
CREATE INDEX "ActivityAttempt_studentProfileId_activityId_idx" ON "ActivityAttempt"("studentProfileId", "activityId");

-- CreateIndex
CREATE UNIQUE INDEX "Reflection_activityAttemptId_key" ON "Reflection"("activityAttemptId");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_nombre_key" ON "Badge"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "EarnedBadge_studentProfileId_badgeId_key" ON "EarnedBadge"("studentProfileId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "NarrativeChapter_numero_key" ON "NarrativeChapter"("numero");

-- CreateIndex
CREATE INDEX "ErrorPattern_studentProfileId_tipoError_idx" ON "ErrorPattern"("studentProfileId", "tipoError");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAttempt" ADD CONSTRAINT "ActivityAttempt_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAttempt" ADD CONSTRAINT "ActivityAttempt_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetacognitionChecklist" ADD CONSTRAINT "MetacognitionChecklist_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetacognitionChecklist" ADD CONSTRAINT "MetacognitionChecklist_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SessionLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_activityAttemptId_fkey" FOREIGN KEY ("activityAttemptId") REFERENCES "ActivityAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarnedBadge" ADD CONSTRAINT "EarnedBadge_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarnedBadge" ADD CONSTRAINT "EarnedBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionLog" ADD CONSTRAINT "SessionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorPattern" ADD CONSTRAINT "ErrorPattern_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorPattern" ADD CONSTRAINT "ErrorPattern_activityAttemptId_fkey" FOREIGN KEY ("activityAttemptId") REFERENCES "ActivityAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
