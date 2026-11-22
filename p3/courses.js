

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


/* ---------- Render Courses ---------- */

function renderCourses() {

  // Get course table body
  const body = $("#courseTable");

  body.replaceChildren();

  // Get filter and search values
  const filter = $("#courseFilter").value;

  const q = $("#courseSearch")
    .value
    .trim()
    .toLowerCase();

  // Filter courses
  const visible = courses.filter((c) => {

    const okStatus =
      filter === "all" || c.status === filter;

    const okSearch =
      !q ||
      [c.name, c.instructor, c.classroom]
        .some((f) => f.toLowerCase().includes(q));

    return okStatus && okSearch;

  });

  // Handle empty results
  const empty = $("#courseEmpty");

  empty.hidden = visible.length > 0;

  if (!visible.length) {

    empty.textContent = courses.length
      ? "No courses match your search/filter."
      : "No courses yet. Click “Add Course” to create your first one.";

  }

  // Display courses in table
  visible.forEach((c) => {

    body.append(

      el("tr", {},

        el("td", { text: c.name }),

        el("td", { text: c.credits }),

        el("td", { text: formatDate(c.start) }),

        el("td", { text: formatDate(c.end) }),

        el("td", { text: c.instructor }),

        el("td", { text: c.classroom }),

        el("td", {}, statusBadge(c.status)),

        el("td", {},

          el("div", { class: "actions" },

            // Edit button
            el("button", {
              class: "btn btn-ghost btn-sm",
              type: "button",
              text: "Edit",
              onclick: () => openCourseDialog(c.id)
            }),

            // Delete button
            el("button", {
              class: "btn btn-danger btn-sm",
              type: "button",
              text: "Delete",
              onclick: () => deleteCourse(c.id)
            })

          )

        )

      )

    );

  });

}


/* ---------- Courses CRUD ---------- */

// Get course form
const courseForm = $("#courseForm");


// Open Add/Edit Course Dialog
function openCourseDialog(id = null) {

  clearErrors(courseForm);

  courseForm.reset();

  $("#courseId").value = id || "";

  $("#courseDialogTitle").textContent =
    id ? "Edit Course" : "Add Course";

  // If editing, load existing course data
  if (id) {

    const c = courses.find((c) => c.id === id);

    $("#courseName").value = c.name;

    $("#courseCredits").value = c.credits;

    $("#courseStart").value = c.start;

    $("#courseEnd").value = c.end;

    $("#courseInstructor").value = c.instructor;

    $("#courseRoom").value = c.classroom;

    $("#courseStatus").value = c.status;

  }

  $("#courseDialog").showModal();

}


// Submit Course Form
courseForm.addEventListener("submit", (e) => {

  e.preventDefault();

  clearErrors(courseForm);

  // Get form data
  const data = {

    name: $("#courseName").value.trim(),

    credits: $("#courseCredits").value.trim(),

    start: $("#courseStart").value,

    end: $("#courseEnd").value,

    instructor: $("#courseInstructor").value.trim(),

    classroom: $("#courseRoom").value.trim(),

    status: $("#courseStatus").value,

  };

  const id = $("#courseId").value;

  // Validation
  let ok = true;

  const check = (field, msg) => {
    if (!setError(courseForm, field, msg)) {
      ok = false;
    }
  };


  // Validate course name
  check(
    "courseName",

    data.name.length < 2
      ? "Course name must be at least 2 characters."

      : courses.some((c) =>
          c.id !== id &&
          c.name.toLowerCase() === data.name.toLowerCase()
        )
        ? "A course with this name already exists."

        : ""
  );


  // Validate credit hours
  const credits = Number(data.credits);

  check(
    "courseCredits",

    !data.credits
      ? "Credit hours are required."

      : !Number.isInteger(credits) ||
        credits < 1 ||
        credits > 10
        ? "Enter a whole number between 1 and 10."

        : ""
  );


  // Validate start date
  check(
    "courseStart",
    data.start ? "" : "Start date is required."
  );


  // Validate end date
  check(
    "courseEnd",

    !data.end
      ? "End date is required."

      : data.start && data.end < data.start
        ? "End date must be on or after the start date."

        : ""
  );


  // Validate instructor
  check(
    "courseInstructor",
    data.instructor.length < 2
      ? "Instructor name is required."
      : ""
  );


  // Validate classroom
  check(
    "courseRoom",
    data.classroom ? "" : "Classroom is required."
  );


  // Stop if validation fails
  if (!ok) return;


  // Convert credits to number
  data.credits = credits;


  // Update existing course or add new course
  if (id) {

    Object.assign(
      courses.find((c) => c.id === id),
      data
    );

  } else {

    courses.push({
      id: uid(),
      ...data
    });

  }


  // Save changes
  saveCourses();

  // Close dialog
  $("#courseDialog").close();

  // Refresh application
  renderAll();

});


// Delete Course
async function deleteCourse(id) {

  const linked = assignments
    .filter((a) => a.courseId === id)
    .length;

  const msg = linked

    ? `Delete this course and its ${linked} assignment(s)? This cannot be undone.`

    : "Delete this course? This cannot be undone.";

  // Confirm deletion
  if (!(await confirmDelete(msg))) return;


  // Remove course
  courses = courses.filter((c) => c.id !== id);

  // Remove related assignments
  assignments = assignments.filter((a) => a.courseId !== id);


  // Save changes
  saveCourses();

  saveAssignments();


  // Refresh application
  renderAll();

}


/* ---------- Courses Events ---------- */

// Add Course Button
$("#addCourseBtn").addEventListener("click", () => {
  openCourseDialog();
});


// Course Filter
$("#courseFilter").addEventListener("change", renderCourses);


// Course Search
$("#courseSearch").addEventListener("input", renderCourses);
