# Cheffin' It Up

## Purpose

The purpose for our project, Cheffin’ It Up, is to create a web application that helps users create and shop for groceries based on recipes they want to make. Our web application would allow the user to search through recipes based on different factors such as, diet restrictions, calories, and many more. After they find a recipe that fits their needs and wants they are able to save it and send it to their grocery list within the app. These saved recipes then get sent to the grocery list portion of our application where they will be able to see the exact amount they will need to buy at the store for each recipe they saved.<br/>

The problem this application aims to solve is the amount of time people have to spend each week on planning out and purchasing meals. This application saves the users time by giving the user direct access to recipes instead of them having to find one in a book or online, and then connecting them directly to their ingredients in a grocery list. Instead of having to go look up the recipe, write down the ingredients and calculate how much is needed for each, the user can do it all in one click.

## Users

Cheffin’ It Up will primarily serve two kinds of users:
1. those who frequently shop and/or prepare meals for households
2. those new to living on their own

### Background

The first category includes parents who can use the web app to save time in their busy lives, while the second category includes young adults who can benefit from a reduced barrier to entry for learning how to shop and cook for themselves. Although, all users regardless of background can benefit from saving the time it takes to decide a dish, look up a recipe, and figure out and write a grocery list. Any user should easily be able to find a dish they would like and automatically be provided with a grocery list with clear quantities.

### Needs

Users can also benefit from a digital grocery list as items can be checked off on their mobile devices as they find each item in a store. Additionally, users can benefit from recipe information regarding how many it feeds and its nutritional information. Recipes can be dynamically changed to provide appropriate ingredient quantities, and nutritional information will be summed.


## Features

Users of Cheffin' It Up will be able to utilize:

### 1. Recipe Browsing:

The recipe browsing feature allows for users to actively search for recipes by name, ingredients, category, and dish type (e.g. breakfast, dinner, vegetarian). The recipe search also allows for searching of recipes that meet a caloric requirement or even cooking time. Many of these individual features will be implemented as search filters, allowing the user to interact with the recipes and sorting.

### 2. Grocery Lists:

For each recipe that the user interacts with and wants, there will be a corresponding grocery list for that item. Each grocery list will contain the ingredients needed to make that recipe. Users can manage the grocery list by adding, removing, and overall editing each ingredient needed, including the quantity of said item.

### 3. User Accounts:

The application will include a user account system that allows users to personalize and save preferences and recipes within their personal or shared account. Saved recipes will allow for repetition and routine scheduling that allow for better accessibility and overall time saving. User accounts will also have other implementations, such as storing grocery lists, customizing preferences, tracking previously cooked or viewed recipes, and bookmarking recipe features.

### A concrete example:

A college student opens the application and logs into their personal account. They search for a dinner recipe that they will need for tonight using the interactive search bar that includes filters. The user searches, for example, “chicken alfredo” with the search filter “dinner”, and maybe the caloric range of “400-800”. The user is then met with a page of recipes that matches the given search. The user saves the recipe that they want, and their grocery list is updated with the ingredients needed for that recipe.

## Data

### Ingredient

1. name: string
2. quantity: number
3. unit: string

### Recipe

1. name: string
2. summary: string
3. img: string (URL to recipe image)
4. servings: number
5. ingredients: array[Ingredient]
6. instructions: array[string]

### GroceryList

1. name: string
2. ingredients: array[object { ingredient: Ingredient, checked: boolean }]
3. date: Date object

### UserAccount

1. username: string
2. password: string
3. img: string (URL to a profile picture)
4. recipes: array[Recipe]
5. groceryLists: array[GroceryList]

### Example

```
recipe = new Recipe(
  “Lobster Risotto”,
  “Classic Italian rice dish”, 
  “www.foodimages.net/lobster-risotto.png”,
  2, 
  [
    new Ingredient(“Lobster”, 4, “oz”),
    new Ingredient(“Rice”, 8, “oz”), ...
  ],
  [
    “Cook onion in butter and oil”,
    “Add rice and stir”, ...
  ]
);
```
