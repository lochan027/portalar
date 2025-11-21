/**
 * Perplexity AI Service
 * 
 * Integrates with Perplexity API to generate summaries and extract metadata.
 * Handles both real API calls and mock mode for development/demo.
 * 
 * API Documentation: https://docs.perplexity.ai/
 * Get API Key: https://www.perplexity.ai/settings/api
 * 
 * Features:
 * - Article summarization from URLs
 * - Content generation from queries
 * - Metadata extraction (Open Graph)
 * - Mock mode for testing without API key
 * - Rate limiting and error handling
 */

const axios = require('axios');

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const PERPLEXITY_MODEL = 'llama-3.1-sonar-small-128k-online'; // Fast, cost-effective model

/**
 * Summarize article from URL
 */
async function summarizeArticle(url, maxLength = 200) {
  // Check if mock mode is enabled
  if (process.env.PERPLEXITY_MOCK_MODE === 'true') {
    return generateMockSummary(url);
  }

  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️  Perplexity API key not configured, using mock mode');
    return generateMockSummary(url);
  }

  try {
    // Construct prompt for article summarization
    const prompt = `
Please analyze the article at this URL: ${url}

Provide:
1. A concise headline (max 60 characters)
2. A brief summary (max ${maxLength} characters)
3. 3-5 relevant keywords

Format your response as JSON:
{
  "headline": "...",
  "summary": "...",
  "keywords": ["...", "..."],
  "readTime": "X min"
}
`;

    const response = await axios.post(
      PERPLEXITY_API_URL,
      {
        model: PERPLEXITY_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes articles for AR display. Keep responses concise and engaging.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.2, // Lower temperature for more factual responses
        top_p: 0.9,
        search_domain_filter: [extractDomain(url)], // Focus search on article domain
        return_images: false,
        return_related_questions: false,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    // Parse response
    const content = response.data.choices[0].message.content;
    
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(content);
      return {
        headline: parsed.headline || 'Article Summary',
        summary: parsed.summary || content.substring(0, maxLength),
        keywords: parsed.keywords || [],
        readTime: parsed.readTime || estimateReadTime(parsed.summary),
        source: url,
      };
    } catch {
      // Fallback: extract headline and summary from text
      const lines = content.split('\n').filter(l => l.trim());
      return {
        headline: lines[0]?.substring(0, 60) || 'Article Summary',
        summary: lines.slice(1).join(' ').substring(0, maxLength),
        keywords: [],
        readTime: estimateReadTime(content),
        source: url,
      };
    }
  } catch (error) {
    console.error('❌ Perplexity API error:', error.message);
    
    if (error.response) {
      console.error('API Response:', error.response.data);
    }

    // Handle specific error types
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 401) {
      throw new Error('Invalid Perplexity API key');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. The article may be too large or unavailable.');
    }

    // Fallback to mock on error
    console.warn('⚠️  Falling back to mock summary');
    return generateMockSummary(url);
  }
}

/**
 * Generate content from query (not URL-based)
 */
async function generateContent(query, maxLength = 200) {
  // Check if mock mode is enabled
  if (process.env.PERPLEXITY_MOCK_MODE === 'true') {
    return generateMockContent(query);
  }

  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️  Perplexity API key not configured, using mock mode');
    return generateMockContent(query);
  }

  try {
    const prompt = `
Topic: ${query}

Provide a concise, engaging summary suitable for AR display:
1. A catchy headline (max 60 characters)
2. A brief description (max ${maxLength} characters)
3. 3-5 relevant keywords

Format as JSON:
{
  "headline": "...",
  "summary": "...",
  "keywords": ["..."]
}
`;

    const response = await axios.post(
      PERPLEXITY_API_URL,
      {
        model: PERPLEXITY_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates engaging AR content summaries.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 400,
        temperature: 0.7, // Higher temperature for creative content
        top_p: 0.9,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    const content = response.data.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      return {
        headline: parsed.headline || query,
        summary: parsed.summary || content.substring(0, maxLength),
        keywords: parsed.keywords || [],
        readTime: estimateReadTime(parsed.summary),
      };
    } catch {
      const lines = content.split('\n').filter(l => l.trim());
      return {
        headline: lines[0]?.substring(0, 60) || query,
        summary: lines.slice(1).join(' ').substring(0, maxLength),
        keywords: [],
        readTime: estimateReadTime(content),
      };
    }
  } catch (error) {
    console.error('❌ Perplexity API error:', error.message);
    return generateMockContent(query);
  }
}

/**
 * Extract metadata from URL using simple HTTP request
 * Falls back to basic parsing if Perplexity fails
 */
async function extractMetadata(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PortalAR/1.0)',
      },
    });

    const html = response.data;

    // Extract Open Graph metadata
    const title = extractMetaTag(html, 'og:title') || extractTitle(html);
    const description = extractMetaTag(html, 'og:description') || extractMetaTag(html, 'description');
    const image = extractMetaTag(html, 'og:image');
    const siteName = extractMetaTag(html, 'og:site_name');

    return {
      title: title?.substring(0, 200),
      description: description?.substring(0, 500),
      imageUrl: image,
      siteName,
      url,
    };
  } catch (error) {
    console.error('❌ Metadata extraction error:', error.message);
    
    return {
      title: 'Article',
      description: 'Unable to extract metadata',
      imageUrl: null,
      siteName: extractDomain(url),
      url,
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate mock summary for testing (no API key required)
 */
function generateMockSummary(url) {
  const domain = extractDomain(url);
  
  return {
    headline: `Breaking News from ${domain}`,
    summary: 'This is a mock summary generated for demonstration purposes. In production, this would contain actual article content extracted via Perplexity AI.',
    keywords: ['technology', 'innovation', 'news'],
    readTime: '3 min',
    source: url,
    mock: true,
  };
}

/**
 * Generate mock content for testing
 */
function generateMockContent(query) {
  return {
    headline: `${query} - Latest Updates`,
    summary: `Mock content about ${query}. This demonstrates the AR experience without requiring an API key. Enable Perplexity integration to get real-time summaries.`,
    keywords: query.split(' ').slice(0, 3),
    readTime: '2 min',
    mock: true,
  };
}

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'Unknown Source';
  }
}

/**
 * Estimate reading time from text length
 */
function estimateReadTime(text) {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min`;
}

/**
 * Extract Open Graph meta tag from HTML
 */
function extractMetaTag(html, property) {
  const regex = new RegExp(`<meta[^>]*(?:property|name)=["'](?:og:)?${property}["'][^>]*content=["']([^"']*)["']`, 'i');
  const match = html.match(regex);
  return match ? match[1] : null;
}

/**
 * Extract title from HTML
 */
function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? match[1] : null;
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  summarizeArticle,
  generateContent,
  extractMetadata,
};
