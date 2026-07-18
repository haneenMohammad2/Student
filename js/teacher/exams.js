document.addEventListener("DOMContentLoaded", function () {
  updateDashboardStatistics();
  renderExamsTable();
});

function updateDashboardStatistics() {
  const totalExams = document.getElementById("totalExams");
  const activeExams = document.getElementById("activeExams");
  const inactiveExams = document.getElementById("inactiveExams");
  const totalSubmissions = document.getElementById("totalSubmissions");

  if (totalExams) {
    totalExams.textContent = getExams().length;
  }

  if (activeExams) {
    activeExams.textContent = getActiveExams().length;
  }

  if (inactiveExams) {
    inactiveExams.textContent = getInactiveExams().length;
  }

  if (totalSubmissions) {
    totalSubmissions.textContent = getTotalSubmissions();
  }
}

function renderExamsTable() {
  const tableBody = document.getElementById("examsTableBody");

  if (!tableBody) return;

  const exams = getExams();
  const results = getResults();

  tableBody.innerHTML = "";

  if (exams.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center;">
          No exams found
        </td>
      </tr>
    `;
    return;
  }

  exams.forEach(function (exam) {
    const questionsCount = Array.isArray(exam.questions)
      ? exam.questions.length
      : 0;

    const submissionsCount = results.filter(function (result) {
      return result.examId === exam.id;
    }).length;

    const examStatus = exam.status || "Inactive";

    const statusClass =
      examStatus === "Active" ? "success" : "danger";

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <span class="text-strong">
          ${escapeHTML(exam.title || "Untitled Exam")}
        </span>
      </td>

      <td>
        ${formatExamDate(exam.dateTime)}
      </td>

      <td>
        ${questionsCount}
        ${questionsCount === 1 ? "Question" : "Questions"}
      </td>

      <td>
        <span class="status-pill ${statusClass}">
          <span class="pill-dot"></span>
          ${escapeHTML(examStatus)}
        </span>
      </td>

      <td>
        ${submissionsCount}
        ${submissionsCount === 1 ? "Submission" : "Submissions"}
      </td>

      <td>
        <div class="row-actions">
          

          <button
            type="button"
            class="icon-btn edit"
            title="Edit"
            onclick="editExam('${exam.id}')"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"></path>
            </svg>
          </button>

          <button
            type="button"
            class="icon-btn delete"
            title="Delete"
            onclick="deleteExam('${exam.id}')"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
              <path d="M10 11v6"></path>
              <path d="M14 11v6"></path>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
            </svg>
          </button>
        </div>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

function deleteExam(examId) {
  const confirmed = confirm(
    "Are you sure you want to delete this exam?"
  );

  if (!confirmed) return;

  const updatedExams = getExams().filter(function (exam) {
    return exam.id !== examId;
  });

  saveExams(updatedExams);

  const updatedResults = getResults().filter(function (result) {
    return result.examId !== examId;
  });

  saveResults(updatedResults);

  renderExamsTable();
  updateDashboardStatistics();
}

function editExam(examId) {
  window.location.href =
    `create-exam.html?examId=${encodeURIComponent(examId)}`;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatExamDate(dateTime) {
  if (!dateTime) return "No date";

  const dateObj = new Date(dateTime);

  if (Number.isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  const formattedDate = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formattedDate}<br>at ${formattedTime}`;
}