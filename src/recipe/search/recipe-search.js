document.addEventListener("DOMContentLoaded", () => {
  const windowParams = new URLSearchParams(location.search);
  const searchQuery = windowParams.get("q");
  let mealParam = windowParams.get("meal");
  let dietParam = windowParams.get("diet");
  let viewParam = windowParams.get("view");

  // set all input fields to whatever is in the url parameters
  // if there is an invalid parameter, remove it from the url without page reload

  if (mealParam) {
    switch (mealParam) {
      case "breakfast":
      case "lunch/dinner":
      case "snack":
        document.getElementById("filter-meal").value = mealParam;
        break;
      default:
        const newParams = windowParams;
        newParams.delete("meal");
        history.replaceState(null, "", `${location.origin}${location.pathname}?${newParams.toString()}`);
    }
  }

  if (dietParam) {
    switch (dietParam) {
      case "balanced":
      case "high-fiber":
      case "high-protein":
      case "low-carb":
      case "low-fat":
      case "low-sodium":
        document.getElementById("filter-diet").value = dietParam;
        break;
      default:
        const newParams = windowParams;
        newParams.delete("diet");
        history.replaceState(null, "", `${location.origin}${location.pathname}?${newParams.toString()}`);
    }
  }

  if (viewParam) {
    switch (viewParam) {
      case "grid":
        document.getElementById("grid-view-btn").classList.add("active");
        document.getElementById("list-view-btn").classList.remove("active");
        break;
      case "list":
        document.getElementById("grid-view-btn").classList.remove("active");
        document.getElementById("list-view-btn").classList.add("active");
        break;
    }
  }

  const results = [];
  let visibleCount = 10;
  
  if (searchQuery) {
    document.getElementById("r-query").value = searchQuery;
    search();
    document.title = `${windowParams.get("q").trim()} - Recipe Search`;
  }

  async function search() {
    if (!searchQuery) {
      return;
    }

    results.push(...await getResults(3));

    if (results.length !== 0) {
      displayResults();
    }
  }

  async function getResults(numFetches) {
    if (!searchQuery) {
      return;
    }

    const fields = ["uri", "label", "image", "images", "mealType", "dietLabels", "calories"];
    const apiParams = recipeParams("any", searchQuery, fields);

    let data;

    const currentResults = [];

    for (let i = 0; i < numFetches; i++) {
      if (data && !data._links.next) {
        break;
      }
      
      let request;
      if (!data) {
        request = `${RECIPE_ENDPOINT}?${apiParams.toString()}`;
      } else {
        request = data._links.next.href;
      }

      const response = await fetch(request, options("GET"));
      if (!response.ok) {
        switch (response.status) {
          case 429:
            alert("Too many requests!");
            break;
          default:
            alert(`Server error: ${response.status}`);
            console.log(response);
        }
        break;
      }

      data = await response.json();
      currentResults.push(...data.hits);
    }

    return currentResults;
  }

  function displayResults() {
    let filteredResults = results;

    if (windowParams.has("meal")) {
      filteredResults = filteredResults.filter((result) => {
        // these are given as an array (ex. ["Lunch/Dinner", "Breakfast"])
        const mealTypes = result.recipe.mealType.map(type => type.toLowerCase());
        return mealTypes.includes(windowParams.get("meal").toLowerCase());
      });
    }

    if (windowParams.has("diet")) {
      filteredResults = filteredResults.filter((result) => {
        // these are given as an array (ex. ["Balanced", "High-Fiber"])
        const dietLabels = result.recipe.dietLabels.map(label => label.toLowerCase());
        return dietLabels.includes(windowParams.get("diet").toLowerCase());
      });
    }

    const visibleResults = filteredResults.slice(0, visibleCount);
    
    const gridOutput = document.getElementById("grid-output");
    const listTable = document.getElementById("list-output-table");
    const listOutput = document.getElementById("list-output-body");

    // grid view
    if (!windowParams.has("view") || windowParams.get("view") === "grid") {

      // hide list view
      listTable.classList.add("d-none");
      listTable.setAttribute("aria-hidden", true);

      // clear all outputs
      gridOutput.replaceChildren();
      listOutput.replaceChildren();

      for (const result of visibleResults) {
        const recipe = result.recipe;
        const recipeID = recipe.uri.split('_').pop();
        const anchor = document.getElementById("card-template").content.cloneNode(true).children[0];
        
        anchor.href = `${ROOT}recipe/?id=${recipeID}`;
        anchor.getElementsByTagName("img")[0].src = recipe.images.REGULAR.url;
        anchor.getElementsByTagName("figcaption")[0].textContent = recipe.label;
        anchor.getElementsByClassName("recipe-star")[0].dataset.recipeId = recipeID;
        gridOutput.appendChild(anchor);
      }

      // make output visible
      gridOutput.classList.remove("d-none");
      gridOutput.classList.add("d-flex");
      gridOutput.setAttribute("aria-hidden", false);

    } else if (windowParams.get("view") === "list") { // list view

      // hide grid view
      gridOutput.classList.add("d-none");
      gridOutput.classList.remove("d-flex");
      gridOutput.setAttribute("aria-hidden", true);

      // clear all outputs
      listOutput.replaceChildren();
      gridOutput.replaceChildren();

      for (const result of visibleResults) {
        const tr = document.getElementById("row-template").content.cloneNode(true).children[0];
        const recipeID = result.recipe.uri.split('_').pop();

        tr.dataset.recipeId = recipeID;

        tr.children.item(0).getElementsByClassName("recipe-star")[0].dataset.recipeId = recipeID;
        tr.children.item(0).appendChild(document.createTextNode(result.recipe.label));
        tr.children.item(1).textContent = result.recipe.mealType.join(", ");
        tr.children.item(2).textContent = result.recipe.dietLabels.join(", ");
        tr.children.item(3).textContent = Math.round(result.recipe.calories / 10) * 10;
        listOutput.append(tr);
      }

      // make table visible
      listTable.classList.remove("d-none");
      listTable.setAttribute("aria-hidden", false);
    }

    if (filteredResults.length > visibleCount) {
      // display the load more button
      document.getElementById("load-more-btn").classList.remove("d-none");
    } else {
      document.getElementById("load-more-btn").classList.add("d-none");
    }

    loadFavorites();
  }

  document.getElementById("grid-output").addEventListener("click", (e) => {
    // handles favoriting in grid view
    let target = e.target;
    switch (target.nodeName.toLowerCase()) {
      case "polygon":
        target = target.parentElement;
      case "svg":
        e.preventDefault();
        flipStar(target);
        return;
    }
  });

  document.getElementById("list-output-body").addEventListener("click", (e) => {
    // handles favoriting in list view
    let target = e.target;
    switch (target.nodeName.toLowerCase()) {
      case "polygon":
        target = target.parentElement;
      case "svg":
        e.preventDefault();
        flipStar(target);
        return;
    }

    // handles redirecting to recipe page (turns tr into a "link")
    const tr = e.target.parentNode;
    location.href = `${ROOT}recipe/?id=${tr.dataset.recipeId}`;
  });

  // handle search
  document.getElementById("search-btn").addEventListener("click", (e) => {
    e.preventDefault();

    // input validation
    const input = document.getElementById("r-query");
    const query = input.value.trim();
    if (!query) {
      input.placeholder = i18next.t("search_error");
      input.classList.add("is-invalid");
      return;
    }

    input.placeholder = i18next.t("search_placeholder");
    input.classList.remove("is-invalid");

    const newParams = windowParams;
    newParams.set("q", query); // set the new query (potentially overwrite current query)
    location.search = `?${newParams.toString()}`; // causes a page reload
  });

  // handle load more
  document.getElementById("load-more-btn").addEventListener("click", () => { 
    visibleCount += 10;
    displayResults();
  });

  // handle meal type input
  document.getElementById("filter-meal").addEventListener("change", () => {
    const mealType = document.getElementById("filter-meal").value;
    const newParams = windowParams;
    if (mealType === "") {
      newParams.delete("meal");
    } else {
      newParams.set("meal", mealType);
    }
    history.replaceState(null, "", `${location.origin}${location.pathname}?${newParams.toString()}`);
    displayResults();
  });

  // handle diet input
  document.getElementById("filter-diet").addEventListener("change", () => {
    const diet = document.getElementById("filter-diet").value;
    const newParams = windowParams;
    if (diet === "") {
      newParams.delete("diet");
    } else {
      newParams.set("diet", diet);
    }
    history.replaceState(null, "", `${location.origin}${location.pathname}?${newParams.toString()}`);
    displayResults();
  });

  // handle view input
  document.getElementById("grid-view-btn").addEventListener("click", () => {
    document.getElementById("grid-view-btn").classList.add("active");
    document.getElementById("list-view-btn").classList.remove("active");

    const newParams = windowParams;
    newParams.delete("view");
    history.replaceState(null, "", `${location.origin}${location.pathname}?${newParams.toString()}`);
    displayResults();
  });

  document.getElementById("list-view-btn").addEventListener("click", () => {
    document.getElementById("grid-view-btn").classList.remove("active");
    document.getElementById("list-view-btn").classList.add("active");

    const newParams = windowParams;
    newParams.set("view", "list");
    history.replaceState(null, "", `${location.origin}${location.pathname}?${newParams.toString()}`);
    displayResults();
  });

  // if storage changes, reload user-related content
  window.addEventListener("storage", () => {
    loadUserNav();
    loadFavorites();
  });
});
