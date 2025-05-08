// mga pang login namin
const usernameArray = ["ebat_adan", "kristine", "loyd"];
const passwordArray = ["juhan", "tin", "loyd"];



function validate(event) {
  if (event) event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const rememberMe = document.getElementById("remember-me").checked;

  for (let i = 0; i < usernameArray.length; i++) {
    if (username === usernameArray[i] && password === passwordArray[i]) {
      alert(`Login successful! Welcome, ${username}.`);

      if (rememberMe) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loggedInUser", username);
      } else {
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("loggedInUser", username);
      }

      window.location.href = "index.html";
      return false;
    }
  }

  alert("Incorrect username or password.");
  return false;
}



const currentPage = window.location.pathname.split("/").pop();
if (!localStorage.getItem("isLoggedIn") && currentPage !== "login.html") {
  location.href = "login.html"; 
} else if (document.getElementById("welcome-message")) {
  const loggedInUser = localStorage.getItem("loggedInUser");
  if (loggedInUser) {
    document.getElementById("welcome-message").innerText = `Welcome, ${loggedInUser}!`;
  }
}

function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("loggedInUser");
  sessionStorage.removeItem("isLoggedIn");
  sessionStorage.removeItem("loggedInUser");
  alert("You have been logged out.");
  location.href = "login.html";
}

const passwordInput = document.getElementById("password");
const toggleIcon = document.getElementById("toggle-password");

if (passwordInput && toggleIcon) {
  
  toggleIcon.addEventListener("click", function () {
    if (passwordInput.type === "password") {
      passwordInput.type = "text"; 
      toggleIcon.classList.remove("fa-eye-slash");
      toggleIcon.classList.add("fa-eye"); // Change icon to "eye open"
    } else {
      passwordInput.type = "password"; // Hide password
      toggleIcon.classList.remove("fa-eye");
      toggleIcon.classList.add("fa-eye-slash"); // Change icon to "eye closed"
    }
  });
} else {
  console.error("Password input or toggle icon not found!");
}




//slidescript
let nextDom = document.getElementById('next');
let prevDom = document.getElementById('prev');

let carouselDom = document.querySelector('.carousel');
let SliderDom = carouselDom.querySelector('.carousel .list');
let thumbnailBorderDom = document.querySelector('.carousel .thumbnail');
let thumbnailItemsDom = thumbnailBorderDom.querySelectorAll('.item');
let timeDom = document.querySelector('.carousel .time');

thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);
let timeRunning = 3000;
let timeAutoNext = 7000;

nextDom.onclick = function(){
    showSlider('next');    
}

prevDom.onclick = function(){
    showSlider('prev');    
}
let runTimeOut;
let runNextAuto = setTimeout(() => {
    next.click();
}, timeAutoNext)
function showSlider(type){
    let  SliderItemsDom = SliderDom.querySelectorAll('.carousel .list .item');
    let thumbnailItemsDom = document.querySelectorAll('.carousel .thumbnail .item');
    
    if(type === 'next'){
        SliderDom.appendChild(SliderItemsDom[0]);
        thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);
        carouselDom.classList.add('next');
    }else{
        SliderDom.prepend(SliderItemsDom[SliderItemsDom.length - 1]);
        thumbnailBorderDom.prepend(thumbnailItemsDom[thumbnailItemsDom.length - 1]);
        carouselDom.classList.add('prev');
    }
    clearTimeout(runTimeOut);
    runTimeOut = setTimeout(() => {
        carouselDom.classList.remove('next');
        carouselDom.classList.remove('prev');
    }, timeRunning);

    clearTimeout(runNextAuto);
    runNextAuto = setTimeout(() => {
        next.click();
    }, timeAutoNext)
}

'use strict';

// modal variables
const modal = document.querySelector('[data-modal]');
const modalCloseBtn = document.querySelector('[data-modal-close]');
const modalCloseOverlay = document.querySelector('[data-modal-overlay]');

// modal function
const modalCloseFunc = function () { 
  modal.classList.add('closed'); 
}

// modal eventListener
modalCloseOverlay.addEventListener('click', modalCloseFunc);
modalCloseBtn.addEventListener('click', modalCloseFunc);

// notification toast variables
const notificationToast = document.querySelector('[data-toast]');
const toastCloseBtn = document.querySelector('[data-toast-close]');

// notification toast eventListener
toastCloseBtn.addEventListener('click', function () {
  notificationToast.classList.add('closed');
});

document.addEventListener('DOMContentLoaded', () => {
  const newsletterForm = document.querySelector('.newsletter form');
  const modal = document.querySelector('.modal');
  const overlay = document.querySelector('.modal-close-overlay');

  newsletterForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    const email = newsletterForm.querySelector('.email-field').value;

    if (email) {
      alert(`Thank you for subscribing with ${email}!`);
      newsletterForm.reset();

      // Close the modal
      modal.classList.add('closed'); // Add the closed class to close the modal
      overlay.classList.add('closed'); // Optional: You can also hide the overlay here
    } else {
      alert('Please enter a valid email address.');
    }
  });

  // Optional: Add event listener to close modal when overlay is clicked
  overlay.addEventListener('click', () => {
    modal.classList.add('closed');
    overlay.classList.add('closed');
  });
});



// COUNT DOWN
function startCountdown(duration, display) {
  let timer = duration, days, hours, minutes, seconds;
  setInterval(function () {
    days = parseInt(timer / (3600 * 24), 10);
    hours = parseInt((timer % (3600 * 24)) / 3600, 10);
    minutes = parseInt((timer % 3600) / 60, 10);
    seconds = parseInt(timer % 60, 10);

    // Display the countdown timer
    document.getElementById('days').querySelector('span').textContent = days < 10 ? "0" + days : days;
    document.getElementById('hours').querySelector('span').textContent = hours < 10 ? "0" + hours : hours;
    document.getElementById('minutes').querySelector('span').textContent = minutes < 10 ? "0" + minutes : minutes;
    document.getElementById('seconds').querySelector('span').textContent = seconds < 10 ? "0" + seconds : seconds;

    if (--timer < 0) {
      timer = 0;
    }
  }, 1000);
}

window.onload = function () {
  var countdown = (2 * 24 * 60 * 60) + (15 * 60) + 33; 
  startCountdown(countdown, document.querySelector('.countdown-timer'));
};
