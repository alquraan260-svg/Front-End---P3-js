const courseSelect = document.getElementById("assignmentCourse");

courses.forEach((course) => {
  const option = document.createElement("option");
  option.value = course.id;
  option.textContent = course.name;
  courseSelect.appendChild(option);
});

const assignmentForm = document.getElementById("assignmentForm");
assignmentForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const title = document.getElementById("assignmentTitle").value.trim();
  const courseId = document.getElementById("assignmentCourse").value;
  const deadline = document.getElementById("assignmentDueDate").value;
  const status = document.getElementById("assignmentStatus").value;

  if (editingAssignmentId !== null) {
    const assignment = assignments.find(
      (assignment) => assignment.id === editingAssignmentId,
    );

    if (assignment) {
      assignment.title = title;
      assignment.courseId = courseId;
      assignment.deadline = deadline;
      assignment.status = status;
    }
  } else {
    const newAssignment = {
      id: uid(),
      title: title,
      courseId: courseId,
      deadline: deadline,
      status: status,
    };

    assignments.push(newAssignment);
  }

  saveAssignments();
  renderAssignments();
  assignmentForm.reset();

  editingAssignmentId = null;

  const submitButton = assignmentForm.querySelector('button[type="submit"]');

  submitButton.innerHTML =
    '<i class="bi bi-plus-circle me-2"></i> Add Assignment';
});

function renderAssignments() {
  const tableBody = document.getElementById("assignmentTableBody");
  tableBody.innerHTML = "";
  assignments.forEach((assignment, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${index + 1}</td>
            <td>${courseName(assignment.courseId)}</td>
            <td>${assignment.title}</td>
            <td>${formatDate(assignment.deadline)}</td>
            <td>
            <select class="form-select form-select-sm assignment-status"
                   data-id="${assignment.id}">
                <option value="To Do" ${assignment.status === "To Do" ? "selected" : ""}>To Do</option>
                <option value="Doing" ${assignment.status === "Doing" ? "selected" : ""}>Doing</option>
                <option value="Done" ${assignment.status === "Done" ? "selected" : ""}>Done</option>
            </select> 
            </td>
            <td>
              <button class="btn btn-primary btn-sm edit-btn"
              data-id="${assignment.id}">
              <i class="bi bi-pencil"></i> Edit
              </button>
              <button class="btn btn-danger btn-sm delete-btn"
              data-id="${assignment.id}">
              <i class="bi bi-trash"></i> Delete
              </button>
            </td>
                
            `;

    tableBody.appendChild(row);
  });
}
renderAssignments();

document
  .getElementById("assignmentTableBody")
  .addEventListener("change", function (event) {
    if (event.target.classList.contains("assignment-status")) {
      const assignmentId = event.target.dataset.id;
      const newStatus = event.target.value;

      const assignment = assignments.find(
        (assignment) => assignment.id === assignmentId,
      );

      if (assignment) {
        assignment.status = newStatus;
        saveAssignments();
      }
    }
  });

let editingAssignmentId = null;

document
  .getElementById("assignmentTableBody")
  .addEventListener("click", function (event) {
    const editButton = event.target.closest(".edit-btn");

    if (editButton) {
      const assignmentId = editButton.dataset.id;

      const assignment = assignments.find(
        (assignment) => assignment.id === assignmentId,
      );

      if (assignment) {
        editingAssignmentId = assignment.id;

        document.getElementById("assignmentTitle").value = assignment.title;
        document.getElementById("assignmentCourse").value = assignment.courseId;
        document.getElementById("assignmentDueDate").value =
          assignment.deadline;
        document.getElementById("assignmentStatus").value = assignment.status;
        const submitButton = assignmentForm.querySelector(
          'button[type="submit"]',
        );
        submitButton.innerHTML =
          '<i class="bi bi-check-circle"></i> Save Changes';
      }
    }
  });

document
  .getElementById("assignmentTableBody")
  .addEventListener("click", function (event) {
    const deleteButton = event.target.closest(".delete-btn");

    if (deleteButton) {
      const assignmentId = deleteButton.dataset.id;

      const confirmed = confirm(
        "Are you sure you want to delete this assignment?",
      );

      if (confirmed) {
        assignments = assignments.filter(
          (assignment) => assignment.id !== assignmentId,
        );

        saveAssignments();
        renderAssignments();
      }
    }
  });
