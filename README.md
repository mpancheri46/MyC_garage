# MyC Garage · Catálogo web

Catálogo de productos en React, TypeScript, Vite y Tailwind CSS. Es un frontend estático pensado para desplegarse en Vercel; no procesa pagos ni necesita backend. Los pedidos se envían como consulta por WhatsApp.

## Instalar y ejecutar

Requiere Node.js 20 o posterior.

```bash
npm install
npm run dev
```

Vite muestra en la terminal la dirección local. Para generar y revisar el build de producción:

```bash
npm run build
npm run preview
```

## Datos de Google Sheets

La aplicación usa datos de ejemplo al comenzar. Para conectar la hoja:

1. En Google Sheets, publicá la pestaña `CATALOGO_WEB` como CSV desde **Archivo → Compartir → Publicar en la web**. La hoja debe ser accesible públicamente para que el navegador pueda descargarla.
2. Pegá la URL publicada en `GOOGLE_SHEET_CSV_URL` dentro de `src/services/products.ts`.
3. Cambiá `USE_MOCK_DATA` a `false` en ese mismo archivo.

La pestaña debe incluir `ID`, `CATEGORIA`, `PRODUCTO`, `PRESENTACION`, `PRECIO`, `DESCRIPCION`, `IMAGEN`, `VISIBLE`, `DESTACADO` y `ORDEN`. Se aceptan encabezados sin distinguir mayúsculas y minúsculas. Las filas sin nombre, categoría, precio u orden numéricos se ignoran; solo aparecen filas con `VISIBLE` igual a `SI`. Las imágenes deben usar URL accesibles públicamente. No hacen falta fotos para que funcione el catálogo: se muestra un placeholder propio.

La capa `src/services/products.ts` descarga, parsea y normaliza el CSV; los componentes solo reciben productos normalizados. El parser maneja comas, comillas escapadas y saltos de línea dentro de celdas.

## Datos de ejemplo y WhatsApp

- `src/data/mockProducts.ts`: editar o ampliar el catálogo de ejemplo.
- `src/services/products.ts`: `USE_MOCK_DATA` selecciona los datos de ejemplo o Google Sheets.
- `src/config.ts`: `WHATSAPP_NUMBERS` contiene los dos destinos con código de país, solo dígitos y sin `+`. `src/utils/whatsapp.ts` alterna el destino al presionar **Consultar por WhatsApp** y guarda el último índice en `localStorage`. La secuencia se conserva al recargar, es independiente por navegador y comienza por el primer número. Si el almacenamiento no está disponible, se usa el primer número. La URL del mensaje se genera con `encodeURIComponent`.

La consulta y sus cantidades se conservan en el navegador mediante `localStorage`. No representa una compra.

## Despliegue en Vercel

Importá el repositorio en Vercel y usá la configuración automática para Vite, o indicá:

- **Build command:** `npm run build`
- **Output directory:** `dist`

No se necesitan variables de entorno para el modo mock. En producción, la URL de Sheets y los números de WhatsApp se configuran en los archivos indicados arriba antes del despliegue. Como la URL de la hoja publicada estará visible en el frontend, usá únicamente datos pensados para ser públicos.
# MyC_garage
