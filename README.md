# InsightVault

## Inspiration
I wanted to explore the stock market and see how news and public sentiment actually affect prices. Most tools either focus on numbers or media, but don’t connect the two. InsightVault puts them together in one dashboard, showing the story behind the numbers in real time.

## What it does
InsightVault is a comprehensive competitor intelligence dashboard that aggregates and visualizes critical business data.
*   **Real-time Dashboard:** Displays a centralized view of tracked competitors with key metrics at a glance.
*   **Sentiment Analysis:** Analyzes news articles to generate daily sentiment scores (Positive, Neutral, Negative), visualizing trends over time.
*   **Financial Tracking:** Plots historical stock data alongside sentiment metrics to reveal correlations between news cycles and market performance.
*   **Media Monitoring:** Tracks the volume of media mentions and calculates day-over-day and week-over-week changes.
*   **Dynamic Filtering:** Allows users to toggle between 7-day, 30-day, and 90-day views to analyze short-term buzz or long-term trends.

## How I built it
We architected a full-stack solution designed for performance and scalability.
*   **Frontend:** Built with **React** and **Vite** for a fast, responsive user experience. We used **Tailwind CSS** for modern styling and **Recharts** for rendering complex, interactive data visualizations.
*   **Backend:** Developed a RESTful API using **Node.js** and **Express**. We implemented a modular Service-Controller-Route architecture to keep business logic clean and maintainable.
*   **Database:** Utilized **PostgreSQL** for robust data storage, handling complex relationships between organizations, stock data, and media articles.
*   **Data Ingestion:** Integrated external APIs (MarketData, News API) with background schedulers to fetch historical data and maintain up-to-date intelligence without blocking user interactions.

## Challenges I ran into
*   **Performance Optimization:** As the volume of news data grew, the dashboard initially suffered from excessive re-renders. We solved this by implementing React memoization strategies (`useMemo`, `useCallback`) and optimizing state management, resulting in a smooth, lag-free experience.
*   **Data Synchronization:** Fetching bulk historical data for new competitors caused long wait times. We addressed this by decoupling the ingestion process, moving it to asynchronous background services so users could interact with the app immediately while data populated in the background.
*   **Sentiment Quantification:** Converting raw sentiment scores (0-2 scale) into user-friendly visual indicators required careful normalization logic to ensure the UI accurately reflected the data's nuance.

## Accomplishments that we’re proud of
*   **Seamless User Experience:** Successfully implementing an "infinite scroll" news feed that preserves scroll position and loads data dynamically without jarring page jumps.
*   **Clean Architecture:** Refactoring a monolithic backend into a clean, scalable MVC pattern that makes adding new features straightforward.
*   **Real-time Intelligence:** Building a system that doesn't just display static data but calculates live metrics like "Daily Sentiment Change" and "Media Mention Growth" on the fly.

## What we learned
*   **React Performance Patterns:** Deepened our understanding of React's rendering lifecycle and how to effectively prevent wasted render cycles in data-heavy applications.
*   **Asynchronous Architecture:** Learned the importance of non-blocking operations in Node.js to maintain API responsiveness during heavy data processing tasks.
*   **Data Visualization:** Gained expertise in transforming raw database records into meaningful, interactive charts that tell a story.

## What’s next for InsightVault
*   **AI-Powered Summaries:** Integrating LLMs to generate automatic executive summaries of daily news for each competitor.
*   **Custom Alerts:** Adding a notification system to alert users when sentiment or stock price crosses a user-defined threshold.
*   **Social Media Integration:** Expanding data sources to include Twitter/X and Reddit for a broader sentiment analysis scope.
*   **Export Functionality:** Allowing users to export intelligence reports as PDF or CSV files for stakeholder presentations.
