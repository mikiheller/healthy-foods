// ============================================
// HEALTHY FOODS ADVENTURE - SHARED APP CODE
// ============================================

/**
 * Load foods data from JSON
 */
export async function loadFoods() {
  try {
    const response = await fetch('./data/foods.json');
    if (!response.ok) throw new Error('Failed to load foods');
    return await response.json();
  } catch (error) {
    console.error('Error loading foods:', error);
    return { healthy: [], moderation: [], unhealthy: [] };
  }
}

/**
 * Get image path for a food item
 */
export function getImagePath(foodId) {
  return `./images/foods/${foodId}.png`;
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
      <div class="food-card__nutrients" title="Protein | Fat | Carbs">
        <span class="nutrient-badge nutrient-badge--${food.protein}" title="Protein: ${food.protein}"></span>
        <span class="nutrient-badge nutrient-badge--${food.fat}" title="Fat: ${food.fat}"></span>
        <span class="nutrient-badge nutrient-badge--${food.carbs}" title="Carbs: ${food.carbs}"></span>
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

