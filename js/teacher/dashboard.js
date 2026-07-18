window.addEventListener("DOMContentLoaded", function () {
    // قراءة أحدث البيانات من localStorage
    const students = getStudents();
    const exams = getExams();
    const activeExams = getActiveExams();
    const allResults = getResults();

    // ==============================
    // Teacher Name
    // ==============================

    const teacher = getCurrentUser();
    const teacherNameElement = document.getElementById("teacherName");

    if (teacher && teacherNameElement) {
        const teacherName =
            teacher.name ||
            teacher.fullName ||
            teacher.username ||
            "Teacher";

        teacherNameElement.textContent =
            teacherName.toUpperCase();
    }

    // ==============================
    // Dashboard Statistics
    // ==============================

    const totalStudentsElement =
        document.getElementById("totalStudents");

    const totalExamsElement =
        document.getElementById("totalExams");

    const activeExamsElement =
        document.getElementById("activeExams");

    if (totalStudentsElement) {
        totalStudentsElement.textContent =
            students.length;
    }

    if (totalExamsElement) {
        totalExamsElement.textContent =
            exams.length;
    }

    if (activeExamsElement) {
        activeExamsElement.textContent =
            activeExams.length;
    }

    // ==============================
    // Recent Students Table
    // ==============================

    const tbodyDashboard =
        document.getElementById("recentStudentsTable");

    if (tbodyDashboard) {
        tbodyDashboard.innerHTML = "";

        const recentStudents = students
            .slice(-3)
            .reverse();

        if (recentStudents.length === 0) {
            tbodyDashboard.innerHTML = `
                <tr>
                    <td colspan="4">
                        No students found.
                    </td>
                </tr>
            `;
        } else {
            recentStudents.forEach(function (student) {
                const studentResults =
                    getResultsByStudent(student.id);

                const studentName =
                    student.name ||
                    student.fullName ||
                    student.username ||
                    "Unknown Student";

                let average = 0;
                let lastExam = "No exams";

                if (studentResults.length > 0) {
                    average = Math.round(
                        studentResults.reduce(
                            function (sum, result) {
                                return (
                                    sum +
                                    getResultPercentage(result)
                                );
                            },
                            0
                        ) / studentResults.length
                    );

                    const sortedResults = [
                        ...studentResults
                    ].sort(function (a, b) {
                        return (
                            getResultDate(b) -
                            getResultDate(a)
                        );
                    });

                    const lastResult = sortedResults[0];

                    const exam = getExamById(
                        lastResult.examId
                    );

                    if (exam) {
                        lastExam =
                            exam.title ||
                            exam.name ||
                            "Unknown Exam";
                    }
                }

                const initials = getInitials(studentName);
                const badgeClass =
                    getGradeBadgeClass(average);

                tbodyDashboard.innerHTML += `
                    <tr>
                        <td>
                            <div class="student-name-cell">
                                <div class="student-avatar">
                                    ${escapeHTML(initials)}
                                </div>

                                <span>
                                    ${escapeHTML(studentName)}
                                </span>
                            </div>
                        </td>

                        <td>
                            <span class="grade-badge ${badgeClass}">
                                ${average}%
                            </span>
                        </td>

                        <td>
                            ${escapeHTML(lastExam)}
                        </td>

                        <td>
                            <button
                                type="button"
                                class="btn-view"
                                onclick="viewStudent('${student.id}')"
                            >
                                View
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    }

    // ==============================
    // Recent Exam Results
    // ==============================

    const recentResultsContainer =
        document.getElementById("recentResults");

    if (recentResultsContainer) {
        recentResultsContainer.innerHTML = "";

        const recentExams = exams
            .slice(-3)
            .reverse();

        if (recentExams.length === 0) {
            recentResultsContainer.innerHTML = `
                <p>No exam results found.</p>
            `;
        } else {
            recentExams.forEach(function (exam) {
                const examResults = allResults.filter(
                    function (result) {
                        return result.examId === exam.id;
                    }
                );

                const submitted = examResults.length;

                let average = 0;

                if (submitted > 0) {
                    average = Math.round(
                        examResults.reduce(
                            function (sum, result) {
                                return (
                                    sum +
                                    getResultPercentage(result)
                                );
                            },
                            0
                        ) / submitted
                    );
                }

                const averageClass =
                    getGradeBadgeClass(average);

                const examTitle =
                    exam.title ||
                    exam.name ||
                    "Untitled Exam";

                recentResultsContainer.innerHTML += `
                    <div class="result-row">
                        <div class="average ${averageClass}">
                            ${average}
                        </div>

                        <div class="result-details">
                            <p class="title-exam">
                                ${escapeHTML(examTitle)}
                            </p>

                            <p class="students-count">
                                ${submitted}
                                student${submitted !== 1 ? "s" : ""}
                                submitted
                            </p>
                        </div>
                    </div>
                `;
            });
        }
    }

    // ==============================
    // Exam Status
    // ==============================

    const examStatusContainer =
        document.getElementById(
            "examStatusContainer"
        );

    if (examStatusContainer) {
        examStatusContainer.innerHTML = "";

        const recentExams = exams
            .slice(-3)
            .reverse();

        if (recentExams.length === 0) {
            examStatusContainer.innerHTML = `
                <p>No exams found.</p>
            `;
        } else {
            recentExams.forEach(function (exam) {
                const examStatus =
                    exam.status || "Inactive";

                const statusClass =
                    examStatus === "Active"
                        ? "active"
                        : "draft";

                const examTitle =
                    exam.title ||
                    exam.name ||
                    "Untitled Exam";

                examStatusContainer.innerHTML += `
                    <div class="status-row">
                        <div class="title-exam-status">
                            ${escapeHTML(examTitle)}
                        </div>

                        <div class="activation ${statusClass}">
                            ${escapeHTML(examStatus)}
                        </div>
                    </div>
                `;
            });
        }
    }

    // ==============================
    // Logout
    // ==============================

    const logoutLink =
        document.getElementById("logoutLink");

    if (logoutLink) {
        logoutLink.addEventListener(
            "click",
            function (event) {
                event.preventDefault();

                clearSession();
                sessionStorage.clear();

                window.location.href =
                    "../index.html";
            }
        );
    }
});

// ========================================
// Helper Functions
// ========================================

function getResultPercentage(result) {
    if (!result) {
        return 0;
    }

    // إذا كانت النسبة مخزنة مباشرة
    if (
        result.percentage !== undefined &&
        result.percentage !== null
    ) {
        const percentage =
            Number(result.percentage);

        return Number.isNaN(percentage)
            ? 0
            : percentage;
    }

    // إذا كانت score عبارة عن نسبة جاهزة
    if (
        result.score !== undefined &&
        result.score !== null &&
        !result.totalQuestions
    ) {
        const score = Number(result.score);

        return Number.isNaN(score)
            ? 0
            : score;
    }

    // إذا كانت النتيجة مثل 8 من 10
    if (
        result.score !== undefined &&
        result.totalQuestions !== undefined
    ) {
        const score = Number(result.score);
        const totalQuestions =
            Number(result.totalQuestions);

        if (
            Number.isNaN(score) ||
            Number.isNaN(totalQuestions) ||
            totalQuestions <= 0
        ) {
            return 0;
        }

        return (
            (score / totalQuestions) *
            100
        );
    }

    // إذا كان اسم عدد الأسئلة total
    if (
        result.score !== undefined &&
        result.total !== undefined
    ) {
        const score = Number(result.score);
        const total = Number(result.total);

        if (
            Number.isNaN(score) ||
            Number.isNaN(total) ||
            total <= 0
        ) {
            return 0;
        }

        return (score / total) * 100;
    }

    return 0;
}

function getGradeBadgeClass(average) {
    if (average >= 85) {
        return "high";
    }

    if (average >= 70) {
        return "mid";
    }

    return "low";
}

function getInitials(name) {
    return String(name)
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(function (word) {
            return word.charAt(0);
        })
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function getResultDate(result) {
    const dateValue =
        result.submittedAt ||
        result.createdAt ||
        result.dateTime ||
        result.date;

    if (!dateValue) {
        return 0;
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return 0;
    }

    return date.getTime();
}

function viewStudent(studentId) {
    window.location.href =
        `student-details.html?studentId=${encodeURIComponent(studentId)}`;
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}