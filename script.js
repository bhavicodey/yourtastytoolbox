document.getElementById('recipeForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    
    const diet = document.getElementById('diet').value;
    const ingredients = document.getElementById('ingredients').value.split(',').map(i => i.trim());
    
    if (diet && ingredients) {
        const response = await fetch('/getRecipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ diet, ingredients }),
        });
        
        const data = await response.json();
        
        displayRecipes(data.recipes);
    }
});

function displayRecipes(recipes) {
    const recipesDiv = document.getElementById('recipes');
    const recipeMessage = document.getElementById('recipeMessage');
    recipesDiv.innerHTML = '';
    
    if (recipes.length > 0) {
        recipeMessage.classList.remove('hidden');
        recipes.forEach(recipe => {
            const recipeElement = document.createElement('div');
            recipeElement.className = 'recipe';
            recipeElement.innerHTML = `
                <h3>${recipe.name}</h3>
                <p>${recipe.description}</p>
                <img src="${recipe.imageUrl}" alt="${recipe.name}" />
                <h4>Ingredients:</h4>
                <ul>${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}</ul>
                <h4>Steps:</h4>
                <ul>${recipe.steps.map(step => `<li>${step}</li>`).join('')}</ul>
            `;
            recipesDiv.appendChild(recipeElement);
        });
    } else {
        recipeMessage.classList.add('hidden');
        recipesDiv.innerHTML = '<p>No recipes found with the given ingredients.</p>';
    }

    // Scroll to the recipes section
    recipeMessage.scrollIntoView({ behavior: 'smooth' });
}
