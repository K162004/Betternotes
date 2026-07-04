const { ChromaClient } = require('chromadb');

const client = new ChromaClient({
  path: 'http://localhost:8000'
});

const getCollection = async () => {
  const collection = await client.getOrCreateCollection({
    name: 'betternotes',
  });
  return collection;
};

module.exports = getCollection;