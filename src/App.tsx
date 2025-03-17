import {
  SUITS,
  SUIT_NAME,
  SUIT_TEMPLATES,
  RANK_TEMPLATES,
  O_TEMPLATE,
  RANKS,
  SUIT_COLORS,
  FILL_SYMBOLS,
  RANK_NAME,
} from "./data/asciiCards.ts";
import { useEffect, useState, useRef } from "react";

interface Card {
  suits: SUIT_NAME;
  rank: RANK_NAME;
  suitsTemplate: string[];
  rankTemplate: string[];
  backgroundColor: string;
  borderStyle: string;
}

type PositionTuple = [number, number, string];

// Use to pick random ranks or cards
const randomFrom = <T,>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const dealRandomCard = (): Card => {
  const suits = randomFrom(SUITS);
  const rank = randomFrom(RANKS);
  const suitsTemplate = SUIT_TEMPLATES[suits];
  const rankTemplate = RANK_TEMPLATES[rank];
  const backgroundColor = getRandomLightColor();
  const borderStyle = randomFrom(["solid", "double", "dashed", "dotted"]);
  return {
    suits,
    rank,
    suitsTemplate,
    rankTemplate,
    backgroundColor,
    borderStyle,
  };
};

const getRandomLightColor = (): string => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 30%, 90%)`;
};

// Get the pair of position for * in template, then shuffle it's order
const generateShufflePair = (template: string[]): PositionTuple[] => {
  const shuffleOrder = (pairArray: PositionTuple[]) => {
    for (let i = 0; i < pairArray.length; i++) {
      const randomIndex = Math.floor(Math.random() * pairArray.length);
      [pairArray[i], pairArray[randomIndex]] = [
        pairArray[randomIndex],
        pairArray[i],
      ];
    }
  };
  const positions: PositionTuple[] = [];
  const columnLength = template[0].length;

  for (let i = 0; i < template.length; i++) {
    for (let j = 0; j < columnLength; j++) {
      if (template[i][j] == "*") {
        const sym = randomFrom(FILL_SYMBOLS);
        positions.push([i, j, sym]);
      }
    }
  }

  // shuffle the position
  shuffleOrder(positions);

  return positions;
};

const App = () => {
  const [card, setCard] = useState<Card | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [rankDisplay, setRankDisplay] = useState<string[]>([]);
  const [suitsDisplay, setSuitsDisplay] = useState<string[]>([]);
  const [oDisplay, setODisplay] = useState<string[]>([]);

  // Animation related refs
  const animationFrameRef = useRef<number | null>(null);
  const rankPositionsRef = useRef<PositionTuple[]>([]);
  const oPositionsRef = useRef<PositionTuple[]>([]);
  const suitsPositionsRef = useRef<PositionTuple[]>([]);
  const rankCountRef = useRef<number>(0);
  const oCountRef = useRef<number>(0);
  const suitsCountRef = useRef<number>(0);
  const lastDrawTimeRef = useRef<number>(0);
  const animationSpeedRef = useRef<number>(30);

  // Init empty display with spaces
  const initializeEmptyDisplay = (template: string[]): string[] => {
    return template.map((row) => row.replace(/\*/g, " "));
  };

  const getSuitColor = () => {
    if (!card) return "black";
    return SUIT_COLORS[card.suits];
  };

  const handlePickCard = () => {
    if (isDrawing) return;

    const newCard = dealRandomCard();
    setCard(newCard);
    const emptyRankDisplay = initializeEmptyDisplay(newCard.rankTemplate);
    const emptyODisplay = initializeEmptyDisplay(O_TEMPLATE);
    const emptySuitsDisplay = initializeEmptyDisplay(newCard.suitsTemplate);

    // Set the state AND update refs
    setRankDisplay(emptyRankDisplay);
    setSuitsDisplay(emptySuitsDisplay);
    setODisplay(emptyODisplay);

    // Generate shuffled positions for each element
    rankPositionsRef.current = generateShufflePair(newCard.rankTemplate);
    oPositionsRef.current = generateShufflePair(O_TEMPLATE);
    suitsPositionsRef.current = generateShufflePair(newCard.suitsTemplate);

    rankCountRef.current = 0;
    oCountRef.current = 0;
    suitsCountRef.current = 0;

    setIsDrawing(true);
  };

  const animateDrawing = (time: number) => {
    if (!isDrawing) return;

    const batchSize = 1; // Adjust batch size based on performance needs

    // Update rank display using functional update
    setRankDisplay((prevRankDisplay) => {
      const newRankDisplay = [...prevRankDisplay];

      for (let i = 0; i < batchSize; i++) {
        if (rankCountRef.current < rankPositionsRef.current.length) {
          const [row, col, symbol] =
            rankPositionsRef.current[rankCountRef.current];
          newRankDisplay[row] =
            newRankDisplay[row].substring(0, col) +
            symbol +
            newRankDisplay[row].substring(col + 1);
          rankCountRef.current++;
        }
      }

      return newRankDisplay;
    });

    // Update O display using functional update
    setODisplay((prevODisplay) => {
      const newODisplay = [...prevODisplay];

      for (let i = 0; i < batchSize; i++) {
        if (oCountRef.current < oPositionsRef.current.length) {
          const [row, col, symbol] = oPositionsRef.current[oCountRef.current];
          newODisplay[row] =
            newODisplay[row].substring(0, col) +
            symbol +
            newODisplay[row].substring(col + 1);
          oCountRef.current++;
        }
      }

      return newODisplay;
    });

    // Update suits display using functional update
    setSuitsDisplay((prevSuitsDisplay) => {
      const newSuitsDisplay = [...prevSuitsDisplay];

      for (let i = 0; i < batchSize; i++) {
        if (suitsCountRef.current < suitsPositionsRef.current.length) {
          const [row, col, symbol] =
            suitsPositionsRef.current[suitsCountRef.current];
          newSuitsDisplay[row] =
            newSuitsDisplay[row].substring(0, col) +
            symbol +
            newSuitsDisplay[row].substring(col + 1);
          suitsCountRef.current++;
        }
      }

      return newSuitsDisplay;
    });

    if (
      suitsCountRef.current + oCountRef.current + rankCountRef.current ===
      suitsPositionsRef.current.length +
        oPositionsRef.current.length +
        rankPositionsRef.current.length
    ) {
      setIsDrawing(false);
    } else {
      animationFrameRef.current = requestAnimationFrame(animateDrawing);
    }
  };

  // Draw the poker
  useEffect(() => {
    if (isDrawing && animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(animateDrawing);
    } else {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isDrawing]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        minHeight: "100vh",
        backgroundColor: "#f1f5f9",
      }}
    >
      <h1
        style={{
          fontSize: "1.875rem",
          fontWeight: "bold",
          marginBottom: "1.5rem",
        }}
      >
        ASCII Card Animation
      </h1>

      <button
        onClick={handlePickCard}
        disabled={isDrawing}
        style={{
          padding: "0.75rem 1.5rem",
          borderRadius: "0.5rem",
          fontWeight: "600",
          color: "white",
          backgroundColor: isDrawing ? "#9ca3af" : "#2563eb",
          marginBottom: "2rem",
          cursor: isDrawing ? "not-allowed" : "pointer",
          border: "none",
        }}
      >
        {isDrawing ? "Drawing..." : "Pick a Card"}
      </button>

      {card && (
        <div
          style={{
            padding: "1.5rem",
            borderRadius: "0.75rem",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            position: "relative",
            backgroundColor: card.backgroundColor,
            border: `3px ${card.borderStyle} ${getSuitColor()}`,
          }}
        >
          {/* Card content - Vertical layout */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              paddingTop: "1rem",
              width: "500px",
              height: "300px",
            }}
          >
            {/* Rank display */}
            <pre
              style={{
                fontFamily: "monospace",
                fontSize: "1.125rem",
                whiteSpace: "pre",
                color: getSuitColor(),
                margin: 0,
              }}
            >
              {rankDisplay.join("\n")}
            </pre>

            {/* "O" display */}
            <pre
              style={{
                fontFamily: "monospace",
                fontSize: "1.125rem",
                whiteSpace: "pre",
                color: getSuitColor(),
                margin: 0,
                transform: "scale(0.25)",
                marginTop: "150px",
              }}
            >
              {oDisplay.join("\n")}
            </pre>

            {/* Suits display */}
            <pre
              style={{
                fontFamily: "monospace",
                fontSize: "1.125rem",
                whiteSpace: "pre",
                color: getSuitColor(),
                margin: 0,
              }}
            >
              {suitsDisplay.join("\n")}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
