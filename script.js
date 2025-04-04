// Quiz data for different languages
const quizData = {
    english: [
        {
            question: "What is the correct translation for 'Hello'?",
            options: ["Hola", "Bonjour", "Hello", "Ciao"],
            answer: 2,
            pronunciation: "Hello"
        },
        {
            question: "How do you say 'Goodbye' in English?",
            options: ["Adiós", "Au revoir", "Goodbye", "Arrivederci"],
            answer: 2,
            pronunciation: "Goodbye"
        },
        {
            question: "What does 'Thank you' mean?",
            options: ["Por favor", "Merci", "Thank you", "Grazie"],
            answer: 2,
            pronunciation: "Thank you"
        }
    ],
    spanish: [
        {
            question: "What is the correct translation for 'Hello' in Spanish?",
            options: ["Hola", "Bonjour", "Hello", "Ciao"],
            answer: 0,
            pronunciation: "Hola"
        },
        {
            question: "How do you say 'Goodbye' in Spanish?",
            options: ["Adiós", "Au revoir", "Goodbye", "Arrivederci"],
            answer: 0,
            pronunciation: "Adiós"
        },
        {
            question: "What does 'Gracias' mean?",
            options: ["Please", "Thank you", "Hello", "Goodbye"],
            answer: 1,
            pronunciation: "Gracias"
        }
    ]
};

// DOM elements
const startQuizBtn = document.getElementById('startQuiz');
const languageSelect = document.getElementById('language');

// Quiz page elements (if on quiz.html)
let currentQuestion = 0;
let score = 0;
let selectedLanguage = 'english';

// Initialize the app based on current page
document.addEventListener('DOMContentLoaded', function() {
    if (startQuizBtn) {
        // Home page initialization
        startQuizBtn.addEventListener('click', function() {
            const selectedLang = languageSelect.value;
            window.location.href = `quiz.html?lang=${selectedLang}`;
        });
    }

    if (document.getElementById('question-text')) {
        // Quiz page initialization
        const urlParams = new URLSearchParams(window.location.search);
        selectedLanguage = urlParams.get('lang') || 'english';
        
        loadQuestion();
        setupSpeechRecognition();
        
        document.getElementById('next-btn').addEventListener('click', nextQuestion);
        document.getElementById('prev-btn').addEventListener('click', prevQuestion);
        document.getElementById('submit-quiz').addEventListener('click', submitQuiz);
    }

    if (document.getElementById('student-name')) {
        // Certificate page initialization
        const urlParams = new URLSearchParams(window.location.search);
        const name = urlParams.get('name') || 'Student';
        const lang = urlParams.get('lang') || 'English';
        const level = urlParams.get('level') || '1';
        const userScore = urlParams.get('score') || '0';
        
        document.getElementById('student-name').textContent = name;
        document.getElementById('language-name').textContent = lang.charAt(0).toUpperCase() + lang.slice(1);
        document.getElementById('level-number').textContent = level;
        document.getElementById('score').textContent = `${userScore}%`;
    }
});

// Quiz functions
function loadQuestion() {
    const quiz = quizData[selectedLanguage];
    if (!quiz || currentQuestion >= quiz.length) {
        endQuiz();
        return;
    }

    const questionData = quiz[currentQuestion];
    document.getElementById('question-text').textContent = questionData.question;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    questionData.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'flex items-center p-4 bg-white bg-opacity-20 rounded-lg cursor-pointer hover:bg-opacity-30 option';
        optionElement.innerHTML = `
            <span class="flex items-center justify-center w-6 h-6 rounded-full bg-white bg-opacity-30 mr-4">${index + 1}</span>
            <span>${option}</span>
        `;
        optionElement.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(optionElement);
    });

    // Update progress
    document.getElementById('progress-text').textContent = `Question ${currentQuestion + 1} of ${quiz.length}`;
    const progressPercent = ((currentQuestion + 1) / quiz.length) * 100;
    document.getElementById('progress-bar').style.width = `${progressPercent}%`;
    
    // Update navigation buttons
    document.getElementById('prev-btn').disabled = currentQuestion === 0;
    document.getElementById('next-btn').classList.toggle('hidden', currentQuestion === quiz.length - 1);
    document.getElementById('submit-quiz').classList.toggle('hidden', currentQuestion !== quiz.length - 1);
    
    // Show pronunciation section for every 3rd question
    const pronunciationSection = document.getElementById('pronunciation-section');
    pronunciationSection.classList.toggle('hidden', (currentQuestion + 1) % 3 !== 0);
    if (!pronunciationSection.classList.contains('hidden')) {
        document.getElementById('pronunciation-text').textContent = `"${questionData.pronunciation}"`;
    }
}

