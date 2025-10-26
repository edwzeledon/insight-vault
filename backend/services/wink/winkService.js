import dotenv from 'dotenv';
dotenv.config({ path: '../../.env'})
import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';

const nlp = winkNLP(model);
const its = nlp.its;
const as = nlp.as;

export const getSentiment = async (text) => {
    const doc = nlp.readDoc(text);
    const score = doc.out(its.sentiment);
    const sentiment = getSentimentLabel(score);
    return sentiment;
}

const getSentimentLabel = (score) => {
  if (score > 0.2) return 2; // positive
  if (score < -0.2) return 0; // negative
  return 1; // neutral
};