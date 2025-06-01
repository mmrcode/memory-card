document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const startBtn = document.getElementById('start-btn');
    const difficultySelect = document.getElementById('difficulty');
    const movesCount = document.getElementById('moves-count');
    const timeDisplay = document.getElementById('time');
    const winMessage = document.getElementById('win-message');
    const winnerMessage = document.getElementById('winner-message');
    const finalMoves = document.getElementById('final-moves');
    const finalTime = document.getElementById('final-time');
    const playAgainBtn = document.getElementById('play-again');
    const score1Display = document.getElementById('score1');
    const score2Display = document.getElementById('score2');
    const player1Status = document.querySelector('#player1 .status');
    const player2Status = document.querySelector('#player2 .status');

    let cards = [];
    let firstCard = null;
    let secondCard = null;
    let moves = 0;
    let timer;
    let seconds = 0;
    let matchedPairs = 0;
    let totalPairs = 0;
    let currentPlayer = 1;
    let score1 = 0;
    let score2 = 0;
    let isLocked = false;
    let gameStarted = false;

    // Emoji set for cards
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦗', '🕷️', '🦂', '🦀', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🦔'];

    // Create and shuffle cards
    function createCards(numCards) {
        console.log('Creating cards:', numCards);
        const selectedEmojis = emojis.slice(0, numCards / 2);
        const cardValues = [...selectedEmojis, ...selectedEmojis];
        shuffleArray(cardValues);

        gameBoard.innerHTML = ''; // Clear existing cards
        cards = []; // Reset cards array

        // Calculate grid dimensions
        const difficulty = difficultySelect.value;
        let cols;
        switch(difficulty) {
            case 'easy':
                cols = 4;
                break;
            case 'medium':
                cols = 5;
                break;
            case 'hard':
                cols = 6;
                break;
        }

        // Set grid template columns
        gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        cardValues.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.value = emoji;

            const cardFront = document.createElement('div');
            cardFront.classList.add('card-front');
            cardFront.textContent = emoji;

            const cardBack = document.createElement('div');
            cardBack.classList.add('card-back');

            card.appendChild(cardFront);
            card.appendChild(cardBack);
            card.addEventListener('click', handleCardClick);
            gameBoard.appendChild(card);
            cards.push(card);
        });

        console.log('Cards created:', cards.length);
    }

    // Initialize game
    function initGame() {
        console.log('Initializing game...');
        resetGame();
        const difficulty = difficultySelect.value;
        let rows, cols;

        switch(difficulty) {
            case 'easy':
                rows = 4;
                cols = 4;
                break;
            case 'medium':
                rows = 4;
                cols = 5;
                break;
            case 'hard':
                rows = 6;
                cols = 6;
                break;
        }

        totalPairs = (rows * cols) / 2;
        createCards(rows * cols);
        updatePlayerStatus();
        console.log('Game initialized');
    }

    // Shuffle array using Fisher-Yates algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Update player status display
    function updatePlayerStatus() {
        player1Status.textContent = currentPlayer === 1 ? "Your Turn" : "Waiting...";
        player2Status.textContent = currentPlayer === 2 ? "Your Turn" : "Waiting...";
        player1Status.className = `status ${currentPlayer === 1 ? 'active' : ''}`;
        player2Status.className = `status ${currentPlayer === 2 ? 'active' : ''}`;
        
        // Update player containers
        document.querySelector('.player:nth-child(1)').className = `player ${currentPlayer === 1 ? 'active' : ''}`;
        document.querySelector('.player:nth-child(2)').className = `player ${currentPlayer === 2 ? 'active' : ''}`;
    }

    // Switch player turn
    function switchPlayer() {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updatePlayerStatus();
        
        // Add visual feedback for turn switch
        const currentPlayerElement = document.querySelector(`.player:nth-child(${currentPlayer})`);
        currentPlayerElement.style.animation = 'none';
        currentPlayerElement.offsetHeight; // Trigger reflow
        currentPlayerElement.style.animation = 'pulse 0.5s ease-in-out';
    }

    // Flip card
    function flipCard(card) {
        card.classList.add('flipped');
    }

    function handleCardClick(e) {
        if (!gameStarted || isLocked || e.target.parentElement.classList.contains('flipped')) return;
        
        const card = e.target.parentElement;
        flipCard(card);
        
        if (!firstCard) {
            firstCard = card;
            return;
        }
        
        secondCard = card;
        isLocked = true;
        moves++;
        movesCount.textContent = moves;
        
        if (firstCard.dataset.value === secondCard.dataset.value) {
            // Match found
            setTimeout(() => {
                firstCard.style.visibility = 'hidden';
                secondCard.style.visibility = 'hidden';
                firstCard = null;
                secondCard = null;
                isLocked = false;
                
                // Award point to current player
                if (currentPlayer === 1) {
                    score1++;
                    score1Display.textContent = score1;
                } else {
                    score2++;
                    score2Display.textContent = score2;
                }
                
                // Check if game is over
                if (document.querySelectorAll('.card:not([style*="visibility: hidden"])').length === 0) {
                    endGame();
                }
            }, 1000);
        } else {
            // No match
            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                firstCard = null;
                secondCard = null;
                isLocked = false;
                switchPlayer();
            }, 1000);
        }
    }

    // Start timer
    function startTimer() {
        clearInterval(timer);
        seconds = 0;
        timeDisplay.textContent = '00:00';
        timer = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    // End game
    function endGame() {
        clearInterval(timer);
        finalMoves.textContent = moves;
        finalTime.textContent = timeDisplay.textContent;

        // Determine winner
        let message;
        if (score1 > score2) {
            message = 'Player 1 Wins! 🎉';
        } else if (score2 > score1) {
            message = 'Player 2 Wins! 🎉';
        } else {
            message = "It's a Tie! 🤝";
        }
        winnerMessage.textContent = message;

        setTimeout(() => {
            winMessage.style.display = 'block';
        }, 500);
    }

    // Reset game
    function resetGame() {
        clearInterval(timer);
        seconds = 0;
        moves = 0;
        matchedPairs = 0;
        score1 = 0;
        score2 = 0;
        currentPlayer = 1;
        firstCard = null;
        secondCard = null;
        isLocked = false;
        gameStarted = false;
        movesCount.textContent = '0';
        timeDisplay.textContent = '00:00';
        score1Display.textContent = '0';
        score2Display.textContent = '0';
        winMessage.style.display = 'none';
        gameBoard.innerHTML = '';
        cards = [];
        updatePlayerStatus();
    }

    // Event listeners
    startBtn.addEventListener('click', () => {
        if (!gameStarted) {
            gameStarted = true;
            startTimer();
        }
    });

    playAgainBtn.addEventListener('click', () => {
        initGame();
        gameStarted = true;
        startTimer();
    });

    difficultySelect.addEventListener('change', () => {
        initGame();
        gameStarted = false;
    });

    // Initialize game on page load without starting timer
    initGame();
}); 