// Flashcard data array
let flashcards = [
    { question: "What is the capital of France?", answer: "Paris" },
    { question: "What is 2 + 2?", answer: "4" },
    { question: "What is the color of the sky?", answer: "Blue" }
];
let currentCard = 0;
let showingAnswer = false;
let editingIndex = null;

const flashcardContainer = document.getElementById('flashcard-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const showAnswerBtn = document.getElementById('show-answer-btn');
const addBtn = document.getElementById('add-btn');
const editBtn = document.getElementById('edit-btn');
const deleteBtn = document.getElementById('delete-btn');
const formContainer = document.getElementById('form-container');
const questionInput = document.getElementById('question-input');
const answerInput = document.getElementById('answer-input');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const userAnswerInput = document.getElementById('user-answer');
const checkAnswerBtn = document.getElementById('check-answer-btn');
const resultMessage = document.getElementById('result-message');

function showFlashcard() {
    if (flashcards.length === 0) {
        flashcardContainer.textContent = "No flashcards. Please add one!";
        showAnswerBtn.disabled = true;
        editBtn.disabled = true;
        deleteBtn.disabled = true;
        userAnswerInput.value = '';
        userAnswerInput.disabled = true;
        checkAnswerBtn.disabled = true;
        resultMessage.textContent = '';
        return;
    }
    showAnswerBtn.disabled = false;
    editBtn.disabled = false;
    deleteBtn.disabled = false;
    userAnswerInput.value = '';
    userAnswerInput.disabled = false;
    checkAnswerBtn.disabled = false;
    resultMessage.textContent = '';
    showingAnswer = false;
    flashcardContainer.textContent = flashcards[currentCard].question;
}

function showAnswer() {
    if (flashcards.length > 0) {
        flashcardContainer.textContent = flashcards[currentCard].answer;
        showingAnswer = true;
        resultMessage.textContent = '';
        userAnswerInput.value = '';
    }
}

function nextCard() {
    if (flashcards.length > 0) {
        currentCard = (currentCard + 1) % flashcards.length;
        showFlashcard();
    }
}

function prevCard() {
    if (flashcards.length > 0) {
        currentCard = (currentCard - 1 + flashcards.length) % flashcards.length;
        showFlashcard();
    }
}

function showForm(edit = false) {
    formContainer.style.display = 'block';
    if (edit) {
        questionInput.value = flashcards[currentCard].question;
        answerInput.value = flashcards[currentCard].answer;
        editingIndex = currentCard;
    } else {
        questionInput.value = '';
        answerInput.value = '';
        editingIndex = null;
    }
}

function hideForm() {
    formContainer.style.display = 'none';
    questionInput.value = '';
    answerInput.value = '';
    editingIndex = null;
}

function saveFlashcard() {
    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();
    if (!question || !answer) {
        alert('Please enter both question and answer.');
        return;
    }
    if (editingIndex !== null) {
        flashcards[editingIndex] = { question, answer };
    } else {
        flashcards.push({ question, answer });
        currentCard = flashcards.length - 1;
    }
    hideForm();
    showFlashcard();
}

function deleteFlashcard() {
    if (flashcards.length === 0) return;
    if (!confirm('Are you sure you want to delete this flashcard?')) return;
    flashcards.splice(currentCard, 1);
    if (currentCard >= flashcards.length) {
        currentCard = flashcards.length - 1;
    }
    showFlashcard();
}

prevBtn.addEventListener('click', prevCard);
nextBtn.addEventListener('click', nextCard);
showAnswerBtn.addEventListener('click', showAnswer);
addBtn.addEventListener('click', () => showForm(false));
editBtn.addEventListener('click', () => showForm(true));
deleteBtn.addEventListener('click', deleteFlashcard);
saveBtn.addEventListener('click', saveFlashcard);
cancelBtn.addEventListener('click', hideForm);
checkAnswerBtn.addEventListener('click', checkUserAnswer);

// Function to check user's answer
function checkUserAnswer() {
    if (!userAnswerInput || !resultMessage) {
        alert('Answer input or result message element not found!');
        return;
    }
    if (flashcards.length === 0) return;
    const userAns = userAnswerInput.value.trim().toLowerCase();
    const correctAns = flashcards[currentCard].answer.trim().toLowerCase();
    if (!userAns) {
        resultMessage.textContent = 'Please type your answer.';
        resultMessage.style.color = 'orange';
        return;
    }
    if (userAns === correctAns) {
        resultMessage.textContent = 'Correct!';
        resultMessage.style.color = 'green';
        setTimeout(() => {
            nextCard();
        }, 1000); // 1 second delay before moving to next card
    } else {
        resultMessage.textContent = 'Wrong!';
        resultMessage.style.color = 'red';
    }
}

// Initial display
showFlashcard();
