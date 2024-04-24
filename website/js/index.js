// Optional: Add smooth scrolling behavior
const featureContainer = document.querySelector('.features-container');
featureContainer.addEventListener('scroll', (e) => {
    if (featureContainer.scrollLeft % window.innerWidth === 0) {
        featureContainer.scrollTo({
            left: featureContainer.scrollLeft,
            behavior: 'smooth'
        });
    }
});
const features = document.querySelectorAll('.feature');
const featureDescription = document.querySelector('.feature-description');

features.forEach(feature => {
    feature.addEventListener('mouseover', () => {
        const featureName = feature.getAttribute('data-feature');
        featureDescription.textContent = featureName;
    });

    feature.addEventListener('mouseout', () => {
        featureDescription.textContent = '';
    });
});
document.addEventListener("DOMContentLoaded", function() {
    const features = document.querySelectorAll('.feature');
    let currentIndex = 0;

    features.forEach((feature, index) => {
        feature.addEventListener('click', () => {
            currentIndex = index === features.length - 1 ? 0 : index + 1;
            scrollToFeature(currentIndex);
        });

        feature.addEventListener('mouseover', () => {
            currentIndex = index === features.length - 1 ? 0 : index + 1;
            scrollToFeature(currentIndex);
        });
    });

    function scrollToFeature(index) {
        features[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const features = document.querySelectorAll('.feature');
    let currentFeatureIndex = 0;

    window.addEventListener('scroll', function() {
        const windowHeight = window.innerHeight;
        const scrollTop = window.scrollY;

        const featureTop = features[currentFeatureIndex].getBoundingClientRect().top;
        const featureBottom = features[currentFeatureIndex].getBoundingClientRect().bottom;

        if (featureTop <= 0 && featureBottom >= windowHeight) {
            currentFeatureIndex = Math.min(currentFeatureIndex + 1, features.length - 1);
            scrollToFeature(currentFeatureIndex);
        }
    });

    function scrollToFeature(index) {
        window.scrollTo({
            top: features[index].offsetTop,
            behavior: 'smooth'
        });
    }
});
  // JavaScript function to redirect to sign.html when Sign In button is clicked
  function redirectToSignIn() {
    window.location.href = 'sign.html';
}

// JavaScript function to redirect to contact.html when Contact Us button is clicked
function redirectToContact() {
    window.location.href = 'contact.html';
}

function redirectToAbout() {
    window.location.href = 'About.html';
}
function redirectToSignUp() {
    window.location.href = 'sign.html';
}
function redirectToHome() {
    window.location.href = 'index.html';
}