import "dotenv/config";
import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient({ apiKey: process.env.HF_TOKEN });

const run = async () => {
  try {
    const output = await client.summarization({
      model: "facebook/bart-large-cnn",
      inputs: "The Eiffel Tower is the tallest structure in Paris and was completed in 1889.",
      provider: "hf-inference",
      parameters: { max_new_tokens: 50 },
      options: { wait_for_model: true },
    });

    console.log(output);
  } catch (err) {
    console.error("HF Error:", err);
  }
};


