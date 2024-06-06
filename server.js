const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));  // Serve static files from the "public" directory

app.post('/getRecipes', async (req, res) => {
    const { diet, ingredients } = req.body;

    try {
        // Ensure ingredients is an array
        const ingredientsArray = Array.isArray(ingredients) ? ingredients : [ingredients];

        // Call the Spoonacular API
        const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
            params: {
                apiKey: process.env.SPOONACULAR_API_KEY,
                diet: diet,  // Optional: specify the diet type
                includeIngredients: ingredientsArray.join(','),
                number: 5,  // Number of recipes to return
                instructionsRequired: true  // Request instructions for each recipe
            }
        });

        console.log('Spoonacular API Response:', response.data);

        if (response.data.results && response.data.results.length > 0) {
            // Map over results to fetch detailed information including steps
            const recipeDetailsPromises = response.data.results.map(async result => {
                // Fetch detailed information for each recipe
                const detailsResponse = await axios.get(`https://api.spoonacular.com/recipes/${result.id}/information`, {
                    params: {
                        apiKey: process.env.SPOONACULAR_API_KEY,
                        includeNutrition: false
                    }
                });
                const details = detailsResponse.data;

                return {
                    name: details.title || 'Unknown',
                    description: details.summary || 'No description available',
                    imageUrl: details.image || '',
                    sourceUrl: details.sourceUrl || '',
                    ingredients: details.extendedIngredients ? details.extendedIngredients.map(ingredient => ingredient.original) : [],
                    steps: details.analyzedInstructions && details.analyzedInstructions.length > 0 ?
                        details.analyzedInstructions[0].steps.map(step => step.step) :
                        ['No instructions available']
                };
            });

            const recipes = await Promise.all(recipeDetailsPromises);
            res.json({ recipes });
        } else {
            res.json({ recipes: ['No matching recipes found.'] });
        }
    } catch (error) {
        console.error('Error while calling Spoonacular API:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
