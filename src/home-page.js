document.addEventListener("DOMContentLoaded", () => {
  /**
   * If the page has not been opened on the user's device and current browser today (UTC time),
   * then a random recipe will be acquired. This recipe will then be put in localStorage and reused
   * as the recipe of the day (ROTD) until the page is loaded in another day.
   */
  async function getDailyRecipe() {
    // gets current UTC data in format "YYYY-MM-DD"
    const currDate = new Date().toISOString().split('T')[0];
    
    // if you need to use another field in the response recipe(s), add it to this list
    const fields = ["uri", "label", "image", "images"];
    
    let endpoint = RECIPE_ENDPOINT;
    let random = true;

    const rotdStr = localStorage.getItem("rotd");
    if (rotdStr) {
      const rotd = JSON.parse(rotdStr);

      // only if there is a recipe of the day in storage 
      // AND its data matches today's date will we NOT make a random query
      if (rotd.date === currDate) {
        endpoint = `https://api.edamam.com/api/recipes/v2/${rotd.id}`;
        random = false;
      }
    }

    try {
      let response;
      let data;
      let pick;

      if (random) {
        const params = recipeParams("any", undefined, fields);
        params.set("random", "true");
        params.set("mealType", "dinner");

        response = await fetch(`${endpoint}?${params.toString()}`, options("GET")); 
        data = await response.json();
        pick = data.hits[0].recipe; // we received multiple recipe hits if this was random
      } else {
        const params = recipeParams(undefined, undefined, fields);

        response = await fetch(`${endpoint}?${params.toString()}`, options("GET"));
        data = await response.json();
        pick = data.recipe; // we only received the single recipe that we wanted if we used an ID
      }

      const id = pick.uri.split('_').pop();

      // if this was a random query and we successfully retrieved a recipe ID
      if (random && id) {
        localStorage.setItem("rotd", JSON.stringify({
          id: id,
          date: currDate
        }));
      }

      document.getElementById('recipe-img').src = pick.image;
      document.getElementById('recipe-img').alt = pick.label;
      document.getElementById('recipe-title').innerText = pick.label;
      document.getElementById('recipe-link').href = `${ROOT}recipe/?id=${id}`;
      document.getElementById("recipe-star").dataset.recipeId = id;
    } catch (error) {
      console.error("Failed to load recipe of the day:", error);

      // reset recipe img
      document.getElementById('recipe-img').src = '';
      document.getElementById('recipe-img').alt = '';
      document.getElementById('recipe-img').style.display = 'none';

      // display error message instead of img
      document.getElementById('recipe-title').innerHTML = `
        <p class="error">Couldn't load today's recipe.</p>
        <p class="error">Please check your connection and try again.</p>`;
    }

    loadUser();
  }

  getDailyRecipe();

  function loadUser(isNewUser) {
    const loginBox = document.getElementById("login-box");
    const usernameInput = document.getElementById("username-input");
    const passwordInput = document.getElementById("password-input");
    const welcomeBox = document.getElementById("welcome-box");
    const userDisplay = document.getElementById("user-display");
    const dietPref = document.getElementById("pref-diet");

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

    loadFavorites();
  }

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

  document.getElementById("logout-btn").addEventListener("click", (e) => {
    e.preventDefault();
    logout();
    loadUser();
    loadUserNav();
  });

  // RECIPE FAVORITING //

  document.getElementById("recipe-star").addEventListener("click", (e) => {
    e.preventDefault();

    const star = document.getElementById("recipe-star");
    const recipeID = star.parentElement.href.split("?id=")[1];

    flipStar(star);
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


  // if storage changes, reload user-related content
  window.addEventListener("storage", () => {
    loadUser();
    loadUserNav();
    loadFavorites();
  });
});