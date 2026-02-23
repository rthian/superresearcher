# Research Methodology: App Store VoC

## Source
Appbot export of GXBank (GXB) app reviews from App Store and Google Play.

## Processing
1. Raw Markdown files in `context/transcripts/`
2. Chunking (if needed) for AI context limits
3. Insight extraction via SuperResearcher
4. Action generation from insights

## Review Structure (per Appbot block)
- Date, App, Country, Rating (1-5), Sentiment
- Topics, Custom Topics, Language, Author, Version
- Subject + Body (verbatim)
