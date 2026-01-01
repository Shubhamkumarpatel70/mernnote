import express from "express";
import { InferenceClient } from "@huggingface/inference";

const router = express.Router();

const fallbackSummary = (text) => {
  if (!text) return "";
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let summary = "";
  for (let i = 0; i < sentences.length && summary.length < 300; i++) {
    summary += sentences[i].trim() + " ";
  }
  summary = summary.trim();
  if (!summary.endsWith(".")) summary += ".";
  return summary;
};

const hfClient = process.env.HF_TOKEN
  ? new InferenceClient({ apiKey: process.env.HF_TOKEN })
  : null;

router.post("/", async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string")
    return res.status(400).json({ error: "Text is required and must be a string" });

  let summary = fallbackSummary(text);
  let source = "fallback";

  if (hfClient && text.length > 50) {
    try {
      const output = await hfClient.summarization({
        model: "facebook/bart-large-cnn",
        inputs: text,
      parameters: {
    max_new_tokens: 300,   
    min_length: 5,        
    max_length: 400
  },
      });

      let hfSummary = Array.isArray(output) ? (output[0]?.summary_text || output[0]?.generated_text) : output;
      if (hfSummary && hfSummary.trim() !== text.trim()) {
        summary = hfSummary.trim();
        source = "genai";
      }
    } catch (err) {
      console.error("HF API call failed, using fallback:", err.message);
    }
  }

  res.json({ summary, source });
});

export default router;
