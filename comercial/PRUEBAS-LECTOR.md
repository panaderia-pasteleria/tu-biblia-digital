# Pruebas de seguridad del lector comercial

Estado: función `read-licensed-chapter` versión 2 desplegada con `verify_jwt=true`. **Las pruebas HTTP reales están pendientes**: el entorno de ejecución actual no resolvió el dominio de Supabase.

## Casos obligatorios antes de publicar

1. Sin JWT: debe responder 401 desde el gateway; no debe devolver capítulos.
2. JWT inválido: debe responder 401; no debe consultar archivos privados.
3. JWT válido sin registro en `entitlements`: debe responder 403 `License required`.
4. JWT válido con licencia, capítulo no cargado: debe responder 404 `Chapter unavailable`.
5. JWT válido con licencia y capítulo autorizado cargado en `licensed/es/GEN/1.txt`: debe responder 200 con texto, sin URL de almacenamiento.
6. Origen no autorizado: debe responder 403 sin acceso CORS; comprobar producción y preview autorizados.
7. Rechazar rutas arbitrarias (`../`), idiomas no permitidos y capítulos fuera de 1–200 con 400.
8. Confirmar que el bucket `tbd-biblia-protegida` continúa `public=false` y que ningún usuario puede leerlo directamente mediante políticas de Storage.
9. Verificar que el texto comercial tiene derechos de distribución y atribuciones correspondientes antes de subirlo.
10. Stripe: comprobar pago de prueba, webhook firmado, evento duplicado, pago fallido y concesión de licencia sin usar una tarjeta real en producción.

## Alcance actual

- Código guardado únicamente en la rama `comercial/stripe-accesos-v1`.
- El lector HTML y el endpoint de lectura existen, pero **no se han validado todavía con una sesión real y contenido autorizado**.
- No activar cobros públicos ni afirmar que la compra entrega ya la Biblia completa.
- Ningún registro fiscal fue creado o modificado.
