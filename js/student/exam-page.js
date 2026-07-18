

// Check that the logged-in user is a student
const student = requireRole("Student");

// Stop the code if the user is not a student
if (!student) {
    throw new Error("Student login is required");
}

const results = getResults();

const selectedExamId =
    localStorage.getItem("selectedExamId");

const exam =
    getExamById(selectedExamId);


// =========================
// Get saved exam progress
// =========================

let currentQuestion =
    Number(
        sessionStorage.getItem("currentQuestion")
    ) || 0;

let studentAnswers =
    safeParse(
        sessionStorage.getItem("studentAnswers"),
        {}
    );


// =========================
// Get HTML elements
// =========================

const examTitle =
    document.getElementById("examTitle");

const currentQuestionNumber =
    document.getElementById(
        "currentQuestionNumber"
    );

const totalQuestions =
    document.getElementById("totalQuestions");

const questionLabel =
    document.getElementById("questionLabel");

const questionType =
    document.getElementById("questionType");

const questionText =
    document.getElementById("questionText");

const answersContainer =
    document.getElementById("answersContainer");

const answerMessage =
    document.getElementById("answerMessage");

const progressBar =
    document.getElementById("progressBar");

const previousBtn =
    document.getElementById("previousBtn");

const nextBtn =
    document.getElementById("nextBtn");

const submitBtn =
    document.getElementById("submitBtn");

const timer =
    document.getElementById("timer");


// Timer placeholder

timer.textContent = "--:--";


// =========================
// Check exam
// =========================

if (
    exam &&
    exam.questions &&
    exam.questions.length > 0
) {

    if (
        currentQuestion >=
        exam.questions.length
    ) {
        currentQuestion = 0;
    }

    examTitle.textContent =
        exam.title;

    totalQuestions.textContent =
        exam.questions.length;

    showQuestion();

} else {

    questionText.textContent =
        "Exam not found";

    previousBtn.style.display = "none";
    nextBtn.style.display = "none";
    submitBtn.style.display = "none";
}


// =========================
// Display question
// =========================

function showQuestion() {

    const question =
        exam.questions[currentQuestion];

    const questionNumber =
        currentQuestion + 1;


    currentQuestionNumber.textContent =
        questionNumber;

    questionLabel.textContent =
        "QUESTION " + questionNumber;

    questionType.textContent =
        question.type;

    questionText.textContent =
        question.text;

    answersContainer.innerHTML = "";

    answerMessage.textContent = "";


    // Update progress bar

    const progress =
        (
            questionNumber /
            exam.questions.length
        ) * 100;

    progressBar.style.width =
        progress + "%";


    // MCQ question

    if (question.type === "mcq") {

        question.options.forEach(
            function (option) {

                answersContainer.innerHTML += `
                    <label class="answer-option">

                        <input
                            type="radio"
                            name="answer"
                            value="${option}"
                        >

                        <span>${option}</span>

                    </label>
                `;

            }
        );

    }


    // True or False question

    else if (
        question.type === "true_false"
    ) {

        answersContainer.innerHTML = `
            <label class="answer-option">

                <input
                    type="radio"
                    name="answer"
                    value="true"
                >

                <span>True</span>

            </label>

            <label class="answer-option">

                <input
                    type="radio"
                    name="answer"
                    value="false"
                >

                <span>False</span>

            </label>
        `;

    }


    // Multiple answers question

    else if (
        question.type === "multiple_answer"
    ) {

        question.options.forEach(
            function (option) {

                answersContainer.innerHTML += `
                    <label class="answer-option">

                        <input
                            type="checkbox"
                            name="answer"
                            value="${option}"
                        >

                        <span>${option}</span>

                    </label>
                `;

            }
        );

    }


    // Short answer question

    else if (
        question.type === "short_answer"
    ) {

        answersContainer.innerHTML = `
            <input
                type="number"
                id="shortAnswer"
                class="short-answer-input"
                placeholder="Enter your answer"
            >
        `;

    }


    // Show saved answer

    showSavedAnswer(question);


    // Previous button

    previousBtn.disabled =
        currentQuestion === 0;


    // Next and Submit buttons

    if (
        currentQuestion ===
        exam.questions.length - 1
    ) {

        nextBtn.style.display = "none";

        submitBtn.style.display = "block";

    } else {

        nextBtn.style.display = "block";

        submitBtn.style.display = "none";

    }
}


// =========================
// Show saved answer
// =========================

