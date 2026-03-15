import knowledgeBase from "../data/medicalKnowledge.js";
import { buildVectorIndex, searchVectorIndex } from "./vectorStoreService.js";

const vectorIndex = buildVectorIndex(knowledgeBase);

export const retrieveMedicalContext = (query = "", topK = 3) => {
  if (!query.trim()) {
    return [];
  }

  return searchVectorIndex(vectorIndex, query, topK)
    .filter((doc) => doc.score > 0)
    .map((doc) => `${doc.title}: ${doc.content}`);
};
