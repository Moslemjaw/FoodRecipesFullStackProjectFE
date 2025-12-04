# Food Recipes Backend API Documentation

This is the backend API for the Food Recipes Full Stack Project.

## **General Info**

- **Base URL**: `http://localhost:8000` (or your deployed URL)
- **Authentication**: Uses **Bearer Token**.
  - On login/register, the API returns a `token`.
  - For protected routes, send header: `Authorization: Bearer <your_token>`
- **Image Uploads**:
  - Images are handled via `multer`.
  - Endpoints accepting images expect `multipart/form-data`.
  - Served at: `/media/<filename>` (e.g., `http://localhost:8000/media/image-123.jpg`)

---

## **1. User Resource**

**Base Path**: `/users`

### **Model**

```typescript
interface User {
  _id: string;
  name: string; // Required
  email: string; // Required, Unique
  password: string; // Required (Hashed)
  image?: string; // URL path to image
  recipes: string[]; // Array of Recipe IDs
  following: string[]; // Array of User IDs
  createdAt: string;
  updatedAt: string;
}
```

### **Endpoints**

| Method   | Endpoint    | Auth | Input (Body/Params)                                                                               | Response                                               | Notes                         |
| :------- | :---------- | :--- | :------------------------------------------------------------------------------------------------ | :----------------------------------------------------- | :---------------------------- |
| **POST** | `/register` | No   | **FormData**:<br>`name` (text)<br>`email` (text)<br>`password` (text)<br>`image` (file, optional) | `{ message, token, user: { id, name, email, image } }` | Creates user & returns token. |
| **POST** | `/login`    | No   | **JSON**:<br>`{ "email": "...", "password": "..." }`                                              | `{ token, user: { id, name, email, image } }`          | Returns token on success.     |
| **GET**  | `/`         | No   | None                                                                                              | `User[]`                                               | Returns all users.            |
| **GET**  | `/:userId`  | No   | Params: `userId`                                                                                  | `User`                                                 | Get single user by ID.        |

---

## **2. Recipe Resource**

**Base Path**: `/recipes`

### **Model**

```typescript
interface Recipe {
  _id: string;
  title: string;
  instructions: string[];
  image?: string;
  cookingTime: string;
  userId: User; // Populated with name
  categoryId: Category[]; // Populated with name
  ingredients: {
    ingredientId: Ingredient; // Populated with name
    quantity: string;
    unit: string;
  }[];
  createdAt: string;
  updatedAt: string;
}
```

### **Endpoints**

| Method     | Endpoint                | Auth    | Input                                                                                                                                                             | Response                       | Notes                                                                                         |
| :--------- | :---------------------- | :------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------- | :-------------------------------------------------------------------------------------------- |
| **GET**    | `/`                     | **Yes** | None                                                                                                                                                              | `Recipe[]`                     | Returns all recipes (populated).                                                              |
| **GET**    | `/my-recipes`           | **Yes** | None                                                                                                                                                              | `Recipe[]`                     | Returns current user's recipes.                                                               |
| **GET**    | `/category/:categoryId` | No      | Params: `categoryId`                                                                                                                                              | `Recipe[]`                     | Filter by category.                                                                           |
| **GET**    | `/:id`                  | No      | Params: `id`                                                                                                                                                      | `Recipe`                       | Single recipe details.                                                                        |
| **POST**   | `/`                     | **Yes** | **FormData**:<br>`title` (text)<br>`instructions` (text/array)<br>`cookingTime` (text)<br>`categoryId` (text ID)<br>`ingredients` (JSON string)<br>`image` (file) | `Recipe`                       | `ingredients` must be `JSON.stringify([{ingredientId, quantity, unit}])` when using FormData. |
| **PUT**    | `/:id`                  | **Yes** | **FormData** (same as POST)                                                                                                                                       | `Recipe`                       | Updates recipe. Only owner can update.                                                        |
| **DELETE** | `/:id`                  | **Yes** | Params: `id`                                                                                                                                                      | `String` ("Recipe deleted...") | Only owner can delete.                                                                        |

---

## **3. Ingredient Resource**

**Base Path**: `/ingredients`

### **Model**