function showSavedAnswer(question) {

    const savedAnswer =
        studentAnswers[question.id];

    if (savedAnswer === undefined) {
        return;
    }


    // Short answer

    if (
        question.type === "short_answer"
    ) {

        document.getElementById(
            "shortAnswer"
        ).value = savedAnswer;

        return;

    }


    // Other question types

    const inputs =
        document.getElementsByName("answer");

    inputs.forEach(function (input) {

        if (
            question.type ===
            "multiple_answer"
        ) {

            if (
                savedAnswer.includes(
                    input.value
                )
            ) {
                input.checked = true;
            }

        } else {

            if (
                input.value ===
                String(savedAnswer)
            ) {
                input.checked = true;
            }

        }

    });
}


// =========================
// Save current answer
// =========================

function saveAnswer() {

    const question =
        exam.questions[currentQuestion];

    let answer;


    // Short answer

    if (
        question.type === "short_answer"
    ) {

        answer =
            document.getElementById(
                "shortAnswer"
            ).value;

        if (answer === "") {

            answerMessage.textContent =
                "Please enter an answer";

            return false;

        }

    }


    // Multiple answers

    else if (
        question.type ===
        "multiple_answer"
    ) {

        answer = [];

        const inputs =
            document.getElementsByName(
                "answer"
            );

        inputs.forEach(function (input) {

            if (input.checked) {
                answer.push(input.value);
            }

        });

        if (answer.length === 0) {

            answerMessage.textContent =
                "Please select an answer";

            return false;

        }

    }


    // MCQ and True/False

    else {

        const inputs =
            document.getElementsByName(
                "answer"
            );

        inputs.forEach(function (input) {

            if (input.checked) {
                answer = input.value;
            }

        });

        if (answer === undefined) {

            answerMessage.textContent =
                "Please select an answer";

            return false;

        }

    }


    // Save answer temporarily

    studentAnswers[question.id] =
        answer;

    sessionStorage.setItem(
        "studentAnswers",
        JSON.stringify(studentAnswers)
    );

    answerMessage.textContent = "";

    return true;
}


// =========================
// Next button
// =========================

nextBtn.onclick = function () {

    if (saveAnswer() === false) {
        return;
    }

    currentQuestion++;

    sessionStorage.setItem(
        "currentQuestion",
        currentQuestion
    );

    showQuestion();
};


// =========================
// Previous button
// =========================

previousBtn.onclick = function () {

    if (currentQuestion > 0) {

        currentQuestion--;

        sessionStorage.setItem(
            "currentQuestion",
            currentQuestion
        );

        showQuestion();

    }
};


// =========================
// Submit button
// =========================

submitBtn.onclick = function () {

    if (saveAnswer() === false) {
        return;
    }

    calculateResult();
};


// =========================
// Calculate result
// =========================

// =========================
// Calculate result
// =========================

function calculateResult() {

    // Prevent submitting the same exam twice

    const oldResult =
        getResultByStudentAndExam(
            student.id,
            exam.id
        );

    if (oldResult) {
        showResult(oldResult);
        return;
    }


    let correctAnswersCount = 0;


    exam.questions.forEach(
        function (question) {

            const studentAnswer =
                studentAnswers[question.id];


            if (
                isAnswerCorrect(
                    question,
                    studentAnswer
                )
            ) {
                correctAnswersCount++;
            }

        }
    );


    const score = Math.round(
        (
            correctAnswersCount /
            exam.questions.length
        ) * 100
    );


    const passed =
        score >= 50;


    const formattedAnswers =
        exam.questions.map(
            function (question) {

                return {
                    questionId:
                        question.id,

                    studentAnswer:
                        studentAnswers[
                            question.id
                        ]
                };

            }
        );


    const result = {

        id: generateId("r"),

        studentId: student.id,

        examId: exam.id,

        answers: formattedAnswers,

        score: score,

        passed: passed,

        dateTaken:
            new Date().toISOString()

    };


    results.push(result);

    saveResults(results);


    localStorage.setItem(
        "selectedResultId",
        result.id
    );


    sessionStorage.removeItem(
        "currentQuestion"
    );

    sessionStorage.removeItem(
        "studentAnswers"
    );

    sessionStorage.removeItem(
        "reviewMode"
    );


    // Display result inside the same page

    showResult(result);
}


// =========================
// Get result elements
// =========================

const examContent =
    document.getElementById("examContent");

const resultSection =
    document.getElementById("resultSection");

const reviewSection =
    document.getElementById("reviewSection");

const progressContainer =
    document.getElementById("progressContainer");

const examHeaderInfo =
    document.getElementById("examHeaderInfo");

const resultIcon =
    document.getElementById("resultIcon");

const resultTitle =
    document.getElementById("resultTitle");

const resultExamName =
    document.getElementById("resultExamName");

const resultStatus =
    document.getElementById("resultStatus");

const scoreElement =
    document.getElementById("score");

