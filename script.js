// App State
let restaurants = [];
let isSpinning = false;
let selectedCuisine = "all"; // Default to "Surprise Me"
let isAnimatingWelcome = false; // Track welcome animation state
let isLoading = false; // Track loading animation state

// Text shown on the welcome screen; swapped out for a "no results" message
const DEFAULT_WELCOME_MESSAGE = {
  emoji: "🍴",
  title: "Ready to Spin!",
  subtitle1: "Select options above and",
  subtitle2: "click Find Restaurants",
};
let welcomeMessage = { ...DEFAULT_WELCOME_MESSAGE };

// DOM Elements
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const wheelContainer = document.querySelector(".wheel-container");
const spinBtn = document.getElementById("spin-btn");
const fetchBtn = document.getElementById("fetch-btn");
const cuisineSelect = document.getElementById("cuisine");
const zipcodeInput = document.getElementById("zipcode");
const distanceSlider = document.getElementById("distance");
const distanceDisplay = document.getElementById("distance-display");
const resultDiv = document.getElementById("result");
const resultName = document.getElementById("result-name");
const spinAgainBtn = document.getElementById("spin-again-btn");
const loadingModal = document.getElementById("loading-modal");
const restaurantsDiv = document.getElementById("restaurants");
const countSpan = document.getElementById("count");
const fireworksCanvas = document.getElementById("fireworks");
const fireworksCtx = fireworksCanvas.getContext("2d");

// Wheel properties
let currentRotation = 0;
let targetRotation = 0;

// Cedar Park, TX coordinates
const CEDAR_PARK_LAT = 30.5052;
const CEDAR_PARK_LNG = -97.8203;

// Color palette for wheel segments
const colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E2",
  "#F8B195",
  "#C06C84",
  "#6C5B7B",
  "#355C7D",
];

// Initialize with sample restaurants
function initializeApp() {
  // Show welcome message on canvas
  welcomeMessage = { ...DEFAULT_WELCOME_MESSAGE };
  isAnimatingWelcome = true;
  drawWelcomeMessage();

  // Setup fireworks canvas
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;

  window.addEventListener("resize", () => {
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
  });
}

// Draw enhanced welcome message
function drawWelcomeMessage() {
  if (!isAnimatingWelcome) return; // Stop if flag is false

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Gradient background
  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    250,
  );
  gradient.addColorStop(0, "#f8f9fa");
  gradient.addColorStop(1, "#e9ecef");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer decorative circle with glow
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 180, 0, 2 * Math.PI);
  ctx.strokeStyle = "#667eea";
  ctx.lineWidth = 3;
  ctx.shadowColor = "rgba(102, 126, 234, 0.5)";
  ctx.shadowBlur = 20;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Inner circle
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 150, 0, 2 * Math.PI);
  ctx.strokeStyle = "#764ba2";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Animated dots around circle
  const time = Date.now() / 1000;
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + time;
    const x = canvas.width / 2 + Math.cos(angle) * 165;
    const y = canvas.height / 2 + Math.sin(angle) * 165;

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#667eea";
    ctx.fill();
  }

  // Large emoji
  ctx.font = "80px Arial";
  ctx.textAlign = "center";
  ctx.fillText(welcomeMessage.emoji, canvas.width / 2, canvas.height / 2 - 30);

  // Main text with gradient
  const textGradient = ctx.createLinearGradient(
    0,
    canvas.height / 2,
    0,
    canvas.height / 2 + 30,
  );
  textGradient.addColorStop(0, "#667eea");
  textGradient.addColorStop(1, "#764ba2");
  ctx.fillStyle = textGradient;
  ctx.font = "bold 28px Arial";
  ctx.fillText(welcomeMessage.title, canvas.width / 2, canvas.height / 2 + 60);

  // Subtitle
  ctx.font = "18px Arial";
  ctx.fillStyle = "#666";
  ctx.fillText(
    welcomeMessage.subtitle1,
    canvas.width / 2,
    canvas.height / 2 + 95,
  );
  ctx.fillText(
    welcomeMessage.subtitle2,
    canvas.width / 2,
    canvas.height / 2 + 120,
  );

  spinBtn.disabled = true;

  // Animate the welcome screen
  requestAnimationFrame(drawWelcomeMessage);
}

// Show/hide the "searching" modal while restaurants are being fetched
function showLoadingModal() {
  loadingModal.classList.remove("hidden");
  spinBtn.disabled = true;
}

function hideLoadingModal() {
  loadingModal.classList.add("hidden");
}

// Cuisine dropdown handler
cuisineSelect.addEventListener("change", (e) => {
  selectedCuisine = e.target.value;
});

// Update distance display
distanceSlider.addEventListener("input", (e) => {
  distanceDisplay.textContent = `${e.target.value} miles`;
});

