// Check that the logged-in user is a student
const student = requireRole("Student");

if (student) {

    // Display profile card

    document.getElementById("studentName").textContent =
        student.name || "Student";

    document.getElementById("studentRole").textContent =
        student.role || "Student";

    document.getElementById("studentImage").src =
        student.image || "../assets/images/person.png";


    // Display personal information

    document.getElementById("fullName").textContent =
        student.name || "Not provided";

    document.getElementById("gender").textContent =
        student.gender || "Not provided";

    document.getElementById("nationalId").textContent =
        student.nationalId || "Not provided";

    document.getElementById("phoneNumber").textContent =
        student.phone || "Not provided";


    // Display account details

    document.getElementById("email").textContent =
        student.email || "Not provided";

    document.getElementById("username").textContent =
        student.username || "Not provided";

    document.getElementById("role").textContent =
        student.role || "Student";

    document.getElementById("status").textContent =
        student.status || "Active";
}




/*document.getElementById("logoutBtn").onclick = function () {

    logout();

};*/
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("exam_session");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("selectedExamId");

        sessionStorage.clear();

        window.location.href = "../index.html";
    });
}