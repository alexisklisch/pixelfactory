import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { parse } from 'opentype.js';

// Configuración del parser XML
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: ''
});

// Cargar la fuente Montserrat
const fontResponse = await fetch('https://cdn.jsdelivr.net/fontsource/fonts/montserrat@latest/latin-400-normal.ttf');
const buffer = await fontResponse.arrayBuffer();
const font = parse(buffer);

// SVG de ejemplo
const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <!-- Background Rect -->
  <rect width="100%" height="100%" fill="#f0f0f0" />

  <!-- Title Text -->
  <text id="title" x="50%" y="50" text-anchor="middle" font-family="Arial" font-size="24" fill="#333">
    <!-- Default title from manifest.json -->
    Diseño sin título
  </text>

  <!-- Description Text -->
  <text @box-width="200" id="description" x="50%" y="100" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">
    <!-- Default description, this can be empty or modified -->
    Breve descripción del proyecto, aunque tenemos que entender que la vida es una moneda y quien la rebusca la tiene
  </text>

  <!-- Border -->
  <rect x="10" y="10" width="380" height="380" stroke="#333" stroke-width="2" fill="none" />
</svg>
`;

// Parsear el SVG
const svgObject = parser.parse(svgData);

// Función para calcular el ancho de un texto utilizando la fuente
function getTextWidth(text, fontSize, font) {
  const scale = fontSize / font.unitsPerEm;
  return text.split('').reduce((acc, char) => {
    const glyph = font.charToGlyph(char);
    return acc + glyph.advanceWidth * scale;
  }, 0);
}

// Función para adaptar el texto dentro del box-width
function adaptTextToBox(svgObject, font) {
  svgObject.svg.text.forEach(textElement => {
    if (textElement['@box-width']) {
      const boxWidth = parseFloat(textElement['@box-width']);
      const fontSize = parseFloat(textElement['font-size']);
      const textContent = textElement['#text'].trim();

      let currentLine = '';
      let newTextContent = '';
      textContent.split(' ').forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const lineWidth = getTextWidth(testLine, fontSize, font);
        
        if (lineWidth > boxWidth) {
          newTextContent += (newTextContent ? '\n' : '') + currentLine;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });

      newTextContent += (newTextContent ? '\n' : '') + currentLine;
      textElement['#text'] = newTextContent; // Actualiza el texto con los saltos de línea
    }
  });
}

// Adaptar el texto al box
adaptTextToBox(svgObject, font);

// Generar el nuevo SVG
const builder = new XMLBuilder({
  attributeNamePrefix: '',
  ignoreAttributes: false
});
const content = builder.build(svgObject);
console.log(content);
