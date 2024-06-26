const signInBtn = document.getElementById("signIn");
const signUpBtn = document.getElementById("signUp");
const firstForm = document.getElementById("form1");
const secondForm = document.getElementById("form2");
const container = document.querySelector(".container");

signInBtn.addEventListener("click", () => {
    container.classList.remove("right-panel-active");
});

signUpBtn.addEventListener("click", () => {
    container.classList.add("right-panel-active");
});

firstForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent default form submission
    validateSignUp(); // Call validation function
});

secondForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent default form submission
    // Handle sign-in form submission if needed
    const username = document.getElementById('usernameSignin').value;
    const password = document.getElementById('passwordSignin').value;
    submitSignIn(username, password);
});

function validateSignUp() {
    const username = document.getElementById('username').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const bio = document.getElementById('bio').value;

    // Simple email validation using regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return; // Exit the function if email is invalid
    }

    // Additional validation can be added here (e.g., checking other fields)

    // If all validation passes, proceed with form submission
    submitSignUp(username, firstName, lastName, email, password, bio);
}

async function submitSignUp(username, firstName, lastName, email, password, bio) {
    // Perform AJAX request or form submission here
    // You can replace this alert with your actual form submission logic
    username = "@" + username;

        const res = await fetch('/register', 
          {method:'POST',
          headers:{"Content-Type":'application/json'},
          body: JSON.stringify({"username": username,"firstName": firstName,
          "lastName": lastName,"email": email,"password": password,"bio":bio})
        });
    // For demonstration, we'll just display a success message
    if(res.status === 201){
        window.location.href = '/'+username;
    }
    else{
        window.alert("wrong form submission");
    }

    // Optionally, redirect to another page after successful sign-up
    // Redirect to home page
}
async function submitSignIn(username, password) {
    // Perform AJAX request or form submission here
    // You can replace this alert with your actual form submission logic
    username = "@" + username;

        const res = await fetch('/signin',
          {method:'POST',
          headers:{"Content-Type":'application/json'},
          body: JSON.stringify({"username": username,"password": password})
        });
    // For demonstration, we'll just display a success message
    if(res.status === 200){
        window.location.href = '/'+username;
    }
    else{
        window.alert("wrong form submission");
    }

    // Optionally, redirect to another page after successful sign-up // Redirect to home page
}

// Other redirect functions
function redirectToSignIn() {
    window.location.href = 'Sign.html';
}

function redirectToContact() {
    window.location.href = 'contact.html';
}

function redirectToAbout() {
    window.location.href = 'About.html';
}

function redirectToSignUp() {
    window.location.href = 'Sign.html';
}

function redirectToHome() {
    window.location.href = 'index.html';
}
