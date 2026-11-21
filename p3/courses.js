

// ========================================
// 1. STORAGE KEYS
// ========================================

const STORAGE_KEYS = {
  courses: "sd_courses",
  assignments: "sd_assignments",
  student: "sd_student",
  theme: "sd_theme",
};


// ========================================
// 2. DEFAULT STUDENT
// ========================================

const DEFAULT_STUDENT = {
  fullName: "Alex Johnson",
  dob: "2003-05-14",
  major: "Computer Science",
  nationality: "Jordanian",
  photo: "",
};


// ========================================
// 3. GENERAL SETTINGS
// ========================================

const SOON_DAYS = 3;


// ========================================
// 4. LOAD DATA FROM LOCAL STORAGE
// ========================================

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);

    return raw ? JSON.parse(raw) : fallback;

  } catch {
    return fallback;
  }
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

const saveCourses = () =>
  save(STORAGE_KEYS.courses, courses);

const saveAssignments = () =>
  save(STORAGE_KEYS.assignments, assignments);

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