// Convert zip code to coordinates using Nominatim (free OSM geocoding)
async function getCoordinatesFromZip(zipcode) {
  if (!zipcode || zipcode.length !== 5 || !/^\d{5}$/.test(zipcode)) {
    // Return Cedar Park default if invalid
    return {
      lat: CEDAR_PARK_LAT,
      lng: CEDAR_PARK_LNG,
      location: "Cedar Park, TX",
    };
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${zipcode}&country=us&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "RestaurantPickerWheel/1.0",
      },
    });
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        location: data[0].display_name.split(",")[0], // Get city name
      };
    } else {
      throw new Error("Zip code not found");
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    // Return Cedar Park default on error
    return {
      lat: CEDAR_PARK_LAT,
      lng: CEDAR_PARK_LNG,
      location: "Cedar Park, TX",
    };
  }
}

// Fetch restaurants (using Overpass API)

fetchBtn.addEventListener("click", async () => {
  const distance = distanceSlider.value;
  const zipcode = zipcodeInput.value.trim();

  fetchBtn.disabled = true;
  fetchBtn.textContent = "Searching...";

  wheelContainer.scrollIntoView({ behavior: "smooth", block: "center" });
  isAnimatingWelcome = false;
  isLoading = true;
  showLoadingModal();

  // Get coordinates from zip code (or use default)
  const coords = await getCoordinatesFromZip(zipcode);
  const { lat, lng, location } = coords;

  const radiusMeters = distance * 1609.34;

  // Build cuisine filter for Overpass API
  let cuisineFilter = "";
  if (selectedCuisine !== "all") {
    // Vegan is tagged differently in OpenStreetMap (diet:vegan)
    if (selectedCuisine === "vegan") {
      cuisineFilter = `["diet:vegan"~"yes|only",i]`;
    } else {
      // Other cuisines use the cuisine tag
      cuisineFilter = `["cuisine"~"${selectedCuisine}",i]`;
    }
  }

  const query = `
        [out:json][timeout:25];
        (
            node["amenity"="restaurant"]${cuisineFilter}(around:${radiusMeters},${lat},${lng});
            way["amenity"="restaurant"]${cuisineFilter}(around:${radiusMeters},${lat},${lng});
        );
        out center;
    `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const seen = new Set();
    restaurants = [];
    for (const el of data.elements) {
      const name = el.tags?.name;
      if (!name || seen.has(name)) continue;
      seen.add(name);

      const website = el.tags?.website || el.tags?.["contact:website"] || "";
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;

      restaurants.push({ name, website, lat: elLat, lng: elLng });
    }

    isLoading = false;
    hideLoadingModal();

    if (restaurants.length === 0) {
      const cuisineText =
        selectedCuisine === "all" ? "" : ` ${selectedCuisine}`;
      welcomeMessage = {
        emoji: "🔍",
        title: "No Matches Found",
        subtitle1: `No${cuisineText} restaurants near ${location}.`,
        subtitle2: "Try a wider radius or another cuisine.",
      };
      isAnimatingWelcome = true;
      drawWelcomeMessage();
    } else {
      updateRestaurantList();
      drawWheel();
    }
  } catch (error) {
    console.error("Error:", error);
    restaurants = [];
    isLoading = false;
    hideLoadingModal();
    welcomeMessage = {
      emoji: "⚠️",
      title: "Something Went Wrong",
      subtitle1: "Couldn't fetch restaurants.",
      subtitle2: "Please try again.",
    };
    isAnimatingWelcome = true;
    drawWelcomeMessage();
  }

  fetchBtn.disabled = false;
  fetchBtn.textContent = "Find Restaurants";
});

// Draw the wheel
function drawWheel() {
  // Stop welcome animation if running
  isAnimatingWelcome = false;

  if (restaurants.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ddd";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#666";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "Add restaurants to start!",
      canvas.width / 2,
      canvas.height / 2,
    );
    spinBtn.disabled = true;
    return;
  }

  spinBtn.disabled = false;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 200;
  const sliceAngle = (2 * Math.PI) / restaurants.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(currentRotation);

  // Draw each segment
  restaurants.forEach((restaurant, index) => {
    const startAngle = index * sliceAngle;
    const endAngle = startAngle + sliceAngle;

    // Draw segment
    ctx.beginPath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.lineTo(0, 0);
    ctx.fill();

    // Draw border
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw text
    ctx.save();
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 3;
    ctx.fillText(restaurant.name, radius * 0.65, 5);
    ctx.restore();
  });

  // Draw center circle
  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.arc(0, 0, 30, 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = "#667eea";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.restore();
}

