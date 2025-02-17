/***********************************************
 * NAVBAR & SCROLL BEHAVIOR
 **********************************************/

const navbar = document.getElementById("navbar");

// Initial "insane" gradient for light mode
// (Feel free to adjust these colors or use a radial gradient).
navbar.style.position = "fixed";
navbar.style.width = "100%";
navbar.style.top = "0";
navbar.style.zIndex = "1000";
navbar.style.transition =
  "top 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease";
navbar.style.padding = "0 1.5rem";

// Style the container inside navbar
const navContainer = navbar.querySelector(".container");
navContainer.style.display = "flex";
navContainer.style.alignItems = "center";
navContainer.style.justifyContent = "space-between";
navContainer.style.height = "70px";

// Update initial text colors for the logo link
const logoLink = navbar.querySelector(".logo a");
logoLink.style.fontSize = "1.5rem";
logoLink.style.color = document.body.classList.contains("dark-mode")
  ? "#fff"
  : "#fff";
logoLink.style.fontWeight = "700";
logoLink.style.letterSpacing = "1px";

// Style the nav links with dynamic colors
const navUl = navbar.querySelector("ul");
navUl.style.listStyle = "none";
navUl.style.display = "flex";
navUl.style.alignItems = "center";
navUl.style.gap = "2rem";

const navLinks = navbar.querySelectorAll("ul li a");
navLinks.forEach((link) => {
  link.style.color = document.body.classList.contains("dark-mode")
    ? "#fff"
    : "#fff";
  link.style.padding = "0.5rem 0";
  link.style.fontWeight = "500";
  link.style.position = "relative";
  link.style.textDecoration = "none";
});

/***********************************************
 * FUNCTION: UPDATE NAVBAR STYLES
 * This handles:
 * 1) Changing BG color / box shadow on scroll
 * 2) Dark-mode adjustments
 **********************************************/

function updateNavbarOnScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const isDark = document.body.classList.contains("dark-mode");

  // Update logo color
  logoLink.style.color = isDark ? "#fff" : "#fff";

  // Update nav links color
  navLinks.forEach((link) => {
    link.style.color = isDark ? "#fff" : "#fff";
  });

  // BG color logic
  if (scrollTop > 50) {
    // SCROLLED
    if (isDark) {
      // Dark mode scrolled
      navbar.style.backgroundColor = "rgba(26, 32, 44, 0.95)";
    } else {
      // Light mode scrolled
      navbar.style.backgroundColor = "rgba(26, 32, 44, 0.95)";
    }
    navbar.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
  } else {
    // NOT SCROLLED
    if (isDark) {
      // Dark mode top
      navbar.style.backgroundColor = "rgba(26, 32, 44, 0.7)";
    } else {
      // Light mode top
      navbar.style.background = "transparent";
    }
    navbar.style.boxShadow = "none";
  }
}

/***********************************************
 * HIDE / SHOW NAVBAR ON SCROLL
 **********************************************/

let lastScrollTop = 0;
window.addEventListener("scroll", () => {
  updateNavbarOnScroll();

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollTop > lastScrollTop && scrollTop > 300) {
    // Hide navbar
    navbar.style.top = "-80px";
  } else {
    // Show navbar
    navbar.style.top = "0";
  }
  lastScrollTop = scrollTop;
});

/***********************************************
 * SMOOTH SCROLL FOR NAV LINKS
 **********************************************/

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
 **********************************************/

const darkModeBtn = document.getElementById("dark-mode-toggle");
darkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");

  // Update logo color
  logoLink.style.color = isDark ? "#fff" : "#fff";

  // Update nav links color
  navLinks.forEach((link) => {
    link.style.color = isDark ? "#fff" : "#fff";
  });

  updateNavbarOnScroll(); // Re-check navbar style
});

/***********************************************
 * ENHANCED PROJECT GALLERY WITH ANIMATION
 **********************************************/

document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projects = document.querySelectorAll(".project-item");

  // Initialize projects with fade-in animation
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
 * CONTACT FORM VALIDATION
 **********************************************/

const form = document.getElementById("contact-form");
const formMessage = document.getElementById("form-message");
const formInputs = form.querySelectorAll("input, textarea");

// Real-time validation feedback
formInputs.forEach((input) => {
  const feedback = document.createElement("div");
  feedback.className = "input-feedback";
  // Insert feedback div right after input
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

// Handle Form Submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validate all inputs
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

  // Show loading state
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Sending...";

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    formMessage.style.color = "green";
    formMessage.textContent =
      "Thank you for your message! I'll get back to you soon.";
    form.reset();

    // Reset success states
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
 * BACK TO TOP WITH PROGRESS INDICATOR
 **********************************************/

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

/***********************************************
 * OPTIONAL: CURSOR TRAIL TOGGLE
 ***********************************************/
const tailToggleBtn = document.getElementById("tail-toggle");
if (tailToggleBtn) {
  tailToggleBtn.addEventListener("click", () => {
    // Toggle custom cursor trail script on/off
    // Implementation depends on your "cursor.js"
  });
}
