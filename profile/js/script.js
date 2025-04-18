/***********************************************
 * NAVBAR & SCROLL BEHAVIOR
 ***********************************************/
const navbar = document.getElementById("navbar");

// Set fixed positioning and transitions
navbar.style.position = "fixed";
navbar.style.width = "100%";
navbar.style.top = "0";
navbar.style.zIndex = "1000";
navbar.style.transition =
  "top 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease";
navbar.style.padding = "0 1.5rem";

// Style inner container
const navContainer = navbar.querySelector(".container");
navContainer.style.display = "flex";
navContainer.style.alignItems = "center";
navContainer.style.justifyContent = "space-between";
navContainer.style.height = "70px";

// Logo link styling
const logoLink = navbar.querySelector(".logo a");
logoLink.style.fontSize = "1.5rem";
logoLink.style.color = "#fff";
logoLink.style.fontWeight = "700";
logoLink.style.letterSpacing = "1px";

// Navigation links styling
const navUl = navbar.querySelector("ul");
navUl.style.listStyle = "none";
navUl.style.display = "flex";
navUl.style.alignItems = "center";
navUl.style.gap = "2rem";

const navLinks = navbar.querySelectorAll("ul li a");
navLinks.forEach((link) => {
  link.style.color = "#fff";
  link.style.padding = "0.5rem 0";
  link.style.fontWeight = "500";
  link.style.position = "relative";
  link.style.textDecoration = "none";
});

/***********************************************
 * MOBILE MENU TOGGLE
 ***********************************************/
document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const navUl = document.querySelector("#navbar ul");

  if (!mobileMenuToggle || !navUl) {
    console.error("Mobile menu toggle button or nav <ul> not found!");
    return;
  }

  mobileMenuToggle.addEventListener("click", () => {
    navUl.classList.toggle("active");
    console.log(
      "Mobile menu toggle clicked. Active state:",
      navUl.classList.contains("active")
    );
  });
});

document.addEventListener("click", (event) => {
  const navUl = document.querySelector("#navbar ul");
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");

  // If the menu is open and the click is outside both the nav and the toggle (or its children), then close it.
  if (
    navUl.classList.contains("active") &&
    !navUl.contains(event.target) &&
    !mobileMenuToggle.contains(event.target)
  ) {
    navUl.classList.remove("active");
  }
});

/***********************************************
 * UPDATE NAVBAR ON SCROLL
 ***********************************************/
function updateNavbarOnScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const isDark = document.body.classList.contains("dark-mode");

  logoLink.style.color = "#fff";
  navLinks.forEach((link) => {
    link.style.color = "#fff";
  });

  if (scrollTop > 50) {
    navbar.style.backgroundColor = isDark
      ? "rgba(26, 32, 44, 0.95)"
      : "rgba(26, 32, 44, 0.95)";
    navbar.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
  } else {
    navbar.style.backgroundColor = isDark
      ? "rgba(26, 32, 44, 0.7)"
      : "transparent";
    navbar.style.boxShadow = "none";
  }
}

let lastScrollTop = 0;
window.addEventListener("scroll", () => {
  updateNavbarOnScroll();

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollTop > lastScrollTop && scrollTop > 300) {
    navbar.style.top = "-80px";
  } else {
    navbar.style.top = "0";
  }
  lastScrollTop = scrollTop;
});

/***********************************************
 * SMOOTH SCROLL FOR NAV LINKS
 ***********************************************/
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

/***********************************************
 * DARK MODE TOGGLE
 ***********************************************/
const darkModeBtn = document.getElementById("dark-mode-toggle");
darkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  logoLink.style.color = "#fff";
  navLinks.forEach((link) => {
    link.style.color = "#fff";
  });
  updateNavbarOnScroll();
});

/***********************************************
 * ENHANCED PROJECT GALLERY WITH ANIMATION
 ***********************************************/
document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projects = document.querySelectorAll(".project-item");

  // Fade-in effect for projects on page load
  projects.forEach((project) => {
    project.style.opacity = "0";
    project.style.transform = "translateY(20px)";
    setTimeout(() => {
      project.style.opacity = "1";
      project.style.transform = "translateY(0)";
    }, 500);
  });

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((button) => button.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");

      projects.forEach((project) => {
        project.style.transition = "all 0.3s ease-out";

        if (
          filter === "all" ||
          project.getAttribute("data-category") === filter
        ) {
          project.style.opacity = "0";
          project.style.transform = "translateY(20px)";
          project.style.display = "block";

          setTimeout(() => {
            project.style.opacity = "1";
            project.style.transform = "translateY(0)";
          }, 100);
        } else {
          project.style.opacity = "0";
          project.style.transform = "translateY(20px)";
          setTimeout(() => {
            project.style.display = "none";
          }, 300);
        }
      });
    });
  });
});

/***********************************************
 * CONTACT FORM VALIDATION & SUBMISSION
 ***********************************************/
const form = document.getElementById("contact-form");
const formMessage = document.getElementById("form-message");
const formInputs = form.querySelectorAll("input, textarea");

