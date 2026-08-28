/********* GLOBAL CONSTANTS *********/

/** CHANGE THIS WHEN DEPLOYED */
const ROOT = "/cheffin-it-up/";

// first id and key that we were using
// const APP_ID = '22fddf2c';
// const APP_KEY = '6e027a9aa1d31ff9727bcc31554bf115';

// these two specifically must be paired with header "Edamam-Account-User": "willi8jk"
const APP_ID = '03b15c99';
const APP_KEY = '709c28a154ba21d685492a497a97b23f';
const HEADERS = {
  "Content-Type": "applications/json",
  "Edamam-Account-User": "willi8jk"
};

/********* RECIPE API *********/

/** API Documentation - https://developer.edamam.com/edamam-docs-recipe-api */
const RECIPE_ENDPOINT = "https://api.edamam.com/api/recipes/v2";

/**
 * @param {"any" | "public" | "user" | "edamam-generic" | undefined} type - an optional type parameter
 * @param {string | undefined} q - an optional query parameter
 * @param {string[] | undefined} fields - an optional list of the fields to be included in each recipe in the response
 * @returns default recipe parameters
 */
function recipeParams(type, q, fields) { 
  const params = new URLSearchParams({ "app_id": APP_ID, "app_key": APP_KEY });
  if (type) {
    params.set("type", type);
  }

  if (q) { 
    params.set("q", q);
  }

  if (fields) {
    for (const field of fields) {
      params.append("field", field);
    }
  }
  
  return params;
};

/**
 * @param {"GET" | "POST"} method 
 * @param {Entry[] | undefined} entries - a **list** of entry objects (see `Entry` class and https://developer.edamam.com/shopping-list-api)
 * @returns default API options *for use with fetch(url, **options**)*
 */
function options(method, entries) {
  switch(method) {
    case "GET":
      return { headers: HEADERS };
    case "POST":
      return { 
        method: "POST", 
        headers: HEADERS, 
        body: JSON.stringify({
          "entries": entries
        })
      };
  }
}

/********* SHOPPING LIST API *********/

/** API Documentation - https://developer.edamam.com/shopping-list-api */
const LIST_ENDPOINT = "https://api.edamam.com/api/shopping-list/v2";

/**
 * @returns default shopping list parameters
 */
function shoppingListParams() { 
  return new URLSearchParams({ "app_id": APP_ID, "app_key": APP_KEY });
};

/**
 * A shopping list entry (see https://developer.edamam.com/shopping-list-api)
 * 
 * Example object: 
 * 
 * `{`
 *   `"quantity": 1,`
 *   `"measure": "http://www.edamam.com/ontologies/edamam.owl#Measure_serving",`
 *   `"item": "http://www.edamam.com/ontologies/edamam.owl#recipe_1"`
 * `}`
 */
class Entry {
  constructor(quantity, measure, item) {
    this.quantity = quantity;
    this.measure = measure;
    this.item = item;
  }
}

/********* MISC. UTILITY FUNCTIONS *********/

const savedLng = localStorage.getItem('i18nextLng') || 'en';

