/**
 * InterviewForge AI — Configuration
 *
 * IMPORTANT: Never hardcode your API key in this file for production.
 * For GitHub Pages deployment, prompt the user to enter their key at runtime.
 * For local dev, you can temporarily set GEMINI_API_KEY below.
 *
 * Get your key at: https://aistudio.google.com/app/apikey
 */

const CONFIG = {
  // Leave empty — user will be prompted at first run, key stored in sessionStorage
  GEMINI_API_KEY: "AIzaSyDejnzPEPoxCfGHHwXsGO2aADzFgMj2qIc",
  GEMINI_MODEL: "gemini-2.0-flash",
  GEMINI_ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models/",

  // Google Sheets API (optional — leave empty to skip sheet saving)
  SHEETS_API_KEY: "",
  SPREADSHEET_ID: "",   // Your Google Sheets ID from the URL
};
