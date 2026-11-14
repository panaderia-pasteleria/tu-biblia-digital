# Auditoría de lanzamiento — Tu Biblia Digital

Fecha de comprobación: **14/11/2026**. Estado comercial: **NO APTO PARA ACTIVAR COBROS NI PUBLICAR COMO PRODUCTO FINAL**. Avance técnico significativo en dos idiomas. Ver las limitaciones.

## Contenido importado (Supabase)

Tabla privada `public.bible_chapters`, proyecto `hbzyhdpkjmyarzsykhsx`, región `eu-west-3`:

| Idioma | Edición | Libros | Capítulos | Versos | Estado |
| --- | --- | ---: | ---: | ---: | --- |
| en | Original Douay-Rheims 1582/1609, CC0 | 73 | 1.334 | 35.814 | Importado, integridad numérica verificada |
| it | Bibbia Martini 1769–1781, texto histórico PD; estructura CC BY 4.0 | 73 | 1.334 | 35.713 | Importado, integridad numérica verificada, con corrección documentada |
| es | Torres Amat, objetivo | 0 | 0 | 0 | No importado: falta fuente digital redistribuible completa verificada |
| pt | Traductor/edición por confirmar | 0 | 0 | 0 | No importado: derechos de una edición de 73 libros pendientes |

**2.668 capítulos permanentes, 146 asociaciones libro/idioma.** Las tablas tienen RLS habilitado. `anon` y `authenticated` NO tienen SELECT en `bible_chapters`; `service_role` sí.

**QA verificable:** se probaron los 2.668 capítulos contra líneas con encabezado numérico de versículo, número inicial=1, número final=conteo, cero formatos inválidos, cero saltos de numeración después de la corrección italiana. No implica una revisión filológica humana completa de cada versículo.

**Fuentes:** inglés https://github.com/janvier-s/original-douay-rheims (commit fijo `fe7765039e57d0fb9ca6e03d9811c77ae619d746`; licencia CC0). Italiano https://parolaviva.art/opendata (Antonio Martini PD; estructura Giovanni Novelli CC BY 4.0). Ver `fuentes.html`.

**Incidencia italiana:** fuente Parola Viva JSON `1pt/5.json` omitió los versículos 1–10; se recuperaron por cotejo con el texto histórico público de https://www.catholicshare.com/bible/martini/1-peter/5/ . Se recuperaron 10, quedó 1 Pedro 5 con 14 versículos. Parola Viva declara 35.714 en sus estadísticas, pero su API devolvió 35.703; tras recuperación el total de datos es 35.713. Queda **una diferencia de un versículo entre el contador público y el corpus real**, sin saltos numéricos; documentar antes del lanzamiento. No inventar un versículo.

## Acceso y seguridad

- Función Supabase `read-licensed-chapter` **v5 ACTIVE, verify_jwt=true**. Autentica al usuario y comprueba entitlement antes de leer `bible_chapters` usando credencial de servicio solo en servidor.
- Prueba HTTP sin header Authorization a lectura protegida: **401** `UNAUTHORIZED_NO_AUTH_HEADER`.
- En la app las notas religiosas están desactivadas. En PostgreSQL no es posible INSERT/UPDATE para roles cliente y se constató **0 notas guardadas**; favoritos permitidos bajo RLS por propietario.
- `create-checkout` **v8 ACTIVE** es una **función bloqueada deliberadamente**: no puede crear sesiones de Stripe; devuelve 503 para los orígenes autorizados, con JWT requerido. Historial de implementación previa disponible. El botón web de compra también está deshabilitado.
- Supabase JS del frontend/lector y función de lectura fijado a **2.119.0** para evitar actualizaciones implícitas de `@2`.
- `stripe-webhook` permanece registrado; **ninguna transacción de prueba ni cobro real** ha validado el circuito de entrega/reembolsos. No habilitar `create-checkout` sin prueba autorizada.
- Security Advisors anteriores indicaban informaciones de RLS sin políticas para tablas exclusivamente de servidor `gift_codes`/`stripe_events`, y advertencia de protección de contraseñas filtradas; se utiliza magic-link. Volver a ejecutar el asesor al finalizar.

## Despliegue / DNS — PRUEBAS HTTP externas

Resultados de consultas HTTPS sin credenciales desde infraestructura Supabase:

| URL | Resultado |
| --- | --- |
| `https://app.tubibliadigital.com/comercial/` | **404**, Vercel `NOT_FOUND` |
| `https://tubibliadigital.com/` | **No resuelve hostname** desde servidor de prueba |
| Vista previa `indexhtml-ar4bkwq9g-juan-daniel-de-gouveia-s-projects.vercel.app/comercial/` | HTTP 200 pero **título «Login – Vercel»** (página de protección, no sitio público) |

**Bloqueo de lanzamiento**: conectar la cuenta Vercel, vincular repositorio/rama a proyecto, confirmar Vercel Domains y DNS Cloudflare, establecer despliegue público sin protección de vista previa para rutas apropiadas, añadir `app.tubibliadigital.com` como URL de redirección de Auth y comprobar HTTPS/SSL. No asumir que una respuesta HTTP 200 de la vista previa significa que la app responde.

## Legal y privacidad

- Autónomo y privacidad@tubibliadigital.com identificados; email routing de recepción probado.
- Condiciones: 2,99 € único, acceso indefinido mientras el servicio esté operativo, derechos irrenunciables y desistimiento contemplados.
- Fuentes/licencias publicadas en `fuentes.html`, con reutilización CC0 y CC BY 4.0 respetada. El servicio cobra por funcionalidad, no vende derechos exclusivos sobre texto.
- Auditoría estática de cookies: Supabase Auth (sesión local), CDN esm.sh; no se detectaron etiquetas analíticas en las páginas comerciales revisadas. **Falta inspección en navegador de dominio publicado**.
- DPA, subencargados, transferencias internacionales, retención/eliminación de cuenta y confirmación contractual durable pendientes de comprobación completa. No declarar cumplimiento total.

## Lista de cierre y decisión

1. Obtener e importar 73 libros españoles con procedencia y derechos comerciales verificados; portugués también si se mantiene en la oferta.
2. Revisar diferencia de 1 versículo del contador italiano y, en su caso, corregir con fuente primaria.
3. Conectar Vercel, resolver dominio 404 y DNS de raíz, publicar la rama y comprobar navegador real con cookies.
4. Probar cliente logueado con licencia (lectura, notas deshabilitadas, favoritos), cliente sin licencia, caducidad de token y seguridad de orígenes.
5. Probar Stripe Checkout y webhook mediante entorno de pruebas o transacción controlada autorizada, concesión de entitlement, confirmación del pedido en soporte duradero, desistimiento y reembolso.
6. Completar DPA/proveedores, términos finales, cookies y retención; revisar fiscalidad con el titular antes de cobrar.
7. Ejecutar y verificar GitHub Actions, además de tests del conversor en CI.

**Decisión:** conservar `create-checkout` desactivado. Un catálogo bilingüe parcial y un despliegue con 404 no justifican activar ventas. No se han realizado cobros.
