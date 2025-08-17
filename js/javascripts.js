// Function to validate form
function formValidation() {
  const name = document.getElementById("name-input").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  // Cek apakah semua field sudah diisi
  if (name && email && message) {
    // Tampilkan alert dengan informasi dari form
    alert(
      `Thank you, ${name}! We have received your message.\nWe will contact you at ${email} soon.`
    );

    // Reset form setelah alert hilang
    setTimeout(() => {
      document.getElementById("contact-form").reset(); // Reset form
    }, 0); // Tunggu hingga alert selesai
  } else {
    alert("Please fill out all fields before submitting the form.");
  }
}

// Menambahkan event listener untuk tombol submit
document.getElementById("submit-btn").addEventListener("click", formValidation);

// Banner Background Change Function
let indexBanner = 0;

changeBackground();

function nextBanner() {
  indexBanner = indexBanner + 1;
  changeBackground();
}

// Function to change background banner
function changeBackground() {
  let bannerList = document.getElementsByClassName("banner-image");

  if (indexBanner >= bannerList.length) {
    // Reset indexBanner
    indexBanner = 0;
  }

  // Looping to change background
  for (let i = 0; i < bannerList.length; i++) {
    bannerList[i].style.display = "none";
  }

  bannerList[indexBanner].style.display = "block";
}

setInterval(nextBanner, 3000);

// Function to change image list for slider
const slides = document.querySelector(".image-list");
const slideItems = slides.children;
const slideWidth = slideItems[0].offsetWidth;

// Duplikasi elemen pertama dan terakhir
const firstClone = slideItems[0].cloneNode(true);
const lastClone = slideItems[slideItems.length - 1].cloneNode(true);

// Tambahkan klon ke slider
slides.appendChild(firstClone);
slides.insertBefore(lastClone, slideItems[0]);

// Atur posisi awal ke elemen pertama yang asli
let currentIndex = 1;
slides.style.transform = `translateX(${-slideWidth * currentIndex}px)`;

// Fungsi untuk perpindahan slider
function slideNext() {
  currentIndex++;
  slides.style.transition = "transform 0.5s ease-in-out";
  slides.style.transform = `translateX(${-slideWidth * currentIndex}px)`;

  if (currentIndex === slideItems.length) {
    setTimeout(() => {
      slides.style.transition = "none";
      currentIndex = 1;
      slides.style.transform = `translateX(${-slideWidth * currentIndex}px)`;
    }, 500);
  }
}

setInterval(slideNext, 3000);
