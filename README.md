# Serverless React Recipe Displayer

## 1. Project Overview
This project is a highly customized, future-proof recipe display web application. It utilizes a serverless architecture where a static React frontend dynamically fetches data from a private GitHub repository acting as a headless JSON Content Management System (CMS). The UI is configured for Right-to-Left (RTL) rendering to natively support Hebrew text alongside English.

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
1. **Sidebar Discovery:** Uses the GitHub Git Tree API (`/git/trees/main?recursive=1`) to fetch a flat list of all `.json` files in the `my-recipe-data` repository and displays them as basic buttons in a right-aligned (RTL) sidebar.
2. **Recipe Fetching & Rendering:** When a sidebar button is clicked, it uses the GitHub Contents API (`/contents/${path}`) with the `Accept: 'application/vnd.github.v3.raw'` header to fetch the raw JSON. It renders the title, Cloudinary image, mapped ingredients list, mapped instructions list, and trial notes in the main display area.

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
  "ingredients": [
    {
      "section": "String (optional)",
      "items": [
        {
          "name": "String",
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
          "text": "String representing the step",
          "image": "String (optional Cloudinary URL)"
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
