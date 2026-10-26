# ADR 0021: Operación mínima: carga inicial, migraciones, entornos y registros

## Estado

Aceptado. Complementa al ADR 0002, al ADR 0005 y al ADR 0011.

## Contexto

La revisión adversarial (`REVISION-ADVERSARIAL.md`, hallazgo A8) señaló que el proyecto necesita varias áreas que ningún ADR trataba: cómo se llenan los orbitales y el texto teórico en Neon, cómo se crean y cambian las tablas, si la base de producción se comparte con las vistas previas y el desarrollo local, y cómo se observan los errores, dado que los registros de Vercel duran solo 1 hora y el servicio de cálculo recibe pocas llamadas. El PRD no admite recursos de terceros en uso.

## Decisión

Se adopta el siguiente paquete mínimo:

- **Carga inicial:** un script repetible calcula los 15 orbitales con el módulo del ADR 0011 y los inserta en Neon sin duplicar (si el orbital ya existe, lo actualiza). El mismo script carga el texto teórico inicial. Se ejecuta en el primer despliegue y cada vez que sube la versión del algoritmo (ADR 0013).
- **Migraciones:** las tablas se crean y se cambian con las migraciones de Prisma (ADR 0005), versionadas en el repositorio.
- **Entornos:** una base de datos para producción y otra para el desarrollo local, sin compartir datos entre ellas.
- **Observabilidad:** se usan los registros de Vercel, sin servicio externo.

## Alternativas consideradas

- **Decidir solo la carga inicial y las migraciones, dejando los entornos y la observabilidad para la implementación** — era viable y más rápido. No se eligió porque deja dos áreas sin decidir.
- **Dejarlo todo para la implementación** — era viable y no exigía trabajo. No se eligió porque se arriesga a improvisar durante el desarrollo.

## Consecuencias

- La carga inicial es reproducible y segura de repetir, y las tablas tienen un historial de cambios.
- Los registros de Vercel se pierden a la hora, por lo que un error ocurrido durante la noche no se podrá consultar después; es un riesgo aceptado.
- Hay que crear y mantener dos bases de datos y sus credenciales, que se guardan como variables de entorno y nunca en el repositorio.
- Quedan por verificar al implementar: si el plan gratuito de Neon permite crear dos bases o ramas, y cómo se ejecuta el script de carga contra Neon sin guardar credenciales en el repositorio.