const correctAnswersElement =
    document.getElementById("correctAnswers");

const incorrectAnswersElement =
    document.getElementById("incorrectAnswers");

const totalResultQuestions =
    document.getElementById("totalResultQuestions");

const resultMessage =
    document.getElementById("resultMessage");

const reviewAnswersBtn =
    document.getElementById("reviewAnswersBtn");

const backToResultBtn =
    document.getElementById("backToResultBtn");

const reviewAnswersContainer =
    document.getElementById(
        "reviewAnswersContainer"
    );


// =========================
// Display result
// =========================

function showResult(result) {

    examContent.hidden = true;

    resultSection.hidden = false;

    reviewSection.hidden = true;

    progressContainer.style.display =
        "none";

    examHeaderInfo.style.display =
        "none";


    const total =
        exam.questions.length;

    const correct =
        Math.round(
            (
                Number(result.score) /
                100
            ) * total
        );

    const incorrect =
        total - correct;


    resultExamName.textContent =
        exam.title;

    scoreElement.textContent =
        result.score + "%";

    correctAnswersElement.textContent =
        correct;

    incorrectAnswersElement.textContent =
        incorrect;

    totalResultQuestions.textContent =
        total;


    resultSection.classList.remove(
        "passed",
        "failed"
    );


   if (result.passed === true) {

    resultSection.classList.add("passed");

    resultIcon.innerHTML = `
        <img
            src="../assets/images/happy.png"
            alt="Happy smile"
        >
    `;

    resultTitle.textContent =
        "Congratulations!";

    resultStatus.textContent =
        "Passed";

    resultMessage.textContent =
        "You passed the exam successfully.";

} else {

    resultSection.classList.add("failed");

    resultIcon.innerHTML = `
        <img
            src="..../assets/images/sad.png"
            alt="Sad smile"
        >
    `;

    resultTitle.textContent =
        "Exam Completed";

    resultStatus.textContent =
        "Failed";

    resultMessage.textContent =
        "Keep practicing and try again next time.";
}

// =========================
// Review button
// =========================

reviewAnswersBtn.addEventListener(
    "click",
    function () {

        const result =
            getResultByStudentAndExam(
                student.id,
                exam.id
            );


        if (!result) {
            return;
        }


        showReviewAnswers(result);

    }
);


// =========================
// Display reviewed answers
// =========================

function showReviewAnswers(result) {

    examContent.hidden = true;

    resultSection.hidden = true;

    reviewSection.hidden = false;

    progressContainer.style.display =
        "none";

    examHeaderInfo.style.display =
        "none";

    reviewAnswersContainer.innerHTML =
        "";


    const reviewedAnswers =
        getAnswerReview(result);


    reviewedAnswers.forEach(
        function (answer, index) {

            const answerClass =
                answer.isCorrect
                    ? "correct"
                    : "incorrect";


            const studentAnswer =
                formatAnswer(
                    answer.studentAnswer
                );


            const correctAnswer =
                formatAnswer(
                    answer.correctAnswer
                );


            reviewAnswersContainer.innerHTML += `
                <article
                    class="review-answer-card ${answerClass}"
                >

                    <p class="review-question-number">
                        QUESTION ${index + 1}
                    </p>

                    <h3 class="review-question-text">
                        ${answer.questionText}
                    </h3>

                    <p
                        class="review-user-answer ${answerClass}"
                    >
                        <strong>Your answer:</strong>
                        ${studentAnswer}
                    </p>

                    <p class="review-correct-answer">
                        <strong>Correct answer:</strong>
                        ${correctAnswer}
                    </p>

                </article>
            `;

        }
    );
}


// =========================
// Format displayed answer
// =========================

function formatAnswer(answer) {

    if (Array.isArray(answer)) {
        return answer.join(", ");
    }


    if (
        answer === undefined ||
        answer === null ||
        answer === ""
    ) {
        return "No answer";
    }


    if (answer === true) {
        return "True";
    }


    if (answer === false) {
        return "False";
    }


    return String(answer);
}


// =========================
// Back to result
// =========================

backToResultBtn.addEventListener(
    "click",
    function () {

        const result =
            getResultByStudentAndExam(
                student.id,
                exam.id
            );


        if (result) {
            showResult(result);
        }

    }
);


// =========================
// Open page in review mode
// =========================

const reviewMode =
    sessionStorage.getItem(
        "reviewMode"
    ) === "true";


if (reviewMode) {

    const savedResult =
        getResultByStudentAndExam(
            student.id,
            exam.id
        );


    if (savedResult) {
        showReviewAnswers(
            savedResult
        );
    }


    sessionStorage.removeItem(
        "reviewMode"
    );
}}