import {
    legalKeywords,
    leadershipKeywords,
    acquisitionKeywords,
    productStrategyKeywords,
    regulationPolicyKeywords,
    hiringLayoffKeywords
} from "./keywords";

function classifyArticle(article) {
    const text = (article.title + " " + article.description).toLowerCase()

    const tags = [];

    if (containsKeywords(text, leadershipKeywords)) tags.push("leadership");
    if (containsKeywords(text, acquisitionKeywords)) tags.push("acquisition")
    if (containsKeywords(text, legalKeywords)) tags.push("legal");
    if (containsKeywords(text, productStrategyKeywords)) tags.push("product")
    if (containsKeywords(text, regulationPolicyKeywords)) tags.push("regulation")
    if (containsKeywords(text, hiringLayoffKeywords)) tags.push("hiring")

    return tags.length > 0 ? { ...article, tags } : null
}

function containsKeywords(text, keywords) {
    const lower = text.toLowerCase();
    return keywords.some(keyword => lower.includes(keyword))
}

export const classifiedArticles = allArticles
    .map(classifyArticle)
    .filter(article => article !== null);