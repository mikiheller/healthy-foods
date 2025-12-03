// Food data will be loaded
let foods = { healthy: [], moderation: [], unhealthy: [] };

// App State
const state = {
  currentPage: 'landing',
  gameState: {
    currentFood: null,
    score: 0,
    total: 0,
    foods: [],
    answered: false,
  },
  trackerState: {
    eatenFoods: [],
    searchQuery: '',
  },
};

// Get all foods as a flat array with category info
function getAllFoods() {
  return [
    ...foods.healthy.map(f => ({ ...f, category: 'healthy' })),
    ...foods.moderation.map(f => ({ ...f, category: 'moderation' })),
    ...foods.unhealthy.map(f => ({ ...f, category: 'unhealthy' })),
  ];
}

// Shuffle array
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Check if image exists
async function imageExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Get food image HTML (with emoji fallback)
function getFoodImageHTML(food, size = 'medium') {
  const sizes = {
    small: { img: '80px', emoji: '3rem' },
    medium: { img: '120px', emoji: '5rem' },
    large: { img: '180px', emoji: '8rem' },
  };
  const s = sizes[size] || sizes.medium;
  const imgPath = `/images/foods/${food.id}.png`;
  
  return `
    <img 
      src="${imgPath}" 
      alt="${food.name}"
      class="food-image"
      style="width: ${s.img}; height: ${s.img}; object-fit: contain;"
      onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
    >
    <span class="food-emoji" style="display: none; font-size: ${s.emoji}; line-height: 1;">${food.emoji}</span>
  `;
}

// Router
function navigate(page) {
  state.currentPage = page;
  render();
  window.scrollTo(0, 0);
}

// Render the app
function render() {
  const app = document.getElementById('app');
  
  switch (state.currentPage) {
    case 'landing':
      app.innerHTML = renderLanding();
      break;
    case 'guide':
      app.innerHTML = renderGuide();
      break;
    case 'game':
      app.innerHTML = renderGame();
      break;
    case 'tracker':
      app.innerHTML = renderTracker();
      break;
  }
  
  attachEventListeners();
}

// Landing Page
function renderLanding() {
  return `
    <div class="landing-page">
      <header class="landing-header">
        <h1 class="landing-title">🍎 Healthy Foods Adventure! 🥦</h1>
        <p class="landing-subtitle">Learn which foods help you grow strong and healthy!</p>
      </header>
      
      <div class="menu-grid">
        <button class="menu-card menu-card--guide" data-page="guide" aria-label="Food Guide">
          <span class="menu-card__icon" style="--delay: 0s;">📚</span>
          <h2 class="menu-card__title">Food Guide</h2>
          <p class="menu-card__description">Learn about healthy foods and see the complete list</p>
        </button>
        
        <button class="menu-card menu-card--game" data-page="game" aria-label="Play the Game">
          <span class="menu-card__icon" style="--delay: 0.2s;">🎮</span>
          <h2 class="menu-card__title">Play the Game!</h2>
          <p class="menu-card__description">Test your knowledge with our flashcard game</p>
        </button>
        
        <button class="menu-card menu-card--tracker" data-page="tracker" aria-label="Dessert Tracker">
          <span class="menu-card__icon" style="--delay: 0.4s;">🍽️</span>
          <h2 class="menu-card__title">Dessert Tracker</h2>
          <p class="menu-card__description">Track what you ate - are you ready for dessert?</p>
        </button>
      </div>
    </div>
  `;
}

// Guide Page
function renderGuide() {
  return `
    <header class="page-header">
      <button class="back-button" data-page="landing">← Back</button>
      <h1 class="page-title">📚 Guide to Healthy Foods</h1>
    </header>
    
    <div class="guide-container">
      <div class="guide-intro">
        <h2>🌟 How to Tell if a Food is Healthy</h2>
        <p>Here are some questions to ask about any food:</p>
        <ul>
          <li><strong>Is it natural?</strong> Foods that grow in the ground or on trees are usually healthy!</li>
          <li><strong>Is it processed?</strong> The more a food is changed from its original form, the less healthy it usually is.</li>
          <li><strong>Does it have added sugar?</strong> Natural sugar in fruit is okay, but added sugar should be limited.</li>
          <li><strong>How was it cooked?</strong> Baked, steamed, or raw is better than fried.</li>
        </ul>
        
        <div class="nutrition-tip">
          <strong>🏋️ Protein Power!</strong> Protein helps build strong muscles. Look for foods like eggs, beans, cheese, and tofu.
        </div>
        
        <div class="nutrition-tip">
          <strong>🥑 Good Fats!</strong> Some fat is important! Avocados, nuts, and cheese have healthy fats.
        </div>
        
        <div class="nutrition-tip">
          <strong>🍞 Carb Check!</strong> Choose whole grains (brown rice, oatmeal, whole wheat bread) over refined carbs (white bread, pasta).
        </div>
      </div>
      
      <section class="category-section">
        <div class="category-header">
          <div class="category-icon category-icon--healthy">🟢</div>
          <h2>Healthy Foods - Eat Lots!</h2>
        </div>
        <div class="food-grid">
          ${foods.healthy.map(food => `
            <div class="food-item">
              ${getFoodImageHTML(food, 'small')}
              <span class="food-item__name">${food.name}</span>
            </div>
          `).join('')}
        </div>
      </section>
      
      <section class="category-section">
        <div class="category-header">
          <div class="category-icon category-icon--moderation">🟡</div>
          <h2>Okay in Moderation - Sometimes!</h2>
        </div>
        <div class="food-grid">
          ${foods.moderation.map(food => `
            <div class="food-item">
              ${getFoodImageHTML(food, 'small')}
              <span class="food-item__name">${food.name}</span>
            </div>
          `).join('')}
        </div>
      </section>
      
      <section class="category-section">
        <div class="category-header">
          <div class="category-icon category-icon--unhealthy">🔴</div>
          <h2>Unhealthy - Only as a Treat!</h2>
        </div>
        <div class="food-grid">
          ${foods.unhealthy.map(food => `
            <div class="food-item">
              ${getFoodImageHTML(food, 'small')}
              <span class="food-item__name">${food.name}</span>
            </div>
          `).join('')}
        </div>
      </section>
    </div>
  `;
}

