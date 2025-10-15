import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

// ✅ Firebase Configuration
// This configuration connects your app to Firebase, enabling it to retrieve
// quizzes from the Realtime Database.
const firebaseConfig = {
  apiKey: "AIzaSyBQxFPa68XrTGMTMfPPU_pOsJXyECl1GM0",
  authDomain: "aplusbuddy-80c4f.firebaseapp.com",
  databaseURL: "https://aplusbuddy-80c4f-default-rtdb.firebaseio.com",
  projectId: "aplusbuddy-80c4f"
};

// Initialize Firebase App and Database
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ Parse Query Parameters
// This allows dynamic quiz loading based on URL parameters such as:
// example.com?exam=Waec&subject=Agricultural%20Science&topic=BASIC-CONCEPTS
const params = new URLSearchParams(window.location.search);
const exam = params.get("exam");
const subject = params.get("subject");
const topic = params.get("topic");

// Create a reference to the quiz data in Firebase
const quizRef = ref(db, `all/${exam}/${subject}/${topic}`);

// Fetch quiz data from Firebase
get(quizRef)
  .then(snapshot => {
    const container = document.getElementById("quiz-container");

    if (!snapshot.exists()) {
      container.innerText = "No quiz found for this topic.";
      return;
    }

    // Hide the "Loading quiz..." text after successful load
    container.innerText = "";
    renderQuiz(snapshot.val());
  })
  .catch(err => {
    document.getElementById("quiz-container").innerText = "Error: " + err.message;
  });


// ✅ Main Quiz Rendering Function
function renderQuiz(questions) {
  const container = document.getElementById("quiz-container");
  let current = 0;
  let score = 0;

  // Create quiz elements dynamically
  const card = document.createElement("div");
  card.className = "quiz-card";

  const scoreText = document.createElement("div");
  scoreText.className = "score-text";

  const questionEl = document.createElement("h2");
  questionEl.className = "question-text";

  const optionsEl = document.createElement("div");
  optionsEl.className = "options";

  const feedbackEl = document.createElement("p");
  feedbackEl.className = "feedback hidden";

  const nextBtn = document.createElement("button");
  nextBtn.className = "next-btn hidden";

  const imageBtn = document.createElement("button");
  imageBtn.className = "image-btn";
  imageBtn.textContent = "View Image";

  // Append elements to container
  card.append(scoreText, questionEl, imageBtn, optionsEl, feedbackEl, nextBtn);
  container.append(card);

  // Load the first question
  updateQuestion();

  // ✅ Function to update the current question
  function updateQuestion() {
    const q = questions[current];

    questionEl.textContent = `Q${current + 1}: ${q.question}`;
    optionsEl.innerHTML = "";
    feedbackEl.classList.add("hidden");
    nextBtn.classList.add("hidden");

    // Update score tracker at the top
    scoreText.textContent = `Score: ${score} / ${questions.length}`;

    // Display each answer option as a button
    q.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = opt;
      btn.onclick = () => handleAnswer(btn, q);
      optionsEl.appendChild(btn);
    });

    // Image button click event
    imageBtn.onclick = () => {
      if (q.imageUrl) {
        showImagePopup(q.imageUrl);
      } else {
        showPopup("No image available for this question.");
      }
    };
  }

  // ✅ Function to handle answer selection
  function handleAnswer(btn, q) {
    const selected = btn.textContent;
    const allButtons = optionsEl.querySelectorAll("button");

    // Disable all options after selection
    allButtons.forEach(b => (b.disabled = true));

    // Determine correctness
    if (selected === q.answer) {
      score++;
      feedbackEl.textContent = "✅ Correct!";
      feedbackEl.classList.add("correct");
      feedbackEl.classList.remove("wrong");
    } else {
      feedbackEl.textContent = "❌ Incorrect!";
      feedbackEl.classList.add("wrong");
      feedbackEl.classList.remove("correct");
    }

    feedbackEl.classList.remove("hidden");

    // Show explanation popup
    showPopup(`<strong>Explanation:</strong><br>${q.explanation}`);

    // Change button label based on progress
    nextBtn.textContent = current === questions.length - 1 ? "Finish" : "Next";
    nextBtn.classList.remove("hidden");

    nextBtn.onclick = () => {
      current++;
      if (current < questions.length) {
        updateQuestion();
      } else {
        finishQuiz();
      }
    };
  }

  // ✅ Function to handle quiz completion
  function finishQuiz() {
    const percent = ((score / questions.length) * 100).toFixed(1);
    showPopup(`🎉 <b>You scored ${percent}%!</b><br><br>Press your back button to exit or choose another quiz.`);

    card.innerHTML = `
      <h2>Quiz Complete!</h2>
      <p>Your score: <strong>${score}</strong> / ${questions.length} (${percent}%)</p>
    `;
  }

  // ✅ Function to display general popups (for explanations, completion, etc.)
  function showPopup(message) {
    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";
    overlay.innerHTML = `
      <div class="popup">
        <p>${message}</p>
        <button class="close-btn">OK</button>
      </div>
    `;
    document.body.append(overlay);
    overlay.querySelector(".close-btn").onclick = () => overlay.remove();
  }

  // ✅ Function to display image popups when an image URL is provided
  function showImagePopup(url) {
    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";
    overlay.innerHTML = `
      <div class="popup">
        <img src="${url}" class="popup-img" alt="Question Image" style="max-width:100%; border-radius:10px; margin-bottom:10px;"/>
        <button class="close-btn">Close</button>
      </div>
    `;
    document.body.append(overlay);
    overlay.querySelector(".close-btn").onclick = () => overlay.remove();
  }
}
