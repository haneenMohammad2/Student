// Check that the logged-in user is a student

const student = requireRole("Student");


if (student) {

    // =========================
    // Get data
    // =========================

    const activeExams =
        getActiveExams();

    const studentResults =
        getResultsByStudent(student.id);


    const pendingExamsList =
        activeExams.filter(function (exam) {
            return !hasStudentTakenExam(
                student.id,
                exam.id
            );
        });


    // =========================
    // Display student name
    // =========================

    const studentDisplayName =
        student.name ||
        student.fullName ||
        student.username ||
        "Student";


    document.getElementById(
        "studentName"
    ).textContent =
        studentDisplayName;


    // =========================
    // Calculate average grade
    // =========================

    let totalGrades = 0;


    studentResults.forEach(
        function (result) {
            totalGrades +=
                Number(result.score) || 0;
        }
    );


    let averageGrade = 0;


    if (studentResults.length > 0) {
        averageGrade =
            totalGrades /
            studentResults.length;
    }


    // =========================
    // Calculate passed percentage
    // =========================

    let passedResults = 0;


    studentResults.forEach(
        function (result) {
            if (result.passed === true) {
                passedResults++;
            }
        }
    );


    let passedPercentage = 0;


    if (studentResults.length > 0) {
        passedPercentage =
            (
                passedResults /
                studentResults.length
            ) * 100;
    }


    // =========================
    // Display statistics
    // =========================

    document.getElementById(
        "pendingExams"
    ).textContent =
        pendingExamsList.length;


    document.getElementById(
        "activeExams"
    ).textContent =
        activeExams.length;


    document.getElementById(
        "completedExams"
    ).textContent =
        studentResults.length;


    document.getElementById(
        "averageGrade"
    ).textContent =
        Math.round(averageGrade) + "%";


    document.getElementById(
        "passedPercentage"
    ).textContent =
        Math.round(passedPercentage) + "%";


    // =========================
    // Display available exams
    // =========================

    const examsContainer =
        document.getElementById(
            "examsContainer"
        );


    const noExamsMessage =
        document.getElementById(
            "noExamsMessage"
        );


    examsContainer.innerHTML = "";


    if (activeExams.length === 0) {

        noExamsMessage.style.display =
            "block";

    } else {

        noExamsMessage.style.display =
            "none";


        activeExams
            .slice(0, 3)
            .forEach(function (exam) {

                let questionsNumber = 0;


                if (
                    exam.questions &&
                    exam.questions.length > 0
                ) {
                    questionsNumber =
                        exam.questions.length;

                } else if (exam.numQuestions) {
                    questionsNumber =
                        exam.numQuestions;
                }


                const alreadyTaken =
                    hasStudentTakenExam(
                        student.id,
                        exam.id
                    );


                const reviewHtml =
                    alreadyTaken
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


                const buttonHtml =
                    alreadyTaken
                        ? `
                            <button
                                type="button"
                                class="start-exam-button completed"
                                disabled
                            >
                                ✓ Already Submitted
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


                examsContainer.innerHTML += `
                    <article class="exam-card">

                        <div class="exam-title-row">

                            <h3>
                                ${exam.title}
                            </h3>

                            ${reviewHtml}

                        </div>

                        <p class="exam-subject">
                            ${exam.dateTime || "No date"}
                        </p>

                        <div class="exam-details">

                            <span>
                                ${questionsNumber} Questions
                            </span>

                        </div>

                        ${buttonHtml}

                    </article>
                `;

            });

    }


    // =========================
    // Display latest results
    // =========================

    const resultsTable =
        document.getElementById(
            "resultsTable"
        );


    const noResultsMessage =
        document.getElementById(
            "noResultsMessage"
        );


    resultsTable.innerHTML = "";


    if (studentResults.length === 0) {

        noResultsMessage.style.display =
            "block";

    } else {

        noResultsMessage.style.display =
            "none";


        studentResults
            .slice(-3)
            .reverse()
            .forEach(function (result) {

                const exam =
                    getExamById(
                        result.examId
                    );


                let examTitle =
                    "Unknown Exam";


                if (exam) {
                    examTitle =
                        exam.title;
                }


                let status =
                    "Failed";


                if (result.passed === true) {
                    status =
                        "Passed";
                }


                let resultDate =
                    "No date";


                if (result.dateTaken) {
                    resultDate =
                        new Date(
                            result.dateTaken
                        ).toLocaleDateString();
                }


                resultsTable.innerHTML += `
                    <tr>

                        <td>
                            ${examTitle}
                        </td>

                        <td>
                            ${resultDate}
                        </td>

                        <td>
                            <span
                                class="status ${status.toLowerCase()}"
                            >
                                ${status}
                            </span>
                        </td>

                        <td class="score">
                            ${result.score}/100
                        </td>

                    </tr>
                `;

            });

    }

}


// =========================
// Start exam
// =========================

function startExam(examId) {

    const currentStudent =
        getCurrentUser();


    if (
        currentStudent &&
        hasStudentTakenExam(
            currentStudent.id,
            examId
        )
    ) {
        alert(
            "You have already submitted this exam."
        );

        return;
    }


    localStorage.setItem(
        "selectedExamId",
        examId
    );


    sessionStorage.removeItem(
        "reviewMode"
    );

    sessionStorage.removeItem(
        "currentQuestion"
    );

    sessionStorage.removeItem(
        "studentAnswers"
    );


    window.location.href =
        "exams.html";
}


// =========================
// Review answers
// =========================

function reviewExam(examId) {

    const currentStudent =
        getCurrentUser();


    if (!currentStudent) {
        window.location.href =
            "../index.html";

        return;
    }


    const result =
        getResultByStudentAndExam(
            currentStudent.id,
            examId
        );


    if (!result) {
        alert(
            "Result not found."
        );

        return;
    }


    localStorage.setItem(
        "selectedExamId",
        examId
    );


    if (result.id) {
        localStorage.setItem(
            "selectedResultId",
            result.id
        );
    }


    sessionStorage.setItem(
        "reviewMode",
        "true"
    );


    window.location.href =
        "exams.html";
}


// =========================
// Logout
// =========================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "exam_session"
            );

            localStorage.removeItem(
                "currentUser"
            );

            localStorage.removeItem(
                "selectedExamId"
            );

            localStorage.removeItem(
                "selectedResultId"
            );

            sessionStorage.clear();


            window.location.href =
                "../index.html";

        }
    );

}