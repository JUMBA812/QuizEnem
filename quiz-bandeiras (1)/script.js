document.addEventListener('DOMContentLoaded', function() {
    const mainMenu = document.getElementById('main-menu');
    const normalModeBtn = document.getElementById('normal-mode-btn');
    const streakModeBtn = document.getElementById('streak-mode-btn');
    const livesModeBtn = document.getElementById('lives-mode-btn');
    const quizContainer = document.getElementById('quiz-container');
    const languageSelect = document.getElementById('language-select');
    const flagImg = document.getElementById('flag-img');
    const answerInput = document.getElementById('answer-input');
    const resultText = document.getElementById('result');
    const streakCounter = document.getElementById('streak-counter');
    const livesContainer = document.getElementById('lives-container'); // Updated ID for lives container
    const livesCountDisplay = document.getElementById('lives-counter');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const highScoreDisplay = document.getElementById('high-score-count');
    const gameOverContainer = document.getElementById('game-over-container');
    const restartBtn = document.getElementById('restart-btn');

    let quizData = [];
    let shuffledIndexes = [];
    let currentQuestionIndex = 0;
    let streakModeActive = false;
    let livesModeActive = false;
    let streakCount = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let livesCount = 5;

    function updateHighScore() {
        highScoreDisplay.textContent = highScore;
    }

    function checkAndUpdateHighScore() {
        if (streakCount > highScore) {
            highScore = streakCount;
            localStorage.setItem('highScore', highScore);
            updateHighScore();
        }
    }

    function updateStreakCounter() {
        streakCounter.textContent = streakCount;
    }

    function updateLivesCounter() {
        livesCountDisplay.textContent = livesCount;
    }

    document.addEventListener('keydown', handleKeyboardShortcuts);

    function handleKeyboardShortcuts(event) {
        if (event.altKey && !event.ctrlKey && !event.shiftKey && event.code === 'AltRight') {
            showAnswerAndSkip();
        } else if (event.altKey && !event.ctrlKey && !event.shiftKey && event.key === 'Alt') {
            skipQuestion();
        }
    }

    function resetStreakCounter() {
        streakCount = 0;
        updateStreakCounter();
        checkAndUpdateHighScore();
    }

    function incrementStreakCounter() {
        streakCount++;
        updateStreakCounter();
    }

    function resetLivesCount() {
        livesCount = 5;
        updateLivesCounter();
    }

    function decrementLivesCount() {
        livesCount--;
        updateLivesCounter();
        if (livesCount <= 0) {
            gameOver();
        }
    }

    function gameOver() {
        quizContainer.style.display = 'none';
        gameOverContainer.style.display = 'block';
    }

    function restartGame() {
        gameOverContainer.style.display = 'none';
        quizContainer.style.display = 'block';
        currentQuestionIndex = 0;
        resetLivesCount();
        showNextQuestion();
    }

    function checkAnswer() {
        const currentIndex = shuffledIndexes[currentQuestionIndex];
        const playerAnswer = normalizeAnswer(answerInput.value.trim().toLowerCase());
        const correctAnswers = quizData[currentIndex].allAnswers.map(ans => normalizeAnswer(ans.toLowerCase()));
        if (correctAnswers.includes(playerAnswer)) {
            if (streakModeActive) {
                incrementStreakCounter();
                checkAndUpdateHighScore();
            }
            currentQuestionIndex++;
            if (currentQuestionIndex < shuffledIndexes.length) {
                showNextQuestion();
            } else {
                alert('Congratulations! You have completed the quiz.');
            }
        } else {
            resultText.textContent = 'Incorrect';
            setTimeout(() => {
                resultText.textContent = '';
            }, 1000);
            if (streakModeActive) {
                resetStreakCounter();
            } else if (livesModeActive) {
                decrementLivesCount();
            }
        }
    }

    answerInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            checkAnswer();
        }
    });

    function startNormalMode() {
        mainMenu.style.display = 'none';
        quizContainer.style.display = 'block';
        const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
        languageSelect.value = selectedLanguage;
        loadQuizData(selectedLanguage);
        streakModeActive = false;
        livesModeActive = false;
        streakCounter.style.display = 'none';
        livesContainer.style.display = 'none';
        highScoreDisplay.parentElement.style.display = 'none';
        resetStreakCounter();
    }

    function startStreakMode() {
        mainMenu.style.display = 'none';
        quizContainer.style.display = 'block';
        const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
        languageSelect.value = selectedLanguage;
        loadQuizData(selectedLanguage);
        streakModeActive = true;
        livesModeActive = false;
        streakCounter.style.display = 'block';
        livesContainer.style.display = 'none';
        highScoreDisplay.parentElement.style.display = 'block';
        resetStreakCounter();
        updateHighScore();
    }

    function startLivesMode() {
        mainMenu.style.display = 'none';
        quizContainer.style.display = 'block';
        const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
        languageSelect.value = selectedLanguage;
        loadQuizData(selectedLanguage);
        streakModeActive = false;
        livesModeActive = true;
        streakCounter.style.display = 'none';
        livesContainer.style.display = 'block';
        highScoreDisplay.parentElement.style.display = 'none';
        resetLivesCount();
    }

    normalModeBtn.addEventListener('click', startNormalMode);
    streakModeBtn.addEventListener('click', startStreakMode);
    livesModeBtn.addEventListener('click', startLivesMode);
    restartBtn.addEventListener('click', restartGame);

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function loadQuizData(language) {
        fetch(`quiz_data_${language}.txt`)
            .then(response => response.text())
            .then(data => {
                quizData = data.split('\n').map(line => {
                    const [country, flagUrl, ...alternatives] = line.split(',');
                    const allAnswers = [country, ...alternatives];
                    return { country, flagUrl, allAnswers };
                });
                shuffledIndexes = shuffleArray(Array.from(Array(quizData.length).keys()));
                showNextQuestion();
            });
    }

    function skipQuestion() {
        resetStreakCounter();
        currentQuestionIndex++;
        if (currentQuestionIndex < shuffledIndexes.length) {
            showNextQuestion();
        } else {
            alert('Congratulations! You have completed the quiz.');
        }
    }

    document.getElementById('skip-btn').addEventListener('click', skipQuestion);

    function showAnswerAndSkip() {
        resetStreakCounter();
        const currentIndex = shuffledIndexes[currentQuestionIndex];
        const correctAnswer = quizData[currentIndex].country;
        answerInput.value = correctAnswer;

        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < shuffledIndexes.length) {
                showNextQuestion();
            } else {
                alert('Congratulations! You have completed the quiz.');
            }
        }, 1000);
    }

    document.getElementById('show-answer-btn').addEventListener('click', showAnswerAndSkip);

    function showNextQuestion() {
        const currentIndex = shuffledIndexes[currentQuestionIndex];
        flagImg.src = quizData[currentIndex].flagUrl;
        answerInput.value = '';
        answerInput.focus();
        resultText.textContent = '';
    }

    function normalizeAnswer(answer) {
        answer = answer.replace(/[áàâãä]/g, 'a');
        answer = answer.replace(/[éèêë]/g, 'e');
        answer = answer.replace(/[íìîï]/g, 'i');
        answer = answer.replace(/[óòôõö]/g, 'o');
        answer = answer.replace(/[úùûü]/g, 'u');
        answer = answer.replace(/[ç]/g, 'c');
        answer = answer.replace(/\s/g, '');
        return answer;
    }

    languageSelect.addEventListener('change', function() {
        const selectedLanguage = languageSelect.value;
        localStorage.setItem('selectedLanguage', selectedLanguage);
        loadQuizData(selectedLanguage);
    });

    backToMenuBtn.addEventListener('click', function() {
        mainMenu.style.display = 'block';
        quizContainer.style.display = 'none';
        gameOverContainer.style.display = 'none';
    });

    // Initial High Score display setup
    updateHighScore();
});