// Spin the wheel
function spinWheel() {
  if (isSpinning || restaurants.length === 0) return;

  isSpinning = true;
  resultDiv.classList.add("hidden");
  spinBtn.disabled = true;
  spinAgainBtn.disabled = true;

  // Random spins between 5-10 full rotations plus random position
  const spins = 5 + Math.random() * 5;
  const randomAngle = Math.random() * 2 * Math.PI;
  targetRotation = currentRotation + spins * 2 * Math.PI + randomAngle;

  // Animate the spin
  const duration = 4000; // 4 seconds
  const startTime = Date.now();
  const startRotation = currentRotation;

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (ease-out)
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    currentRotation =
      startRotation + (targetRotation - startRotation) * easeProgress;
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Spin complete
      currentRotation = targetRotation % (2 * Math.PI);
      drawWheel();
      showResult();
      isSpinning = false;
      spinBtn.disabled = false;
      spinAgainBtn.disabled = false;
    }
  }

  animate();
}

spinBtn.addEventListener("click", spinWheel);
spinAgainBtn.addEventListener("click", spinWheel);

// Build a link to the restaurant's website, falling back to a Google search
function getRestaurantLink(restaurant) {
  if (restaurant.website) {
    return restaurant.website;
  }

  const query = encodeURIComponent(restaurant.name);
  return `https://www.google.com/search?q=${query}`;
}

// Show result
function showResult() {
  const sliceAngle = (2 * Math.PI) / restaurants.length;
  // Normalize rotation to 0-2π
  const normalizedRotation =
    (2 * Math.PI - (currentRotation % (2 * Math.PI))) % (2 * Math.PI);
  const winningIndex =
    Math.floor(normalizedRotation / sliceAngle) % restaurants.length;
  const winner = restaurants[winningIndex];

  resultName.innerHTML = "";
  const link = document.createElement("a");
  link.href = getRestaurantLink(winner);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = winner.name;
  resultName.appendChild(link);
  resultDiv.classList.remove("hidden");
  resultDiv.scrollIntoView({ behavior: "smooth", block: "center" });

  // Launch fireworks!
  launchFireworks();
}

// Update restaurant list
function updateRestaurantList() {
  restaurantsDiv.innerHTML = "";
  countSpan.textContent = restaurants.length;

  restaurants.forEach((restaurant, index) => {
    const item = document.createElement("div");
    item.className = "restaurant-item";

    const name = document.createElement("span");
    name.textContent = restaurant.name;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.textContent = "🗑️ Delete";
    deleteBtn.addEventListener("click", () => {
      restaurants.splice(index, 1);
      updateRestaurantList();
      if (restaurants.length === 0) {
        // Restart welcome animation if all restaurants deleted
        welcomeMessage = { ...DEFAULT_WELCOME_MESSAGE };
        isAnimatingWelcome = true;
        drawWelcomeMessage();
      } else {
        drawWheel();
      }
    });

    item.appendChild(name);
    item.appendChild(deleteBtn);
    restaurantsDiv.appendChild(item);
  });
}

// Fireworks Animation
class Firework {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.exploded = false;
    this.targetY = Math.random() * fireworksCanvas.height * 0.5;
    this.speed = 5;

    // Create particles
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: this.x,
        y: this.y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        alpha: 1,
        color: `hsl(${Math.random() * 360}, 100%, 60%)`,
      });
    }
  }

  update() {
    if (!this.exploded) {
      this.y -= this.speed;
      if (this.y <= this.targetY) {
        this.exploded = true;
      }
    } else {
      this.particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // Gravity
        particle.alpha -= 0.015;
      });
    }
  }

  draw() {
    if (!this.exploded) {
      fireworksCtx.beginPath();
      fireworksCtx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      fireworksCtx.fillStyle = "white";
      fireworksCtx.fill();
    } else {
      this.particles.forEach((particle) => {
        fireworksCtx.beginPath();
        fireworksCtx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        fireworksCtx.fillStyle = particle.color;
        fireworksCtx.globalAlpha = particle.alpha;
        fireworksCtx.fill();
      });
      fireworksCtx.globalAlpha = 1;
    }
  }

  isDead() {
    return this.exploded && this.particles[0].alpha <= 0;
  }
}

let fireworks = [];
let fireworksActive = false;

function launchFireworks() {
  fireworksActive = true;
  fireworksCanvas.classList.add("active");

  // Launch 10 fireworks over 2 seconds
  let count = 0;
  const interval = setInterval(() => {
    if (count < 10) {
      const x = Math.random() * fireworksCanvas.width;
      const y = fireworksCanvas.height;
      fireworks.push(new Firework(x, y));
      count++;
    } else {
      clearInterval(interval);
    }
  }, 200);

  animateFireworks();

  // Stop after 4 seconds
  setTimeout(() => {
    fireworksActive = false;
    setTimeout(() => {
      fireworksCanvas.classList.remove("active");
      fireworks = [];
    }, 1000);
  }, 4000);
}

function animateFireworks() {
  if (!fireworksActive && fireworks.length === 0) return;

  fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

  fireworks.forEach((firework, index) => {
    firework.update();
    firework.draw();

    if (firework.isDead()) {
      fireworks.splice(index, 1);
    }
  });

  requestAnimationFrame(animateFireworks);
}

// Initialize app
initializeApp();
