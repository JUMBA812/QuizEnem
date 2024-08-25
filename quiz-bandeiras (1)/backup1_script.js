document.addEventListener('DOMContentLoaded', function() {
    const mainMenu = document.getElementById('main-menu');
    const normalModeBtn = document.getElementById('normal-mode-btn');
    const streakModeBtn = document.getElementById('streak-mode-btn');
    const quizContainer = document.getElementById('quiz-container');
    const languageSelect = document.getElementById('language-select');
    const flagImg = document.getElementById('flag-img');
    const answerInput = document.getElementById('answer-input');
    const resultText = document.getElementById('result');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');

    let quizData = [];
    let shuffledIndexes = [];
    let currentQuestionIndex = 0;
    let streakModeActive = false;

    // Load quiz data based on the selected language
    function loadQuizData(language) {
        fetch(`quiz_data_${language}.txt`)
            .then(response => response.text())
            .then(data => {
                quizData = data.split('\n').map(line => {
                    const [country, flagUrl] = line.split(',');
                    return { country, flagUrl };
                });
                shuffledIndexes = shuffleArrayIndexes(quizData.length);
                showNextQuestion();
            });
    }

    // Shuffle array indexes to keep track of random order
    function shuffleArrayIndexes(length) {
        const indexes = Array.from({ length }, (_, i) => i);
        for (let i = indexes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
        }
        return indexes;
    }

    // Show the next question
    function showNextQuestion() {
        const currentIndex = shuffledIndexes[currentQuestionIndex];
        flagImg.src = quizData[currentIndex].flagUrl;
        answerInput.value = '';
        answerInput.focus();
        resultText.textContent = ''; // Clear previous result text
    }

    // Check the player's answer
  // Check the player's answer with tolerance for mistakes
  function checkAnswer() {
      const currentIndex = shuffledIndexes[currentQuestionIndex];
      const playerAnswer = normalizeAnswer(answerInput.value.trim().toLowerCase());
      const correctAnswer = normalizeAnswer(quizData[currentIndex].country.toLowerCase());
      if (playerAnswer === correctAnswer) {
          currentQuestionIndex++;
          if (currentQuestionIndex < shuffledIndexes.length) {
              showNextQuestion();
          } else {
              alert('Congratulations! You have completed the quiz.');
          }
      } else if (streakModeActive && playerAnswer !== '') {
          resultText.textContent = 'Incorrect';
          setTimeout(() => {
              resultText.textContent = '';
          }, 2000); // 2000 milliseconds = 2 seconds
      }
  }

  // Normalize the answer to tolerate some mistakes
  function normalizeAnswer(answer) {
      // Replace accented characters with their unaccented equivalents
      answer = answer.replace(/[áàâãä]/g, 'a');
      answer = answer.replace(/[éèêë]/g, 'e');
      answer = answer.replace(/[íìîï]/g, 'i');
      answer = answer.replace(/[óòôõö]/g, 'o');
      answer = answer.replace(/[úùûü]/g, 'u');
      // Replace spaces with empty string to make them optional
      answer = answer.replace(/\s/g, '');
      // Add more replacements as needed for other special characters
      return answer;
  }


    // Start the game in normal mode
    function startNormalMode() {
        mainMenu.style.display = 'none';
        quizContainer.style.display = 'block';
        const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en'; // Default to English if not set
        languageSelect.value = selectedLanguage;
        loadQuizData(selectedLanguage);
        streakModeActive = false;
    }

    // Start the game in streak mode
    function startStreakMode() {
        mainMenu.style.display = 'none';
        quizContainer.style.display = 'block';
        const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en'; // Default to English if not set
        languageSelect.value = selectedLanguage;
        loadQuizData(selectedLanguage);
        streakModeActive = true;
    }

    // Normal mode button click event
    normalModeBtn.addEventListener('click', startNormalMode);

    // Streak mode button click event
    streakModeBtn.addEventListener('click', startStreakMode);

    // Mode selection change event
    languageSelect.addEventListener('change', function() {
        const selectedLanguage = languageSelect.value;
        localStorage.setItem('selectedLanguage', selectedLanguage);
        loadQuizData(selectedLanguage);
    });

    // Handle answer submission based on streak mode
    answerInput.addEventListener('input', function() {
        if (streakModeActive) {
            answerInput.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    checkAnswer();
                }
            });
        } else {
            checkAnswer();
        }
    });

    // Back to Menu button click event
    backToMenuBtn.addEventListener('click', function() {
        mainMenu.style.display = 'block';
        quizContainer.style.display = 'none';
    });

    // Load quiz based on stored language on page load
    const storedLanguage = localStorage.getItem('selectedLanguage');
    if (storedLanguage) {
        languageSelect.value = storedLanguage;
        if (mainMenu.style.display === 'none') {
            if (streakModeActive) {
                startStreakMode();
            } else {
                startNormalMode();
            }
        }
    }
});
