const fs = require('fs');
const path = require('path');

const inputFile = 'C:/projects/Recipe Project/all_recipies.json';
const outputDir = path.join(__dirname, '../my-recipe-data');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const data = require(inputFile);
const recipes = data.recipes || [];

console.log(`Found ${recipes.length} recipes. Generating files...`);

// Helper to parse ingredients roughly
function parseIngredient(str) {
  if (str.startsWith('[')) {
    return { name: str, amount: 0, unit: "" }; 
  }

  const unitMap = {
    'cup': 'cup', 'cups': 'cup', 'c': 'cup', 'כוס': 'cup', 'כוסות': 'cup',
    'teaspoon': 'teaspoon', 'teaspoons': 'teaspoon', 'tsp': 'teaspoon', 'כפית': 'teaspoon', 'כפיות': 'teaspoon',
    'tablespoon': 'tablespoon', 'tablespoons': 'tablespoon', 'tbsp': 'tablespoon', 'כף': 'tablespoon', 'כפות': 'tablespoon',
    'gram': 'grams', 'grams': 'grams', 'g': 'grams', 'גרם': 'grams', "גר'": 'grams',
    'ml': 'ml', 'מ"ל': 'ml', 'מ”ל': 'ml',
    'ounce': 'ounce', 'ounces': 'ounce', 'oz': 'ounce',
    'pound': 'pound', 'pounds': 'pound', 'lb': 'pound', 'lbs': 'pound',
    'pinch': 'pinch', 'pinches': 'pinch',
    'clove': 'clove', 'cloves': 'clove'
  };

  const unitRegexParts = Object.keys(unitMap).sort((a,b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const unitsPattern = `(?:(?:(?<=\\d)|\\b|_)(?:${unitRegexParts.filter(u => /^[a-z]/.test(u)).join('|')})\\b|(?:${unitRegexParts.filter(u => !/^[a-z]/.test(u)).join('|')}))`;
  const amountPattern = `(?:\\d+\\s+(?:and\\s+|&\\s+)?\\d+\\/\\d+|\\d+\\s+(?:and\\s+|&\\s+)?[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\\d+\\/\\d+|\\d+(?:\\.\\d+)?|[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])`;

  const parseAmount = (aStr) => {
    if (!aStr) return 0;
    aStr = aStr.replace(/\s+(and|&)\s+/i, ' ').trim();
    const fractionMap = {'½':0.5, '⅓':0.33, '⅔':0.66, '¼':0.25, '¾':0.75};
    if (fractionMap[aStr]) return fractionMap[aStr];
    const matchUnicodeFrac = aStr.match(/(\d+)\s+([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/);
    if (matchUnicodeFrac) return parseInt(matchUnicodeFrac[1]) + fractionMap[matchUnicodeFrac[2]];
    const matchFraction = aStr.match(/(\d+)\s+(\d+)\/(\d+)/);
    if (matchFraction) return parseInt(matchFraction[1]) + (parseInt(matchFraction[2]) / parseInt(matchFraction[3]));
    const matchSimpleFraction = aStr.match(/^(\d+)\/(\d+)$/);
    if (matchSimpleFraction) return parseInt(matchSimpleFraction[1]) / parseInt(matchSimpleFraction[2]);
    let floatVal = parseFloat(aStr);
    return isNaN(floatVal) ? 0 : floatVal;
  };

  let result = { name: str.trim(), amount: 0, unit: "" };
  let currentName = result.name.replace(/^[\s,\+\-]+/, '').trim();

  // Strip stick measurements (e.g. "/ 1 stick" or "or 1/2 stick") before processing parens
  currentName = currentName.replace(/(?:\/\s*|\b(?:or|and)\s+)?\b\d+(?:[\/\.]\d+|[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])?\s+stick(?:s)?\b/gi, '')
                           .replace(/\(\s+/g, '(')
                           .replace(/\s+\)/g, ')')
                           .replace(/\(\s*\)/g, '');

  // 1. Extract anything in parentheses that looks like amount/unit
  const parensRegex = new RegExp(`\\(\\s*(${amountPattern})?\\s*(${unitsPattern})?\\s*\\)`, 'i');
  const parensMatch = currentName.match(parensRegex);
  
  if (parensMatch && (parensMatch[1] || parensMatch[2])) {
     let amt = parseAmount(parensMatch[1]);
     if (amt === 0 && !parensMatch[1] && parensMatch[2]) amt = 1;
     result.amount2 = amt;
     result.unit2 = unitMap[parensMatch[2] ? parensMatch[2].toLowerCase() : ''] || parensMatch[2] || '';
     currentName = currentName.replace(parensMatch[0], ' ');
  }

  // 2. Prepend "1 " if starts with unit (hebrew words mostly)
  const startUnitRegexHebrew = new RegExp(`^(${unitsPattern})(?:\\s|$)`, 'i');
  if (startUnitRegexHebrew.test(currentName.trim())) {
      currentName = "1 " + currentName.trim();
  }

  // 3. Extract primary amount and unit at start (and optional additive secondary like "+ 2 כפות")
  const startRegex = new RegExp(`^(${amountPattern})\\s*(${unitsPattern})?(?:\\s*\\+\\s*(${amountPattern})\\s*(${unitsPattern})?)?`, 'i');
  const startMatch = currentName.trim().match(startRegex);

  if (startMatch) {
     result.amount = parseAmount(startMatch[1]);
     result.unit = unitMap[startMatch[2] ? startMatch[2].toLowerCase() : ''] || startMatch[2] || '';
     
     // If parens weren't used, but we had a + unit, assign to amount2 if empty
     if (startMatch[3] && !result.amount2) {
       result.amount2 = parseAmount(startMatch[3]);
       result.unit2 = unitMap[startMatch[4] ? startMatch[4].toLowerCase() : ''] || startMatch[4] || '';
     }

     currentName = currentName.trim().replace(startMatch[0], ' ');
  }

  // Clean up
  result.name = currentName.replace(/^[\s,\+\-]+|[\s,\+\-]+$/g, '').replace(/\s{2,}/g, ' ').trim();
  return result;
}

const translationMap = {
  "בצק בריוש כרוך - CakeLab": "Laminated Brioche Dough - CakeLab",
  "דובשניות קלאסיות": "Classic Honey Cookies",
  "הטירמיסו של ביג מאמא - פיצפוצים": "Big Mama's Tiramisu",
  "חלה לשבת מארבע רצועות עם בצק מקדים- יהודית אביב": "Four-Strand Shabbat Challah",
  "טארט ריקוטה ושמנת חמוצה": "Ricotta and Sour Cream Tart",
  "כדורי עוף ברוטב חמאת בוטנים": "Chicken Meatballs in Peanut Butter Sauce",
  "לחם נלסון": "Nelson Bread",
  "לחמניות קשר שמונה רכות במיוחד": "Extra Soft Figure-Eight Rolls",
  "ממרחים לשמרים (עוד לא ניסיתי)": "Yeast Cake Spreads",
  "מקרון פטל – אלון שאבו": "Raspberry Macarons - Alon Shabo",
  "סהרוני שקדים – קרן אגם": "Almond Crescents - Keren Agam",
  "עוגיות אלפחורס – בצק אלים": "Alfajores Cookies",
  "עוגיות ברטון [או: עוגיות חמאה צרפתיות]": "Breton Butter Cookies",
  "עוגיות מגולגלות (שני גלילים)": "Rolled Cookies",
  "עוגיות שוקולד צ'יפס בקטנה": "Small Batch Chocolate Chip Cookies",
  "עוגיות שוקולד צ’יפס של פייר הרמה": "Pierre Herme Chocolate Chip Cookies",
  "עוגיות שיבולת שועל וצימוקים - פיצפוצים": "Oatmeal Raisin Cookies",
  "עוגת בננה פירורים - פיצפוצים": "Banana Crumb Cake",
  "עוגת גבינה בווארית - פיצפוצים": "Bavarian Cheesecake",
  "עוגת גבינה ניאוקלאסית - פיצפוצים": "Neoclassic Cheesecake",
  "עוגת חמאה ושמנת -פיצפוצים": "Butter and Cream Cake",
  "עוגת מוס שוקולד אפויה [בקושי] - פיצפוצים": "Barely Baked Chocolate Mousse Cake",
  "עוגת שמרים שוקולד - פיצפוצים": "Chocolate Babka",
  "עוגת תפוזים ושקדים": "Orange Almond Cake",
  "פנקייקים מושלמים בקלי קלות - פיצפוצים": "Easy Perfect Pancakes",
  "פסטה פטוצ’יני ברוטב שמנת ופטריות": "Fettuccine in Mushroom Cream Sauce",
  "קציצות קינואה וסלק (ללא גלוטן)": "Quinoa Beet Patties",
  "קראנץ גבינה ואוכמניות": "Cheese and Blueberry Krantz",
  "רוגעלך גלותיים - פיצפוצים": "Diaspora Rugelach"
};

recipes.forEach((recipe, index) => {
  if (!recipe.name) return;

  // Translate the title if it's in the map, otherwise use original
  let title = translationMap[recipe.name.trim()] || recipe.name;
  
  // Create a safe filename (allow unicode letters so if something isn't translated, it doesn't become .json)
  const filename = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/(^-|-$)/g, '') + '.json';

  // Instructions (Grouped by sections and cleaned)
  let instructions = [];
  if (Array.isArray(recipe.recipeInstructions)) {
    let currentInstSection = { section: "", steps: [] };
    
    const rawSteps = recipe.recipeInstructions.map(step => {
      if (typeof step === 'string') return step;
      if (step['@type'] === 'HowToSection') return `[${step.name}]`;
      if (step['@type'] === 'HowToStep') return step.text;
      return "";
    }).filter(Boolean);

    rawSteps.forEach(stepStr => {
      if (stepStr.startsWith('[')) {
        if (currentInstSection.steps.length > 0) {
          instructions.push(currentInstSection);
        }
        currentInstSection = { section: stepStr.replace(/[\[\]]/g, '').trim(), steps: [] };
      } else {
        // Strip leading numbers like "1. ", "2. ", "1) "
        const cleanedStep = stepStr.replace(/^\d+[\.\)]\s*/, '').trim();
        if (cleanedStep) {
          currentInstSection.steps.push({ text: cleanedStep, image: "" });
        }
      }
    });

    if (currentInstSection.steps.length > 0) {
      instructions.push(currentInstSection);
    }
  }

  // Trial Notes (from comments)
  let trial_notes = [];
  if (Array.isArray(recipe.comment)) {
    trial_notes = recipe.comment.map(c => {
      return {
        date: "2024-01-01", // Default date since comment might not have one
        note: c.text || ""
      };
    }).filter(n => n.note.trim() !== "");
  }

  // Ingredients (Grouped by sections)
  let ingredients = [];
  if (Array.isArray(recipe.recipeIngredient)) {
    let currentSection = { section: "", items: [] };
    
    recipe.recipeIngredient.forEach(ingStr => {
      if (ingStr.includes('מצרכים למתכון')) return;

      if (ingStr.startsWith('[')) {
        if (currentSection.items.length > 0) {
          ingredients.push(currentSection);
        }
        currentSection = { section: ingStr.replace(/[\[\]]/g, '').trim(), items: [] };
      } else {
        const parsed = parseIngredient(ingStr);
        if (parsed.name) {
          currentSection.items.push(parsed);
        }
      }
    });

    if (currentSection.items.length > 0) {
      ingredients.push(currentSection);
    }
  }

  // Auto-generate tags based on ingredients and instructions
  let tags = Array.isArray(recipe.recipeCategory) ? recipe.recipeCategory.filter(t => !t.includes('import on')) : [];
  
  const allIngredientsText = ingredients.flatMap(sec => sec.items.map(i => i.name)).join(' ').toLowerCase();
  const allInstructionsText = instructions.join(' ').toLowerCase();
  
  const containsGluten = /(flour|wheat|bread|pasta|קמח|חיטה|לחם|פסטה|פירורי לחם|בישקוטים)/i.test(allIngredientsText);
  const containsDairy = /(milk|butter|cheese|cream|mascarpone|yogurt|ricotta|parmesan|חלב|חמאה|גבינה|שמנת|מסקרפונה|יוגורט|ריקוטה|פרמזן)/i.test(allIngredientsText);
  const containsEggs = /(egg|yolk|white|ביצה|ביצים|חלמון|חלבון)/i.test(allIngredientsText);
  const requiresMixer = /(mixer|מיקסר|מערבל)/i.test(allInstructionsText);

  if (!containsGluten) tags.push("Gluten-Free");
  if (!containsDairy) tags.push("Dairy-Free");
  if (!containsDairy && !containsEggs && tags.includes("Dairy-Free")) tags.push("Vegan");
  if (!requiresMixer) tags.push("No Mixer");

  // Remove duplicates just in case
  tags = [...new Set(tags)];

  // Auto-generate Category based on title
  let category = "";
  const lowerTitle = title.toLowerCase();
  
  if (/(cookie|cookies|עוגיות|עוגייה|דובשניות|מקרון|macaron|crescent|cantucci)/i.test(lowerTitle)) {
    category = "Cookies";
  } else if (/(cake|cakes|עוגת|עוגה|טירמיסו|tiramisu|tart|טארט|פאי|pie|crumble)/i.test(lowerTitle)) {
    category = "Cakes & Tarts";
  } else if (/(cinnamon roll|babka|rugelach|רוגעלך|muffin|krantz|pancake|פנקייק)/i.test(lowerTitle)) {
    category = "Breakfast & Pastries";
  } else if (/(bread|dough|חלה|לחם|בצק|לחמניות|challah|roll\b|rolls)/i.test(lowerTitle)) {
    category = "Breads & Doughs";
  } else if (/(chicken|meatball|fettuccine|gyoza|dumpling|patty|patties|bao|pasta)/i.test(lowerTitle)) {
    category = "Savory Mains";
  } else if (/(soup|potato|potatoes|salad|סלט|מרק|תפוחי אדמה)/i.test(lowerTitle)) {
    category = "Soups & Sides";
  }

  // Detect Hebrew title
  const hebrew_title = /[\u0590-\u05FF]/.test(recipe.name) ? recipe.name.trim() : "";

  const newRecipe = {
    title: title,
    hebrew_title: hebrew_title,
    description: recipe.description || "",
    category: category,
    tags: tags,
    images: Array.isArray(recipe.image) ? recipe.image : (recipe.image ? [recipe.image] : []),
    original_url: recipe.isBasedOn || "",
    ingredients: ingredients,
    instructions: instructions,
    trial_notes: trial_notes
  };

  // Default category if none matched
  const finalCategory = category || "Uncategorized";
  newRecipe.category = finalCategory;

  const categoryDir = path.join(outputDir, finalCategory);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }

  const outputPath = path.join(categoryDir, filename);
  fs.writeFileSync(outputPath, JSON.stringify(newRecipe, null, 2));
});

console.log(`Successfully generated JSON files in ${outputDir}`);