// Game Page
function renderGame() {
  // Initialize game if needed
  if (state.gameState.foods.length === 0 && state.gameState.total === 0) {
    startNewGame();
  }
  
  // Check if game is complete
  if (state.gameState.foods.length === 0 && state.gameState.total > 0) {
    return renderGameComplete();
  }
  
  const food = state.gameState.currentFood;
  
  return `
    <header class="page-header">
      <button class="back-button" data-page="landing">← Back</button>
      <h1 class="page-title">🎮 Food Flash Cards</h1>
    </header>
    
    <div class="game-container">
      <div class="game-score">
        <div class="score-item">
          <div class="score-label">Correct</div>
          <div class="score-value score-value--correct">${state.gameState.score}</div>
        </div>
        <div class="score-item">
          <div class="score-label">Total</div>
          <div class="score-value score-value--total">${state.gameState.total}</div>
        </div>
      </div>
      
      <div class="flashcard" id="flashcard">
        ${getFoodImageHTML(food, 'large')}
        <h2 class="flashcard__name">${food.name}</h2>
      </div>
      
      <div class="answer-buttons">
        <button class="btn btn--healthy answer-btn" data-answer="healthy">
          🟢 Healthy!
        </button>
        <button class="btn btn--moderation answer-btn" data-answer="moderation">
          🟡 Okay Sometimes
        </button>
        <button class="btn btn--unhealthy answer-btn" data-answer="unhealthy">
          🔴 Unhealthy
        </button>
      </div>
    </div>
  `;
}

function renderGameComplete() {
  const percentage = Math.round((state.gameState.score / state.gameState.total) * 100);
  let icon, message, messageClass;
  
  if (percentage >= 80) {
    icon = '🏆';
    message = 'Amazing! You really know your healthy foods!';
    messageClass = 'great';
  } else if (percentage >= 60) {
    icon = '⭐';
    message = 'Good job! Keep learning about healthy eating!';
    messageClass = 'good';
  } else {
    icon = '💪';
    message = 'Nice try! Check out the Food Guide to learn more!';
    messageClass = 'practice';
  }
  
  return `
    <header class="page-header">
      <button class="back-button" data-page="landing">← Back</button>
      <h1 class="page-title">🎮 Game Complete!</h1>
    </header>
    
    <div class="game-container">
      <div class="game-complete">
        <div class="game-complete__icon">${icon}</div>
        <h2 class="game-complete__title">Great Job!</h2>
        <p class="game-complete__score">You got ${state.gameState.score} out of ${state.gameState.total} correct! (${percentage}%)</p>
        <p class="game-complete__message game-complete__message--${messageClass}">${message}</p>
        <button class="btn btn--primary" id="play-again">🔄 Play Again</button>
      </div>
    </div>
  `;
}

function startNewGame() {
  const allFoods = getAllFoods();
  // Pick 15 random foods for a quick game
  const gameFoods = shuffle(allFoods).slice(0, 15);
  
  state.gameState = {
    foods: gameFoods,
    currentFood: gameFoods[0],
    score: 0,
    total: 0,
    answered: false,
  };
}

function handleAnswer(answer) {
  if (state.gameState.answered) return;
  
  state.gameState.answered = true;
  const correct = answer === state.gameState.currentFood.category;
  const flashcard = document.getElementById('flashcard');
  
  if (correct) {
    state.gameState.score++;
    flashcard.classList.add('flashcard--correct');
  } else {
    flashcard.classList.add('flashcard--incorrect');
  }
  
  state.gameState.total++;
  state.gameState.foods.shift();
  
  setTimeout(() => {
    if (state.gameState.foods.length > 0) {
      state.gameState.currentFood = state.gameState.foods[0];
    }
    state.gameState.answered = false;
    render();
  }, 800);
}

