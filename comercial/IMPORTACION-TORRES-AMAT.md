# Importación de Torres Amat — control de calidad

## Fuente y derechos
La traducción original de Félix Torres Amat (fallecido en 1847) es histórica. **No asumir que la edición digital, su aparato editorial o su base de datos se pueden copiar comercialmente.**

Fuentes contrastadas:
- Registro 1823–1825, Comunidad de Madrid: https://bibliotecavirtualmadrid.comunidad.madrid/bvmadrid_publicacion/es/consulta/registro.do?control=BDCM20210316999
- Facsímiles del siglo XIX en Wikisource: https://es.wikisource.org/wiki/Archivo:La_Sagrada_Biblia_(XIV).djvu
- Fides Viva identifica la segunda edición de 1832–1835 y afirma que su ortografía fue modernizada: https://fidesviva.org/es/biblia
- Scriptio indica que su colección Torres Amat tiene **66 libros**, no los 73 requeridos: https://scriptio.org/es-aviso-legal
- Universidad de Sevilla, digitalización de 1883–1884, lleva licencia de acceso CC BY-NC-ND: https://idus.us.es/items/9f85737f-81a2-4411-a75f-424dec27209c ; no reutilizar el archivo digital comercialmente sin resolver esas condiciones.

## Proceso
1. Elegir un único testigo impreso y documentar editorial, año, tomos, páginas y procedencia.
2. Obtener transcripción reutilizable de forma acreditada; no extraer una base de datos protegida de un competidor.
3. Normalizar a JSON con `books: [{id, chapters: [[verse1,verse2,...], ...]}]`.
4. Comparar contra facsímiles y revisar manualmente la correspondencia de versículos, especialmente Ester, Daniel, Joel y los Salmos.
5. Ejecutar `python3 scripts/convert_torres_amat.py --input transcripcion-autorizada.json --output /ruta/privada`.
6. Revisar salida y cargar solo los archivos aprobados en bucket privado `tbd-biblia-protegida`, con rutas `licensed/es/GEN/1.txt`.
7. Probar lectura autenticada con licencia y rechazo sin licencia.

**Estado:** importador creado; no hay transcripción aprobada ni archivos de Biblia cargados. El importador exige los 73 libros y los conteos del catálogo; las variantes de versificación se deben resolver antes de importación.
