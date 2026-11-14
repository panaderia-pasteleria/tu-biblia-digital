# Tu Biblia Digital — versión comercial (NO desplegada)

**Estado: desarrollo seguro; NO lista para cobrar.** Esta rama está aislada de `main`. La web pública y la PWA existentes no se modifican.

## Objetivo
- Venta: un pago único de **2,99 EUR**, precio final con impuestos incluidos cuando corresponda.
- Comprador: cuenta autenticada por correo; pago mediante Stripe Checkout; acceso concedido exclusivamente por webhook Stripe con firma validada.
- Regalo: código aleatorio **TBD-** + 32 dígitos hexadecimales, 128 bits de entropía, de un solo canje, asociado a una cuenta.
- Propietario: emisión de códigos únicamente desde una función de administración con identidad verificada.

## Ya construido en esta rama
- `comercial/index.html`: página de compra / entrada / canje (requiere configuración).
- `comercial/config.js`: configuración pública VACÍA a completar al desplegar, nunca poner secretos.
- `comercial/checkout-exito.html` y `checkout-cancelado.html`.
- `comercial/supabase/migrations/001_comercial.sql`: registros de permisos, regalos, eventos Stripe y políticas RLS.
- `supabase/functions/create-checkout/index.ts`: sesión de pago de precio fijo para usuario autenticado.
- `supabase/functions/stripe-webhook/index.ts`: verificación de firma Stripe y activación por pago completado.
- `supabase/functions/redeem-code/index.ts`: canje autenticado.
- `supabase/functions/create-gift-codes/index.ts`: emisión de códigos solo por ADMIN_USER_ID.

## Cuentas Stripe ya confirmadas (NO poner claves aquí)
Cuenta: `app.tubibliadigital`
Producto: `prod_VcjxawQHN7WOko` (inactivo)
Precio: `price_1UbUTQ2MlJh2e6JZRk2xiQAc`, EUR 2,99, `one_time`, `tax_behavior=inclusive`.

**Este precio es de PRODUCCIÓN**: para pruebas, configurar Stripe en testmode con un producto/precio de prueba distinto. No activar enlaces reales sin aprobación.

## Para terminar (bloqueos)
1. Conectar/crear proyecto **Supabase** independiente y privado, autenticación por correo, URL de redirección correcta. Crear migración anterior solo tras revisar en proyecto real.
2. Registrar secretos en Supabase, nunca en GitHub: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `APP_ORIGIN`, `ADMIN_USER_ID`. `STRIPE_PRICE_ID` debe concordar con el entorno Stripe (pruebas vs producción).
3. Configurar webhook Stripe para los eventos `checkout.session.completed` y `checkout.session.async_payment_succeeded`, endpoint público de función Edge y firma validada. Desplegar `stripe-webhook` sin exigir JWT (la seguridad es la firma de Stripe); el resto requiere verificación de usuario.
4. Completar `comercial/config.js` SOLO con URL Supabase, anon/publishable key y URL de funciones (no son secretos). Publicar la página cuando la infraestructura esté probada.
5. **Gating REAL:** Actualmente `index.html`, `SpaRV.json` y otros archivos bíblicos permanecen en alojamiento/repositorio público. El paywall no puede proteger contenido que siga servido públicamente, ni revocar las copias PWA ya descargadas. Crear un nuevo lector autenticado y servir los textos desde almacenamiento/servicio privado con control de acceso comprobado en servidor; limpiar la política de caché para no comprometer cuentas. NO enlazar la página de pago actual a archivos públicos como si fueran protegidos.
6. Revisar derechos comerciales de **cada traducción** y atribuciones; no asumir que todos los 73 libros/versiones son comercializables.
7. Definir condiciones de venta, soporte, privacidad, reembolsos, obligaciones de información al consumidor e IVA. En Stripe Tax hay sede configurada y categoría genérica de servicios electrónicos; actualmente **no hay registros fiscales** en la cuenta. No afirmar que Stripe recauda impuestos sin completar registros.
8. Probar: correo de acceso, pago válido en testmode, webhook duplicado/idempotente, pago rechazado, código usado dos veces, código inválido, usuario sin licencia, restablecimiento de acceso, lectura offline, compra desde varios dispositivos. Solo después publicar.
9. Verificar despliegue del frontend. Mantener `main` sin cambios y hacer revisión de PR antes de fusionar.

## Notas de seguridad
- No es posible proteger plenamente los archivos que ya fueron entregados en abierto; la versión comercial se debe servir desde un repositorio de contenidos o endpoint privado.
- Nunca desbloquear acceso por retorno del navegador o por `session_id` en la URL: SOLO webhook validado.
- El servidor verifica autenticación, identificador del precio y estado `paid`.
- Los códigos se almacenan mediante SHA-256; nadie debe crear códigos legibles y fáciles de adivinar. No imprimir códigos reales en registros.
- No habilitar Stripe Tax ni suponer recaudación sin registros fiscales válidos.
- Se mantiene intacto el `index.html` principal hasta completar todas las pruebas.

## Permisos
Proyecto de desarrollo separado. El propietario puede revisar y aprobar el despliegue cuando se completen dependencias y verificaciones.