i18next.init({
  lng: savedLng,
  resources: {
    en: {
      translation: {
        "nav_home": "Home",
        "nav_search": "Recipe Search",
        "recipe_day_head": "Recipe of the Day",
        "welcome_head": "Welcome",
        "welcome_back": "Welcome back",
        "cooking_prompt": "What are we cooking today?",
        "not_you": "Not you?",
        "logout": "Logout",
        "login_head": "Login",
        "signin_btn": "Sign In",
        "ingredients": "Ingredients List",
        "nutrition": "Quick Nutrition",
        "calories": "Calories",
        "carbs": "Carbs",
        "protein": "Protein",
        "back_home": "← Back to Home",
        "recipe-search": "Recipe Search",
        "meal-type": "Meal Type",
        "diet": "Diet",
        "grid-view": "Grid View",
        "list-view": "List View",
        "find-meal": "Find your next meal",
        "quick": "Quick Preferences",
        "search": "Search",
        "search_placeholder": "Username",
        "password_placeholder": "Password",
        "user-dashboard": "User Dashboard",
        "favorite": "No favorites found, ",
        "fav": " some recipes!",
        "find_link": "find",
        "char": "6 characters long",
        "lower": "a lowercase letter",
        "upper": "an uppercase letter",
        "digit": "a digit",
        "special": "a special character",
        "genuine": "** <em>Do <strong>not</strong> use a genuine password</em> **",
        "favorites": "Favorites",
        "name": "Name",
        "time": "Time",
        "meal": "Meal",
        "load-more": "Load More Recipes"
      }
    },
    fr: {
      translation: {
        "nav_home": "Accueil",
        "nav_search": "Recherche de Recettes",
        "recipe_day_head": "Recette du Jour",
        "welcome_head": "Bienvenue",
        "welcome_back": "Bon retour",
        "cooking_prompt": "Qu'est-ce qu'on cuisine aujourd'hui ?",
        "not_you": "Pas vous ?",
        "logout": "Déconnexion",
        "login_head": "Connexion",
        "signin_btn": "Se Connecter",
        "ingredients": "Liste des Ingrédients",
        "nutrition": "Nutrition Rapide",
        "calories": "Calories",
        "carbs": "Glucides",
        "protein": "Protéines",
        "back_home": "← Retour à l'Accueil",
        "recipe-search": "Recherche de recettes",
        "meal-type": "Type de repas",
        "diet": "Régime",
        "grid-view": "Grille",
        "list-view": "Liste",
        "find-meal": "Trouvez votre prochain repas",
        "quick": "Préférences rapides",
        "search": "Recherche",
        "search_placeholder": "Nom d'utilisateur",
        "password_placeholder": "Mot de passe",
        "user-dashboard": "Tableau de bord utilisateur",
        "favorite": "Aucun favori trouvé, ",
        "fav": " des recettes!",
        "find_link": "trouver",
        "char": "6 caractères de long",
        "lower": "une lettre minuscule",
        "upper": "une lettre majuscule",
        "digit": "un chiffre",
        "special": "un caractère spécial",
        "genuine": "** <em>N'utilisez <strong>pas</strong> un vrai mot de passe</em> **",
        "favorites": "Favoris",
        "name": "Nom",
        "time": "Temps",
        "meal": "Repas",
        "load-more": "Charger plus de recettes"
      }
    }
  }
}, function(err, t) {
  console.log("Current Language in Memory:", i18next.language);
  console.log("Elements found to translate:", document.querySelectorAll('[data-i18n]').length);
  updateInterface();
  loadUserNav();
});

function changeLanguage(lng) {
  i18next.changeLanguage(lng, () => {
    localStorage.setItem('i18nextLng', lng);
    updateInterface();
    loadUserNav();
  });
}

// Helper to update elements with data-i18n attributes
function updateInterface() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    let key = el.getAttribute('data-i18n');
    
    // placeholder
    if (key.startsWith('[placeholder]')) {
      const actualKey = key.replace('[placeholder]', '');
      el.setAttribute('placeholder', i18next.t(actualKey));
    } 
    // rich text
    else {
      el.innerHTML = i18next.t(key);
    }
  });
}

class User {
  constructor(name, password) {
    this.name = name;
    this.password = password;
  }
}

/**
 * Runs the process of updating the currentUser and users collection object in localStorage with the
 * given user object.
 * @param {User} updatedUser 
 */
function updateUser(updatedUser) {
  const strUsers = localStorage.getItem("users");

  let updatedUsers;
  if (strUsers) {
    updatedUsers = JSON.parse(strUsers);
    updatedUsers[updatedUser.name] = updatedUser;
  } else {
    updatedUsers = {
      [updatedUser.name]: updatedUser
    }
  }

  trySetItem("currentUser", JSON.stringify(updatedUser));
  trySetItem("users", JSON.stringify(updatedUsers));
}

/**
 * Attempts to login with the given username and password. Does not allow empty usernames or
 * passwords, and will also reject any password that does not match the regex, if one is provided.
 *
 * Returns a "response" object with a `status` indicating whether or not the login was successful.
 *
 * Unsuccessful logins come with a `cause` indicating why it was unsuccessful.
 *
 * Successful logins come with a boolean `isNewUser` indicating whether or not this was a new user 
 * registration. The `user` object is also returned and automatically updated as the `currentUser` 
 * and in the `users` object in localStorage.
 *
 * @param {string} username 
 * @param {string} password 
 * @param {RegExp | undefined} passwordRegex optional
 * @returns {{
 *    status: boolean,
 *    cause?: "invalidUsername" | "invalidPassword" | "incorrectPassword",
 *    isNewUser?: boolean,
 *    user?: User
 * }} response object
 */
