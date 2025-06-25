import { useState } from "react";
import { clsx } from "clsx";
import { languages } from "./languages";
import { getFarewellText, getRandomWord } from "./utils";
import Confetti from "react-confetti";

/**
 * AssemblyEndgame - A mini game where the player guesses a word letter by letter.
 * The player has limited attempts (based on the number of programming languages),
 * and gets visual feedback for correct/incorrect guesses.
 */

export default function AssemblyEndgame() {
  // -------------------- STATE --------------------
  // The target word to guess, randomly chosen
  const [currentWord, setCurrentWord] = useState(() => getRandomWord());
  // The letters the user has guessed so far
  const [guessedLetters, setGuessedLetters] = useState([]);

  // -------------------- GAME LOGIC --------------------
  // Max wrong guesses allowed is total languages - 1
  const numGuessesLeft = languages.length - 1;
  // Count how many incorrect letters the user has guessed
  const wrongGuessCount = guessedLetters.filter(
    (letter) => !currentWord.includes(letter)
  ).length;

  // Check if the user guessed all letters correctly
  const isGameWon = currentWord
    .split("")
    .every((letter) => guessedLetters.includes(letter));

  // Game is lost if wrong guesses exceed the limit
  const isGameLost = wrongGuessCount >= numGuessesLeft;

  // Final game state check
  const isGameOver = isGameWon || isGameLost;

  // Keep track of the most recent guessed letter
  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1];

  // Check if the last guess was incorrect
  const isLastGuessIncorrect =
    lastGuessedLetter && !currentWord.includes(lastGuessedLetter);

  // -------------------- CONSTANTS --------------------
  const alphabet = "abcdefghijklmnopqrstuvwxyz";

  // -------------------- HANDLERS --------------------
  // Add a new guessed letter if it hasn’t been guessed already
  function addGuessedLetter(letter) {
    setGuessedLetters((prevLetters) =>
      prevLetters.includes(letter) ? prevLetters : [...prevLetters, letter]
    );
  }

  // Start a new game by resetting the word and guesses
  function startNewGame() {
    setCurrentWord(getRandomWord());
    setGuessedLetters([]);
  }

  // -------------------- RENDERING LOGIC --------------------

  // Render programming languages as chips, color-coded, mark wrong ones
  const languageElements = languages.map((lang, index) => {
    const isLanguageLost = index < wrongGuessCount;
    const styles = {
      backgroundColor: lang.backgroundColor,
      color: lang.color,
    };
    const className = clsx("chip", isLanguageLost && "lost");
    return (
      <span className={className} style={styles} key={lang.name}>
        {lang.name}
      </span>
    );
  });

  // Render the word: show letters if guessed or if game is over
  const letterElements = currentWord.split("").map((letter, index) => {
    const shouldRevealLetter = isGameLost || guessedLetters.includes(letter);
    const letterClassName = clsx(
      isGameLost && !guessedLetters.includes(letter) && "missed-letter"
    );
    return (
      <span key={index} className={letterClassName}>
        {shouldRevealLetter ? letter.toUpperCase() : ""}
      </span>
    );
  });

  // Render alphabet keyboard with correct/wrong styles
  const keyboardElements = alphabet.split("").map((letter) => {
    const isGuessed = guessedLetters.includes(letter);
    const isCorrect = isGuessed && currentWord.includes(letter);
    const isWrong = isGuessed && !currentWord.includes(letter);

    const className = clsx({
      correct: isCorrect,
      wrong: isWrong,
    });

    return (
      <button
        className={className}
        key={letter}
        disabled={isGameOver}
        aria-disabled={isGuessed}
        aria-label={`Letter ${letter}`}
        onClick={() => addGuessedLetter(letter)}
      >
        {letter.toUpperCase()}
      </button>
    );
  });

  // Status banner class (affects color/animation)
  const gameStatusClass = clsx("game-status", {
    won: isGameWon,
    lost: isGameLost,
    farewell: !isGameOver && isLastGuessIncorrect,
  });

  // Render the game status message dynamically
  function renderGameStatus() {
    if (!isGameOver && isLastGuessIncorrect) {
      return (
        <p className="farewell-message">
          {getFarewellText(languages[wrongGuessCount - 1].name)}
        </p>
      );
    }

    if (isGameWon) {
      return (
        <>
          <h2>You win!</h2>
          <p>Well done! 🎉</p>
        </>
      );
    }

    if (isGameLost) {
      return (
        <>
          <h2>Game over!</h2>
          <p>You lose! Better start learning Assembly 😭</p>
        </>
      );
    }

    return null;
  }

  // -------------------- MAIN RENDER --------------------
  return (
    <main>
      {/* Show confetti if the user won */}
      {isGameWon && <Confetti recycle={false} numberOfPieces={1000} />}

      <header>
        <h1>Assembly: Endgame</h1>
        <p>
          Guess the word within 8 attempts to keep the programming world safe
          from Assembly!
        </p>
      </header>

      {/* Status message (with a11y live region) */}
      <section aria-live="polite" role="status" className={gameStatusClass}>
        {renderGameStatus()}
      </section>

      {/* Programming languages chips */}
      <section className="language-chips">{languageElements}</section>

      {/* Current guessed word */}
      <section className="word">{letterElements}</section>

      {/* Hidden screen-reader-only feedback for each guess */}
      <section className="sr-only" aria-live="polite" role="status">
        <p>
          {currentWord.includes(lastGuessedLetter)
            ? `Correct! The letter ${lastGuessedLetter} is in the word.`
            : `Sorry, the letter ${lastGuessedLetter} is not in the word.`}
          You have {numGuessesLeft} attempts left.
        </p>
        <p>
          Current word:{" "}
          {currentWord
            .split("")
            .map((letter) =>
              guessedLetters.includes(letter) ? letter + "." : "blank."
            )
            .join(" ")}
        </p>
      </section>

      {/* Keyboard with clickable letter buttons */}
      <section className="keyboard">{keyboardElements}</section>

      {/* Show New Game button after game ends */}
      {isGameOver && (
        <button className="new-game" onClick={startNewGame}>
          New Game
        </button>
      )}
    </main>
  );
}
