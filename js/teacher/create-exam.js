const teacher = requireRole("Teacher");

document
  .getElementById("logoutLink")
  .addEventListener("click", function (e) {
    e.preventDefault();
    logout();
  });

// ========================================
// معرفة هل الصفحة Create أم Edit
// ========================================

const urlParams = new URLSearchParams(window.location.search);
const editingExamId = urlParams.get("examId");

let editingExam = null;
let draftQuestions = [];

if (editingExamId) {
  editingExam = getExamById(editingExamId);

  if (!editingExam) {
    alert("Exam not found.");
    window.location.href = "exams.html";
  }
}

// ========================================
// عناصر الصفحة
// ========================================

const qTypeSelect = document.getElementById("qType");
const qOptionsArea = document.getElementById("qOptionsArea");
const formError = document.getElementById("formError");

// ========================================
// عرض الحقول حسب نوع السؤال
// ========================================

function renderOptionsArea() {
  const type = qTypeSelect.value;

  if (type === "mcq") {
    qOptionsArea.innerHTML = `
      <div class="ce-field">
        <label>Option 1</label>
        <input type="text" class="qOpt">
      </div>

      <div class="ce-field">
        <label>Option 2</label>
        <input type="text" class="qOpt">
      </div>

      <div class="ce-field">
        <label>Option 3</label>
        <input type="text" class="qOpt">
      </div>

      <div class="ce-field">
        <label>Option 4</label>
        <input type="text" class="qOpt">
      </div>

      <div class="ce-field ce-field-wide">
        <label>Correct Answer</label>
        <input
          type="text"
          id="qCorrectSingle"
          placeholder="Must match one of the options exactly"
        >
      </div>
    `;
  } else if (type === "true_false") {
    qOptionsArea.innerHTML = `
      <div class="ce-field ce-field-wide">
        <label>Correct Answer</label>

        <select id="qCorrectBool">
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>
    `;
  } else if (type === "multiple_answer") {
    qOptionsArea.innerHTML = `
      <div class="ce-field">
        <label>Option 1</label>
        <input type="text" class="qOpt">
      </div>

      <div class="ce-field">
        <label>Option 2</label>
        <input type="text" class="qOpt">
      </div>

      <div class="ce-field">
        <label>Option 3</label>
        <input type="text" class="qOpt">
      </div>

      <div class="ce-field">
        <label>Option 4</label>
        <input type="text" class="qOpt">
      </div>

      <div class="ce-field ce-field-wide">
        <label>Correct Answers</label>
        <input
          type="text"
          id="qCorrectMulti"
          placeholder="Comma-separated, e.g. 4, 8"
        >
      </div>
    `;
  } else if (type === "short_answer") {
    qOptionsArea.innerHTML = `
      <div class="ce-field ce-field-wide">
        <label>Correct Answer (number)</label>
        <input type="number" id="qCorrectShort">
      </div>
    `;
  }
}

qTypeSelect.addEventListener("change", renderOptionsArea);
renderOptionsArea();

// ========================================
// عرض قائمة الأسئلة
// ========================================

function renderQuestionList() {
  const list = document.getElementById("questionList");
  const emptyState = document.getElementById("emptyState");
  const questionCount = document.getElementById("questionCount");

  questionCount.textContent =
    `${draftQuestions.length} question` +
    `${draftQuestions.length === 1 ? "" : "s"} added`;

  if (draftQuestions.length === 0) {
    list.innerHTML = "";

    if (emptyState) {
      list.appendChild(emptyState);
    }

    return;
  }

  list.innerHTML = draftQuestions
    .map(function (question, index) {
      return `
        <div class="ce-question-row">
          <div>
            <span class="ce-question-type">
              ${escapeHTML(question.type.replaceAll("_", " "))}
            </span>

            <p class="ce-question-text">
              ${index + 1}. ${escapeHTML(question.text)}
            </p>
          </div>

          <button
            type="button"
            class="ce-remove-btn"
            data-index="${index}"
          >
            Remove
          </button>
        </div>
      `;
    })
    .join("");

  list.querySelectorAll(".ce-remove-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      const questionIndex = Number(button.dataset.index);

      draftQuestions.splice(questionIndex, 1);

      renderQuestionList();
    });
  });
}

// ========================================
// تحميل الامتحان عند التعديل
// ========================================