// Real-time validation
formInputs.forEach((input) => {
  const feedback = document.createElement("div");
  feedback.className = "input-feedback";
  input.parentNode.insertBefore(feedback, input.nextSibling);

  input.addEventListener("input", () => {
    validateInput(input, feedback);
  });
  input.addEventListener("blur", () => {
    validateInput(input, feedback);
  });
});

function validateInput(input, feedback) {
  const value = input.value.trim();

  switch (input.id) {
    case "name":
      if (value.length < 2) {
        showError(input, feedback, "Name must be at least 2 characters long");
      } else {
        showSuccess(input, feedback);
      }
      break;
    case "email":
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        showError(input, feedback, "Please enter a valid email address");
      } else {
        showSuccess(input, feedback);
      }
      break;
    case "message":
      if (value.length < 10) {
        showError(
          input,
          feedback,
          "Message must be at least 10 characters long"
        );
      } else {
        showSuccess(input, feedback);
      }
      break;
  }
}

function showError(input, feedback, message) {
  input.classList.add("error");
  input.classList.remove("success");
  feedback.textContent = message;
  feedback.style.color = "red";
}

function showSuccess(input, feedback) {
  input.classList.remove("error");
  input.classList.add("success");
  feedback.textContent = "";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let isValid = true;
  formInputs.forEach((input) => {
    const feedback = input.nextSibling;
    validateInput(input, feedback);
    if (input.classList.contains("error")) {
      isValid = false;
    }
  });

  if (!isValid) {
    formMessage.style.color = "red";
    formMessage.textContent = "Please correct the errors before submitting.";
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Sending...";

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    formMessage.style.color = "green";
    formMessage.textContent =
      "Thank you for your message! I'll get back to you soon.";
    form.reset();

    formInputs.forEach((input) => {
      input.classList.remove("success");
    });
  } catch (error) {
    formMessage.style.color = "red";
    formMessage.textContent = "An error occurred. Please try again later.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
});

/***********************************************
 * BACK TO TOP BUTTON WITH PROGRESS INDICATOR
 ***********************************************/
const backToTopButton = document.getElementById("back-to-top");
const progressRing = document.createElement("svg");
progressRing.innerHTML = `
  <circle cx="20" cy="20" r="18" fill="none" stroke="#ffffff33" stroke-width="2"/>
  <circle cx="20" cy="20" r="18" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="113" stroke-dashoffset="113"/>
`;
progressRing.style.position = "absolute";
progressRing.style.top = "0";
progressRing.style.left = "0";
progressRing.style.width = "40px";
progressRing.style.height = "40px";
progressRing.style.transform = "rotate(-90deg)";
backToTopButton.appendChild(progressRing);

window.addEventListener("scroll", () => {
  const scrollHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollPercent = scrollTop / scrollHeight;
  const drawProgress = Math.min(113 * (1 - scrollPercent), 113);

  if (scrollTop > 300) {
    backToTopButton.style.display = "flex";
    backToTopButton.style.opacity = "1";

    progressRing.querySelector("circle:nth-child(2)").style.strokeDashoffset =
      drawProgress;
  } else {
    backToTopButton.style.opacity = "0";
    setTimeout(() => {
      if (window.pageYOffset <= 300) {
        backToTopButton.style.display = "none";
      }
    }, 300);
  }
});

backToTopButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

//***********************************************
/* CUSTOM CURSOR & TRAIL (Disabled on Mobile)
 /***********************************************/
document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth < 768 || "ontouchstart" in window) {
    return;
  }

  let customCursor = document.getElementById("custom-cursor");
  if (!customCursor) {
    customCursor = document.createElement("div");
    customCursor.id = "custom-cursor";
    document.body.appendChild(customCursor);
  }

  let tailEnabled = true;
  const tailToggleBtn = document.getElementById("tail-toggle");
  if (tailToggleBtn) {
    tailToggleBtn.addEventListener("click", () => {
      tailEnabled = !tailEnabled;
      tailToggleBtn.style.opacity = tailEnabled ? "1" : "0.5";
      tailToggleBtn.title = tailEnabled
        ? "Disable Cursor Trail"
        : "Enable Cursor Trail";
    });
  }

  document.addEventListener("mousemove", (e) => {
    customCursor.style.top = `${e.clientY}px`;
    customCursor.style.left = `${e.clientX}px`;
    if (tailEnabled) {
      createBinaryDigit(e.clientX, e.clientY);
    }
  });

  document.addEventListener("mousedown", () => {
    customCursor.classList.add("click-effect");
  });

  document.addEventListener("mouseup", () => {
    customCursor.classList.remove("click-effect");
  });

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

function createBinaryDigit(x, y) {
  const digit = Math.random() < 0.5 ? "0" : "1";
  const binEl = document.createElement("div");
  binEl.className = "cursor-binary";
  binEl.textContent = digit;
  binEl.style.left = `${x}px`;
  binEl.style.top = `${y}px`;
  document.body.appendChild(binEl);
  setTimeout(() => {
    binEl.remove();
  }, 800);
}
