

const teacher = requireRole("Teacher");

document.getElementById("logoutLink").addEventListener("click", function (e) {
  e.preventDefault();
  logout();
});

// Questions are kept in memory as a draft until "Save Exam" is clicked —
// only then do we actually call addExam()/addQuestionToExam() from storage.js.
let draftQuestions = [];

const qTypeSelect = document.getElementById("qType");
const qOptionsArea = document.getElementById("qOptionsArea");

function renderOptionsArea() {
  const type = qTypeSelect.value;

  if (type === "mcq") {
    qOptionsArea.innerHTML = `
      <div class="ce-field"><label>Option 1</label><input type="text" class="qOpt"></div>
      <div class="ce-field"><label>Option 2</label><input type="text" class="qOpt"></div>
      <div class="ce-field"><label>Option 3</label><input type="text" class="qOpt"></div>
      <div class="ce-field"><label>Option 4</label><input type="text" class="qOpt"></div>
      <div class="ce-field ce-field-wide">
        <label>Correct Answer</label>
        <input type="text" id="qCorrectSingle" placeholder="Must match one of the options exactly">
      </div>`;
  } else if (type === "true_false") {
    qOptionsArea.innerHTML = `
      <div class="ce-field ce-field-wide">
        <label>Correct Answer</label>
        <select id="qCorrectBool">
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>`;
  } else if (type === "multiple_answer") {
    qOptionsArea.innerHTML = `
      <div class="ce-field"><label>Option 1</label><input type="text" class="qOpt"></div>
      <div class="ce-field"><label>Option 2</label><input type="text" class="qOpt"></div>
      <div class="ce-field"><label>Option 3</label><input type="text" class="qOpt"></div>
      <div class="ce-field"><label>Option 4</label><input type="text" class="qOpt"></div>
      <div class="ce-field ce-field-wide">
        <label>Correct Answers</label>
        <input type="text" id="qCorrectMulti" placeholder="Comma-separated, e.g. 4, 8">
      </div>`;
  } else if (type === "short_answer") {
    qOptionsArea.innerHTML = `
      <div class="ce-field ce-field-wide">
        <label>Correct Answer (number)</label>
        <input type="number" id="qCorrectShort">
      </div>`;
  }
}
qTypeSelect.addEventListener("change", renderOptionsArea);
renderOptionsArea(); // initial render

function renderQuestionList() {
  const list = document.getElementById("questionList");
  const emptyState = document.getElementById("emptyState");
  document.getElementById("questionCount").textContent =
    `${draftQuestions.length} question${draftQuestions.length === 1 ? "" : "s"} added`;

  if (!draftQuestions.length) {
    list.innerHTML = "";
    list.appendChild(emptyState);
    return;
  }

  list.innerHTML = draftQuestions.map((q, i) => `
    <div class="ce-question-row">
      <div>
        <span class="ce-question-type">${q.type.replace("_", " ")}</span>
        <p class="ce-question-text">${i + 1}. ${q.text}</p>
      </div>
      <button type="button" class="ce-remove-btn" data-index="${i}">Remove</button>
    </div>
  `).join("");

  list.querySelectorAll(".ce-remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      draftQuestions.splice(Number(btn.dataset.index), 1);
      renderQuestionList();
    });
  });
}

document.getElementById("addQuestionBtn").addEventListener("click", function () {
  const type = qTypeSelect.value;
  const text = document.getElementById("qText").value.trim();
  const formError = document.getElementById("formError");
  formError.style.display = "none";

  if (!text) {
    formError.textContent = "Please enter the question text.";
    formError.style.display = "block";
    return;
  }

  let question = { type, text };

  if (type === "mcq") {
    const options = [...document.querySelectorAll(".qOpt")].map(i => i.value.trim()).filter(Boolean);
    const correctAnswer = document.getElementById("qCorrectSingle").value.trim();
    if (options.length < 2 || !correctAnswer) {
      formError.textContent = "Add at least 2 options and a correct answer.";
      formError.style.display = "block";
      return;
    }
    question.options = options;
    question.correctAnswer = correctAnswer;
  } else if (type === "true_false") {
    question.correctAnswer = document.getElementById("qCorrectBool").value === "true";
  } else if (type === "multiple_answer") {
    const options = [...document.querySelectorAll(".qOpt")].map(i => i.value.trim()).filter(Boolean);
    const correctAnswers = document.getElementById("qCorrectMulti").value
      .split(",").map(v => v.trim()).filter(Boolean);
    if (options.length < 2 || !correctAnswers.length) {
      formError.textContent = "Add at least 2 options and at least 1 correct answer.";
      formError.style.display = "block";
      return;
    }
    question.options = options;
    question.correctAnswers = correctAnswers;
  } else if (type === "short_answer") {
    const correctAnswer = document.getElementById("qCorrectShort").value;
    if (correctAnswer === "") {
      formError.textContent = "Please enter the correct numeric answer.";
      formError.style.display = "block";
      return;
    }
    question.correctAnswer = Number(correctAnswer);
  }

  draftQuestions.push(question);
  renderQuestionList();

  // Reset the add-question form for the next question
  document.getElementById("qText").value = "";
  qTypeSelect.value = "mcq";
  renderOptionsArea();
});

document.getElementById("saveExamBtn").addEventListener("click", function () {
  const title = document.getElementById("examTitle").value.trim();
  const dateTime = document.getElementById("examDateTime").value;
  const status = document.getElementById("examStatus").value;
  const formError = document.getElementById("formError");

  if (!title || !dateTime) {
    formError.textContent = "Please fill in the exam title and date/time.";
    formError.style.display = "block";
    return;
  }
  if (!draftQuestions.length) {
    formError.textContent = "Add at least one question before saving.";
    formError.style.display = "block";
    return;
  }

  const exam = addExam({
    title,
    dateTime,
    numQuestions: draftQuestions.length,
    status,
  });

  draftQuestions.forEach(q => addQuestionToExam(exam.id, q));

  window.location.href = "exams.html";
});