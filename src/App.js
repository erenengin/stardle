import React, { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
import './App.css';
import hints from './hints.json';
import charactersData from './characters.json';

function App() {
  const [characters, setCharacters] = useState(charactersData.characters);
  const [guesses, setGuesses] = useState([]);
  const [input, setInput] = useState('');
  const [filteredChars, setFilteredChars] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [dailyChar, setDailyChar] = useState(characters[Math.floor(Math.random() * characters.length)].name);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [animatingRow, setAnimatingRow] = useState(-1);
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [teaseMessage, setTeaseMessage] = useState('');
  const [showHintButton, setShowHintButton] = useState(false);
  const [showHintPopup, setShowHintPopup] = useState(false);
  const [currentHint, setCurrentHint] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    console.log('Daily Character:', dailyChar);
  }, [dailyChar]);

  const teaseMessages = [
    "Maybe try playing more Stardew Valley?",
    "Even Pam could've guessed that one!",
    "Lewis would be disappointed...",
    "That's worse than Pierre's prices!",
    "Not even Krobus would hide from this performance",
    "Time to hit the Stardrop Saloon...",
    "Clint has better luck with Emily!",
    "Even the slimes are laughing",
    "Did a Joja employee write this guess?",
    "Your farming skills might need some work..."
  ];

  useEffect(() => {
    if (input.trim() === '') {
      setFilteredChars([]);
    } else {
      const matches = characters
        .filter(char => char.name.toLowerCase().includes(input.toLowerCase()))
        .map(char => ({
          name: char.name,
          data: charactersData.characters.find(c => c.name === char.name)
        }));
      setFilteredChars(matches);
    }
  }, [input, characters]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (animatingRow !== -1) {
      const timer = setTimeout(() => {
        setAnimatingRow(-1);
      }, 3500); // Total animation time: 2.8s (last tile start) + 0.6s (flip duration) + buffer
      return () => clearTimeout(timer);
    }
  }, [animatingRow]);

  useEffect(() => {
    if (guesses.length === 5 && !gameOver) {
      setShowHintButton(true);
    } else {
      setShowHintButton(false);
    }
  }, [guesses.length, gameOver]);

  const getRandomHint = () => {
    const characterHints = hints.hints.find(h => h.name === dailyChar);
    if (!characterHints) return '';
    
    // Randomly choose between detail hint and quote hint
    return Math.random() < 0.5 ? characterHints.detail_hint : characterHints.quote_hint;
  };

  const handleGuess = (charName) => {
    if (gameOver) return;
    
    const charData = charactersData.characters.find(c => c.name === charName);
    const dailyCharData = charactersData.characters.find(c => c.name === dailyChar);
    const feedback = [];
    if (charData.birth_month === dailyCharData.birth_month) feedback.push('green');
    else if (charData.birth_month && dailyCharData.birth_month) feedback.push('yellow');
    else feedback.push('gray');

    if (charData.dominant_loved_gift_area === dailyCharData.dominant_loved_gift_area) feedback.push('green');
    else if (charData.dominant_loved_gift_area && dailyCharData.dominant_loved_gift_area) feedback.push('yellow');
    else feedback.push('gray');

    if (charData.gender === dailyCharData.gender) feedback.push('green');
    else if (charData.gender && dailyCharData.gender) feedback.push('yellow');
    else feedback.push('gray');

    if (charData.marriageable === dailyCharData.marriageable) feedback.push('green');
    else if (charData.marriageable && dailyCharData.marriageable) feedback.push('yellow');
    else feedback.push('gray');

    if (charData.personality_trait === dailyCharData.personality_trait) feedback.push('green');
    else if (charData.personality_trait && dailyCharData.personality_trait) feedback.push('yellow');
    else feedback.push('gray');

    const newGuess = {
      name: charName,
      feedback: feedback,
      data: charData
    };
    
    setGuesses(prev => [...prev, newGuess]);
    setInput('');
    setFilteredChars([]);
    setAnimatingRow(guesses.length);

    const isWin = charName === dailyChar;
    const isLastGuess = guesses.length + 1 >= 6;

    if (isWin || isLastGuess) {
      if (!isWin) {
        setTeaseMessage(teaseMessages[Math.floor(Math.random() * teaseMessages.length)]);
      }
      setTimeout(() => {
        setGameOver(true);
        setIsWin(isWin);
        setShowGameOverPopup(true);
      }, 3500); // Match the animation reset timer
    }
  };

  const renderGuessResult = (guess, index) => {
    const isAnimating = index === animatingRow;
    
    if (!guess || !guess.data) return null;
    
    return (
      <>
        <img 
          src={`/portraits/${guess.name}.png`} 
          alt={guess.name} 
          className={`portrait ${isAnimating ? 'new-guess animate' : ''}`} 
        />
        {guess.feedback.map((color, i) => (
          <div 
            key={i} 
            className={`tile ${color === 'yellow' ? 'red' : color} ${isAnimating ? 'new-guess animate delay-' + i : 'revealed'}`}
          >
            <div className="tile-front">?</div>
            <div className="tile-back">
              {i === 0 && guess.data.birth_month && (
                <img 
                  src={`/seasons/${guess.data.birth_month.toLowerCase()}.png`} 
                  alt={guess.data.birth_month}
                  className="season-icon"
                />
              )}
              {i === 1 && guess.data.dominant_loved_gift_area && (
                <img 
                  src={`/gift/${guess.data.dominant_loved_gift_area}.png`} 
                  alt={guess.data.dominant_loved_gift_area}
                />
              )}
              {i === 2 && guess.data.gender && (
                <img 
                  src={`/gender/gender-${guess.data.gender.toLowerCase()}.png`} 
                  alt={guess.data.gender} 
                />
              )}
              {i === 3 && typeof guess.data.marriageable !== 'undefined' && (
                <img 
                  src={`/marriage/${guess.data.marriageable ? 'yes' : 'no'}.png`} 
                  alt={guess.data.marriageable ? 'Marriageable' : 'Not Marriageable'} 
                />
              )}
              {i === 4 && guess.data.personality_trait && (
                <span>{guess.data.personality_trait}</span>
              )}
            </div>
          </div>
        ))}
      </>
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && filteredChars.length === 1) {
      handleGuess(filteredChars[0].name);
    }
  };

  const handleStartGame = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(e => console.log('Audio playback error:', e));
      setIsMusicPlaying(true);
    }
    setShowTutorial(false);
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleCharacterSelect = (char) => {
    handleGuess(char.name);
  };

  const handleHintClick = () => {
    setCurrentHint(getRandomHint());
    setShowHintPopup(true);
  };

  const handleRetry = () => {
    setGuesses([]);
    setInput('');
    setFilteredChars([]);
    setGameOver(false);
    setIsWin(false);
    setShowGameOverPopup(false);
    setDailyChar(characters[Math.floor(Math.random() * characters.length)].name);
    console.log('New Daily Character:', dailyChar);
  };

  return (
    <div className="App">
      {isWin && showGameOverPopup && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={200}
          recycle={false}
          colors={['#4CAF50', '#f0e8d9', '#8b4513', '#ffd700']}
        />
      )}
      {showTutorial && (
        <div className="tutorial-overlay">
          <div className="tutorial-content">
            <h1>Welcome to the Stardle</h1>
            <h2>How to Play</h2>
            <div className="tutorial-text">
              <p>Stardle is a guessing game based on Stardew Valley</p>
              <p>In this game, you need to guess Stardew Valley characters based on their traits. Gifts and personalities are not explicitly written in the game but are determined through details like dialogues and the prominence of their preferred gifts. Items represent the group they belong to. For example, the Prismatic Shard should be seen not as a universally loved item, but simply as a gem.</p>
              <p>You have limited chances to make the correct guess. I hope you enjoy it!</p>
            </div>
            <button className="continue-button" onClick={handleStartGame}>
              Continue
            </button>
          </div>
        </div>
      )}
      <header>
        <h1>Stardle</h1>
        <div className="controls">
          <button 
            className="sound-toggle" 
            onClick={toggleMusic}
          >
            {isMusicPlaying ? '🔊' : '🔈'}
          </button>
          {showHintButton && (
            <button 
              className="hint-button"
              onClick={handleHintClick}
            >
              ❓
            </button>
          )}
        </div>
      </header>

      {showHintPopup && (
        <div className="hint-popup">
          <div className="hint-content">
            <button className="close-button" onClick={() => setShowHintPopup(false)}>✕</button>
            <h3>Hint</h3>
            <p>{currentHint}</p>
          </div>
        </div>
      )}

      <div className="game-board">
        {[...Array(6)].map((_, row) => (
          <div className="row" key={row}>
            {guesses[row] ? (
              renderGuessResult(guesses[row], row)
            ) : (
              <>
                <div className="portrait placeholder">?</div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="tile">
                    <div className="tile-front">?</div>
                    <div className="tile-back"></div>
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
      {!gameOver && (
        <div className="search-container">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Guess a character..."
            className="search-bar"
          />
          {filteredChars.length > 0 && (
            <div className="suggestions">
              {filteredChars.map(char => (
                <div
                  key={char.name}
                  className="suggestion-item"
                  onClick={() => handleCharacterSelect(char)}
                >
                  <img src={`/portraits/${char.name}.png`} alt={char.name} className="suggestion-portrait" />
                  <span>{char.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {showGameOverPopup && (
        <div className={`game-over-popup ${isWin ? 'win' : 'lose'}`}>
          <h2>{isWin ? "You win!" : "Bad Luck!"}</h2>
          <div className="portrait">
            <img src={`/portraits/${dailyChar}.png`} alt={dailyChar} />
          </div>
          <div className="character-name">{dailyChar}</div>
          {!isWin && <div className="tease-message">{teaseMessage}</div>}
          <button className={`play-again-button ${isWin ? 'win' : 'lose'}`} onClick={handleRetry}>
            Play Again
          </button>
        </div>
      )}
      {gameOver && !showGameOverPopup && (
        <p>{guesses[guesses.length - 1]?.name === dailyChar ? "You Win!" : `Game Over! It was ${dailyChar}.`}</p>
      )}
      <audio ref={audioRef} src="/audio/background.mp3" loop />
    </div>
  );
}

export default App;