# studentinformationsystem.com

Sitio web estático para presentar un catálogo de servicios digitales y consultar equivalencias de precios en distintas monedas.

## Alcance inicial
- Catálogo editable de 10 servicios digitales.
- Precios de referencia en USD y equivalencia orientativa en ARS.
- Conversor de divisas para ARS, USD, EUR, CLP, MXN, PEN, COP y CAD.
- Diseño adaptable a móviles y textos en español.
- Aviso visible sobre fecha, fuente y carácter orientativo de las cotizaciones.

## Desarrollo
El sitio inicial se implementará en `index.html`, sin dependencias de compilación. La cotización se consulta desde un servicio público de tipos de cambio; si no está disponible, la interfaz debe informar el error y no inventar una cotización.

## Importante
Los precios son valores iniciales editables y no constituyen una oferta definitiva. La conversión a ARS es orientativa y puede diferir de cotizaciones MEP, bancarias o de proveedores de pago. No se realizan despliegues desde este repositorio.
