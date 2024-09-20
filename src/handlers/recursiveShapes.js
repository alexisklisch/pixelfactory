import { linear, url } from "../utils/propertyContentExtractor.js"
import { separateWords } from "../utils/stringUtils.js"

export async function recursiveShapes (shape, ctx) {

    // Elipse
    if (shape.type === 'ellipse') {
        if (shape.styles.background.includes('image')) {
            await applyStyles(shape, ctx)

        } else {
            ctx.save()
            ctx.translate(shape.x + shape.width / 2, shape.y  + shape.height / 2)
    
            ctx.beginPath()
            ctx.ellipse(shape.x, shape.y, shape.width / 2, shape.height / 2, 0, 0, 2 * Math.PI)
            ctx.clip()
            await applyStyles(shape, ctx)
            ctx.restore()
            
    
            ctx.closePath()
        }


    }

    // Rect

    if (shape.type === 'rect') {
        ctx.save()
        ctx.beginPath()

        let borderRadius = shape.styles.borderRadius || 0
        if (borderRadius) {
            const [tl, tr, br, bl] = borderRadius.split(',')
            borderRadius = { tl, tr, br, bl }
        }

        roundRect(ctx, shape.x, shape.y, shape.width, shape.height, borderRadius)
        await applyStyles(shape, ctx)
        ctx.closePath()
    }

    // Grup

    if (shape.type === 'group') {
        for (const child of shape.children) {
            recursiveShapes(child, ctx)
        }
    }
}

async function applyStyles (shape, ctx) {

  const { styles, width, height, x, y } = shape

  // Fill
  const { background } = styles
  if (background) {
    const backgroundValues = separateWords(background)
    if (backgroundValues[0] === 'solid') {
        ctx.fillStyle = backgroundValues[1]
        ctx.fill()
    }

    if (backgroundValues[0] === 'gradient') {
        if (background.includes('linear(')) {
            const [linearValues] = linear(background)
            const colorStops = linearValues.split(',')

            // Dirección
            let x1 = x, y1 = y, x2 = x + width, y2 = y + height;

            // Cambiar las coordenadas según el valor de 'gradientDirection'
            switch (backgroundValues[2]) {
                case 'to-t':
                    x1 = x; y1 = y + height;
                    x2 = x; y2 = y;
                    break;
                case 'to-b':
                    x1 = x; y1 = y;
                    x2 = x; y2 = y + height;
                    break;
                case 'to-l':
                    x1 = x + width; y1 = y;
                    x2 = x; y2 = y;
                    break;
                case 'to-r':
                    x1 = x; y1 = y;
                    x2 = x + width; y2 = y;
                    break;
                case 'to-tl':
                    x1 = x + width; y1 = y + height;
                    x2 = x; y2 = y;
                    break;
                case 'to-tr':
                    x1 = x; y1 = y + height;
                    x2 = x + width; y2 = y;
                    break;
                case 'to-bl':
                    x1 = x + width; y1 = y;
                    x2 = x; y2 = y + height;
                    break;
                case 'to-br':
                    x1 = x; y1 = y;
                    x2 = x + width; y2 = y + height;
                    break;
                default:
                    // Si no se especifica dirección, usa el diagonal por defecto
                    x1 = x; y1 = y;
                    x2 = x + width; y2 = y + height;
            }

            const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
            colorStops.forEach((color, index) => {
                const stepPosition = (index * 1) / (colorStops.length - 1)
                gradient.addColorStop(stepPosition, color)
            })

            ctx.fillStyle = gradient

            ctx.fill()
        }

    }

    // Image bg
    if (backgroundValues[0] === 'image') {

        const imageUrl = url(background) // La URL o ruta de la imagen
        const fit = backgroundValues[2] || 'contain'; // Valor por defecto 'contain'

        const blob = await fetch(imageUrl).then(res => res.blob());
        const img = await createImageBitmap(blob);

        // Obtener las dimensiones originales de la imagen
        const imgWidth = img.width;
        const imgHeight = img.height;

        // Calcular el ajuste según la opción seleccionada
        let sx = 0, sy = 0, sWidth = imgWidth, sHeight = imgHeight; // Variables para el área fuente
        let dx = x, dy = y, dWidth = width, dHeight = height;       // Variables para el área destino

        const imgAspectRatio = imgWidth / imgHeight;
        const containerAspectRatio = width / height;

        if (fit === 'cover') {
            // En "cover", la imagen debe cubrir completamente el contenedor, recortando partes si es necesario.
            if (imgAspectRatio > containerAspectRatio) {
                // La imagen es más ancha que el contenedor: se recorta en los laterales
                sWidth = imgHeight * containerAspectRatio; // Calculamos el ancho ajustado a la altura del contenedor
                sx = (imgWidth - sWidth) / 2; // Centrar horizontalmente la imagen recortada
            } else {
                // La imagen es más alta que el contenedor: se recorta en la parte superior/inferior
                sHeight = imgWidth / containerAspectRatio; // Calculamos la altura ajustada al ancho del contenedor
                sy = (imgHeight - sHeight) / 2; // Centrar verticalmente la imagen recortada
            }
        } else if (fit === 'contain') {
            // En "contain", la imagen debe caber completamente dentro del contenedor, con márgenes si es necesario.
            if (imgAspectRatio > containerAspectRatio) {
                // La imagen es más ancha que el contenedor: ajustamos por ancho
                dWidth = width;
                dHeight = width / imgAspectRatio; // Altura ajustada a la proporción de la imagen
                dy = y + (height - dHeight) / 2; // Centrar verticalmente
            } else {
                // La imagen es más alta que el contenedor: ajustamos por altura
                dHeight = height;
                dWidth = height * imgAspectRatio; // Ancho ajustado a la proporción de la imagen
                dx = x + (width - dWidth) / 2; // Centrar horizontalmente
            }
        }

        if (shape.type === 'ellipse') {
            ctx.save();

            ctx.translate(x + width / 2, y + height / 2);
            ctx.beginPath();
            ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
            ctx.clip(); // Aplicar el clipping

            // Ajustar la imagen a la elipse
            ctx.drawImage(img, sx, sy, sWidth, sHeight, -dWidth / 2, -dHeight / 2, dWidth, dHeight);

            ctx.restore();
        } else {
            ctx.save();
            ctx.clip(); // Aplicar el clipping

            // Dibujar la imagen ajustada
            ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

            ctx.restore();
        }
        
    }

  }

  // Stroke
  const { stroke } = styles

  if (stroke) {
        console.log(stroke)
      const [ lineWith, color ] = separateWords(stroke)
      // ctx.setLineDash([25, 10]) Add stroke style
      ctx.lineWidth = lineWith
      ctx.strokeStyle = color
      ctx.stroke()
      ctx.restore()
      ctx.closePath()
  }

}

function roundRect(ctx, x, y, width, height, radius) {
    if (typeof radius === 'number') {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
      radius = Object.assign({ tl: 0, tr: 0, br: 0, bl: 0 }, radius);
    }
  
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.arcTo(x + width, y, x + width, y + radius.tr, radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.arcTo(x + width, y + height, x + width - radius.br, y + height, radius.br);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius.bl, radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.arcTo(x, y, x + radius.tl, y, radius.tl);
    ctx.closePath();
  }