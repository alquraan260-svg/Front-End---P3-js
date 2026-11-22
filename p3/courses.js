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

  bootstrap.Modal.getOrCreateInstance($("#courseDialog")).show();

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
  bootstrap.Modal.getInstance($("#courseDialog")).hide();  
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

function renderAll() {
  renderCourses();
}

renderAll();