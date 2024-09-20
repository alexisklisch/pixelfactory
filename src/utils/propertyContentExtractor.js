function contentExtractor(palabra) {
  const regex = new RegExp(`${palabra}\\(([^)]+)\\)`, 'g');
  
  return function(str) {
      let match;
      const resultados = [];

      while ((match = regex.exec(str)) !== null) {
          resultados.push(match[1]);
      }

      return resultados;
  };
}

// Gradients

export const linear = contentExtractor('linear')
export const url = contentExtractor('url')