import Groq from "groq-sdk";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

function detectProvider(apiKey: string) {
  if (apiKey.startsWith("gsk_")) return "groq";
  if (apiKey.startsWith("sk-ant-")) return "anthropic";
  if (apiKey.startsWith("AIza")) return "google";
  if (apiKey.startsWith("sk-proj-") || apiKey.startsWith("sk-")) return "openai";
  return "groq"; // Default fallback
}

export async function generateJSON<T>(
  prompt: string,
  systemInstruction: string,
  _modelName = "llama-3.3-70b-versatile",
  maxTokens?: number,
  customApiKey?: string
): Promise<T> {
  const key = customApiKey || process.env.GROQ_API_KEY;
  if (!key) throw new Error("No API key provided and GROQ_API_KEY is not set");

  const provider = detectProvider(key);

  if (provider === "openai") {
    const openai = new OpenAI({ apiKey: key });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemInstruction + "\n\nRespond ONLY with a valid JSON object." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: maxTokens
    });
    const text = completion.choices[0]?.message?.content || "{}";
    return JSON.parse(text) as T;

  } else if (provider === "anthropic") {
    const anthropic = new Anthropic({ apiKey: key });
    const completion = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      system: systemInstruction + "\n\nRespond ONLY with a valid JSON object. Do not include markdown formatting or backticks around the JSON.",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens || 8192
    });
    // Anthropic returns an array of content blocks, text block has .text
    const block = completion.content.find(c => c.type === 'text');
    const text = block && block.type === 'text' ? block.text : "{}";
    // Clean up potential markdown if Claude ignored instructions
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText) as T;

  } else if (provider === "google") {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: maxTokens
      }
    });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text) as T;

  } else {
    // Default: Groq
    const groq = new Groq({ apiKey: key });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemInstruction + "\n\nRespond ONLY with a valid JSON object. Do not include markdown formatting or backticks around the JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: maxTokens
    });
    const text = completion.choices[0]?.message?.content || "{}";
    return JSON.parse(text) as T;
  }
}
