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