function loadExamForEditing() {
  if (!editingExam) {
    renderQuestionList();
    return;
  }

  document.getElementById("examTitle").value =
    editingExam.title || "";

  document.getElementById("examDateTime").value =
    editingExam.dateTime || "";

  document.getElementById("examStatus").value =
    editingExam.status || "Inactive";

  // نسخة مستقلة من الأسئلة حتى لا تتغير البيانات
  // الأصلية قبل الضغط على Update Exam
  draftQuestions = Array.isArray(editingExam.questions)
    ? editingExam.questions.map(function (question) {
        return {
          ...question,

          options: Array.isArray(question.options)
            ? [...question.options]
            : undefined,

          correctAnswers: Array.isArray(question.correctAnswers)
            ? [...question.correctAnswers]
            : undefined,
        };
      })
    : [];

  const saveButton = document.getElementById("saveExamBtn");

  if (saveButton) {
    saveButton.textContent = "Update Exam";
  }

  const pageTitle = document.querySelector("h1");

  if (pageTitle) {
    pageTitle.textContent = "Edit Exam";
  }

  renderQuestionList();
}

loadExamForEditing();

// ========================================
// إضافة سؤال إلى المسودة
// ========================================

document
  .getElementById("addQuestionBtn")
  .addEventListener("click", function () {
    const type = qTypeSelect.value;
    const text = document.getElementById("qText").value.trim();

    hideError();

    if (!text) {
      showError("Please enter the question text.");
      return;
    }

    const question = {
      type: type,
      text: text,
    };

    if (type === "mcq") {
      const options = Array.from(
        document.querySelectorAll(".qOpt")
      )
        .map(function (input) {
          return input.value.trim();
        })
        .filter(Boolean);

      const correctAnswer = document
        .getElementById("qCorrectSingle")
        .value.trim();

      if (options.length < 2) {
        showError("Add at least 2 options.");
        return;
      }

      if (!correctAnswer) {
        showError("Please enter the correct answer.");
        return;
      }

      if (!options.includes(correctAnswer)) {
        showError(
          "The correct answer must exactly match one of the options."
        );
        return;
      }

      question.options = options;
      question.correctAnswer = correctAnswer;
    } else if (type === "true_false") {
      question.correctAnswer =
        document.getElementById("qCorrectBool").value === "true";
    } else if (type === "multiple_answer") {
      const options = Array.from(
        document.querySelectorAll(".qOpt")
      )
        .map(function (input) {
          return input.value.trim();
        })
        .filter(Boolean);

      const correctAnswers = document
        .getElementById("qCorrectMulti")
        .value.split(",")
        .map(function (value) {
          return value.trim();
        })
        .filter(Boolean);

      if (options.length < 2) {
        showError("Add at least 2 options.");
        return;
      }

      if (correctAnswers.length === 0) {
        showError("Add at least 1 correct answer.");
        return;
      }

      const hasInvalidAnswer = correctAnswers.some(function (answer) {
        return !options.includes(answer);
      });

      if (hasInvalidAnswer) {
        showError(
          "Every correct answer must exactly match one of the options."
        );
        return;
      }

      question.options = options;
      question.correctAnswers = correctAnswers;
    } else if (type === "short_answer") {
      const correctAnswer =
        document.getElementById("qCorrectShort").value;

      if (correctAnswer === "") {
        showError("Please enter the correct numeric answer.");
        return;
      }

      question.correctAnswer = Number(correctAnswer);
    }

    draftQuestions.push(question);

    renderQuestionList();
    resetQuestionForm();
  });

// ========================================
// حفظ أو تعديل الامتحان
// ========================================

document
  .getElementById("saveExamBtn")
  .addEventListener("click", function () {
    const title = document
      .getElementById("examTitle")
      .value.trim();

    const dateTime =
      document.getElementById("examDateTime").value;

    const status =
      document.getElementById("examStatus").value;

    hideError();

    if (!title || !dateTime) {
      showError(
        "Please fill in the exam title and date/time."
      );
      return;
    }

    if (draftQuestions.length === 0) {
      showError(
        "Add at least one question before saving."
      );
      return;
    }

    if (editingExamId) {
      // الأسئلة القديمة تحتفظ بالـ id الخاص بها.
      // السؤال الجديد فقط يحصل على id جديد.
      const updatedQuestions = draftQuestions.map(
        function (question) {
          if (question.id) {
            return question;
          }

          return {
            id: generateId("q"),
            ...question,
          };
        }
      );

      updateExam(editingExamId, {
        title: title,
        dateTime: dateTime,
        status: status,
        numQuestions: updatedQuestions.length,
        questions: updatedQuestions,
      });
    } else {
      const newExam = addExam({
        title: title,
        dateTime: dateTime,
        status: status,
        numQuestions: draftQuestions.length,
      });

      draftQuestions.forEach(function (question) {
        addQuestionToExam(newExam.id, question);
      });
    }

    window.location.href = "exams.html";
  });

// ========================================
// دوال مساعدة
// ========================================

function resetQuestionForm() {
  document.getElementById("qText").value = "";
  qTypeSelect.value = "mcq";
  renderOptionsArea();
}

function showError(message) {
  formError.textContent = message;
  formError.style.display = "block";
}

function hideError() {
  formError.textContent = "";
  formError.style.display = "none";
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}