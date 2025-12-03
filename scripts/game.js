// Game state
let foodsData = null;
let gameState = {
  foods: [],
  currentIndex: 0,
  score: 0,
  streak: 0,
  correct: 0,
  total: 0,
  currentFood: null,
  currentCategory: null
};

// DOM elements
const screens = {
  start: document.getElementById('start-screen'),
  question: document.getElementById('question-screen'),
  feedback: document.getElementById('feedback-screen'),
  end: document.getElementById('end-screen')
};

const elements = {
  score: document.getElementById('score'),
  streak: document.getElementById('streak'),
  current: document.getElementById('current'),
  total: document.getElementById('total'),
  foodImage: document.getElementById('food-image'),
  foodEmoji: document.getElementById('food-emoji'),
  foodName: document.getElementById('food-name'),
  flashcard: document.getElementById('flashcard'),
  feedbackContent: document.getElementById('feedback-content'),
  feedbackIcon: document.getElementById('feedback-icon'),
  feedbackTitle: document.getElementById('feedback-title'),
  feedbackMessage: document.getElementById('feedback-message'),
  feedbackFoodImage: document.getElementById('feedback-food-image'),
  feedbackFoodName: document.getElementById('feedback-food-name'),
  feedbackFoodDescription: document.getElementById('feedback-food-description'),
  feedbackBadge: document.getElementById('feedback-badge'),
  finalScore: document.getElementById('final-score'),
  statCorrect: document.getElementById('stat-correct'),
  statTotal: document.getElementById('stat-total'),
  statPercent: document.getElementById('stat-percent'),
  endIcon: document.getElementById('end-icon'),
  endTitle: document.getElementById('end-title'),
  confettiContainer: document.getElementById('confetti-container')
};

// Load foods data
async function loadFoods() {
  try {
    const response = await fetch('/data/foods.json');
    foodsData = await response.json();
  } catch (error) {
    console.error('Error loading foods:', error);
  }
}

// Shuffle array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Prepare game foods
function prepareGame() {
  const allFoods = [
    ...foodsData.healthy.map(f => ({ ...f, category: 'healthy' })),
    ...foodsData.moderation.map(f => ({ ...f, category: 'moderation' })),
    ...foodsData.unhealthy.map(f => ({ ...f, category: 'unhealthy' }))
  ];
  
  // Shuffle and take 20 random foods for a game
  gameState.foods = shuffleArray(allFoods).slice(0, 20);
  gameState.currentIndex = 0;
  gameState.score = 0;
  gameState.streak = 0;
  gameState.correct = 0;
  gameState.total = gameState.foods.length;
  
  updateScoreDisplay();
}

// Show a screen
function showScreen(screenName) {
  Object.values(screens).forEach(screen => screen.classList.add('hidden'));
  screens[screenName].classList.remove('hidden');
}

// Update score display
function updateScoreDisplay() {
  elements.score.textContent = gameState.score;
  elements.streak.textContent = gameState.streak;
  elements.current.textContent = gameState.currentIndex + 1;
  elements.total.textContent = gameState.total;
}

// Show current food
function showCurrentFood() {
  const food = gameState.foods[gameState.currentIndex];
  gameState.currentFood = food;
  gameState.currentCategory = food.category;
  
  elements.foodName.textContent = food.name;
  elements.foodImage.src = `/images/foods/${food.id}.png`;
  elements.foodImage.alt = food.name;
  
  // Handle image load error
  elements.foodImage.onerror = () => {
    elements.foodImage.style.display = 'none';
    elements.foodEmoji.style.display = 'block';
    elements.foodEmoji.textContent = food.emoji;
  };
  
  elements.foodImage.onload = () => {
    elements.foodImage.style.display = 'block';
    elements.foodEmoji.style.display = 'none';
  };
  
  // Reset answer buttons
  document.querySelectorAll('.answer-btn').forEach(btn => {
    btn.classList.remove('correct', 'wrong', 'reveal');
    btn.disabled = false;
  });
  
  showScreen('question');
  updateScoreDisplay();
}

