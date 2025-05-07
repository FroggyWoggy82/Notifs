/**
 * Fix Recipe API Endpoints
 *
 * This script is now a lightweight wrapper that defers to the consolidated
 * recipe ingredient fix for handling recipe API endpoints.
 */

(function() {
    console.log('[Recipe API Endpoints Fix] Initializing...');

    if (typeof window.addIngredientToRecipe === 'function') {
        console.log('[Recipe API Endpoints Fix] Consolidated fix detected, deferring to it');

    } else {
        console.log('[Recipe API Endpoints Fix] Consolidated fix not detected, this script is now deprecated');


        const originalFetch = window.fetch;

        window.fetch = function(url, options) {

            if (typeof url === 'string' &&
                url.match(/\/api\/recipes\/\d+\/ingredients\/\d+$/) &&
                options && options.method === 'GET') {

                console.log('[Recipe API Endpoints Fix] Detected get ingredient from recipe request');

                const matches = url.match(/\/api\/recipes\/(\d+)\/ingredients\/(\d+)/);
                const recipeId = matches[1];
                const ingredientId = matches[2];

                const newUrl = `/api/recipes/${recipeId}`;
                console.log(`[Recipe API Endpoints Fix] Redirecting to: ${newUrl}`);

                return originalFetch(newUrl, options)
                    .then(response => {
                        console.log(`[Recipe API Endpoints Fix] Response status: ${response.status}`);

                        return response.clone().json()
                            .then(data => {
                                console.log('[Recipe API Endpoints Fix] Response data:', data);

                                const ingredient = data.ingredients.find(ing => ing.id == ingredientId);

                                if (!ingredient) {

                                    return new Response(JSON.stringify({
                                        error: 'Ingredient not found'
                                    }), {
                                        status: 404,
                                        headers: {
                                            'Content-Type': 'application/json'
                                        }
                                    });
                                }

                                const newResponse = new Response(JSON.stringify(ingredient), {
                                    status: 200,
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                });

                                return newResponse;
                            })
                            .catch(() => {

                                return response;
                            });
                    });
            }

            return originalFetch.apply(this, arguments);
        };
    }

    console.log('[Recipe API Endpoints Fix] Initialized');
})();
