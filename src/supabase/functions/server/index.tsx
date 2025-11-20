import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-84a71643/health", (c) => {
  return c.json({ status: "ok" });
});

// LLM chat endpoint (server-side API calls to avoid CORS)
// OpenAI only
app.post("/make-server-84a71643/chat", async (c) => {
  try {
    const { 
      apiKey, 
      messages, 
      model = "gpt-4o-mini", 
      temperature = 0.7, 
      maxTokens = 200,
      provider = "openai"
    } = await c.req.json();

    if (!apiKey) {
      return c.json({ error: "API key is required" }, 400);
    }

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: "Messages array is required" }, 400);
    }

    console.log(`Calling OpenAI API with model:`, model);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_completion_tokens: maxTokens
        })
      });

      console.log("OpenAI Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("OpenAI Success! Response received");
        return c.json(data);
      }

      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      return c.json({ 
        error: `OpenAI API error: ${response.status}`,
        details: errorText,
        endpoint: "https://api.openai.com/v1/chat/completions"
      }, response.status);

    } catch (fetchError) {
      console.error("OpenAI fetch error:", fetchError);
      return c.json({ 
        error: "OpenAI API request failed",
        details: fetchError.message
      }, 500);
    }

  } catch (error) {
    console.error("Server error:", error);
    return c.json({ 
      error: "Internal server error", 
      details: error.message 
    }, 500);
  }
});

Deno.serve(app.fetch);