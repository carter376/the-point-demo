const CONTACT = { phone: "5876002243", email: "carter@youthone.ca" };
const GOOGLE_BOOKING_URL = "https://calendar.app.google/6wzwpNBtrfCdhj8T8";
const fontPicker = document.querySelector("#fontPicker");
const fonts = { manrope: '"Manrope", Arial, sans-serif', "dm-sans": '"DM Sans", Arial, sans-serif', nunito: '"Nunito Sans", Arial, sans-serif', figtree: '"Figtree", Arial, sans-serif', poppins: '"Poppins", Arial, sans-serif', archivo: '"Archivo", Arial, sans-serif', "work-sans": '"Work Sans", Arial, sans-serif', outfit: '"Outfit", Arial, sans-serif', sora: '"Sora", Arial, sans-serif', "plus-jakarta": '"Plus Jakarta Sans", Arial, sans-serif', "space-grotesk": '"Space Grotesk", Arial, sans-serif', lexend: '"Lexend", Arial, sans-serif', rubik: '"Rubik", Arial, sans-serif', karla: '"Karla", Arial, sans-serif', bricolage: '"Bricolage Grotesque", Arial, sans-serif', montserrat: '"Montserrat", Arial, sans-serif', futura: '"Futura", "Futura PT", "Century Gothic", Arial, sans-serif' };
const savedFont = localStorage.getItem("the-point-font") || "manrope";
document.documentElement.style.setProperty("--app-font", fonts[savedFont]);
fontPicker.value = savedFont;
fontPicker.addEventListener("change", () => { document.documentElement.style.setProperty("--app-font", fonts[fontPicker.value]); localStorage.setItem("the-point-font", fontPicker.value); });
const slots = [
  ["9:30 AM – 10:30 AM", "8 spaces open"], ["10:30 AM – 11:30 AM", "5 spaces open"], ["11:30 AM – 12:30 PM", "Your booking", true], ["12:30 PM – 1:30 PM", "4 spaces open"], ["1:30 PM – 2:30 PM", "7 spaces open"]
];
const schedule = document.querySelector("#schedule");
const toast = document.querySelector("#toast");
const textLink = document.querySelector("#textLink");
const emailLink = document.querySelector("#emailLink");
textLink.href = `sms:${CONTACT.phone}`;
emailLink.href = `mailto:${CONTACT.email}`;
function notify(message) { toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 3000); }
function renderSlots() { schedule.innerHTML = slots.map(([time, status, taken]) => `<button class="slot ${status === "Your booking" ? "booked" : ""}" data-time="${time}" ${taken && status !== "Your booking" ? "disabled" : ""}><span class="slot-time">${time}</span><small class="${status === "Your booking" ? "tag" : ""}">${status}</small></button>`).join("") + `<button class="group-booking-card" id="openGroupBooking"><span class="group-plus">+</span><span><strong>Have a large group?</strong><small>Let’s plan a time together.</small></span><span class="group-arrow">→</span></button>`; }
function goToGoogleBooking() { window.location.assign(GOOGLE_BOOKING_URL); }
function startBooking() { goToGoogleBooking(); }
renderSlots();
document.querySelector("#bookNow").addEventListener("click", startBooking);
schedule.addEventListener("click", event => { if (event.target.closest(".slot")) startBooking(); });
document.querySelectorAll(".close").forEach(button => button.addEventListener("click", () => button.closest("dialog").close()));
document.querySelector("#openGroupBooking").addEventListener("click", () => document.querySelector("#groupDialog").showModal());
document.querySelector("#groupForm").addEventListener("submit", event => { event.preventDefault(); document.querySelector("#groupDialog").close(); event.currentTarget.reset(); notify("Your group booking request has been sent. We’ll reply within one business day."); });
document.querySelector("#switchView").addEventListener("click", event => { const panel=document.querySelector("#parentPanel"); const showing=!panel.hidden; panel.hidden=showing; event.target.textContent=showing ? "Parent view" : "Youth view"; panel.scrollIntoView({behavior:"smooth",block:"start"}); });
document.querySelector("#approveBookings").addEventListener("click", () => notify("Booking permission settings would open here."));
document.querySelector("#linkYouth").addEventListener("click", () => notify("A secure youth-account linking flow would open here."));
const surveyDialog = document.querySelector("#surveyDialog");
const surveyMonth = new Date().toISOString().slice(0, 7);
function openSurvey() { surveyDialog.showModal(); }
document.querySelector("#openSurvey").addEventListener("click", openSurvey);
document.querySelector("#surveyLater").addEventListener("click", () => surveyDialog.close());
document.querySelector("#surveyForm").addEventListener("submit", event => { event.preventDefault(); localStorage.setItem("the-point-survey-completed", surveyMonth); surveyDialog.close(); notify("Thanks! You’re entered into the $50 gift-card draw."); });