// Handle answer
function handleAnswer(answer) {
  const food = gameState.currentFood;
  const isCorrect = answer === gameState.currentCategory;
  
  // Disable all buttons
  document.querySelectorAll('.answer-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.answer === answer) {
      btn.classList.add(isCorrect ? 'correct' : 'wrong');
    }
    if (btn.dataset.answer === gameState.currentCategory && !isCorrect) {
      btn.classList.add('reveal');
    }
  });
  
  // Update score
  if (isCorrect) {
    gameState.streak++;
    const streakBonus = Math.min(gameState.streak - 1, 5);
    const points = 10 + (streakBonus * 2);
    gameState.score += points;
    gameState.correct++;
  } else {
    gameState.streak = 0;
  }
  
  updateScoreDisplay();
  
  // Show feedback after a short delay
  setTimeout(() => showFeedback(isCorrect), 800);
}

// Show feedback
function showFeedback(isCorrect) {
  const food = gameState.currentFood;
  const categoryLabels = {
    healthy: 'Healthy',
    moderation: 'Okay Sometimes',
    unhealthy: 'Treat Food'
  };
  
  elements.feedbackContent.className = `feedback-content ${isCorrect ? 'correct' : 'wrong'}`;
  
  if (isCorrect) {
    elements.feedbackIcon.textContent = ['🎉', '⭐', '🌟', '💪', '👏'][Math.floor(Math.random() * 5)];
    elements.feedbackTitle.textContent = ['Great Job!', 'Awesome!', 'Perfect!', 'You Got It!', 'Excellent!'][Math.floor(Math.random() * 5)];
    elements.feedbackMessage.textContent = `${food.name} is ${categoryLabels[food.category].toLowerCase()}!`;
    
    // Confetti for correct answers
    if (gameState.streak >= 3) {
      createConfetti();
    }
  } else {
    elements.feedbackIcon.textContent = ['🤔', '💭', '📚'][Math.floor(Math.random() * 3)];
    elements.feedbackTitle.textContent = ['Not Quite!', 'Good Try!', 'Almost!'][Math.floor(Math.random() * 3)];
    elements.feedbackMessage.textContent = `${food.name} is actually ${categoryLabels[food.category].toLowerCase()}.`;
  }
  
  elements.feedbackFoodImage.src = `/images/foods/${food.id}.png`;
  elements.feedbackFoodName.textContent = food.name;
  elements.feedbackFoodDescription.textContent = food.description;
  
  elements.feedbackBadge.className = `category-badge badge-${food.category === 'moderation' ? 'moderate' : food.category}`;
  elements.feedbackBadge.textContent = categoryLabels[food.category];
  
  showScreen('feedback');
}

// Next question
function nextQuestion() {
  gameState.currentIndex++;
  
  if (gameState.currentIndex >= gameState.foods.length) {
    showEndScreen();
  } else {
    showCurrentFood();
  }
}

// Show end screen
function showEndScreen() {
  const percent = Math.round((gameState.correct / gameState.total) * 100);
  
  elements.finalScore.textContent = gameState.score;
  elements.statCorrect.textContent = gameState.correct;
  elements.statTotal.textContent = gameState.total;
  elements.statPercent.textContent = `${percent}%`;
  
  if (percent >= 90) {
    elements.endIcon.textContent = '🏆';
    elements.endTitle.textContent = 'Amazing!';
    createConfetti();
  } else if (percent >= 70) {
    elements.endIcon.textContent = '🌟';
    elements.endTitle.textContent = 'Great Job!';
  } else if (percent >= 50) {
    elements.endIcon.textContent = '👍';
    elements.endTitle.textContent = 'Good Try!';
  } else {
    elements.endIcon.textContent = '📚';
    elements.endTitle.textContent = 'Keep Learning!';
  }
  
  showScreen('end');
}

// Create confetti effect
function createConfetti() {
  const colors = ['#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = `${Math.random() * 0.5}s`;
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    elements.confettiContainer.appendChild(confetti);
    
    // Remove after animation
    setTimeout(() => confetti.remove(), 3000);
  }
}

// Start game
function startGame() {
  prepareGame();
  showCurrentFood();
}

// Event listeners
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('next-btn').addEventListener('click', nextQuestion);
document.getElementById('play-again-btn').addEventListener('click', startGame);

document.querySelectorAll('.answer-btn').forEach(btn => {
  btn.addEventListener('click', () => handleAnswer(btn.dataset.answer));
});

// Initialize
loadFoods();

