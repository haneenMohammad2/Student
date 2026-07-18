/**
 * student-details.js
 * ------------------------------------------------------------
 * Logic for teacher/student-details.html.
 * Reads ?studentId=... from the URL, shows that student's
 * profile info + full exam history, and lets the teacher expand
 * any exam to see a question-by-question answer review
 * (via getAnswerReview() from storage.js).
 *
 * Depends on storage.js and auth.js being loaded first.
 * ------------------------------------------------------------
 */

const teacher = requireRole("Teacher");

document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const studentId = params.get("studentId");
  const student = studentId ? getStudentById(studentId) : null;

  const pageContent = document.getElementById("pageContent");
  const notFoundMessage = document.getElementById("notFoundMessage");

  if (!student) {
    pageContent.style.display = "none";
    notFoundMessage.style.display = "block";
    return;
  }

  // ---- Student info card ----
  document.getElementById("studentPageTitle").textContent = student.name;
  document.getElementById("studentName").textContent = student.name;
  document.getElementById("studentGender").textContent = student.gender || "Not specified";
  document.getElementById("studentNationalId").textContent = student.nationalId || "Not provided";
  document.getElementById("studentPhone").textContent = student.phone || "Not provided";
  document.getElementById("studentUsername").textContent = student.username;

  // ---- Exam history ----
  const results = getResultsByStudent(student.id);
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;
  const average = results.length
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0;

  document.getElementById("studentAverage").textContent = results.length ? `${average}%` : "No exams yet";
  document.getElementById("statExamsTaken").textContent = results.length;
  document.getElementById("statPassed").textContent = passedCount;
  document.getElementById("statFailed").textContent = failedCount;

  const listContainer = document.getElementById("examHistoryList");

  if (!results.length) {
    listContainer.innerHTML = `<p class="empty-message">This student hasn't taken any exams yet.</p>`;
    return;
  }

  listContainer.innerHTML = results.map((result, index) => {
    const exam = getExamById(result.examId);
    const examTitle = exam ? exam.title : "Unknown Exam";
    const dateLabel = result.dateTaken
      ? new Date(result.dateTaken).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : "No date";
    const statusClass = result.passed ? "success" : "danger";
    const statusLabel = result.passed ? "Passed" : "Failed";

    return `
      <div class="ce-question-row" style="flex-direction: column; align-items: stretch; gap: 0.75rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap;">
          <div>
            <p class="ce-question-text" style="font-weight:700;">${escapeHTML(examTitle)}</p>
            <p style="margin:0; font-size:0.82rem; color:var(--color-text-soft);">${dateLabel}</p>
          </div>
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <span class="mono-score" style="font-weight:700;">${result.score}%</span>
            <span class="status-pill ${statusClass}">${statusLabel}</span>
            <button type="button" class="btn-outline" data-toggle-review="${index}">Show Answers</button>
          </div>
        </div>
        <div id="review-${index}" style="display:none;"></div>
      </div>
    `;
  }).join("");

  // Wire up "Show Answers" toggle buttons (built fresh each render)
  listContainer.querySelectorAll("[data-toggle-review]").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = btn.dataset.toggleReview;
      const reviewContainer = document.getElementById(`review-${index}`);
      const isHidden = reviewContainer.style.display === "none";

      if (isHidden && !reviewContainer.dataset.loaded) {
        reviewContainer.innerHTML = renderAnswerReview(results[index]);
        reviewContainer.dataset.loaded = "true";
      }

      reviewContainer.style.display = isHidden ? "block" : "none";
      btn.textContent = isHidden ? "Hide Answers" : "Show Answers";
    });
  });
});

function renderAnswerReview(result) {
  const review = getAnswerReview(result);

  if (!review.length) {
    return `<p class="empty-message">No answer details available for this exam.</p>`;
  }

  return `
    <div style="border-top:1px solid var(--color-border); padding-top:0.75rem; display:flex; flex-direction:column; gap:0.6rem;">
      ${review.map((item, i) => {
        const answerClass = item.isCorrect ? "success" : "danger";
        const studentAnswerDisplay = Array.isArray(item.studentAnswer)
          ? item.studentAnswer.join(", ")
          : String(item.studentAnswer ?? "-");

        return `
          <div style="background:var(--color-bg-tint); border-radius:var(--radius); padding:0.75rem 1rem;">
            <p style="margin:0 0 0.4rem; font-size:0.88rem; font-weight:600;">
              ${i + 1}. ${escapeHTML(item.questionText)}
            </p>
            <div style="display:flex; flex-wrap:wrap; gap:1.5rem; font-size:0.82rem;">
              <span>
                Student's answer:
                <strong style="color: ${item.isCorrect ? "var(--color-pass)" : "var(--color-fail)"};">
                  ${escapeHTML(studentAnswerDisplay)}
                </strong>
              </span>
              ${!item.isCorrect ? `
                <span>
                  Correct answer:
                  <strong style="color: var(--color-pass);">${escapeHTML(String(item.correctAnswer))}</strong>
                </span>
              ` : ""}
              <span class="status-pill ${answerClass}" style="margin-inline-start:auto;">
                ${item.isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}