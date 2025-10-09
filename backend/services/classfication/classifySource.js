import {
    legalKeywords,
    leadershipKeywords,
    acquisitionKeywords,
    productStrategyKeywords,
    regulationPolicyKeywords,
    hiringLayoffKeywords
} from "../../config/keywords.js";

function classifyArticle(article) {
    const text = (article.title + " " + article.description).toLowerCase()

    if (containsKeywords(text, leadershipKeywords)
        || containsKeywords(text, acquisitionKeywords)
        || containsKeywords(text, legalKeywords)
        || containsKeywords(text, productStrategyKeywords)
        || containsKeywords(text, regulationPolicyKeywords)
        || containsKeywords(text, hiringLayoffKeywords)
    ) {
        return article
    }
    return null
}

function containsKeywords(text, keywords) {
    return keywords.some(keyword => text.includes(keyword))
}

export const filteredArticles = (articles) => {
    return articles.map(classifyArticle).filter(article => article !== null);
}