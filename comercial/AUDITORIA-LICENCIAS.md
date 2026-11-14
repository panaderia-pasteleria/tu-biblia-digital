# Auditoría inicial de fuentes bíblicas para venta digital
Fecha: 2026-11-14. Estado: **pendiente de cierre**, no afirmar licencia comercial global.

## Evidencia técnica
El original index.html contiene créditos propios en su sección legal y URLs externas a las que accede para completar los 73 libros.
El archivo local SpaRV.json contiene **66 libros, 31.102 versículos** (parseado del repositorio). Los siete libros deuterocanónicos NO están en este archivo; se descargan de repositorios externos para cada idioma.
Afirmar "73 libros offline desde el primer momento" requerirá importar y verificar los siete libros y todas sus ampliaciones, y preparar la descarga privada una vez autorizado el usuario.

## Fuentes encontradas en index.html
- Español general: Reina-Valera SpaRV (archivo local; confirmar que edición es la de 1909 de dominio público).
- Inglés general: King James Version (KJV; determinar origen exacto y restricciones territoriales).
- Portugués general: Bíblia Livre (BLIVRE), Almeida 1819, revisión 2018. Copyright 2018 Diego Santos, Mario Sérgio y Marco Teles; licencia atribuida CC BY 4.0 BR. Mantener la atribución exigida en la app.
- Español deuterocanónicos: Félix Torres Amat (1823), repositorio https://github.com/danloi2/itercatholicum
- Español Ester/Daniel ampliados: traducción histórica Scío, https://github.com/iiTONELOC/lucerna/tree/main/data/library/bibles/scio
- Latín: Vulgata Clementina (1592), Iter Catholicum + https://github.com/midvash/bible-data/tree/main/versions/la/clem (la propia app actual reconoce que la transcripción digital no está completamente verificada).
- Inglés deuterocanónicos: Douay-Rheims (1899), https://github.com/jesuslovestyler/Catholic-Bible
- Portugués deuterocanónicos: Matos Soares, https://github.com/bibliacatolica/biblia. El repositorio declara CC0 de la compilación digital, pero hace falta distinguir el derecho de la compilación y el derecho del texto subyacente según jurisdicción.

## Riesgos / pendientes obligatorios
1. Conservar una lista de atribuciones y licencias visible en la interfaz comercial.
2. Revisar licencias por jurisdicción comercial (España, Portugal, países latinoamericanos, etc.) antes de reutilizar.
3. Mantener la app ya publicada hasta que la importación privada esté verificada; no retirar sus datos locales de lectores existentes.
4. La nueva lectura sin conexión necesita una copia descargable en caché o almacenamiento local, con privacidad y seguridad razonables; no se puede revocar una copia ya descargada.
5. No automatizar Google Ads ni abrir Checkout hasta completar derechos y entrega de los 73 libros.

Documentación de referencia: https://github.com/bibliacatolica/biblia y https://github.com/jesuslovestyler/Catholic-Bible
