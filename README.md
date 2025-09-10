# Athenaze Daily Translation Bot

A Google Apps Script that automatically extracts random sentences from Attic Greek texts, translates them and adds pertinent grammar using Claude AI, emails you daily translation exercises for self-study practice.

## Learning Method

This tool is designed as a **translation exercise** for Greek language learners:

1. 📖 **Read the original Greek sentence first** (appears at the bottom of the email)
2. 🤔 **Attempt your own translation** and grammatical analysis
3. ✅ **Compare with the AI translation** and grammar breakdown (top of email)
4. 📚 **Learn from differences** between your attempt and the model translation

The email format intentionally puts the translation first so you can easily cover it while working through the Greek text yourself.

## Features

- 📚 **Random Sentence Extraction**: Pulls random sentences from your Google Doc containing Greek texts
- 🤖 **AI-Powered Translation**: Uses Anthropic's Claude API for accurate Attic Greek to English translation
- 📧 **Daily Translation Practice**: Automatically sends translation exercises to your email
- 🎯 **Self-Study Format**: Designed for you to attempt translation before checking the answer
- 🧠 **Grammar Breakdown**: Includes brief grammatical analysis alongside translations
- 🔒 **Secure API Storage**: Safely stores your API key using Google's PropertiesService
- 📊 **Email Threading**: Groups all translations in a single email thread for easy organization

## Prerequisites

- Google account with access to Google Drive and Gmail
- Anthropic API key ([get one here](https://console.anthropic.com/))
- A Google Doc containing your Greek texts (default name: "Athenaze_Texts")

## Setup

### 1. Create the Google Apps Script

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Replace the default code with the code from this repository
4. Save the project with a descriptive name

### 2. Configure Your Settings

Edit these variables in the `emailRandomTranslatedSentence()` function:

```javascript
const DOC_NAME = "Athenaze_Texts";  // Name of your Google Doc
const EMAIL_RECIPIENT = "your-email@example.com";  // Your email address
const EMAIL_SUBJECT = "Random Sentence from Athenaze Texts";  // Email subject
```

### 3. Store Your API Key

1. Uncomment the `setupApiKey()` function
2. Replace `"your-actual-api-key-here"` with your actual Anthropic API key
3. Run the `setupApiKey()` function once
4. Comment out or delete the API key from the code for security

### 4. Set Up Daily Automation (Optional)

Run the `setupDailyTrigger()` function to receive daily translations at 9 AM.

## Usage

### Manual Translation Exercise
```javascript
emailRandomTranslatedSentence()  // Sends one translation exercise immediately
```

### Test the Connection
```javascript
testClaudeAPI()  // Tests API connection with a sample sentence
```

### Manage API Key
```javascript
checkApiKey()    // Verify API key is stored
deleteApiKey()   // Remove stored API key
```

## How to Use Your Daily Email

Each email contains a translation exercise in this format:

**Email Subject:** Random Sentence from Athenaze Texts

**Email Body:**
```
Philip hurries toward the field.

Grammar: ὁ Φίλιππος (subject, nominative) σπεύδει (3rd person singular present) πρὸς τὸν ἀγρόν (prepositional phrase with accusative).

---

Original: "ὁ Φίλιππος σπεύδει πρὸς τὸν ἀγρόν."
```

### Recommended Study Method:
1. **Scroll to the bottom** and read the original Greek sentence
2. **Cover the top portion** of the email with your hand or a piece of paper
3. **Attempt your own translation** and identify grammatical elements
4. **Uncover the AI translation** and compare with your attempt
5. **Note any differences** and learn from them

## Text Requirements

Your Google Doc should contain:
- Sentences between 50-800 characters
- Valid Greek text (includes Unicode Greek characters)
- Proper sentence punctuation (., !, ?, ·, ;)

The script automatically filters out:
- Very short or very long sentences
- Headers or titles (all caps)
- Duplicate sentences

## Customization

### Modify Translation Prompt
Edit the prompt in `translateWithClaude()` for different types of analysis:
```javascript
const prompt = `Translate this Attic Greek sentence to English. Give only the translation and very brief breakdown of grammar: "${sentence}"`;
```

### Adjust Sentence Filtering
Modify parameters in `extractSentencesClassical()`:
- Minimum/maximum sentence length
- Required character patterns
- Filtering criteria

### Change Email Schedule
Modify the trigger in `setupDailyTrigger()`:
```javascript
ScriptApp.newTrigger('emailRandomTranslatedSentence')
  .timeBased()
  .everyDays(1)      // Change frequency
  .atHour(9)         // Change time
  .create();
```

## Security

- API keys are stored securely using Google's PropertiesService
- No sensitive data is logged or exposed
- API communication uses HTTPS

## Troubleshooting

### Common Issues

**"API key not found"**
- Run `setupApiKey()` with your actual API key

**"Google Doc not found"**
- Ensure the document name matches `DOC_NAME`
- Check that the script has permission to access your Drive

**"No valid sentences found"**
- Verify your document contains properly formatted Greek text
- Check that sentences meet length requirements (50-800 characters)

**Translation failures**
- Verify your API key is valid
- Check your Anthropic account has sufficient credits

### Debug Functions

```javascript
checkApiKey()     // Verify API key storage
testClaudeAPI()   // Test translation with sample text
```

## Educational Benefits

- **Daily practice** builds consistent study habits
- **Random selection** ensures comprehensive text coverage
- **Self-testing** improves retention and comprehension
- **Immediate feedback** helps correct mistakes quickly
- **Grammar analysis** reinforces syntactical understanding

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to modify and distribute.

---

**Note**: This tool is designed for educational purposes to help with Ancient Greek language learning. The exercise format encourages active translation practice rather than passive reading. Ensure you have proper permissions for any texts you use.
