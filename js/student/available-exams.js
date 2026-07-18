const student = requireRole("Student");

document.getElementById("logoutLink").addEventListener("click", function (e) {
  e.preventDefault();
  logout();
});

if (student) {
  const activeExams = getActiveExams();

  const container = document.getElementById("examsContainer");
  const emptyMessage = document.getElementById("emptyMessage");

  if (!activeExams.length) {
    container.style.display = "none";
    emptyMessage.style.display = "block";
  } else {
    container.style.display = "";
    emptyMessage.style.display = "none";

    container.innerHTML = activeExams.map((exam) => {
      const dateObj = exam.dateTime ? new Date(exam.dateTime) : null;
      const dateLabel = dateObj
        ? dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
        : "-";
      const timeLabel = dateObj
        ? dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
        : "-";

  
      const alreadyTaken = hasStudentTakenExam(student.id, exam.id);
      const buttonHtml = alreadyTaken
        ? `<button type="button" class="start-exam-button completed" disabled>Already Submitted</button>`
        : `<button type="button" class="start-exam-button" onclick="startExam('${exam.id}')">Start Exam</button>`;

      return `
        <div class="exam-card">
          <div class="exam-top">
            <span class="exam-priority">Active</span>
          </div>
          <h3>${exam.title}</h3>
          <p class="exam-subject">${exam.numQuestions || exam.questions.length} Questions</p>
          <div class="exam-details">
            <span>📅 ${dateLabel}</span>
            <span>🕐 ${timeLabel}</span>
          </div>
          ${buttonHtml}
        </div>
      `;
    }).join("");
  }
}


function startExam(examId) {
  localStorage.setItem("selectedExamId", examId);
  window.location.href = "exams.html";
}