const VECTOR_SIZE = 128;

const tokenize = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);

const hashToken = (token) => {
  let hash = 0;
  for (const character of token) {
    hash = (hash * 31 + character.charCodeAt(0)) % VECTOR_SIZE;
  }
  return hash;
};

export const embedText = (text = "") => {
  const vector = Array.from({ length: VECTOR_SIZE }, () => 0);
  const tokens = tokenize(text);

  tokens.forEach((token) => {
    vector[hashToken(token)] += 1;
  });

  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / magnitude);
};

export const cosineSimilarity = (left = [], right = []) =>
  left.reduce((sum, value, index) => sum + value * (right[index] || 0), 0);

export const buildVectorIndex = (documents = []) =>
  documents.map((document) => ({
    ...document,
    embedding: embedText(`${document.title || ""} ${document.tags?.join(" ") || ""} ${document.content || ""}`)
  }));

export const searchVectorIndex = (documents = [], query = "", limit = 3) => {
  const queryEmbedding = embedText(query);

  return documents
    .map((document) => ({
      ...document,
      score: Number(cosineSimilarity(queryEmbedding, document.embedding || []).toFixed(4))
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
};
