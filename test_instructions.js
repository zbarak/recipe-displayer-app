const data = require('C:/projects/Recipe Project/all_recipies.json');

data.recipes.forEach(r => {
  if (Array.isArray(r.recipeInstructions)) {
    r.recipeInstructions.forEach(step => {
      if (step['@type'] === 'HowToSection' && step.itemListElement) {
         console.log("Found HowToSection with items in recipe:", r.name);
      }
    });
  }
});
