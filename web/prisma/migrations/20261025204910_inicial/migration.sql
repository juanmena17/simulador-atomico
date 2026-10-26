-- CreateTable
CREATE TABLE "OrbitalCalculado" (
    "n" INTEGER NOT NULL,
    "l" INTEGER NOT NULL,
    "version" TEXT NOT NULL,
    "datos" JSONB NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrbitalCalculado_pkey" PRIMARY KEY ("n","l","version")
);

-- CreateTable
CREATE TABLE "SeccionTeorica" (
    "clave" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeccionTeorica_pkey" PRIMARY KEY ("clave")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeccionTeorica_orden_key" ON "SeccionTeorica"("orden");
