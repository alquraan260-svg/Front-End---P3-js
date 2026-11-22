const STORAGE_KEYS = {
  courses: "sd_courses",
  assignments: "sd_assignments",
  student: "sd_student",
  theme: "sd_theme",
};


const DEFAULT_STUDENT = {
  fullName: "Odai Alquraan",
  dob: "2003-05-14",
  major: "Computer Engineering",
  nationality: "Jordanian",
  photo: "",
};


const SOON_DAYS = 3;


// ========================================
// 4. LOAD DATA FROM LOCAL STORAGE
// ========================================

function load(key, fallback) {
    const LOAD = localStorage.getItem(key);

    return LOAD ? JSON.parse(LOAD) : fallback;

    return fallback;
  
}


// ========================================
// 5. SAVE DATA TO LOCAL STORAGE
// ========================================

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));

  } catch (e) {
    alert(
      "Could not save data. Storage may be full."
    );
  }
}


// ========================================
// 6. APPLICATION DATA
// ========================================

let courses = load(STORAGE_KEYS.courses, []);

let assignments = load(STORAGE_KEYS.assignments, []);

let student =
  load(STORAGE_KEYS.student, null) ||
  { ...DEFAULT_STUDENT };


// ========================================
// 7. SAVE FUNCTIONS
// ========================================

const saveCourses(){  save(STORAGE_KEYS.courses, courses);}

const saveAssignments(){  save(STORAGE_KEYS.assignments, assignments);}

const saveStudent = () =>
  save(STORAGE_KEYS.student, student);


// ========================================
// 8. DOM SELECTORS
// ========================================

// Select one element
const $ = (selector) =>
  document.querySelector(selector);

// Select multiple elements
const $$ = (selector) =>
  [...document.querySelectorAll(selector)];


// ========================================
// 9. GENERATE UNIQUE ID
// ========================================

const uid = () =>
  Date.now().toString(36) +
  Math.random().toString(36).slice(2, 7);


// ========================================
// 10. CREATE HTML ELEMENTS
// ========================================

function el(tag, props = {}, ...children) {

  const node = document.createElement(tag);

  Object.entries(props).forEach(([key, value]) => {

    if (key === "class") {
      node.className = value;

    } else if (key === "text") {
      node.textContent = value;

    } else if (key.startsWith("on")) {
      node.addEventListener(key.slice(2), value);

    } else {
      node.setAttribute(key, value);
    }

  });

  children.flat().forEach((child) => {
    if (child != null) {
      node.append(child);
    }
  });

  return node;
}


// ========================================
// 11. DATE FUNCTIONS
// ========================================

function parseDate(str) {
  const [year, month, day] = str.split("-").map(Number);

  return new Date(year, month - 1, day);
}


function formatDate(str) {
  if (!str) return "—";

  return parseDate(str).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}


function daysUntil(str) {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return Math.round(
    (parseDate(str) - today) / 86400000
  );
}


function todayStr() {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}


// ========================================
// 12. COURSE NAME
// ========================================

function courseName(id) {

  const course = courses.find(
    (course) => course.id === id
  );

  return course ? course.name : "Unknown course";
}


// ========================================
// 13. STATUS BADGE
// ========================================

function statusBadge(status) {

  const classes = {
    Completed: "badge-completed",
    "In Progress": "badge-progress",
    Dropped: "badge-dropped",
  };

  return el(
    "span",
    {
      class: `badge ${classes[status] || ""}`,
      text: status,
    }
  );
}


// ========================================
// 14. ASSIGNMENT DEADLINE STATE
// ========================================

function deadlineState(assignment) {

  if (assignment.status === "Done") {
    return "";
  }

  const days = daysUntil(assignment.deadline);

  if (days < 0) {
    return "overdue";
  }

  if (days <= SOON_DAYS) {
    return "soon";
  }

  return "";
}


// ========================================
// 15. ASSIGNMENT DEADLINE LABEL
// ========================================

function deadlineLabel(assignment) {

  const state = deadlineState(assignment);

  if (state === "overdue") {
    return `Overdue by ${Math.abs(
      daysUntil(assignment.deadline)
    )}d`;
  }

  if (state === "soon") {

    const days = daysUntil(assignment.deadline);

    return days === 0
      ? "Due today"
      : days === 1
      ? "Due tomorrow"
      : `Due in ${days}d`;
  }

  return "";
}


// ========================================
// 16. FORM VALIDATION HELPERS
// ========================================

function setError(form, id, message) {

  const input = form.querySelector("#" + id);

  const span = form.querySelector(
    `.error[data-for="${id}"]`
  );

  if (span) {
    span.textContent = message || "";
  }

  if (input) {
    input.classList.toggle(
      "invalid",
      Boolean(message)
    );
  }

  return !message;
}


function clearErrors(form) {

  form.querySelectorAll(".error").forEach((span) => {
    span.textContent = "";
  });

  form.querySelectorAll(".invalid").forEach((input) => {
    input.classList.remove("invalid");
  });
}


// ========================================
// 17. CONFIRM DELETE
// ========================================

function confirmDelete(message) {
  return Promise.resolve(window.confirm(message));
}

/* ---------- Dashboard Rendering ---------- */

function renderDashboard() {

  // Count courses by status
  const count = (s) =>
    courses.filter((c) => c.status === s).length;

  // Calculate course statistics
  const total = courses.length;
  const completed = count("Completed");

  // Display course statistics
  $("#statTotal").textContent = total;
  $("#statCompleted").textContent = completed;
  $("#statProgress").textContent = count("In Progress");
  $("#statDropped").textContent = count("Dropped");

  // Display welcome message
  const firstName = (student.fullName || "").split(" ")[0];

  $("#greeting").textContent =
    `Welcome back, ${firstName}! Here's your academic overview.`;

  // Calculate completion percentage
  const pct = total
    ? Math.round((completed / total) * 100)
    : 0;

  $("#completionPct").textContent = pct + "%";

  // Update progress bar
  $("#completionBar").style.width = pct + "%";

  // Calculate credit hours
  const sumCredits = (status) =>
    courses
      .filter((c) => c.status === status)
      .reduce((s, c) => s + Number(c.credits), 0);

  $("#creditsDone").textContent =
    sumCredits("Completed");

  $("#creditsActive").textContent =
    sumCredits("In Progress");

  // Display completed assignments
  $("#assignDone").textContent =
    `${assignments.filter((a) => a.status === "Done").length} / ${assignments.length}`;

  // Upcoming assignments
  const list = $("#upcomingList");

  list.replaceChildren();

  // Get pending assignments and sort by deadline
  const upcoming = assignments
    .filter((a) => a.status !== "Done")
    .sort((a, b) =>
      a.deadline.localeCompare(b.deadline)
    )
    .slice(0, 5);

  // Check if there are no upcoming assignments
  if (!upcoming.length) {

    list.append(
      el("li", {
        class: "muted",
        text: "No pending assignments 🎉"
      })
    );

    return;
  }

  // Display upcoming assignments
  upcoming.forEach((a) => {

    const state = deadlineState(a);
    const label = deadlineLabel(a);

    list.append(
      el("li", { class: state },

        el("div", {},

          el("div", {
            class: "upcoming-title",
            text: a.title
          }),

          el("div", {
            class: "upcoming-course",
            text: `${courseName(a.courseId)} · ${formatDate(a.deadline)}`
          })

        ),

        label
          ? el("span", {
              class: `badge badge-${state}`,
              text: label
            })
          : null

      )
    );

  });

}

