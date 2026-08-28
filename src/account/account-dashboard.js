let loadFavoritesInProgress = false;

document.addEventListener("DOMContentLoaded", () => {
  function loadUser(isNewUser) {
    const loginBox = document.getElementById("login-box");
    const usernameInput = document.getElementById("username-input");
    const passwordInput = document.getElementById("password-input");
    const welcomeBox = document.getElementById("welcome-box");
    const userDisplay = document.getElementById("user-display");
    const dietPref = document.getElementById("pref-diet");

    const emptyMessage = document.getElementById("empty-message");
    const favoritesTable = document.getElementById("favorites-table");

    const strUser = localStorage.getItem("currentUser");
    if (!strUser) {
      loginBox.classList.remove('d-none');
      usernameInput.value = "";
      passwordInput.value = "";
      welcomeBox.classList.add('d-none');
    } else {
      const user = JSON.parse(strUser);
      const greeting = isNewUser ? "welcome_head" : "welcome_back";
      userDisplay.textContent = `${i18next.t(greeting)}, ${user.name}!`;
      loginBox.classList.add('d-none');
      welcomeBox.classList.remove('d-none');
      dietPref.value = user.diet || "";
    }
  }

  loadUser();
  loadFavoritesTable();

  // USERNAME HANDLING //

  const usernameInput = document.getElementById("username-input");

  usernameInput.addEventListener("input", () => {
    document.getElementById("username-error").textContent = "";
    document.getElementById("username-error").classList.add("d-none");
  });

  // PASSWORD HANDLING //
  const passwordInput = document.getElementById("password-input");

  // display criteria when focused
  passwordInput.addEventListener("focus", (event) => {
    document.getElementById("password-criteria").classList.remove("d-none");
  
    // Calculate how much to scroll to align the element's top with the cursor
    const scrollDistance = passwordInput.getBoundingClientRect().top - event.clientY;

    window.scrollBy({
      top: scrollDistance,
      behavior: 'smooth' // Optional: use 'auto' for instant jump
    });
  });

  // hide criteria when unfocused if password field is empty
  passwordInput.addEventListener("blur", onPasswordLostFocus);

  function onPasswordLostFocus() {
    if (passwordInput.value === "") {
      document.getElementById("password-criteria").classList.add("d-none");
    }
  }

  const passwordCriteria = {
    length: () => {
      return /.{6,}/.test(passwordInput.value);
    },
    lowercase: () => {
      return /[a-z]/.test(passwordInput.value);
    },
    uppercase: () => {
      return /[A-Z]/.test(passwordInput.value);
    },
    digit: () => {
      return /[0-9]/.test(passwordInput.value);
    },
    special: () => {
      return /[!@#$%^&*]/.test(passwordInput.value);
    },
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/
  };

  // update criteria icons based on current input value
  passwordInput.addEventListener("input", onPasswordInput);

  function onPasswordInput() {
    document.getElementById("password-error").textContent = "";
    document.getElementById("password-error").classList.add("d-none");

    document.getElementById("criteria-length").src = `${ROOT}img/${passwordCriteria.length() ? "check" : "x"}-square.svg`;
    document.getElementById("criteria-length").alt = `${passwordCriteria.length() ? "valid" : "invalid"}`;

    document.getElementById("criteria-lowercase").src = `${ROOT}img/${passwordCriteria.lowercase() ? "check" : "x"}-square.svg`;
    document.getElementById("criteria-lowercase").alt = `${passwordCriteria.lowercase() ? "valid" : "invalid"}`;

    document.getElementById("criteria-uppercase").src = `${ROOT}img/${passwordCriteria.uppercase() ? "check" : "x"}-square.svg`;
    document.getElementById("criteria-uppercase").alt = `${passwordCriteria.uppercase() ? "valid" : "invalid"}`;

    document.getElementById("criteria-digit").src = `${ROOT}img/${passwordCriteria.digit() ? "check" : "x"}-square.svg`;
    document.getElementById("criteria-digit").alt = `${passwordCriteria.digit() ? "valid" : "invalid"}`;

    document.getElementById("criteria-special").src = `${ROOT}img/${passwordCriteria.special() ? "check" : "x"}-square.svg`;
    document.getElementById("criteria-special").alt = `${passwordCriteria.special() ? "valid" : "invalid"}`;
  }

  // LOGIN/LOGOUT HANDLING //

  document.getElementById("login-btn").addEventListener("click", (e) => {
    e.preventDefault();

    const response = login(usernameInput.value, passwordInput.value, passwordCriteria.regex);

    // if status is success/true, then load the new user
    if (response.status) {
      // response object lets us know if this was a new user registering
      loadUser(response.isNewUser);
      loadUserNav();

      // make sure fields are cleared
      usernameInput.value = "";
      passwordInput.value = "";

      // update icons based on empty input and trigger lost focus ("blur" event)
      onPasswordInput();
      onPasswordLostFocus();

      loadFavoritesTable();
    } else { // if status is failure/false, handle the two causes of failure
      if (response.cause === "invalidUsername") {
        document.getElementById("username-error").textContent = i18next.t("error_username");
        document.getElementById("username-error").classList.remove("d-none");
        usernameInput.focus();
      } else if (response.cause === "invalidPassword") {
        passwordInput.focus();
      } else if (response.cause === "incorrectPassword") {
        document.getElementById("password-error").textContent = i18next.t("error_password");
        document.getElementById("password-error").classList.remove("d-none");
        passwordInput.focus();
      }
    }
  });

  // PREFERENCE HANDLING //

  document.getElementById("pref-diet").addEventListener("change", (e) => {
    const selected = e.target.value;

    const strUser = localStorage.getItem("currentUser");
    if (!strUser) { // should be impossible to get here, the select shouldn't be visible otherwise
      return;
    }

    const user = JSON.parse(strUser);
    user.diet = selected;

    updateUser(user);
  });


  // FAVORITES TABLE //

  async function loadFavoritesTable() {
    const tbody = document.getElementById("favorites-tbody");
    tbody.replaceChildren();

    const emptyMessage = document.getElementById("empty-message");
    const favoritesSection = document.getElementById("favorites");

    const stringifiedUser = localStorage.getItem("currentUser");

    if (!stringifiedUser) {
      emptyMessage.classList.add("d-none");
      favoritesSection.classList.add("d-none");
      return;
    }

    const user = JSON.parse(stringifiedUser);
    if (!user.favoriteRecipes || user.favoriteRecipes.length == 0) {
      emptyMessage.classList.remove("d-none");
      favoritesSection.classList.add("d-none");
      return;
    }

    emptyMessage.classList.add("d-none");
    favoritesSection.classList.remove("d-none");

    const fields = ["uri", "label", "calories", "mealType"];
    const params = recipeParams(undefined, undefined, fields);

    loadFavoritesInProgress = true;

    for (const id of user.favoriteRecipes) {
      const tr = document.getElementById("row-template").content.cloneNode(true).children[0];
      tr.dataset.recipeId = id;

      const response = await fetch(`${RECIPE_ENDPOINT}/${id}?${params.toString()}`, options("GET"));
      const data = await response.json();

      tr.children.item(0).textContent = data.recipe.label;
      tr.children.item(1).textContent = data.recipe.mealType;
      tr.children.item(2).textContent = Math.round(data.recipe.calories / 10) * 10;
      tbody.append(tr);
    }

    loadFavoritesInProgress = false;
  }

  document.getElementById("favorites-tbody").addEventListener("click", (e) => {
    const tr = e.target.parentNode;
    location.href = `${ROOT}recipe/?id=${tr.dataset.recipeId}`;
  })

  document.getElementById("logout-btn").addEventListener("click", (e) => {
    e.preventDefault();
    logout();
    loadUser();
    loadUserNav();
    loadFavoritesTable();
  });

  window.addEventListener("storage", () => {
    loadUser();
    loadUserNav();
    
    // prevents multiple loads being created simultaneously and duplicating row entries
    if (!loadFavoritesInProgress) {
      loadFavoritesTable();
    }
  });
});