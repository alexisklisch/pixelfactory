// worker.js
import { getPresetSize } from './utils/getPresetSize.js';
import { separateWords } from './utils/stringUtils.js';
import { recursiveShapes } from './handlers/recursiveShapes.js'

self.onmessage = async function(event) {

    console.time('worker')
    const {workspace, config} = event.data

    let canvas = undefined
    if (!config.isServer) canvas = new OffscreenCanvas(1, 1)
    if (config.isServer) throw new Error('Canvas is not available in this environment')

    const ctx = canvas.getContext("2d");

    // Configurar el tamaño del canvas
    if (workspace.size[0] === "@") {
        const size = getPresetSize(workspace.size);
        canvas.width = size.w;
        canvas.height = size.h;
    } else {
        const [w, h] = workspace.size.split('x');
        canvas.width = w;
        canvas.height = h;
    }


    // Aplicar estilos y dibujar
    ctx.fillStyle = separateWords(workspace.styles.background)[1];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar los hijos del workspace
    for (const child of workspace.children) {
        await recursiveShapes(child, ctx);
    }

    // Convertir canvas a Blob y enviar de vuelta al hilo principal
    canvas.convertToBlob({ type: "image/png" }).then(blob => {
        self.postMessage(blob);
    }).catch(err => {
        self.postMessage({ error: err.message });
    })
    console.timeEnd('worker')
};
