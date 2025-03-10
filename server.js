const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const fetch = require("node-fetch");
const textToSpeech = require("@google-cloud/text-to-speech");
process.env.GOOGLE_OAUTH_TOKEN_LIFETIME = 3600;
process.env.NODE_OPTIONS = "--openssl-legacy-provider";
// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "emoji.html"));
});

// OpenAI story generation endpoint
app.post("/api/generate-story", async (req, res) => {
  console.log(process.env.OPENAI_API_KEY);

  try {
    const { emojis } = req.body;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a creative storyteller for children. Create a short, engaging, and kid-friendly story (about 3-4 paragraphs) based on the emojis provided. Make it positive, fun, and appropriate for all ages.",
          },
          {
            role: "user",
            content: `Create a story using these emojis: ${emojis}`,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      }),
    });

    console.log(response);

    const data = await response.json();
    console.log(data);
    res.json({ story: data.choices[0].message.content });
  } catch (error) {
    console.error("Error generating story:", error);
    res.status(500).json({ error: "Failed to generate story" });
  }
});

// Google Text-to-Speech endpoint
app.post("/api/text-to-speech", async (req, res) => {
  try {
    const { text } = req.body;

    const client = new textToSpeech.TextToSpeechClient({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    });

    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: "en-US",
        name: "en-US-Neural2-H", // This is a friendly, younger-sounding voice
        ssmlGender: "FEMALE",
      },
      audioConfig: {
        audioEncoding: "MP3",
        pitch: 2, // Makes the voice slightly higher pitched
        speakingRate: 0.9, // Slightly slower speaking rate for better comprehension
      },
    });

    const audioContent = Buffer.from(response.audioContent).toString("base64");
    console.log("Audio content generated successfully", !!audioContent); // Debug log

    res.json({ audioContent });
  } catch (error) {
    console.error("Error converting to speech:", error);
    res.status(500).json({ error: "Failed to convert to speech" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
