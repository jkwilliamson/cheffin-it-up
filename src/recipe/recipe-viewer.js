document.addEventListener("DOMContentLoaded", async () => {
  const windowParams = new URLSearchParams(window.location.search);
  const recipeId = windowParams.get('id');

  async function loadRecipe() {
    const fields = ["label", "image", "calories", "totalNutrients", "ingredientLines"];
    const apiParams = recipeParams(undefined, undefined, fields);

    try {
      const response = await fetch(
        `${RECIPE_ENDPOINT}/${recipeId}?${apiParams.toString()}`, 
        options("GET")
      );

      if (!response.ok) {
        throw new Error("Server Error: " + response.status);
      }

      const data = await response.json();
      const r = data.recipe || data;

      document.title = `${r.label} - Recipe Details`;
      document.getElementById('r-title').innerText = r.label;
      document.getElementById('r-img').src = r.image;
      document.getElementById('r-img').alt = r.label;
      document.getElementById('r-cal').innerText = Math.round(r.calories);
      document.getElementById("recipe-star").dataset.recipeId = recipeId;

      if (r.totalNutrients) {
        const carbs = r.totalNutrients.CHOCDF ? Math.round(r.totalNutrients.CHOCDF.quantity) : 0;
        const protein = r.totalNutrients.PROCNT ? Math.round(r.totalNutrients.PROCNT.quantity) : 0;
        document.getElementById('r-carbs').innerText = carbs + "g";
        document.getElementById('r-protein').innerText = protein + "g";
      }

      let listHTML = "";
      for (let i = 0; i < r.ingredientLines.length; i++) {
        listHTML += "<li class='list-group-item'>" + r.ingredientLines[i] + "</li>";
      }
      document.getElementById('ingredient-list').innerHTML = listHTML;
    } catch (error) {
      console.error("Fetch Error:", error);
      document.getElementById('r-title').innerText = i18next.t("recipe_not_found");
      document.getElementById('ingredient-list').innerHTML = 
        `<p class="error">${i18next.t("conn_error")}</p>`;
    }
  }

  if (recipeId) {
    await loadRecipe();
    loadFavorites();
  }

  document.getElementById("recipe-star").addEventListener("click", () => {
    flipStar(document.getElementById("recipe-star"));
  });

  // if storage changes, reload user-related content
  window.addEventListener("storage", () => {
    loadUserNav();
    loadFavorites();
  });
});