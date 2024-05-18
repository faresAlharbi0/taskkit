document.addEventListener("DOMContentLoaded", () => {
    const features = document.querySelectorAll('.feature');
    const featureDescription = document.querySelector('.feature-description');
    let currentFeatureIndex = 0;

    // Smooth scrolling for feature container
    const featureContainer = document.querySelector('.features-container');
    featureContainer.addEventListener('scroll', (e) => {
        if (featureContainer.scrollLeft % window.innerWidth === 0) {
            featureContainer.scrollTo({
                left: featureContainer.scrollLeft,
                behavior: 'smooth'
            });
        }
    });

    // Hover effect to display feature description and enlarge feature
    features.forEach((feature, index) => {
        feature.addEventListener('mouseover', () => {
            const featureName = feature.getAttribute('data-feature');
            featureDescription.textContent = featureName;
            scrollToFeature(index);
        });

        feature.addEventListener('mouseout', () => {
            featureDescription.textContent = '';
        });

        feature.addEventListener('click', () => {
            currentFeatureIndex = index === features.length - 1 ? 0 : index + 1;
            scrollToFeature(currentFeatureIndex);
        });
    });

    // Function to scroll to a specific feature
    function scrollToFeature(index) {
        features[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Scroll animation for features
    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const scrollTop = window.scrollY;

        features.forEach((feature, index) => {
            const featureTop = feature.getBoundingClientRect().top + scrollTop;
            if (scrollTop + windowHeight - 100 > featureTop) {
                feature.classList.add('visible');
            } else {
                feature.classList.remove('visible');
            }
        });

        const featureBottom = features[currentFeatureIndex].getBoundingClientRect().bottom;

        if (features[currentFeatureIndex].getBoundingClientRect().top <= 0 && featureBottom >= windowHeight) {
            currentFeatureIndex = Math.min(currentFeatureIndex + 1, features.length - 1);
            scrollToFeature(currentFeatureIndex);
        }
    });

    // Redirect functions
    document.querySelector(".btn-home").addEventListener("click", redirectToHome);
    document.querySelector(".btn-about").addEventListener("click", redirectToAbout);
    document.querySelector(".btn-signup").addEventListener("click", redirectToSignUp);
    document.querySelector(".btn-signin").addEventListener("click", redirectToSignIn);
    document.querySelector(".btn-start-now").addEventListener("click", redirectToStartNow);

    function redirectToHome() {
        window.location.href = 'index.html';
    }

    function redirectToAbout() {
        window.location.href = 'About.html';
    }

    function redirectToSignUp() {
        window.location.href = 'Sign.html';
    }

    function redirectToSignIn() {
        window.location.href = 'Sign.html';
    }
    function redirectToStartNow() {
        window.location.href = 'Sign.html';
    }
});
