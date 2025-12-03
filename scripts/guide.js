// Load food data and render the guide
let foodsData = null;
let currentFilter = 'all';

async function loadFoods() {
  try {
    const response = await fetch('/data/foods.json');
    foodsData = await response.json();
    renderFoods();
  } catch (error) {
    console.error('Error loading foods:', error);
    document.getElementById('foods-grid').innerHTML = `
      <div class="loading">Oops! Couldn't load the foods. Try refreshing!</div>
    `;
  }
}

function getNutrientLevel(level) {
  switch(level) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
}

function renderNutrientDots(level, type) {
  const numFilled = getNutrientLevel(level);
  let dots = '';
  for (let i = 0; i < 3; i++) {
    const filled = i < numFilled ? `filled ${level}` : '';
    dots += `<div class="nutrient-dot ${filled}"></div>`;
  }
  return dots;
}

function createFoodCard(food, category) {
  const categoryIndicators = {
    healthy: '✓',
    moderation: '~',
    unhealthy: '!'
  };

  return `
    <div class="guide-food-card ${category}">
      <div class="food-image-container">
        <img 
          src="/images/foods/${food.id}.png" 
          alt="${food.name}"
          class="food-image"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
        >
        <div class="food-emoji-fallback" style="display: none;">${food.emoji}</div>
        <div class="food-category-indicator ${category}">${categoryIndicators[category]}</div>
      </div>
      <div class="food-info">
        <h4 class="food-name">${food.name}</h4>
        <p class="food-description">${food.description}</p>
        <div class="food-nutrients">
          <div class="nutrient-row">
            <span class="nutrient-label-small">Protein</span>
            <div class="nutrient-dots">${renderNutrientDots(food.protein, 'protein')}</div>
          </div>
          <div class="nutrient-row">
            <span class="nutrient-label-small">Fat</span>
            <div class="nutrient-dots">${renderNutrientDots(food.fat, 'fat')}</div>
          </div>
          <div class="nutrient-row">
            <span class="nutrient-label-small">Carbs</span>
            <div class="nutrient-dots">${renderNutrientDots(food.carbs, 'carbs')}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderFoods() {
  const grid = document.getElementById('foods-grid');
  
  if (!foodsData) {
    grid.innerHTML = '<div class="loading">Loading yummy foods</div>';
    return;
  }

  let html = '';

  const categories = [
    { key: 'healthy', title: '🟢 Healthy Foods', description: 'Eat these every day!' },
    { key: 'moderation', title: '🟡 Okay Sometimes', description: 'These are fine once in a while' },
    { key: 'unhealthy', title: '🔴 Treat Foods', description: 'Only on special occasions!' }
  ];

  const categoriesToShow = currentFilter === 'all' 
    ? categories 
    : categories.filter(c => c.key === currentFilter);

  for (const category of categoriesToShow) {
    const foods = foodsData[category.key] || [];
    
    if (foods.length === 0) continue;

    // Add category header
    html += `
      <div class="category-header ${category.key}">
        <h3>${category.title}</h3>
        <div class="category-line"></div>
        <span class="category-count">${foods.length} foods</span>
      </div>
    `;

    // Add food cards
    for (const food of foods) {
      html += createFoodCard(food, category.key);
    }
  }

  grid.innerHTML = html;
}

// Filter functionality
function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update filter and re-render
      currentFilter = btn.dataset.filter;
      renderFoods();
    });
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupFilters();
  loadFoods();
});

