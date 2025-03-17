# ASCII Card Animation

A React app that draws playing cards using ASCII art and random symbols.

## What it does

- Displays cards (like Ace of Hearts) using ASCII art
- Fills the card patterns with random symbols (♥, ★, ♦, etc.)
- Animates the drawing process when you click "Pick a Card"

## Getting Started

1. Clone the repo
2. Install dependencies: `npm install`
3. Start the app: `npm start`

## How to Use

1. Click the "Pick a Card" button
2. Watch as a random card is drawn symbol by symbol
3. Each card has a random background color and border style

## Customization

- Edit the ASCII templates in `asciiCards.ts` to change how cards look
- Add new symbols to the `FILL_SYMBOLS` array
- Adjust animation speed with `animationSpeedRef.current`

## Requirements

- Node.js
- A modern web browser

