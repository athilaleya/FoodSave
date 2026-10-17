
const foodForm = document.getElementById("foodForm");
const foodList = document.getElementById("foodList");
const searchFood = document.getElementById("searchFood");
const formMessage = document.getElementById("formMessage");

const foodName = document.getElementById("foodName");
const foodCategory = document.getElementById("foodCategory");
const foodQuantity = document.getElementById("foodQuantity");
const foodExpiry = document.getElementById("foodExpiry");
const foodLocation = document.getElementById("foodLocation");

// Set today's date as the earliest expiry date.
foodExpiry.min = new Date().toLocaleDateString("en-CA");

// Sample food items for demonstration.
const sampleFoods = [
    {
        id: 1,
        name: "Fresh Apples",
        category: "Fruits & Vegetables",
        quantity: 5,
        expiry: "2026-10-20",
        location: "Mori Cafe, Cyberjaya",
        claimed: false
    },
    {
        id: 2,
        name: "Vegetable Sandwiches",
        category: "Bread & Bakery",
        quantity: 3,
        expiry: "2026-10-19",
        location: "University Cafeteria",
        claimed: false
    },
    {
        id: 3,
        name: "Cooked Rice Meals",
        category: "Rice & Meals",
        quantity: 4,
        expiry: "2026-10-18",
        location: "Community Food Centre",
        claimed: false
    }
];

// Load saved food or show sample food on first visit.
let foods;

try {
    const savedFoods = localStorage.getItem("foodSaveItems");
    foods = savedFoods === null
        ? sampleFoods
        : JSON.parse(savedFoods);

    if (!Array.isArray(foods)) {
        foods = sampleFoods;
    }
} catch (error) {
    foods = sampleFoods;
}

function saveFoods() {
    try {
        localStorage.setItem("foodSaveItems", JSON.stringify(foods));
    } catch (error) {
        formMessage.textContent =
            "Unable to save data in this browser.";
    }
}

function getEmoji(category) {
    if (category === "Fruits & Vegetables") return "🍎";
    if (category === "Rice & Meals") return "🍱";
    if (category === "Bread & Bakery") return "🥪";
    if (category === "Drinks") return "🥤";
    return "🍽️";
}

function updateDashboard() {
    const available = foods.filter(food => !food.claimed).length;
    const claimed = foods.filter(food => food.claimed).length;

    document.getElementById("availableCount").textContent = available;
    document.getElementById("claimedCount").textContent = claimed;
    document.getElementById("sharedCount").textContent = foods.length;
}

function renderFoods() {
    foodList.replaceChildren();

    const keyword = searchFood.value.trim().toLowerCase();

    const filteredFoods = foods.filter(food => {
        return (
            food.name.toLowerCase().includes(keyword) ||
            food.location.toLowerCase().includes(keyword) ||
            food.category.toLowerCase().includes(keyword)
        );
    });

    if (filteredFoods.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent = "No food items found. Try another search.";
        foodList.appendChild(message);
    }

    filteredFoods.forEach(food => {
        const card = document.createElement("article");
        card.className = "food-card";

        const emoji = document.createElement("div");
        emoji.className = "food-emoji";
        emoji.textContent = getEmoji(food.category);

        const name = document.createElement("h3");
        name.textContent = food.name;

        const category = document.createElement("p");
        category.textContent = "Category: " + food.category;

        const quantity = document.createElement("p");
        quantity.textContent = "Quantity: " + food.quantity;

        const expiry = document.createElement("p");
        expiry.textContent = "Expiry date: " + food.expiry;

        const location = document.createElement("p");
        location.textContent = "📍 " + food.location;

        const status = document.createElement("p");
        status.textContent = food.claimed
            ? "Status: Claimed"
            : "Status: Available";

        card.append(
            emoji, name, category, quantity, expiry, location, status
        );

        if (!food.claimed) {
            const claimButton = document.createElement("button");
            claimButton.className = "btn";
            claimButton.textContent = "Claim Food";

            claimButton.addEventListener("click", () => {
                const confirmClaim = confirm(
                    "Do you want to claim " + food.name + "?"
                );

                if (confirmClaim) {
                    food.claimed = true;
                    saveFoods();
                    renderFoods();
                }
            });

            card.appendChild(claimButton);
        }

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete Item";

        deleteButton.addEventListener("click", () => {
            const confirmDelete = confirm(
                "Are you sure you want to delete this item?"
            );

            if (confirmDelete) {
                foods = foods.filter(item => item.id !== food.id);
                saveFoods();
                renderFoods();
            }
        });

        card.appendChild(deleteButton);
        foodList.appendChild(card);
    });

    updateDashboard();
}

// Add a new food item.
foodForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const today = new Date().toLocaleDateString("en-CA");

    if (foodExpiry.value < today) {
        formMessage.textContent = "Please choose a valid expiry date.";
        return;
    }

    const newFood = {
        id: Date.now(),
        name: foodName.value.trim(),
        category: foodCategory.value,
        quantity: Number(foodQuantity.value),
        expiry: foodExpiry.value,
        location: foodLocation.value.trim(),
        claimed: false
    };

    if (
        !newFood.name ||
        !newFood.category ||
        !newFood.quantity ||
        !newFood.location
    ) {
        formMessage.textContent = "Please complete all fields.";
        return;
    }

    foods.unshift(newFood);
    saveFoods();

    foodForm.reset();
    foodExpiry.min = new Date().toLocaleDateString("en-CA");

    formMessage.textContent = "Food item added successfully! 🌱";

    searchFood.value = "";
    renderFoods();

    document.getElementById("available").scrollIntoView({
        behavior: "smooth"
    });
});

// Search by food name, category or location.
searchFood.addEventListener("input", renderFoods);

// Display food items when the page opens.
saveFoods();
renderFoods();
