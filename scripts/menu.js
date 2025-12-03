// State
let foodsData = null;
let myPlate = [];
let currentFilter = 'all';
let searchTerm = '';

// DOM elements
const elements = {
  statusCard: document.getElementById('status-card'),
  statusIcon: document.getElementById('status-icon'),
  statusTitle: document.getElementById('status-title'),
  statusMessage: document.getElementById('status-message'),
  progressBar: document.getElementById('progress-bar'),
  myPlate: document.getElementById('my-plate'),
  emptyPlate: document.getElementById('empty-plate'),
  clearPlateBtn: document.getElementById('clear-plate-btn'),
  searchInput: document.getElementById('food-search'),
  searchResults: document.getElementById('search-results'),
  celebrationModal: document.getElementById('celebration-modal'),
  closeModalBtn: document.getElementById('close-modal-btn'),
  confettiContainer: document.getElementById('confetti-container')
};

// Load foods data
async function loadFoods() {
  try {
    const response = await fetch('/data/foods.json');
    foodsData = await response.json();
    renderSearchResults();
  } catch (error) {
    console.error('Error loading foods:', error);
  }
}

// Calculate dessert score
function calculateScore() {
  if (myPlate.length === 0) return { score: 0, status: 'empty' };
  
  let healthyCount = 0;
  let moderateCount = 0;
  let unhealthyCount = 0;
  
  myPlate.forEach(item => {
    if (item.category === 'healthy') healthyCount++;
    else if (item.category === 'moderation') moderateCount++;
    else unhealthyCount++;
  });
  
  // Scoring logic:
  // - Each healthy food adds 30 points
  // - Each moderate food adds 10 points
  // - Each unhealthy food subtracts 20 points
  // - Need 100 points for dessert
  // - At least 2 healthy foods required
  
  const rawScore = (healthyCount * 30) + (moderateCount * 10) - (unhealthyCount * 20);
  const score = Math.max(0, Math.min(100, rawScore));
  
  let status = 'not-ready';
  if (score >= 100 && healthyCount >= 2) {
    status = 'ready';
  } else if (score >= 60 || healthyCount >= 1) {
    status = 'almost';
  }
  
  return {
    score,
    status,
    healthyCount,
    moderateCount,
    unhealthyCount
  };
}

// Update dessert status display
function updateStatus() {
  const { score, status, healthyCount, moderateCount, unhealthyCount } = calculateScore();
  
  elements.progressBar.style.width = `${score}%`;
  elements.statusCard.className = `status-card ${status}`;
  
  if (myPlate.length === 0) {
    elements.statusIcon.textContent = '🤔';
    elements.statusTitle.textContent = 'What did you eat today?';
    elements.statusMessage.textContent = 'Add foods to see if you\'re ready for dessert!';
  } else if (status === 'ready') {
    elements.statusIcon.textContent = '🎉';
    elements.statusTitle.textContent = 'Dessert Time!';
    elements.statusMessage.textContent = `Amazing! You ate ${healthyCount} healthy foods! You earned a treat!`;
  } else if (status === 'almost') {
    const needed = healthyCount < 2 ? `${2 - healthyCount} more healthy food${2 - healthyCount > 1 ? 's' : ''}` : 'a bit more healthy food';
    elements.statusIcon.textContent = '🌟';
    elements.statusTitle.textContent = 'Almost there!';
    elements.statusMessage.textContent = `You're doing great! Try eating ${needed}!`;
  } else {
    elements.statusIcon.textContent = '💪';
    elements.statusTitle.textContent = 'Keep going!';
    elements.statusMessage.textContent = unhealthyCount > 0 
      ? 'Try adding some healthy foods to balance the treats!'
      : 'Add some healthy foods like fruits and veggies!';
  }
}

