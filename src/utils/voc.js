import fs from 'fs-extra';

/**
 * Parse chunked markdown file with verbatims
 */
export async function parseChunkedVerbatims(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  
  const data = {
    bank: null,
    quarter: null,
    platform: null,
    chunk: null,
    verbatims: []
  };
  
  // Extract metadata from header
  const bankMatch = content.match(/Bank:\s*(.+)/i);
  if (bankMatch) data.bank = bankMatch[1].trim();
  
  const quarterMatch = content.match(/Quarter:\s*(.+)/i);
  if (quarterMatch) data.quarter = quarterMatch[1].trim();
  
  const platformMatch = content.match(/Platform:\s*(.+)/i);
  if (platformMatch) data.platform = platformMatch[1].trim();
  
  const chunkMatch = content.match(/Chunk:\s*(.+)/i);
  if (chunkMatch) data.chunk = chunkMatch[1].trim();
  
  // Parse verbatims - format: [id] Rating: X Verbatim: ...
  // Handle both formats: [id] Rating: X Verbatim: ... and [id]\nRating: X\nVerbatim: ...
  const verbatimRegex = /\[(\d+)\]\s*Rating:\s*(\d+)\s*Verbatim:\s*([\s\S]*?)(?=\n---|\n\[|\n#|$)/g;
  let match;
  
  while ((match = verbatimRegex.exec(content)) !== null) {
    const id = parseInt(match[1], 10);
    const rating = parseInt(match[2], 10);
    const verbatim = match[3].trim();
    
    if (verbatim) {
      data.verbatims.push({
        id,
        rating,
        verbatim
      });
    }
  }
  
  return data;
}

/**
 * Generate prompt for converting verbatims to JSON
 */
export function generateVocJsonPrompt(chunkData) {
  const verbatimsText = chunkData.verbatims.map(v => 
    `[${v.id}]\nRating: ${v.rating}\nVerbatim: ${v.verbatim}`
  ).join('\n\n---\n\n');
  
  return `# Convert App Store Verbatims to Structured JSON

Convert these app store verbatims into structured JSON using the schema below.

## Metadata
- Bank: ${chunkData.bank || 'Unknown'}
- Quarter: ${chunkData.quarter || 'Unknown'}
- Platform: ${chunkData.platform || 'Unknown'}
- Chunk: ${chunkData.chunk || 'Unknown'}

## Verbatims

${verbatimsText}

---

## Rules:
- Preserve original wording exactly as written.
- Infer sentiment (positive, negative, neutral, mixed).
- Extract topics as an array of relevant keywords (e.g., ["login", "crash", "payment"]).
- Assign UX category from: reliability, usability, performance, features, design, support, security, or other.
- Do not summarize or paraphrase.
- Return valid JSON only.

## Output Schema

Generate JSON in this exact format:

\`\`\`json
{
  "bank": "${chunkData.bank || ''}",
  "quarter": "${chunkData.quarter || ''}",
  "platform": "${chunkData.platform || ''}",
  "entries": [
    {
      "id": 1,
      "rating": 2,
      "sentiment": "negative",
      "topics": ["login", "crash"],
      "ux_category": "reliability",
      "verbatim": "App crashes after login..."
    }
  ]
}
\`\`\`

## UX Category Guide

- **reliability**: Crashes, bugs, errors, stability issues
- **usability**: Navigation, clarity, ease of use, confusion
- **performance**: Speed, loading times, responsiveness
- **features**: Missing features, feature requests, functionality
- **design**: UI/UX design, visual appearance, aesthetics
- **support**: Customer service, help, assistance
- **security**: Security concerns, privacy, data protection
- **other**: Anything that doesn't fit above categories

## Sentiment Guidelines

- **positive**: Expresses satisfaction, praise, or positive experience
- **negative**: Expresses dissatisfaction, complaints, or negative experience
- **neutral**: Factual statements without clear emotional tone
- **mixed**: Contains both positive and negative elements

Begin conversion now. Return only the JSON, no markdown formatting.`;
}

/**
 * Parse app store review format and convert to chunked format
 */
export async function parseAppStoreReviews(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  
  const data = {
    bank: null,
    quarter: null,
    platform: null,
    verbatims: []
  };
  
  // Extract metadata from header
  // Format: # 📱 App Review Report - **GXS** (App Store, Q1 2025)
  const headerMatch = content.match(/#.*?App Review Report.*?\*\*(.+?)\*\*.*?\((.+?),\s*(.+?)\)/i);
  if (headerMatch) {
    data.bank = headerMatch[1].trim();
    const storeMatch = headerMatch[2].trim();
    const quarterMatch = headerMatch[3].trim();
    
    // Extract platform from store name
    if (storeMatch.toLowerCase().includes('app store') || storeMatch.toLowerCase().includes('ios')) {
      data.platform = 'iOS';
    } else if (storeMatch.toLowerCase().includes('play store') || storeMatch.toLowerCase().includes('android')) {
      data.platform = 'Android';
    } else {
      data.platform = storeMatch;
    }
    
    // Extract quarter
    data.quarter = quarterMatch;
  }
  
  // Also try to extract from filename if header doesn't have it
  // Format: gxs_ios_q125.md -> GXS, iOS, Q1 2025
  const filename = filePath.split('/').pop() || '';
  if (!data.bank || !data.platform || !data.quarter) {
    const filenameMatch = filename.match(/(\w+)_(ios|android|ps)_q(\d+)/i);
    if (filenameMatch) {
      if (!data.bank) data.bank = filenameMatch[1].toUpperCase();
      if (!data.platform) {
        const plat = filenameMatch[2].toLowerCase();
        data.platform = plat === 'ps' ? 'Play Store' : plat === 'ios' ? 'iOS' : 'Android';
      }
      if (!data.quarter) {
        const qNum = filenameMatch[3];
        const year = qNum.length === 3 ? `20${qNum[0]}${qNum.slice(1)}` : qNum;
        const quarter = qNum.length === 3 ? `Q${qNum[0]}` : `Q${qNum[0]}`;
        data.quarter = `${quarter} ${year}`;
      }
    }
  }
  
  // Parse reviews
  // Format: ### Review - YYYY-MM-DD ... Rating: ★☆☆☆☆ ... Subject: ... > body
  const reviewRegex = /### Review - (\d{4}-\d{2}-\d{2})([\s\S]*?)(?=### Review|---|$)/g;
  let reviewMatch;
  let id = 1;
  
  while ((reviewMatch = reviewRegex.exec(content)) !== null) {
    const reviewContent = reviewMatch[2];
    
    // Extract rating (convert stars to number)
    const ratingMatch = reviewContent.match(/\*\*Rating:\*\*\s*(★+)/);
    let rating = 0;
    if (ratingMatch) {
      rating = ratingMatch[1].length; // Count stars
    }
    
    // Extract subject
    const subjectMatch = reviewContent.match(/\*\*Subject:\*\*\s*(.+?)(?=\n|$)/);
    const subject = subjectMatch ? subjectMatch[1].trim() : '';
    
    // Extract body (blockquote)
    const bodyMatch = reviewContent.match(/>\s*([\s\S]*?)(?=\n---|\n###|$)/);
    const body = bodyMatch ? bodyMatch[1].trim() : '';
    
    // Combine subject and body as verbatim
    let verbatim = '';
    if (subject && body) {
      verbatim = `${subject}\n\n${body}`;
    } else if (subject) {
      verbatim = subject;
    } else if (body) {
      verbatim = body;
    }
    
    // Only add if we have a verbatim and rating
    if (verbatim && rating > 0) {
      data.verbatims.push({
        id: id++,
        rating,
        verbatim: verbatim.trim()
      });
    }
  }
  
  return data;
}

/**
 * Convert app store review format to chunked format
 */
export function convertToChunkedFormat(reviewData, chunkSize = 20) {
  const chunks = [];
  const totalVerbatims = reviewData.verbatims.length;
  const numChunks = Math.ceil(totalVerbatims / chunkSize);
  
  for (let i = 0; i < numChunks; i++) {
    const startIdx = i * chunkSize;
    const endIdx = Math.min(startIdx + chunkSize, totalVerbatims);
    const verbatims = reviewData.verbatims.slice(startIdx, endIdx);
    
    const chunkNumber = String(i + 1).padStart(2, '0');
    
    let chunkContent = `# GXS App Store Verbatims\n`;
    chunkContent += `Bank: ${reviewData.bank || 'GXS'}\n`;
    chunkContent += `Quarter: ${reviewData.quarter || 'Unknown'}\n`;
    chunkContent += `Platform: ${reviewData.platform || 'Unknown'}\n`;
    chunkContent += `Chunk: ${chunkNumber}\n\n`;
    
    verbatims.forEach(v => {
      chunkContent += `[${v.id}]\n`;
      chunkContent += `Rating: ${v.rating}\n`;
      chunkContent += `Verbatim: ${v.verbatim}\n\n`;
      chunkContent += `---\n\n`;
    });
    
    chunks.push({
      chunkNumber,
      content: chunkContent.trim(),
      verbatimCount: verbatims.length
    });
  }
  
  return chunks;
}

