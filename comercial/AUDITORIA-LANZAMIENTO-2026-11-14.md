# Revisión de lanzamiento — 14/11/2026

Estado: **NO PUBLICAR VENTAS** hasta completar pruebas y contenido. La aplicación de desarrollo tiene compras deshabilitadas.

## 1. Encargados y transferencias
- Supabase: proyecto hbzyhdpkjmyarzsykhsx en eu-west-3 (París). DPA: https://supabase.com/legal/customer-resources/data-processing-addendum . Verificar cuenta, subencargados, acceso internacional y conservación.
- Stripe: https://stripe.com/legal/dpa ; contempla funciones como responsable y encargado, transferencias internacionales y anexo. Verificar servicios contratados y cumplimiento fiscal.
- Vercel: https://vercel.com/legal/dpa ; **el DPA publicado se declara aplicable a Pro y Enterprise**. Comprobar plan efectivo y contrato aplicable antes de afirmar cobertura contractual.
- Cloudflare: comprobar el acuerdo aplicable a la cuenta y el alcance del reenvío de correos, y evitar enviar información sensible por correo sin necesidad.
- Registrar subencargados, regiones, medidas, plazos y mecanismos de transferencias. No afirmar firma individual ni aceptación sin comprobación.

## 2. Notas y datos sensibles
- 14/11: notas deshabilitadas en interfaz y permisos INSERT/UPDATE revocados a authenticated/anon. Comprobado por consulta SQL: can_insert=false, can_update=false, existing_notes=0.
- Favoritos sin texto libre continúan habilitados; no utilizar para perfiles de creencias ni publicidad.
- Antes de reactivar notas: evaluación de necesidad, excepción artículo 9 RGPD, información específica, consentimiento explícito si es base elegida, retirada y borrado, seguridad y análisis de riesgos.

## 3. Cookies y tecnologías similares
- Inspección estática: cliente Supabase JS cargado desde esm.sh; SDK Supabase Auth puede usar almacenamiento de sesión; Checkout redirige a Stripe. No se observó analítica explícita en comercial/index.html, pero esto NO equivale a auditoría completa.
- Auditar red/cookies/localStorage en web pública, lector, login y Stripe, con navegador limpio. Documentar proveedor, finalidad, duración, tipo y base legal.
- Si se detectan tecnologías no exentas, bloquearlas hasta consentimiento; mostrar aceptar/rechazar con visibilidad equivalente, revocación sencilla. Referencia AEPD https://www.aepd.es/documento/guia-cookies.pdf .

## 4. Compra y derechos del consumidor
- Precio previsto 2,99 € pago único. No habilitar cobro hasta definir y publicar duración del acceso, contenido disponible, compatibilidad, actualizaciones, soporte, desistimiento y confirmación contractual por email.
- No aplicar renuncia al desistimiento por defecto. Diseñar casilla separada de consentimiento expreso y reconocimiento de pérdida del derecho solo si procede y se confirma en soporte duradero; en otro caso mantener régimen general.
- Verificar Stripe webhook y concesión de licencia tras pago real o prueba controlada, reembolsos y acceso.

## 5. Contenido bíblico
- Catálogo de 73 libros NO implica disponer de 73 libros con texto. Bucket privado tbd-biblia-protegida sin capítulos importados en última comprobación.
- Torres Amat histórico puede estar en dominio público, pero hay que identificar una edición concreta, comprobar integridad de 73 libros, derechos de la transcripción digital, atribución y capítulos por edición.
- No usar transcripciones bajo licencias no comerciales o sin derechos de redistribución comercial. Importar únicamente fuente validada y pasar conversor y pruebas.

## Decisión
**No está al 100 %**. No activar Stripe ni promocionar acceso completo hasta cerrar estos puntos y probar en dominio final.
