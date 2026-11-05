import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Google Gen AI client for server-side operations
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Real-time translation endpoint using gemini-3.8-flash
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang = 'auto', targetLangs = ['pt', 'en', 'es', 'fr', 'de', 'it', 'ja'] } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for translation.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Fallback response if API key is not configured
      return res.json({
        translations: {
          pt: text,
          en: text,
          es: text,
          fr: text,
          de: text,
          it: text,
          ja: text,
        },
        phonetic: '',
        note: 'Chave Gemini API não configurada; mantendo texto original.',
      });
    }

    const prompt = `Translate the vocabulary word or short expression "${text}" (source language: ${sourceLang}) into the following languages: ${targetLangs.join(', ')}.
Also provide an IPA phonetic transcription or pronunciation guide for the word.
Return standard JSON with format:
{
  "translations": {
    "pt": "tradução em português",
    "en": "english translation",
    "es": "traducción en español",
    "fr": "traduction en français",
    "de": "deutsche Übersetzung",
    "it": "traduzione in italiano",
    "ja": "日本語の翻訳"
  },
  "phonetic": "/fəˈnɛt.ɪk/",
  "context": "Short grammatical category or brief context in Portuguese"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translations: {
              type: Type.OBJECT,
              properties: {
                pt: { type: Type.STRING },
                en: { type: Type.STRING },
                es: { type: Type.STRING },
                fr: { type: Type.STRING },
                de: { type: Type.STRING },
                it: { type: Type.STRING },
                ja: { type: Type.STRING },
              },
            },
            phonetic: { type: Type.STRING },
            context: { type: Type.STRING },
          },
          required: ['translations'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Translation API error:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao traduzir com Gemini AI',
      translations: {},
    });
  }
});

// Auto-detect vocabulary hotspots in an image using Gemini 3.8 Flash
app.post('/api/suggest-hotspots', async (req, res) => {
  try {
    const { imageUrl, theme } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    const prompt = `Based on an image or theme "${theme || imageUrl || 'general educational scene'}", suggest 4 to 6 interesting vocabulary items that would typically exist in such a scene.
For each item, specify estimated coordinates (x between 10 and 90, y between 10 and 90 as percentages), the object name in Portuguese, English, Spanish, French, German, Italian, and Japanese, plus phonetic pronunciation.
Return a JSON array of objects.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER, description: 'Percentage from left 10-90' },
              y: { type: Type.NUMBER, description: 'Percentage from top 10-90' },
              translations: {
                type: Type.OBJECT,
                properties: {
                  pt: { type: Type.STRING },
                  en: { type: Type.STRING },
                  es: { type: Type.STRING },
                  fr: { type: Type.STRING },
                  de: { type: Type.STRING },
                  it: { type: Type.STRING },
                  ja: { type: Type.STRING },
                },
                required: ['pt', 'en', 'es'],
              },
              phonetic: { type: Type.STRING },
              color: { type: Type.STRING },
            },
            required: ['x', 'y', 'translations'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    return res.json({ hotspots: parsed });
  } catch (error: any) {
    console.error('Suggest hotspots error:', error);
    return res.status(500).json({ error: error.message || 'Failed to suggest hotspots' });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Error starting server:', err);
});
