chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in content script:', request);
  if (request.action === 'extractArticle') {
    const articleText = extractArticleText();
    sendResponse({ articleText: articleText });
  }
});

// Function to extract article text
function extractArticleText() {
  console.log('Extracting article text...');
  // Try different article extraction strategies
  const strategies = [
    // Strategy 1: Look for <article> tag
    () => {
      const articleBody = document.querySelector('article');
      return articleBody ? articleBody.innerText : null;
    },
    // Strategy 2: Look for common classes in news articles
    () => {
      const articleBody = document.querySelector('.article-body, .articleBody, #article-body');
      return articleBody ? articleBody.innerText : null;
    },
    // Strategy 3: Fallback to paragraphs
    () => {
      const paragraphs = document.querySelectorAll('p');
      const filteredParagraphs = Array.from(paragraphs)
        .filter(p => p.textContent.length > 100) // Filter out short paragraphs
        .map(p => p.textContent)
        .join('\n\n');
      return filteredParagraphs.length > 0 ? filteredParagraphs : null;
    }
  ];

  // Try each strategy until we find text
  for (const strategy of strategies) {
    const text = strategy();
    if (text) return text;
  }

  return 'Could not extract article text';
}
