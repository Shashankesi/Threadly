document.addEventListener("DOMContentLoaded", () => {
  const signinForm = document.getElementById("signinForm");
  const signupForm = document.getElementById("signupForm");

  if (signinForm) {
    signinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("signinName").value.trim();
      if (name) {
        localStorage.setItem("username", name);
        window.location.href = "index.html";
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("signupName").value.trim();
      if (name) {
        localStorage.setItem("username", name);
        window.location.href = "index.html";
      }
    });
  }
});
function handleAuth(action) {
  const inputId = action === 'signin' ? 'signinUsername' : 'signupUsername';
  const username = document.getElementById(inputId).value.trim();

  if (username) {
    localStorage.setItem('username', username);
    window.location.href = 'index.html';
  } else {
    alert('Please enter a valid name.');
  }
}

