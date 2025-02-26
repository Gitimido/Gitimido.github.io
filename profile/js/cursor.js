document.addEventListener("DOMContentLoaded", () => {
  // 1) Create or find the main custom cursor
  const existingCursor = document.getElementById("custom-cursor");
  let customCursor;
  if (!existingCursor) {
    customCursor = document.createElement("div");
    customCursor.id = "custom-cursor";
    document.body.appendChild(customCursor);
  } else {
    customCursor = existingCursor;
  }

  // 2) Track mouse position & update the cursor
  let tailEnabled = true; // by default, the trail is ON

  // Grab the tail toggle button
  const tailToggleBtn = document.getElementById("tail-toggle");
  tailToggleBtn.addEventListener("click", () => {
    tailEnabled = !tailEnabled;
    // Optional: change the button icon, or toggle a class, etc.
    if (!tailEnabled) {
      tailToggleBtn.style.opacity = "0.5";
      tailToggleBtn.title = "Enable Cursor Trail";
    } else {
      tailToggleBtn.style.opacity = "1";
      tailToggleBtn.title = "Disable Cursor Trail";
    }
  });

  document.addEventListener("mousemove", (e) => {
    customCursor.style.top = `${e.clientY}px`;
    customCursor.style.left = `${e.clientX}px`;

    // Only create digits if tail is enabled
    if (tailEnabled) {
      createBinaryDigit(e.clientX, e.clientY);
    }
  });

  // 3) Click effect
  document.addEventListener("mousedown", () => {
    customCursor.classList.add("click-effect");
  });
  document.addEventListener("mouseup", () => {
    customCursor.classList.remove("click-effect");
  });

  // 4) Hover detection => changes cursor color for clickable or text fields
  document.addEventListener("mouseover", (e) => {
    const target = e.target;
    customCursor.classList.remove("hover-clickable", "hover-textfield");

    if (
      target.tagName === "A" ||
      target.tagName === "BUTTON" ||
      target.getAttribute("role") === "button" ||
      target.type === "submit"
    ) {
      customCursor.classList.add("hover-clickable");
    } else if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      customCursor.classList.add("hover-textfield");
    }
  });
});

// Creates a random '0' or '1' at (x, y) that fades out
function createBinaryDigit(x, y) {
  const digit = Math.random() < 0.5 ? "0" : "1";

  const binEl = document.createElement("div");
  binEl.className = "cursor-binary";
  binEl.textContent = digit;
  binEl.style.left = `${x}px`;
  binEl.style.top = `${y}px`;

  document.body.appendChild(binEl);

  // Remove after 0.8s
  setTimeout(() => {
    binEl.remove();
  }, 800);
}
