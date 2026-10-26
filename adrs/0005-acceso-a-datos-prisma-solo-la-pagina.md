# ADR 0005: Acceso a datos: Prisma, solo desde la página

## Estado

Aceptado

## Contexto

La persistencia debe hacerse en PostgreSQL sobre Neon (restricción del proyecto) y consiste en dos tablas: orbitales calculados y contenido teórico (ADR 0002). Por el ADR 0003, el navegador solo habla con la página; la página consulta la base de datos y llama al servicio de cálculo cuando falta un orbital. La página está construida con Next.js y TypeScript (ADR 0004).

Prisma es la herramienta de acceso a datos que se usa en el curso y en el proyecto `mimo_demo`, con el que el equipo ya tiene experiencia.

## Decisión

**Solo la página accede a Neon**, mediante **Prisma**: lee el contenido teórico y los orbitales, y guarda en la caché el orbital que recibe del servicio de cálculo. El servicio de cálculo no tiene conexión con la base de datos: solo calcula y responde.

## Alternativas consideradas

- **Drizzle** — era viable: es más ligero, con tipos y una sintaxis cercana a SQL. No se eligió porque el equipo ya conoce Prisma y no hay ventaja que compense aprender otra herramienta.
- **Controlador de Neon con SQL directo** — era viable y lo más mínimo para dos tablas. No se eligió porque no ofrece migraciones ni tipos automáticos, y los cambios en las tablas se gestionarían a mano.

## Consecuencias

- Las tablas y sus cambios quedan versionados mediante migraciones, y el código de la página trabaja con tipos.
- Una sola conexión a Neon, desde un solo componente: el servicio de cálculo no necesita credenciales de la base de datos.
- Prisma agrega peso y configuración al despliegue de la página, y cada cambio de esquema exige generar una migración.
- La página debe encargarse de guardar el resultado de un cálculo nuevo, lo que añade un paso a esa primera consulta.
- Las credenciales de Neon deben guardarse como variables de entorno en Vercel y nunca en archivos del repositorio.