function login(username, password, passwordRegex) {
  if (!username) {
    return {
      status: false,
      cause: "invalidUsername"
    };
  }

  // if the password is empty
  // or the regex exists and password does not match the regex
  if (!password || (passwordRegex && !passwordRegex.test(password))) {
    return {
      status: false,
      cause: "invalidPassword"
    };
  }
  
  const stringifiedUsers = localStorage.getItem("users");
 
  const isReturningUser = stringifiedUsers && Object.hasOwn(JSON.parse(stringifiedUsers), username);

  // we only need to check password for correctness if this is a returning user and that user 
  // already has a password (backwards compatibility)

  /** a User object */
  let user;

  if (isReturningUser) {
    user = JSON.parse(stringifiedUsers)[username];

    // backwards compatibility, make sure password exists first
    if (user.password) {

      // password was incorrect
      if (user.password !== password) {
        return {
          status: false,
          cause: "incorrectPassword"
        };
      }
    } else { // write password to user if it didn't exist
      user.password = password;
    }
  } else {
    /** a JSON of User objects, as stored in localStorage */
    let users;
    user = new User(username, password);

    if (stringifiedUsers) {
      users = JSON.parse(stringifiedUsers);
      users[username] = user;
    } else {
      users = {
        [username]: user
      }
    }
  }

  updateUser(user);

  return {
    status: true,
    isNewUser: !isReturningUser,
    user: user
  };
}

function logout() {
  localStorage.removeItem("currentUser");
}

function loadUserNav() {
  const link = document.getElementById("username-nav-link");
  const nameSpan = document.getElementById("username-nav-name");
  const image = document.getElementById("username-nav-img");
  if (!link || !nameSpan) return;
  const strUser = localStorage.getItem("currentUser");
  if (!strUser) {
    nameSpan.textContent = i18next.t("login");
    link.href = `${ROOT}account/`;
    image.classList.add("d-none");
    image.src = "";
    return;
  }

  const user = JSON.parse(strUser);

  link.href = `${ROOT}account/`;
  nameSpan.textContent = user.name;

  if (user.img) {
    image.src = `data:image/png;base64, ${user.img}`;
  } else {
    image.src = `${ROOT}img/default-user.svg`
  }
  image.classList.remove("d-none");
}

function loadFavorites() {
  const stars = document.getElementsByClassName("recipe-star");
  const stringifiedUser = localStorage.getItem("currentUser");
  if (!stringifiedUser) {
    for (const star of stars) {
      star.classList.add("d-none");
    }
  } else {
    const user = JSON.parse(stringifiedUser);
    for (const star of stars) {
      if (user.favoriteRecipes && star.dataset.recipeId && user.favoriteRecipes.includes(star.dataset.recipeId)) {
        star.setAttribute("fill", star.getAttribute("stroke"));
        star.classList.remove("d-none");
      } else if (star.dataset.recipeId) {
        star.setAttribute("fill", "none");
        star.classList.remove("d-none");
      } else {
        star.classList.add("d-none");
      }
    };
  }
}

function flipStar(star) {
  const stringifiedUser = localStorage.getItem("currentUser");
  // this shouldn't be possible, the star couldn't be displayed, but for safety
  if (!stringifiedUser || !star.dataset.recipeId) { 
    return;
  }

  const user = JSON.parse(stringifiedUser);
  if (!user.favoriteRecipes) {
    user.favoriteRecipes = [];
  }

  if (star.getAttribute("fill") === "none") {
    star.setAttribute("fill", star.getAttribute("stroke"));
    if (!user.favoriteRecipes.includes(star.dataset.recipeId)) {
      user.favoriteRecipes.push(star.dataset.recipeId);
    }
  } else {
    star.setAttribute("fill", "none");
    user.favoriteRecipes = user.favoriteRecipes.filter(id => id !== star.dataset.recipeId);
  }

  updateUser(user);
}

// RUNS ON EVERY PAGE!!
document.addEventListener("DOMContentLoaded", () => {
  loadUserNav();
  updateInterface();
});