// Render my plate
function renderMyPlate() {
  if (myPlate.length === 0) {
    elements.emptyPlate.style.display = 'block';
    elements.clearPlateBtn.style.display = 'none';
    elements.myPlate.innerHTML = '';
    elements.myPlate.appendChild(elements.emptyPlate);
    return;
  }
  
  elements.clearPlateBtn.style.display = 'flex';
  
  let html = '<div class="plate-items">';
  
  myPlate.forEach((item, index) => {
    html += `
      <div class="plate-item ${item.category}">
        <img 
          src="/images/foods/${item.id}.png" 
          alt="${item.name}" 
          class="plate-item-image"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
        >
        <span class="plate-item-emoji" style="display: none;">${item.emoji}</span>
        <span class="plate-item-name">${item.name}</span>
        <button class="plate-item-remove" data-index="${index}" title="Remove">×</button>
      </div>
    `;
  });
  
  html += '</div>';
  elements.myPlate.innerHTML = html;
  
  // Add remove listeners
  document.querySelectorAll('.plate-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromPlate(parseInt(btn.dataset.index)));
  });
}

// Add food to plate
function addToPlate(food) {
  const wasNotReady = calculateScore().status !== 'ready';
  
  myPlate.push(food);
  renderMyPlate();
  updateStatus();
  
  // Check if we just became ready for dessert
  const nowReady = calculateScore().status === 'ready';
  if (wasNotReady && nowReady) {
    showCelebration();
  }
}

// Remove food from plate
function removeFromPlate(index) {
  myPlate.splice(index, 1);
  renderMyPlate();
  updateStatus();
}

// Clear plate
function clearPlate() {
  myPlate = [];
  renderMyPlate();
  updateStatus();
}

// Show celebration
function showCelebration() {
  elements.celebrationModal.classList.remove('hidden');
  createConfetti();
}

// Create confetti
function createConfetti() {
  const colors = ['#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
  
  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = `${Math.random() * 0.5}s`;
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    elements.confettiContainer.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 3000);
  }
}

// Get filtered foods
function getFilteredFoods() {
  if (!foodsData) return [];
  
  let foods = [];
  
  const categories = currentFilter === 'all' 
    ? ['healthy', 'moderation', 'unhealthy']
    : [currentFilter];
  
  categories.forEach(cat => {
    const categoryFoods = foodsData[cat] || [];
    categoryFoods.forEach(food => {
      foods.push({ ...food, category: cat });
    });
  });
  
  // Apply search filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    foods = foods.filter(food => 
      food.name.toLowerCase().includes(term)
    );
  }
  
  return foods;
}

// Render search results
function renderSearchResults() {
  const foods = getFilteredFoods();
  
  if (foods.length === 0) {
    elements.searchResults.innerHTML = `
      <div class="no-results">
        <p>No foods found. Try a different search!</p>
      </div>
    `;
    return;
  }
  
  const categoryLabels = {
    healthy: 'Healthy',
    moderation: 'Sometimes',
    unhealthy: 'Treat'
  };
  
  let html = '';
  
  foods.forEach(food => {
    html += `
      <div class="search-result-item ${food.category}" data-food-id="${food.id}">
        <img 
          src="/images/foods/${food.id}.png" 
          alt="${food.name}" 
          class="result-image"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
        >
        <div class="result-emoji" style="display: none;">${food.emoji}</div>
        <div class="result-name">${food.name}</div>
        <span class="result-category ${food.category}">${categoryLabels[food.category]}</span>
      </div>
    `;
  });
  
  elements.searchResults.innerHTML = html;
  
  // Add click listeners
  document.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const foodId = item.dataset.foodId;
      const food = foods.find(f => f.id === foodId);
      if (food) addToPlate(food);
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  // Search input
  elements.searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderSearchResults();
  });
  
  // Category filters
  document.querySelectorAll('.quick-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.quick-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.category;
      renderSearchResults();
    });
  });
  
  // Clear plate
  elements.clearPlateBtn.addEventListener('click', clearPlate);
  
  // Close modal
  elements.closeModalBtn.addEventListener('click', () => {
    elements.celebrationModal.classList.add('hidden');
  });
  
  // Close modal on background click
  elements.celebrationModal.addEventListener('click', (e) => {
    if (e.target === elements.celebrationModal) {
      elements.celebrationModal.classList.add('hidden');
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadFoods();
  updateStatus();
});

