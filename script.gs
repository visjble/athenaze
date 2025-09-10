/**
 * Google Apps Script to extract a random sentence, translate it via Claude API, and email
 */

function emailRandomTranslatedSentence() {
  // Configuration - UPDATE THESE VALUES
  const DOC_NAME = "Athenaze_Texts";
  const EMAIL_RECIPIENT = "mazzon@gmail.com";
  const EMAIL_SUBJECT = "Random Sentence from Athenaze Texts";

  try {
    // Get API key from secure storage
    const ANTHROPIC_API_KEY = getApiKey();
    if (!ANTHROPIC_API_KEY) {
      throw new Error("Anthropic API key not found. Please run setupApiKey() first.");
    }

    // Find and read the Google Doc
    const files = DriveApp.getFilesByName(DOC_NAME);
    if (!files.hasNext()) {
      throw new Error(`Google Doc "${DOC_NAME}" not found`);
    }

    const docFile = files.next();
    const doc = DocumentApp.openById(docFile.getId());
    const docContent = doc.getBody().getText();

    if (!docContent || docContent.trim().length === 0) {
      throw new Error("The Google Doc appears to be empty");
    }

    // Extract sentences
    const sentences = extractSentencesClassical(docContent);
    if (sentences.length === 0) {
      throw new Error("No valid sentences found");
    }

    // Get random sentence
    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];

    // Translate via Claude API
    const translation = translateWithClaude(randomSentence, ANTHROPIC_API_KEY);

    // Send email with translation and original
    sendTranslationEmail(EMAIL_RECIPIENT, EMAIL_SUBJECT, translation, randomSentence);

    console.log(`Successfully sent translation to ${EMAIL_RECIPIENT}`);
    console.log(`Original: ${randomSentence}`);
    console.log(`Translation: ${translation}`);

  } catch (error) {
    console.error("Error:", error.toString());

    // Send error email
    const userEmail = Session.getActiveUser().getEmail();
    if (userEmail) {
      GmailApp.sendEmail(
        userEmail,
        "Translation Script Error",
        `Error occurred: ${error.toString()}`
      );
    }
  }
}

/**
 * SETUP: Store your API key securely (run this once)
 * Replace 'your-actual-api-key-here' with your real Anthropic API key
 */
// function setupApiKey() {
//   const apiKey = "your-actual-api-key-here"; // Replace with your real key

//   if (apiKey === "your-actual-api-key-here") {
//     console.error("❌ Please replace 'your-actual-api-key-here' with your actual Anthropic API key!");
//     return;
//   }

//   PropertiesService.getScriptProperties().setProperty('ANTHROPIC_API_KEY', apiKey);
//   console.log("✅ API key stored securely!");
//   console.log("You can now delete the key from this function and run your main script.");
// }

/**
 * Get API key from secure storage
 */
function getApiKey() {
  return PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
}

/**
 * UTILITY: Remove stored API key (if needed)
 */
function deleteApiKey() {
  PropertiesService.getScriptProperties().deleteProperty('ANTHROPIC_API_KEY');
  console.log("🗑️ API key deleted from storage");
}

/**
 * UTILITY: Check if API key is stored
 */
function checkApiKey() {
  const key = getApiKey();
  if (key) {
    console.log("✅ API key is stored");
    console.log(`Key starts with: ${key.substring(0, 8)}...`);
  } else {
    console.log("❌ No API key found. Run setupApiKey() first.");
  }
}

/**
 * Translate sentence using Anthropic Claude API
 */
function translateWithClaude(sentence, apiKey) {
  console.log(`=== TRANSLATION START ===`);
  console.log(`Input sentence: ${sentence}`);

  const url = "https://api.anthropic.com/v1/messages";

  // Clean the API key to remove any whitespace
  const cleanApiKey = apiKey.trim();

  // 🎯 EDIT THIS LINE to get more succinct responses
  const prompt = `You are an expert tutor in Attic Greek, translate this sentence to English. Give only the translation and very brief breakdown of grammar: "${sentence}"`;

  console.log(`Prompt: ${prompt}`);

  const payload = {
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 500,
    "messages": [
      {
        "role": "user",
        "content": prompt
      }
    ]
  };

  const options = {
    "method": "POST",
    "headers": {
      "x-api-key": cleanApiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true  // This lets us see full error details
  };

  try {
    console.log("Making API call...");
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    console.log(`API Response Code: ${responseCode}`);

    if (responseCode !== 200) {
      console.error(`API Error ${responseCode}: ${responseText}`);
      return `Translation failed - API returned ${responseCode}`;
    }

    const data = JSON.parse(responseText);
    console.log(`API Response:`, JSON.stringify(data, null, 2));

    if (data.content && data.content[0] && data.content[0].text) {
      const translation = data.content[0].text.trim();
      console.log(`✅ Translation successful: ${translation}`);
      return translation;
    } else {
      console.error("Unexpected API response format:", data);
      return "Translation failed - unexpected response format";
    }
  } catch (error) {
    console.error("Claude API error:", error.toString());
    return "Translation failed - API error";
  }
}

/**
 * Send email with translation and original sentence
 */
function sendTranslationEmail(recipient, subject, translation, originalSentence) {
  const emailBody = `
${translation}

\n\n\n\n\n\n\n\n\n\n\n\n\
---

Original: "${originalSentence}"
  `.trim();

  // Get thread reference for email threading
  const threadRef = getThreadReference();

  GmailApp.sendEmail(
    recipient,
    subject,
    emailBody,
    {
      headers: {
        'References': threadRef,
        'In-Reply-To': threadRef
      }
    }
  );
}

/**
 * Get consistent thread reference for email threading
 */
function getThreadReference() {
  const properties = PropertiesService.getScriptProperties();
  let threadRef = properties.getProperty('THREAD_REF');

  if (!threadRef) {
    const timestamp = new Date().getTime();
    threadRef = `athenaze-${timestamp}@script.google.com`;
    properties.setProperty('THREAD_REF', threadRef);
  }

  return threadRef;
}

/**
 * Extract sentences from classical text
 */
function extractSentencesClassical(text) {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Clean text
  let cleanText = text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();

  // Split on punctuation including Greek punctuation
  let sentences = cleanText.split(/[.!?·;]+(?:\s|$)/);

  // Filter sentences
  sentences = sentences
    .map(sentence => sentence.trim())
    .filter(sentence => {
      return sentence.length >= 50 &&
        sentence.length <= 800 &&
        /[a-zA-Zα-ωΑ-Ωάέήίόύώἀ-ῼ]/.test(sentence) &&
        sentence.split(/\s+/).length >= 2 &&
        !/^[Α-Ω\s\(\)\[\]0-9]+$/.test(sentence);
    });

  // Remove duplicates
  return [...new Set(sentences)];
}

/**
 * Test function to verify Claude API connection
 */
function testClaudeAPI() {
  const testSentence = "ὁ Φίλιππος σπεύδει πρὸς τὸν ἀγρόν.";

  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error("❌ No API key found. Run setupApiKey() first.");
      return;
    }

    const translation = translateWithClaude(testSentence, apiKey);
    console.log(`Test sentence: ${testSentence}`);
    console.log(`Translation: ${translation}`);
  } catch (error) {
    console.error("Test failed:", error.toString());
  }
}

/**
 * Set up daily trigger
 */
function setupDailyTrigger() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'emailRandomTranslatedSentence') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new daily trigger
  ScriptApp.newTrigger('emailRandomTranslatedSentence')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();

  console.log("Daily trigger set up successfully");
}
