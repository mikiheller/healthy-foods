// ============================================
// HEALTHY FOODS ADVENTURE - SHARED APP CODE
// ============================================

/**
 * Get custom foods from localStorage
 */
function getCustomFoods() {
  const stored = localStorage.getItem('customFoods');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Load foods data from JSON and merge with custom foods
 */
export async function loadFoods() {
  try {
    const response = await fetch('/data/foods.json');
    if (!response.ok) throw new Error('Failed to load foods');
    const foods = await response.json();
    
    // Merge custom foods from localStorage
    const customFoods = getCustomFoods();
    customFoods.forEach(food => {
      if (food.category === 'healthy') {
        foods.healthy.push(food);
      } else if (food.category === 'moderation') {
        foods.moderation.push(food);
      } else if (food.category === 'unhealthy') {
        foods.unhealthy.push(food);
      }
    });
    
    return foods;
  } catch (error) {
    console.error('Error loading foods:', error);
    return { healthy: [], moderation: [], unhealthy: [] };
  }
}

/**
 * Get image path for a food item
 */
export function getImagePath(foodId) {
  return `/images/foods/${foodId}.png`;
}

/**
 * Convert low/medium/high to dots
 */
function toDots(level) {
  if (level === 'low') return '•';
  if (level === 'medium') return '••';
  if (level === 'high') return '•••';
  return '•';
}

/**
 * Render a grid of food cards
 */
export function renderFoodGrid(containerId, foods, category) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = foods.map(food => `
    <div class="food-card food-card--${category}" title="${food.description}">
      <img 
        class="food-card__image" 
        src="${getImagePath(food.id)}" 
        alt="${food.name}"
        loading="lazy"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
      >
      <div class="food-card__emoji" style="display:none;">${food.emoji}</div>
      <div class="food-card__name">${food.name}</div>
      <div class="food-card__nutrients">
        <div>Protein ${toDots(food.protein)}</div>
        <div>Fat ${toDots(food.fat)}</div>
        <div>Carbs ${toDots(food.carbs)}</div>
      </div>
    </div>
  `).join('');
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