function selectOption(optionIndex) {
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.classList.remove('bg-yellow-500', 'bg-opacity-50');
    });
    
    options[optionIndex].classList.add('bg-yellow-500', 'bg-opacity-50');
    selectedOption = optionIndex;
}

function nextQuestion() {
    const quiz = quizData[selectedLanguage];
    if (selectedOption === quiz[currentQuestion].answer) {
        score++;
        document.getElementById('score-display').textContent = `Score: ${score}`;
    }
    
    currentQuestion++;
    selectedOption = null;
    loadQuestion();
}

function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
    }
}

function endQuiz() {
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    const percentage = Math.round((score / quizData[selectedLanguage].length) * 100);
    const firstName = userData.firstName || 'User';
    
    // Save quiz result to localStorage
    const progress = JSON.parse(localStorage.getItem('progress')) || {};
    progress[selectedLanguage] = progress[selectedLanguage] || {};
    progress[selectedLanguage].lastScore = percentage;
    progress[selectedLanguage].lastQuiz = new Date().toISOString();
    localStorage.setItem('progress', JSON.stringify(progress));
    
    window.location.href = `certificate.html?lang=${selectedLanguage}&level=1&score=${percentage}&name=${encodeURIComponent(firstName)}`;
}

function submitQuiz() {
    endQuiz();
}

// Speech recognition functions
function setupSpeechRecognition() {
    const startRecordingBtn = document.getElementById('start-recording');
    const recordingStatus = document.getElementById('recording-status');
    const feedback = document.getElementById('pronunciation-feedback');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        startRecordingBtn.disabled = true;
        startRecordingBtn.textContent = "Speech Recognition Not Supported";
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage === 'spanish' ? 'es-ES' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    startRecordingBtn.addEventListener('click', function() {
        recordingStatus.classList.remove('hidden');
        feedback.classList.add('hidden');
        recognition.start();
    });

    recognition.onresult = function(event) {
        const speechResult = event.results[0][0].transcript.toLowerCase();
        const expectedText = document.getElementById('pronunciation-text').textContent.replace(/"/g, '').toLowerCase();
        
        recordingStatus.classList.add('hidden');
        feedback.classList.remove('hidden');
        
        // Simple pronunciation scoring (could be enhanced)
        const score = calculatePronunciationScore(speechResult, expectedText);
        document.getElementById('pronunciation-score').textContent = score;
    };

    recognition.onerror = function(event) {
        recordingStatus.classList.add('hidden');
        alert('Error occurred in recognition: ' + event.error);
    };
}

function calculatePronunciationScore(speech, expected) {
    // Simple scoring - could be enhanced with more sophisticated algorithm
    if (speech === expected) return 100;
    
    const expectedWords = expected.split(' ');
    const spokenWords = speech.split(' ');
    let correctWords = 0;
    
    for (let i = 0; i < Math.min(expectedWords.length, spokenWords.length); i++) {
        if (expectedWords[i] === spokenWords[i]) {
            correctWords++;
        }
    }
    
    return Math.round((correctWords / expectedWords.length) * 100);
}