const student = requireRole("Student");


/* =========================
   Logout
========================= */

const logoutControl =
    document.getElementById("logoutBtn") ||
    document.getElementById("logoutLink");

if (logoutControl) {
    logoutControl.addEventListener("click", function (event) {
        event.preventDefault();

        localStorage.removeItem("exam_session");
        sessionStorage.clear();

        window.location.href = "../index.html";
    });
}


/* =========================
   Display Exams
========================= */

if (student) {
    displayAvailableExams();
}


function displayAvailableExams() {
    const activeExams = getActiveExams();

    const container =
        document.getElementById("examsContainer");

    const emptyMessage =
        document.getElementById("emptyMessage");


    if (activeExams.length === 0) {
        container.style.display = "none";
        emptyMessage.style.display = "block";

        return;
    }


    container.style.display = "grid";
    emptyMessage.style.display = "none";
    container.innerHTML = "";


    activeExams.forEach(function (exam) {
        const dateObj =
            exam.dateTime
                ? new Date(exam.dateTime)
                : null;


        const dateLabel =
            dateObj
                ? dateObj.toLocaleDateString(
                    undefined,
                    {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                    }
                )
                : "-";


        const timeLabel =
            dateObj
                ? dateObj.toLocaleTimeString(
                    undefined,
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )
                : "-";


        const alreadyTaken =
            hasStudentTakenExam(student.id, exam.id);


        const reviewHtml = alreadyTaken
            ? `
                <button
                    type="button"
                    class="review-link"
                    onclick="reviewExam('${exam.id}')"
                >
                    Review Answers
                </button>
              `
            : "";


        const buttonHtml = alreadyTaken
            ? `
                <button
                    type="button"
                    class="start-exam-button completed"
                    disabled
                >
                    Already Submitted
                </button>
              `
            : `
                <button
                    type="button"
                    class="start-exam-button"
                    onclick="startExam('${exam.id}')"
                >
                    Start Exam
                </button>
              `;


        const questionsCount =
            exam.numQuestions ||
            exam.questions?.length ||
            0;


        container.innerHTML += `
            <div class="exam-card">

                <div class="exam-top">

                    <span class="exam-priority">
                        Active
                    </span>

                </div>

                <div class="exam-title-row">

                    <h3>
                        ${exam.title}
                    </h3>

                    ${reviewHtml}

                </div>

                <p class="exam-subject">
                    ${questionsCount} Questions
                </p>

                <div class="exam-details">

                    <span>
                        📅 ${dateLabel}
                    </span>

                    <span>
                        🕐 ${timeLabel}
                    </span>

                </div>

                ${buttonHtml}

            </div>
        `;
    });
}


/* =========================
   Start Exam
========================= */

function startExam(examId) {
    localStorage.setItem(
        "selectedExamId",
        examId
    );

    sessionStorage.removeItem("reviewMode");
    sessionStorage.removeItem("currentQuestion");
    sessionStorage.removeItem("studentAnswers");

    window.location.href = "exams.html";
}


/* =========================
   Review Answers
========================= */

function reviewExam(examId) {
    const result =
        getResultByStudentAndExam(
            student.id,
            examId
        );


    if (!result) {
        alert("Result not found.");
        return;
    }


    localStorage.setItem(
        "selectedExamId",
        examId
    );

    localStorage.setItem(
        "selectedResultId",
        result.id
    );

    sessionStorage.setItem(
        "reviewMode",
        "true"
    );

    window.location.href = "exams.html";
}