```typescript
interface Ingredient {
  _id: string;
  name: string; // Required, Unique
}
```

### **Endpoints**

| Method     | Endpoint  | Auth | Input                | Response                      |
| :--------- | :-------- | :--- | :------------------- | :---------------------------- |
| **GET**    | `/`       | No   | None                 | `Ingredient[]`                |
| **GET**    | `/search` | No   | Query: `?name=onion` | `Ingredient[]` (Regex search) |
| **POST**   | `/`       | No   | `{ "name": "..." }`  | Message string                |
| **DELETE** | `/:id`    | No   | Params: `id`         | Message string                |

---

## **4. Category Resource**

**Base Path**: `/categories`

### **Model**

```typescript
interface Category {
  _id: string;
  name: string; // Required, Unique
}
```

### **Endpoints**

| Method     | Endpoint | Auth | Input               | Response       |
| :--------- | :------- | :--- | :------------------ | :------------- |
| **GET**    | `/`      | No   | None                | `Category[]`   |
| **GET**    | `/:id`   | No   | Params: `id`        | `Category`     |
| **POST**   | `/`      | No   | `{ "name": "..." }` | `Category`     |
| **PUT**    | `/:id`   | No   | `{ "name": "..." }` | `Category`     |
| **DELETE** | `/:id`   | No   | Params: `id`        | Message string |

---

## **5. Favorites Resource**

**Base Path**: `/favorites`

### **Model**

```typescript
interface Favorite {
  _id: string;
  userID: string; // Ref User
  recipeID: Recipe; // Ref Recipe (Populated in GET)
}
```

### **Endpoints**

| Method     | Endpoint     | Auth    | Input                   | Response       | Notes                                                     |
| :--------- | :----------- | :------ | :---------------------- | :------------- | :-------------------------------------------------------- |
| **POST**   | `/`          | **Yes** | `{ "recipeID": "..." }` | `Favorite`     | Toggles favorite? No, just adds. Returns error if exists. |
| **GET**    | `/`          | **Yes** | None                    | `Favorite[]`   | Returns favorites with populated Recipe details.          |
| **DELETE** | `/:recipeID` | **Yes** | Params: `recipeID`      | Message string | Removes by Recipe ID (not Favorite ID).                   |

---

## **6. Rating Resource**

**Base Path**: `/ratings`

### **Model**

```typescript
interface Rating {
  _id: string;
  userID: User; // Ref User
  recipeID: string; // Ref Recipe
  rating: number; // Min: 1, Max: 5
}
```

### **Endpoints**

| Method     | Endpoint            | Auth    | Input                                | Response                                                       | Notes                           |
| :--------- | :------------------ | :------ | :----------------------------------- | :------------------------------------------------------------- | :------------------------------ |
| **POST**   | `/`                 | **Yes** | `{ "recipeID": "...", "rating": 5 }` | `Rating`                                                       | One rating per user per recipe. |
| **GET**    | `/recipe/:recipeID` | No      | Params: `recipeID`                   | `{ ratings: [], totalRatings: number, averageRating: number }` | Returns list + stats.           |
| **PUT**    | `/:ratingID`        | **Yes** | `{ "rating": 3 }`                    | `Rating`                                                       | Update existing rating.         |
| **DELETE** | `/:ratingID`        | **Yes** | Params: `ratingID`                   | Message string                                                 | Delete rating.                  |

---

## **7. Follow Resource**

**Base Path**: `/follow`

### **Model**

```typescript
interface Follow {
  _id: string;
  followerID: User; // Who is following
  followingID: User; // Who is being followed
}
```

### **Endpoints**

| Method     | Endpoint     | Auth    | Input                     | Response       | Notes                           |
| :--------- | :----------- | :------ | :------------------------ | :------------- | :------------------------------ |
| **GET**    | `/following` | **Yes** | None                      | `Follow[]`     | List of people user follows.    |
| **GET**    | `/followers` | **Yes** | None                      | `Follow[]`     | List of people following user.  |
| **POST**   | `/:userID`   | **Yes** | Params: `userID` (Target) | `Follow`       | Follows the user with `userID`. |
| **DELETE** | `/:userID`   | **Yes** | Params: `userID` (Target) | Message string | Unfollows the user.             |
