# All Weather Heating & Cooling — aplicación de clientes

Aplicación web completa para una empresa de HVAC del área de Durham / Raleigh
(el Triángulo, Carolina del Norte): agendamiento de servicio en línea, cotizador
guiado, portal del cliente y panel de operaciones interno. Todo bilingüe
inglés / español.

Construida para **All Weather Heating & Cooling, Inc.** — 1301 S Briggs Ave #116,
Durham, NC 27703.

---

## Puesta en marcha

```bash
cd hvac-app
npm install
cp .env.example .env      # ajuste SESSION_SECRET antes de producción
npm run setup             # prisma generate + db push + datos de ejemplo
npm run dev               # http://localhost:3000
```

### Cuentas de demostración

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administración | `admin@allweather.test` | `Admin1234!` |
| Cliente | `customer@allweather.test` | `Demo1234!` |

La cuenta de cliente viene con equipos, historial, recordatorios y una
membresía activa para que el portal no se vea vacío.

### Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | `prisma generate` + build de producción |
| `npm start` | Servidor de producción |
| `npm run db:push` | Sincroniza el esquema con SQLite |
| `npm run db:seed` | Carga área de servicio, planes, cupones y demo |
| `npm run db:reset` | Borra la base y la vuelve a sembrar |

---

## Qué incluye

### Para el cliente

- **Agendamiento en 4 pasos** — tipo de servicio, urgencia, dirección con
  autocompletado de ciudad por código postal, calendario con capacidad real por
  franja de dos horas, códigos promocionales y pantalla de confirmación con
  número de referencia. Funciona con o sin cuenta.
- **Cotizador guiado** con precio en vivo mientras se responde: cambio de pieza,
  sistema completo, ductos o calidad del aire. El rango se recalcula en el
  servidor antes de guardarse, así que un payload manipulado no cambia el precio.
- **Portal del cliente** — próximas visitas (cancelables), historial, cotizaciones
  con su estado, inventario de equipos con alerta de vida útil, recordatorios
  estacionales y edición de perfil.
- **Verificador de código postal** en el hero y en la página de contacto.
- **Asistente de diagnóstico por síntomas** — reglas auditables, no un LLM:
  clasifica la urgencia, explica la causa probable, da los pasos seguros que el
  cliente puede intentar y precarga el formulario de agendamiento.
- **Calculadoras** de dimensionamiento (toneladas / BTU) y de ahorro energético
  por cambio de SEER, más simulador de cuota de financiamiento.
- **Contenido de confianza** — servicios, planes de mantenimiento, financiamiento
  con reembolsos y créditos fiscales, nosotros, contacto con mapa, blog de
  consejos escrito por temporada y preguntas frecuentes.

### Para la empresa

- **Panel de operaciones** (`/admin`, solo cuentas con rol `ADMIN`): KPIs de
  visitas de la semana, cotizaciones abiertas, pipeline, tasa de cierre y ticket
  promedio; distribución por tipo de servicio y por estado; bandejas de citas y
  cotizaciones con búsqueda, filtros, cambio de estado, asignación de técnico y
  notas internas.

### Bilingüe de verdad

Cada texto vive en `src/i18n/en.ts` y `src/i18n/es.ts`. El diccionario español
está tipado contra el inglés, así que **falta una clave = falla el build**. El
idioma se guarda en `localStorage` y en una cookie, de modo que los componentes
de servidor renderizan en el idioma correcto desde la primera carga. Los correos
y mensajes de texto también salen en el idioma que eligió el cliente.

---

## Integraciones

Todas viven en `src/lib/integrations/`. Cada una arranca en **modo simulado**:
si la variable de entorno está vacía, el mensaje se escribe en la consola del
servidor en vez de enviarse. Al poner una llave real, esa integración —y solo
esa— pasa a modo real sin tocar código.

| Servicio | Variable | Para qué |
| --- | --- | --- |
| Resend | `RESEND_API_KEY` | Confirmación de cita, cotización, aviso interno |
| Twilio | `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_FROM_NUMBER` | SMS de confirmación |
| Stripe | `STRIPE_SECRET_KEY` | Cobro de membresías y anticipos |
| Google Maps | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Mapa embebido (hay respaldo sin llave) |

Los datos de la empresa (teléfonos, dirección, correo) también salen de
variables de entorno, en `src/lib/company.ts`.

---

## Arquitectura

```
src/
  app/
    api/            Rutas de API (validadas con Zod, autorización por sesión)
    admin/          Panel de operaciones
    portal/         Portal del cliente
    book/           Asistente de agendamiento
    quote/          Cotizador
    services/ plans/ financing/ about/ contact/ blog/ tools/
  components/       UI, layout, i18n provider, calendario
  content/          Blog, preguntas frecuentes, reseñas
  i18n/             Diccionarios en/es
  lib/
    pricing.ts      Motor de estimados y calculadoras
    diagnostics.ts  Triage por síntomas
    scheduling.ts   Franjas, capacidad, reglas de calendario
    auth.ts         Sesiones firmadas con HMAC + bcrypt
    integrations/   Email, SMS, pagos
prisma/
  schema.prisma     Modelo de datos
  seed.mjs          Datos iniciales
```

**Base de datos:** SQLite vía Prisma. Para producción, cambie el `provider` a
`postgresql` en `prisma/schema.prisma` y apunte `DATABASE_URL` a su servidor —
no hay consultas específicas de SQLite en el código.

**Autenticación:** cookie `httpOnly` con un token firmado (`HMAC-SHA256`), sin
estado en el servidor. Las contraseñas usan bcrypt. Roles `CUSTOMER` / `ADMIN`.

**Reglas que se aplican en el servidor, no solo en el navegador:**

- La capacidad de cada franja horaria se vuelve a contar antes de crear la cita
  (409 si se llenó mientras el cliente llenaba el formulario).
- El estimado se recalcula desde las respuestas validadas.
- Un `equipmentId` solo se acepta si pertenece a quien está en sesión.
- Cancelar una cita o borrar un equipo está limitado por dueño.
- `/api/admin/*` exige rol `ADMIN`.

---

## Antes de salir a producción

1. **Reseñas** — `src/content/reviews.ts` trae textos marcados como
   *placeholder*. Reemplácelos por reseñas reales (con permiso) o conéctelos a
   la API de Google Places. Publicar testimonios inventados es un problema
   legal y de confianza.
2. **Números de licencia** — `src/lib/company.ts` dice "Licensed & insured in
   North Carolina" como marcador; ponga los números de licencia HVAC y eléctrica
   reales de Carolina del Norte.
3. **Precios** — las tablas de `src/lib/pricing.ts` son rangos típicos del área
   del Triángulo, no el tarifario de la empresa. Ajústelas al libro de precios
   real antes de mostrarlas a clientes.
4. **Términos de financiamiento** — las tasas y plazos de `/financing` son
   ilustrativos; deben venir del aliado financiero real.
5. **`SESSION_SECRET`** — genere uno con `openssl rand -base64 32`.
6. **Área de servicio** — la lista de códigos postales de `prisma/seed.mjs` es
   aproximada; confírmela contra las rutas reales.