// Tracker Page
function renderTracker() {
  const allFoods = getAllFoods();
  const filteredFoods = state.trackerState.searchQuery
    ? allFoods.filter(f => 
        f.name.toLowerCase().includes(state.trackerState.searchQuery.toLowerCase())
      )
    : allFoods.slice(0, 20);
  
  const healthyCount = state.trackerState.eatenFoods.filter(f => f.category === 'healthy').length;
  const moderationCount = state.trackerState.eatenFoods.filter(f => f.category === 'moderation').length;
  const unhealthyCount = state.trackerState.eatenFoods.filter(f => f.category === 'unhealthy').length;
  
  // Ready for dessert if ate at least 2 healthy foods and no unhealthy foods
  const readyForDessert = healthyCount >= 2 && unhealthyCount === 0;
  
  const statusClass = readyForDessert ? 'tracker-status--ready' : 'tracker-status--not-ready';
  const statusIcon = readyForDessert ? '🎉' : '🥗';
  const statusMessage = readyForDessert ? 'Yes! You can have dessert!' : 'Not yet...';
  const statusSubmessage = readyForDessert 
    ? 'Great job eating healthy today!' 
    : healthyCount < 2 
      ? `Eat ${2 - healthyCount} more healthy food${2 - healthyCount > 1 ? 's' : ''} first!`
      : 'Try to avoid unhealthy foods before dessert!';

  return `
    <header class="page-header">
      <button class="back-button" data-page="landing">← Back</button>
      <h1 class="page-title">🍽️ Dessert Tracker</h1>
    </header>
    
    <div class="tracker-container">
      <div class="tracker-status ${statusClass}">
        <div class="tracker-status__icon">${statusIcon}</div>
        <div class="tracker-status__message">${statusMessage}</div>
        <div class="tracker-status__submessage">${statusSubmessage}</div>
      </div>
      
      <div class="eaten-foods">
        <h3>🍴 What I Ate Today:</h3>
        <div class="eaten-list">
          ${state.trackerState.eatenFoods.length === 0 
            ? '<p style="color: var(--color-text-light);">Add foods you\'ve eaten below!</p>'
            : state.trackerState.eatenFoods.map((food, index) => `
                <div class="eaten-item">
                  <span class="category-badge category-badge--${food.category}">${food.emoji}</span>
                  <span>${food.name}</span>
                  <button class="eaten-item__remove" data-remove="${index}">✕</button>
                </div>
              `).join('')
          }
        </div>
        ${state.trackerState.eatenFoods.length > 0 ? `
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; font-size: 0.9rem; color: var(--color-text-light);">
            <span>🟢 Healthy: ${healthyCount}</span>
            <span>🟡 Moderation: ${moderationCount}</span>
            <span>🔴 Unhealthy: ${unhealthyCount}</span>
          </div>
        ` : ''}
      </div>
      
      <div class="add-food-section">
        <h3>➕ Add Food:</h3>
        <input 
          type="text" 
          class="food-search" 
          placeholder="Search for a food..."
          id="food-search"
          value="${state.trackerState.searchQuery}"
        >
        <div class="food-suggestions">
          ${filteredFoods.map(food => `
            <div class="food-suggestion" data-add-food='${JSON.stringify(food)}'>
              <span class="food-suggestion__emoji">${food.emoji}</span>
              <span class="food-suggestion__name">${food.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// Event Listeners
function attachEventListeners() {
  // Navigation
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', () => {
      const page = el.dataset.page;
      if (page === 'game') {
        startNewGame();
      }
      navigate(page);
    });
  });
  
  // Game answers
  document.querySelectorAll('[data-answer]').forEach(btn => {
    btn.addEventListener('click', () => {
      handleAnswer(btn.dataset.answer);
    });
  });
  
  // Play again
  const playAgainBtn = document.getElementById('play-again');
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', () => {
      startNewGame();
      render();
    });
  }
  
  // Food search
  const searchInput = document.getElementById('food-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.trackerState.searchQuery = e.target.value;
      render();
      // Re-focus the input after render
      document.getElementById('food-search').focus();
    });
  }
  
  // Add food to tracker
  document.querySelectorAll('[data-add-food]').forEach(el => {
    el.addEventListener('click', () => {
      const food = JSON.parse(el.dataset.addFood);
      state.trackerState.eatenFoods.push(food);
      render();
    });
  });
  
  // Remove food from tracker
  document.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.remove);
      state.trackerState.eatenFoods.splice(index, 1);
      render();
    });
  });
}

// Initialize
async function init() {
  try {
    const response = await fetch('/data/foods.json');
    foods = await response.json();
  } catch (error) {
    console.error('Failed to load foods data:', error);
  }
  render();
}

init();

