# 🍎 Healthy Foods Game

A fun, educational game to help kids learn about healthy eating!

## Features

- **Guide to Healthy Foods**: Learn how to tell if a food is healthy
- **Flashcard Game**: Test your knowledge by categorizing foods
- **Menu Tool**: Track what you've eaten and see if you're ready for dessert

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your OpenAI API key:
```bash
OPENAI_API_KEY=your-api-key-here
```

3. Generate food images:
```bash
npm run generate-images
```

4. Run the development server:
```bash
npm run dev
```

## Food Categories

- 🟢 **Healthy**: Whole, unprocessed, nutrient-dense foods
- 🟡 **Okay in Moderation**: Some processing or added ingredients
- 🔴 **Unhealthy**: Highly processed, lots of added sugar, or fried

## Tech Stack

- Vanilla JavaScript/HTML/CSS
- Vite for development
- DALL-E 3 for image generation

