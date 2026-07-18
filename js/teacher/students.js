const students = getStudents();
const exams = getExams();
const activeExams = getActiveExams();

window.addEventListener("DOMContentLoaded", () => {
    // Dashboard statistics
    document.getElementById("totalStudents").textContent = students.length;
    document.getElementById("totalExams").textContent = exams.length;
    document.getElementById("activeExams").textContent = activeExams.length;

    // Recent students table
    const tbodyDashboard = document.getElementById("recentStudentsTable");
    tbodyDashboard.innerHTML = "";

    students.forEach((student) => {
        const results = getResultsByStudent(student.id);

        let avg = 0;
        let lastExam = "No exams";

        if (results.length > 0) {
            // Change "score" if your result object uses another property
            avg = Math.round(
                results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length
            );

            const lastResult = results[results.length - 1];
            const exam = getExamById(lastResult.examId);

            if (exam) {
                lastExam = exam.title || exam.name || "Unknown Exam";
            }
        }

        // Avatar initials
        const initials = student.name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase();

        // Grade color
        let badgeClass = "low";
        if (avg >= 85) {
            badgeClass = "high";
        } else if (avg >= 70) {
            badgeClass = "mid";
        }
        else {
            badgeClass = "low";
        }

        tbodyDashboard.innerHTML += `
            <tr>
                <td>
                    <div class="student-name-cell">
                        <div class="student-avatar">${initials}</div>
                        <span>${student.name}</span>
                    </div>
                </td>
                <td>
                    <span class="grade-badge ${badgeClass}">
                        ${avg}%
                    </span>
                </td>
                <td>${lastExam}</td>
                <td>
                    <button class="btn-view">View</button>
                </td>
            </tr>
        `;
    });

    const recentResults = document.getElementById("recentResults");

    recentResults.innerHTML = "";

    const results = getResults();

    // Show the latest 3 exams
    exams.slice(-3).reverse().forEach(exam => {
        const examResults = results.filter(r => r.examId === exam.id);

        const submitted = examResults.length;

        let average = 0;

        if (submitted > 0) {
            average = Math.round(
                examResults.reduce((sum, r) => sum + (r.score || 0), 0) / submitted
            );
        }

        let avgClass = "";
        if (average >= 85) avgClass = "high";
        else if (average >= 70) avgClass = "mid";
        else avgClass = "low";

        recentResults.innerHTML += `
            <div class="result-row">
                <div class="average ${avgClass}">
                    ${average}
                </div>

                <div class="result-details">
                    <p class="title-exam">${exam.title || exam.name}</p>
                    <p class="students-count">
                        ${submitted} student${submitted !== 1 ? "s" : ""} submitted
                    </p>
                </div>
            </div>
        `;
    });

    // Exam Status
    const examStatusContainer = document.getElementById("examStatusContainer");

    examStatusContainer.innerHTML = "";

    exams.slice(-3).reverse().forEach((exam) => {

        const statusClass = exam.status === "Active" ? "active" : "draft";

        examStatusContainer.innerHTML += `
            <div class="status-row">
                <div class="title-exam-status">
                    ${exam.title || exam.name}
                </div>

                <div class="activation ${statusClass}">
                    ${exam.status}
                </div>
            </div>
        `;

    });
});
const logoutLink = document.getElementById("logoutLink");

if (logoutLink) {
    logoutLink.addEventListener("click", function (event) {
        event.preventDefault();

        localStorage.removeItem("exam_session");
        sessionStorage.clear();

        window.location.href = "../index.html";
    });
}