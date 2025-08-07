let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let quizQuestions = [];

// Soruları JSON dosyasından yükle
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) {
            throw new Error('Sorular yüklenemedi');
        }
        questions = await response.json();
    } catch (error) {
        console.error('Sorular yüklenirken hata:', error);
        // Fallback sorular
        questions = [
            {
                "question": "Hayriye çayı nasıl içiyordu?",
                "options": ["Şekersiz", "Tek şekerli", "2 şekerli", "Tek şekerli+limonlu"],
                "correct": 0
            },
            {
                "question": "Nezih Amerika'da ne okumuştu?",
                "options": ["Uluslararası İlişkiler", "Ekonomi", "İşletme", "Politika"],
                "correct": 1
            }
        ];
    }
}

// Quiz'i başlat
function startQuiz() {
    if (questions.length === 0) {
        alert('Sorular henüz yüklenmedi. Lütfen bekleyin.');
        return;
    }
    
    // Tüm soruları karıştır ve seç
    quizQuestions = [...questions].sort(() => Math.random() - 0.5);
    
    currentQuestionIndex = 0;
    score = 0;
    
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    
    showQuestion();
}

// Soruyu göster
function showQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    document.getElementById('question').textContent = question.question;
    
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => selectAnswer(index);
        optionsContainer.appendChild(button);
    });
    
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('question-number').textContent = 
        `Soru ${currentQuestionIndex + 1} / ${quizQuestions.length}`;
}

// Cevap seç
function selectAnswer(selectedIndex) {
    const question = quizQuestions[currentQuestionIndex];
    const optionsContainer = document.getElementById('options');
    const buttons = optionsContainer.querySelectorAll('button');

    // Doğru cevap ise skor artır
    if (selectedIndex === question.correct) {
        score++;
    }

    // Tüm butonları pasifleştir ve border ekle
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        btn.style.borderWidth = '2.5px';
        if (idx === question.correct) {
            btn.style.borderColor = '#2ecc40'; // yeşil
        } else if (idx === selectedIndex) {
            btn.style.borderColor = '#e74c3c'; // kırmızı
        } else {
            btn.style.borderColor = '#ccc';
        }
    });

    document.getElementById('next-btn').classList.remove('hidden');
}

// Sonraki soru
function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < quizQuestions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

// Sonucu göster
function showResult() {
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');

    const percentage = Math.round((score / quizQuestions.length) * 100);
    document.getElementById('score').textContent = `${score} / ${quizQuestions.length}`;
    document.getElementById('percentage').textContent = `${percentage}%`;

    // Motivasyon mesajı
    let motivation = "";
    if (percentage >= 90) {
        motivation = "🌟 SEN GERÇEK BİR YAPRAK DÖKÜMÜ GURMESİSİN!";
    } else if (percentage >= 75) {
        motivation = "🎭 Harika! Dizinin ruhunu yakaladın.";
    } else if (percentage >= 60) {
        motivation = "🌿 Fena değil! Detaylara biraz daha dikkat!";
    } else if (percentage >= 40) {
        motivation = "🏠 Biraz daha izlemeye devam!";
    } else {
        motivation = "📚 Daha çok izle, daha çok öğren!";
    }
    document.getElementById('motivation-message').textContent = motivation;

    // Twitter paylaş butonunu ekle
    addTwitterShareButton(score, quizQuestions.length, percentage, motivation);

    // İstatistikleri kaydet
    saveStats(score, quizQuestions.length, percentage);
    updateStats();
}

function addTwitterShareButton(score, total, percentage, character) {
    // Önce eski buton varsa kaldır
    const resultContent = document.querySelector('.result-content');
    let oldBtn = document.getElementById('twitter-share-btn');
    if (oldBtn) oldBtn.remove();

    // Tweet metni
    const tweetText = `Yaprak Dökümü Quiz sonucum: ${score} / ${total} (%${percentage})\n${character}\n@bsrinceler ile #YaprakDökümüQuiz`; 
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

    // Buton oluştur
    const btn = document.createElement('button');
    btn.id = 'twitter-share-btn';
    btn.textContent = 'Twitter’da Sonucumu Paylaş';
    btn.style.marginTop = '24px';
    btn.style.background = '#1da1f2';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '30px';
    btn.style.padding = '14px 32px';
    btn.style.fontSize = '1rem';
    btn.style.fontWeight = 'bold';
    btn.style.cursor = 'pointer';
    btn.style.display = 'block';
    btn.style.marginLeft = 'auto';
    btn.style.marginRight = 'auto';
    btn.onclick = function() {
        window.open(tweetUrl, '_blank');
    };
    resultContent.appendChild(btn);
}

// Quiz'i yeniden başlat
function restartQuiz() {
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
}

// İstatistikleri kaydet
function saveStats(score, total, percentage) {
    let stats = JSON.parse(localStorage.getItem('yaprakDokumu-quiz-stats')) || {
        totalQuizzes: 0,
        totalScore: 0,
        totalQuestions: 0,
        bestScore: 0
    };
    
    stats.totalQuizzes++;
    stats.totalScore += score;
    stats.totalQuestions += total;
    stats.bestScore = Math.max(stats.bestScore, percentage);
    
    localStorage.setItem('yaprakDokumu-quiz-stats', JSON.stringify(stats));
}

// İstatistikleri güncelle
function updateStats() {
    const stats = JSON.parse(localStorage.getItem('yaprakDokumu-quiz-stats'));
    if (stats) {
        document.getElementById('total-quizzes').textContent = stats.totalQuizzes;
        document.getElementById('average-score').textContent = 
            Math.round((stats.totalScore / stats.totalQuestions) * 100) + '%';
        document.getElementById('best-score').textContent = stats.bestScore + '%';
    }
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    loadQuestions();
    updateStats();
});