document.addEventListener("DOMContentLoaded", function () {
  const studentsTableBody =
    document.getElementById("studentsTableBody");

  const totalStudentsElement =
    document.getElementById("totalStudents");

  const searchInput =
    document.getElementById("studentSearchInput");

  const paginationText =
    document.getElementById("studentsPaginationText");

  const addStudentButton =
    document.getElementById("addStudentBtn");

  const logoutLink =
    document.querySelector(".link-logout a");

  // التأكد أن المستخدم Teacher
  if (typeof requireRole === "function") {
    requireRole("Teacher");
  }

  // عرض الطلاب أول مرة
  renderStudents();

  // البحث عن طالب
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      renderStudents(searchInput.value);
    });
  }

  // الانتقال إلى صفحة إضافة طالب
  if (addStudentButton) {
    addStudentButton.addEventListener("click", function () {
      window.location.href = "add-student.html";
    });
  }

  // تسجيل الخروج
  if (logoutLink) {
    logoutLink.addEventListener("click", function (event) {
      event.preventDefault();

      clearSession();
      sessionStorage.clear();

      window.location.href = "../index.html";
    });
  }

  // ========================================
  // عرض الطلاب
  // ========================================

  function renderStudents(searchValue = "") {
    const students = getStudents();

    const normalizedSearch =
      String(searchValue).trim().toLowerCase();

    const filteredStudents = students.filter(function (student) {
      const studentName = getStudentName(student);
      const username = student.username || "";
      const phone = student.phone || student.phoneNumber || "";
      const nationalId =
        student.nationalId ||
        student.nationalID ||
        student.nationalNumber ||
        "";

      return (
        studentName.toLowerCase().includes(normalizedSearch) ||
        String(username).toLowerCase().includes(normalizedSearch) ||
        String(phone).toLowerCase().includes(normalizedSearch) ||
        String(nationalId).toLowerCase().includes(normalizedSearch)
      );
    });

    if (totalStudentsElement) {
      totalStudentsElement.textContent = students.length;
    }

    if (paginationText) {
      if (normalizedSearch) {
        paginationText.textContent =
          `Showing ${filteredStudents.length} of ${students.length} students`;
      } else {
        paginationText.textContent =
          `Showing ${students.length} student${students.length === 1 ? "" : "s"}`;
      }
    }

    if (!studentsTableBody) {
      return;
    }

    studentsTableBody.innerHTML = "";

    if (filteredStudents.length === 0) {
      studentsTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">
            ${
              normalizedSearch
                ? "No students match your search."
                : "No students found."
            }
          </td>
        </tr>
      `;

      return;
    }

    filteredStudents.forEach(function (student) {
      const studentName = getStudentName(student);
      const initials = getInitials(studentName);

      const gender =
        student.gender || "Not specified";

      const nationalId =
        student.nationalId ||
        student.nationalID ||
        student.nationalNumber ||
        "Not provided";

      const phone =
        student.phone ||
        student.phoneNumber ||
        "Not provided";

      const username =
        student.username || "Not provided";

      const status =
        student.status || "Active";

      const statusClass =
        status.toLowerCase() === "active"
          ? "success"
          : "neutral";

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>
          <div class="student-name-cell">
            <div class="student-avatar">
              ${escapeHTML(initials)}
            </div>

            <span class="text-strong">
              ${escapeHTML(studentName)}
            </span>
          </div>
        </td>

        <td>
          ${escapeHTML(gender)}
        </td>

        <td>
          ${escapeHTML(maskNationalId(nationalId))}
        </td>

        <td>
          ${escapeHTML(phone)}
        </td>

        <td>
          ${escapeHTML(username)}
        </td>

        <td>
          <span class="status-pill ${statusClass}">
            ${escapeHTML(status)}
          </span>
        </td>

        <td>
          <div class="row-actions">
            <button
              type="button"
              class="icon-btn edit"
              title="Edit"
              data-action="edit"
              data-student-id="${escapeHTML(student.id)}"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                ></path>

                <path
                  d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"
                ></path>
              </svg>
            </button>

            <button
              type="button"
              class="icon-btn delete"
              title="Delete"
              data-action="delete"
              data-student-id="${escapeHTML(student.id)}"
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

                <path
                  d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                ></path>

                <path d="M10 11v6"></path>
                <path d="M14 11v6"></path>

                <path
                  d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
                ></path>
              </svg>
            </button>
          </div>
        </td>
      `;

      studentsTableBody.appendChild(row);
    });
  }

  // ========================================
  // Edit وDelete باستخدام Event Delegation
  // ========================================

  if (studentsTableBody) {
    studentsTableBody.addEventListener(
      "click",
      function (event) {
        const actionButton =
          event.target.closest("[data-action]");

        if (!actionButton) {
          return;
        }

        const studentId =
          actionButton.dataset.studentId;

        const action =
          actionButton.dataset.action;

        if (action === "edit") {
          editStudent(studentId);
        }

        if (action === "delete") {
          deleteStudent(studentId);
        }
      }
    );
  }

  // ========================================
  // تعديل الطالب
  // ========================================

  function editStudent(studentId) {
    window.location.href =
      `add-student.html?studentId=${encodeURIComponent(studentId)}`;
  }

  // ========================================
  // حذف الطالب
  // ========================================

  function deleteStudent(studentId) {
    const student = getStudentById(studentId);

    if (!student) {
      alert("Student not found.");
      return;
    }

    const studentName = getStudentName(student);

    const confirmed = confirm(
      `Are you sure you want to delete ${studentName}?`
    );

    if (!confirmed) {
      return;
    }

    const updatedUsers = getUsers().filter(function (user) {
      return user.id !== studentId;
    });

    saveUsers(updatedUsers);

    // حذف نتائج الطالب أيضًا
    const updatedResults = getResults().filter(
      function (result) {
        return result.studentId !== studentId;
      }
    );

    saveResults(updatedResults);

    renderStudents(
      searchInput ? searchInput.value : ""
    );
  }
});

// ========================================
// دوال مساعدة
// ========================================

function getStudentName(student) {
  return (
    student.name ||
    student.fullName ||
    student.username ||
    "Unknown Student"
  );
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

function maskNationalId(nationalId) {
  const value = String(nationalId || "");

  if (
    value === "Not provided" ||
    value.length <= 4
  ) {
    return value;
  }

  return "*".repeat(value.length - 4) +
    value.slice(-4);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}