# Serverless React Recipe Displayer

## 1. Project Overview
This project is a highly customized, future-proof recipe display web application. It utilizes a serverless architecture where a static React frontend dynamically fetches data from a private GitHub repository acting as a headless JSON Content Management System (CMS). The beautiful, modern UI components were initially generated and scaffolded using Vercel's **v0** generative UI tool, and then heavily customized for Right-to-Left (RTL) rendering to natively support Hebrew text alongside English.

## 2. System Architecture & Tech Stack
* **Frontend Framework:** React 18+ (scaffolded and bundled via Vite).
* **Language:** JavaScript (JSX) and standard CSS.
* **Hosting (Frontend):** Vercel (CI/CD connected to the `recipe-displayer-app` GitHub repository).
* **Backend / Database:** A separate, private GitHub repository (`my-recipe-data`) containing structured `.json` files representing individual recipes (e.g., homemade ice cream bases, baked goods).
* **Media Hosting:** Cloudinary (image URLs are hardcoded into the JSON files).
* **Authentication:** GitHub Fine-Grained Personal Access Token (read-only access to the data repository).
* **Local Environment:** Node.js backend for Vite local development server.

## 3. Repository Ecosystem
This project spans two separate GitHub repositories:
1. `recipe-displayer-app`: The React/Vite frontend codebase.
2. `my-recipe-data`: The static JSON database. Structured categorically (e.g., `/Baking/Sweet/`, `/Ice_Cream/Bases/`).

## 4. Environment Variables
The application relies on the following environment variables (stored in a local `.env` file and configured in Vercel for production):
* `VITE_GITHUB_TOKEN`: The personal access token.
* `VITE_GITHUB_REPO_OWNER`: `zbarak`
* `VITE_GITHUB_REPO_NAME`: `my-recipe-data`

## 5. Current State of the Codebase & API Logic
The core infrastructure is complete and deployed live. Currently, `src/App.jsx` handles two main tasks:
1. **Sidebar Discovery / Catalog:** Fetches `_index.json` from the root of `my-recipe-data`, which acts as a lightweight pre-compiled summary of all recipes to quickly build the catalog view without making dozens of API calls.
2. **Recipe Fetching & Rendering:** When a recipe is clicked, it fetches the specific raw JSON file from GitHub and renders the title, Cloudinary image, tips, mapped ingredients list, mapped instructions list, and trial notes in the main display area.

## 6. Data Structure (The JSON Schema)
Every recipe in the database strictly follows this standard schema:
```json
{
  "title": "String (Supports Hebrew)",
  "hebrew_title": "String (Optional original Hebrew title)",
  "description": "String",
  "category": "String (e.g., 'Cookies', 'Cakes & Tarts')",
  "tags": ["Array", "of", "Strings"],
  "images": ["Array of Cloudinary URL Strings"],
  "original_url": "String (Optional URL to original source)",
  "youtube_url": "String (Optional YouTube video URL)",
  "before_starting": ["Array of prep notes and warnings"],
  "tips": ["Array of helpful tips and tricks"],
  "ingredients": [
    {
      "section": "String (optional)",
      "items": [
        {
          "name": "String",
          "metric_amount": Number,
          "metric_unit": "String",
          "imperial_amount": Number,
          "imperial_unit": "String",
          "amount": Number,
          "unit": "String"
        }
      ]
    }
  ],
  "instructions": [
    {
      "section": "String (optional)",
      "steps": [
        {
          "title": "String (optional bold step title)",
          "text": "String representing the step",
          "wait_time_minutes": Number,
          "image": ["Array of Strings (optional Cloudinary URLs)"]
        }
      ]
    }
  ],
  "trial_notes": [
    {
      "date": "YYYY-MM-DD",
      "note": "String"
    }
  ]
}
```

## 7. Upcoming Feature Roadmap (Pending Tasks)
Future development will focus on the following phases. AI assistants reading this document should provide code to help implement these specific features:

### Phase 1: The Kitchen Experience (Interactive State)

*   **Dynamic Batch Scaler:** Add a state variable for a multiplier (default 1). Create buttons for "0.5x", "1x", and "2x". Dynamically multiply the numeric `{ing.amount}` in the rendering map based on this state.
*   **Cooking Mode:** Add local state (like a Set) to track clicked instruction steps. When an instruction string is clicked, apply a CSS strikethrough and visual checkmark to track progress.

### Phase 2: Navigation & Organization

*   **Folder Tree UI:** Refactor the flat sidebar menu into a recursive component that parses the `folder_path` array from the GitHub Tree API data to build a collapsible, nested file-explorer UI.
*   **Deep Search & Tag Filters:** Add a search bar above the sidebar that actively filters the displayed recipes by checking for substring matches in the title, tags array, and ingredients array.

### Phase 3: The Exporter

*   **HTML Blob Exporter:** Build a "Share" function that takes the currently active JSON object, injects it into a lightweight standalone HTML template string, converts it to a Blob, and triggers a local browser download for offline sharing via mobile.
