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
    // if stetment if 500 window if 200 console
    username = "@" + username;

        const res = await fetch('/register',
          {method:'POST',
          headers:{"Content-Type":'application/json'},
          body: JSON.stringify({"username": escape(username),"firstName": escape(firstName),
          "lastName": escape(lastName),"email": escape(email),"password": escape(password),"bio": escape(bio)})
        });
    // For demonstration, we'll just display a success message
    console.log(res);

    // Optionally, redirect to another page after successful sign-up
    window.location.href = '/'+username; // Redirect to home page
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
const form = document.getElementById('form1'); // Get the signup form
const username = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const bio = document.getElementById('bio');

form.addEventListener('submit', e => {
    e.preventDefault(); // Prevent form submission for now

    validateInputs();
});

const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error-msg');

    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
};

const setSuccess = element => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error-msg');

    errorDisplay.innerText = ''; // Clear any previous error message
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
};

const isValidEmail = email => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

const validateInputs = () => {
    const usernameValue = username.value.trim();
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
    const bioValue = bio.value.trim();

    if (usernameValue === '') {
        setError(username, 'Username is required');
    } else {
        setSuccess(username);
    }

    if (emailValue === '') {
        setError(email, 'Email is required');
    } else if (!isValidEmail(emailValue)) {
        setError(email, 'Provide a valid email address');
    } else {
        setSuccess(email);
    }

    if (passwordValue === '') {
        setError(password, 'Password is required');
    } else if (passwordValue.length < 8) {
        setError(password, 'Password must be at least 8 characters');
    } else {
        setSuccess(password);
    }

    if (bioValue === '') {
        setError(bio, 'Bio is required');
    } else if (bioValue.length > 200) {
        setError(bio, 'Bio cannot exceed 200 characters');
    } else {
        setSuccess(bio);
    }
};
