const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const fetch = require("node-fetch");
const textToSpeech = require("@google-cloud/text-to-speech");
const systemPrompt = require("./systemPrompt");
const getRandomTheme = require("./themes");
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
  const randomTheme = getRandomTheme();

  try {
    const { emojis, listener, characters } = req.body;
    console.log("Received emojis:", emojis); // Debug log

    // Build the prompt based on available information
    let userPrompt = "";

    if (listener && Object.keys(listener).length > 0) {
      // Add listener details if available
      userPrompt += `LISTENER: ${JSON.stringify(listener)}`;

      // Add characters if available
      if (characters && Object.keys(characters).length > 0) {
        userPrompt += `CHARACTERS: ${JSON.stringify(characters)}`;
      }

      userPrompt += `
        Please create a personalized story using these emojis: ${emojis}.
        Start the story with a greeting to the LISTENER (and use a variety of elaborate greetings).
        The CHARACTERS are family, pets, friends, etc., of the LISTENER so relate them appropriately in the story. Include any number of them in the story, selecting them randomly, including selecting zero. If you include them don't always group them all together but make them appear in different places.
        Make the story age-appropriate for a ${listener.age} year old.
      `;
    } else {
      // Use basic prompt if no listener details
      userPrompt = `Here are the emojis to create a story with: ${emojis}.`;
    }

    const systemPromptWithTheme =
      systemPrompt +
      `\n\nThe story should follow the theme: ${randomTheme.theme}: ${randomTheme.description}. Ensure the moral shines through by the end.`;
    console.log("System prompt with theme:", systemPromptWithTheme);
    console.log("User prompt:", userPrompt);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPromptWithTheme,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        max_tokens: 750,
        temperature: 0.7,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      }),
    });

    const data = await response.json();

    // Add error logging
    console.log("OpenAI API Response:", JSON.stringify(data, null, 2));

    // Check if the response has an error
    if (data.error) {
      console.error("OpenAI API Error:", data.error);
      return res
        .status(500)
        .json({ error: data.error.message || "OpenAI API error" });
    }

    // Check if we have the expected data structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected API response structure:", data);
      return res
        .status(500)
        .json({ error: "Invalid response from OpenAI API" });
    }

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

    // Remove emojis from the text before sending to Google TTS
    const textWithoutEmojis = text.replace(/[\p{Emoji}]/gu, "");

    // Trim any extra spaces that might be left after removing emojis
    const cleanText = textWithoutEmojis.replace(/\s+/g, " ").trim();

    const client = new textToSpeech.TextToSpeechClient({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    });

    console.log("Getting ready to generate audio...");

    const [response] = await client.synthesizeSpeech({
      input: { text: cleanText }, // Use the cleaned text
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
  console.log(`Try opening: http://localhost:${PORT}`);
  console.log(
    `Example URL with parameters: http://localhost:${PORT}/?name=Maddie&age=4&sex=Female&mom=Mom&momDesc=loving%20mother&dad=Dad&brother=Miles&brotherDesc=little%20brother%20who%20is%202&toy=Floppy&toyDesc=beloved%20toy%20bunny`
  );
});

// Add error handling for the server
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});
