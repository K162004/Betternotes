const chunkText = (text, chunkSize = 100, overlap = 20) => {
  // Split text into individual words
  const words = text.split(' ');
  
  const chunks = [];
  let i = 0;

  while (i < words.length) {
    // Take 'chunkSize' words starting from position i
    const chunkWords = words.slice(i, i + chunkSize);
    
    // Join them back into a sentence
    const chunkText = chunkWords.join(' ');
    
    chunks.push(chunkText);

    // Move forward by (chunkSize - overlap) 
    // overlap means some words repeat in next chunk
    // this helps AI understand context better
    i += (chunkSize - overlap);
  }

  return chunks;
};

module.exports = chunkText;