document.addEventListener("DOMContentLoaded", function () {
  const currentUser = getCurrentUser();

  // إذا لم يكن هناك مستخدم مسجل دخوله
  if (!currentUser) {
    window.location.href = "../index.html";
    return;
  }

  displayProfile(currentUser);
  setupLogout();
});

// ========================================
// Display Profile Information
// ========================================

function displayProfile(user) {
  const fullName =
    user.name ||
    user.fullName ||
    user.username ||
    "Unknown User";

  const role =
    user.role ||
    user.userRole ||
    "User";

  const gender =
    user.gender ||
    "Not provided";

  const phone =
    user.phone ||
    user.phoneNumber ||
    "Not provided";

  const nationalId =
    user.nationalId ||
    user.nationalID ||
    user.nationalNumber ||
    "Not provided";

  const email =
    user.email ||
    user.emailAddress ||
    "Not provided";

  const username =
    user.username ||
    "Not provided";

  const status =
    user.status ||
    "Active";

  setElementText("profileName", fullName);
  setElementText("profileRole", role);

  setElementText("fullName", fullName);
  setElementText("gender", gender);
  setElementText("phoneNumber", phone);
  setElementText("nationalId", maskNationalId(nationalId));

  setElementText("emailAddress", email);
  setElementText("username", username);
  setElementText("accountRole", role);
  setElementText("accountStatus", status);

  updateProfileImage(user, fullName);
  updateAccountStatus(status);
  updateRoleStatus(role);
  updateVerifiedBadge(user);
  displayLastLogin(user);
}

// ========================================
// Profile Image
// ========================================

function updateProfileImage(user, fullName) {
  const profileImage =
    document.getElementById("profileImage");

  if (!profileImage) {
    return;
  }

  const imageSource =
    user.profileImage ||
    user.image ||
    user.avatar ||
    "../assets/images/man.jpg";

  profileImage.src = imageSource;
  profileImage.alt = `${fullName} profile image`;

  profileImage.addEventListener("error", function () {
    profileImage.src = "../assets/images/man.jpg";
  });
}

// ========================================
// Account Status
// ========================================

function updateAccountStatus(status) {
  const statusDot =
    document.getElementById("accountStatusDot");

  if (!statusDot) {
    return;
  }

  const normalizedStatus =
    String(status).toLowerCase();

  statusDot.classList.remove(
    "green",
    "red",
    "gray",
    "purple"
  );

  if (normalizedStatus === "active") {
    statusDot.classList.add("green");
    return;
  }

  if (
    normalizedStatus === "inactive" ||
    normalizedStatus === "disabled"
  ) {
    statusDot.classList.add("gray");
    return;
  }

  if (
    normalizedStatus === "blocked" ||
    normalizedStatus === "suspended"
  ) {
    statusDot.classList.add("red");
    return;
  }

  statusDot.classList.add("gray");
}

// ========================================
// Role Status
// ========================================

function updateRoleStatus(role) {
  const roleDot =
    document.getElementById("roleStatusDot");

  if (!roleDot) {
    return;
  }

  roleDot.classList.remove(
    "purple",
    "green",
    "blue",
    "gray"
  );

  const normalizedRole =
    String(role).toLowerCase();

  if (normalizedRole === "teacher") {
    roleDot.classList.add("purple");
  } else if (normalizedRole === "student") {
    roleDot.classList.add("green");
  } else {
    roleDot.classList.add("gray");
  }
}

// ========================================
// Verified Badge
// ========================================

function updateVerifiedBadge(user) {
  const verifiedBadge =
    document.getElementById("verifiedBadge");

  if (!verifiedBadge) {
    return;
  }

  /*
   إذا لم يكن عندك verified داخل user،
   سيتم اعتبار الحساب موثقًا افتراضيًا.
  */
  const isVerified =
    user.verified !== false &&
    user.isVerified !== false;

  verifiedBadge.style.display =
    isVerified ? "flex" : "none";
}

// ========================================
// Last Login
// ========================================

function displayLastLogin(user) {
  const lastLoginElement =
    document.getElementById("lastLogin");

  if (!lastLoginElement) {
    return;
  }

  const lastLoginValue =
    user.lastLogin ||
    user.lastLoginAt ||
    getSessionLoginDate();

  if (!lastLoginValue) {
    lastLoginElement.textContent =
      "Login information is not available.";

    return;
  }

  const date = new Date(lastLoginValue);

  if (Number.isNaN(date.getTime())) {
    lastLoginElement.textContent =
      String(lastLoginValue);

    return;
  }

  lastLoginElement.textContent =
    formatDateTime(date);
}

// ========================================
// Get Login Date From Session
// ========================================

function getSessionLoginDate() {
  const session = getSession();

  if (!session) {
    return null;
  }

  return (
    session.loginAt ||
    session.loggedInAt ||
    session.createdAt ||
    null
  );
}

// ========================================
// Format Date and Time
// ========================================

function formatDateTime(date) {
  const formattedDate =
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formattedTime =
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return `${formattedDate} at ${formattedTime}`;
}

// ========================================
// Mask National ID
// ========================================

function maskNationalId(nationalId) {
  const value = String(nationalId || "");

  if (
    value === "Not provided" ||
    value.length <= 4
  ) {
    return value;
  }

  return (
    "*".repeat(value.length - 4) +
    value.slice(-4)
  );
}

// ========================================
// Set Element Text Safely
// ========================================

function setElementText(elementId, value) {
  const element =
    document.getElementById(elementId);

  if (!element) {
    return;
  }

  element.textContent =
    value ?? "Not provided";
}

// ========================================
// Logout
// ========================================

function setupLogout() {
  const logoutLink =
    document.getElementById("logoutLink");

  if (!logoutLink) {
    return;
  }

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