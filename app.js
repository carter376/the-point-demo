const CONTACT = { phone: "5876002243", email: "carter@youthone.ca" };
// Paste the form ID from formspree.io here (e.g. "xabcdwxy"). Until it's set, forms fall back to opening the visitor's email app.
const FORMSPREE_FORM_ID = "xbglvwal";
const GOOGLE_BOOKING_URL = "https://calendar.app.google/6wzwpNBtrfCdhj8T8";
// Opening hours by weekday (1 = Monday), in minutes after midnight. Days not listed are closed.
const HOURS = { 1: [570, 870], 2: [570, 870], 3: [570, 870], 4: [570, 870], 5: [600, 720] };
const MAX_DAYS_AHEAD = 28;
let dayOffset = 0;
const schedule = document.querySelector("#schedule");
const dateLabel = document.querySelector("#dateLabel");
const prevDay = document.querySelector("#prevDay");
const nextDay = document.querySelector("#nextDay");
const toast = document.querySelector("#toast");
const textLink = document.querySelector("#textLink");
const emailLink = document.querySelector("#emailLink");
textLink.href = `sms:${CONTACT.phone}`;
emailLink.href = `mailto:${CONTACT.email}`;
function notify(message) { toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 4000); }
// Sends a form's answers to CONTACT.email. Returns "sent" via Formspree, or "email" when it falls back to the visitor's email app.
async function sendToInbox(subject, body, replyTo) {
  if (!FORMSPREE_FORM_ID) {
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return "email";
  }
  const response = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ _subject: subject, message: body, ...(replyTo?.includes("@") && { email: replyTo }) })
  });
  if (!response.ok) throw new Error(`Formspree responded ${response.status}`);
  return "sent";
}
async function submitForm(form, dialog, subject, body, replyTo, messages) {
  const button = form.querySelector("[type=submit]");
  button.disabled = true;
  try {
    const result = await sendToInbox(subject, body, replyTo);
    dialog.close();
    form.reset();
    notify(messages[result]);
    return true;
  } catch {
    notify(`Sorry, that didn’t send. Please try again, or email ${CONTACT.email}.`);
    return false;
  } finally {
    button.disabled = false;
  }
}
function formatTime(minutes) { const h = Math.floor(minutes / 60), m = minutes % 60; return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; }
function selectedDate() { const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() + dayOffset); return date; }
function renderSlots() {
  const date = selectedDate();
  const hours = HOURS[date.getDay()];
  const dateText = date.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
  dateLabel.textContent = dayOffset === 0 ? `Today · ${dateText}` : dayOffset === 1 ? `Tomorrow · ${dateText}` : dateText;
  prevDay.disabled = dayOffset === 0;
  nextDay.disabled = dayOffset === MAX_DAYS_AHEAD;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  let slots = "";
  if (!hours) slots = `<p class="closed-day">The Point is closed on weekends. Use the arrows to pick a weekday.</p>`;
  else for (let start = hours[0]; start < hours[1]; start += 60) {
    const past = dayOffset === 0 && start + 60 <= nowMinutes;
    slots += `<button class="slot" ${past ? "disabled" : ""}><span class="slot-time">${formatTime(start)} – ${formatTime(start + 60)}</span><small>${past ? "Already passed" : "Tap to book"}</small></button>`;
  }
  schedule.innerHTML = slots + `<button class="group-booking-card" id="openGroupBooking"><span class="group-plus">+</span><span><strong>Have a large group?</strong><small>Let’s plan a time together.</small></span><span class="group-arrow">→</span></button>`;
}
prevDay.addEventListener("click", () => { dayOffset--; renderSlots(); });
nextDay.addEventListener("click", () => { dayOffset++; renderSlots(); });
function goToGoogleBooking() { window.location.assign(GOOGLE_BOOKING_URL); }
function startBooking() { goToGoogleBooking(); }
renderSlots();
document.querySelector("#bookNow").addEventListener("click", startBooking);
schedule.addEventListener("click", event => { if (event.target.closest(".slot")) startBooking(); if (event.target.closest("#openGroupBooking")) document.querySelector("#groupDialog").showModal(); });
document.querySelectorAll(".close").forEach(button => button.addEventListener("click", () => button.closest("dialog").close()));
document.querySelector("#groupForm [name=preferredDate]").min = new Date().toLocaleDateString("en-CA");
document.querySelector("#groupForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const body = [
    `Group type: ${data.get("groupType")}`,
    `Approximate group size: ${data.get("groupSize")}`,
    `Preferred date: ${data.get("preferredDate")}`,
    `Preferred time: ${data.get("preferredTime")}`,
    `Main contact: ${data.get("contactName")}`,
    `Email: ${data.get("contactEmail")}`,
    `Phone: ${data.get("contactPhone")}`,
    "",
    `What the group would like to use The Point for:\n${data.get("purpose")}`,
    "",
    `Anything we should know:\n${data.get("needs") || "Nothing noted"}`
  ].join("\n");
  const subject = `Group booking request: ${data.get("groupType")}, ${data.get("preferredDate")}`;
  submitForm(form, document.querySelector("#groupDialog"), subject, body, data.get("contactEmail"), {
    sent: "Your group booking request has been sent. We’ll reply within one business day.",
    email: "Your email app is opening with the request filled in. Press Send to finish."
  });
});
const surveyDialog = document.querySelector("#surveyDialog");
const surveyMonth = new Date().toISOString().slice(0, 7);
function openSurvey() { surveyDialog.showModal(); }
document.querySelector("#openSurvey").addEventListener("click", openSurvey);
document.querySelector("#surveyLater").addEventListener("click", () => surveyDialog.close());
document.querySelector("#surveyForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const body = [
    `Name: ${data.get("surveyName")}`,
    `Email or phone: ${data.get("surveyContact")}`,
    "",
    `1. Overall rating: ${data.get("rating")} out of 5 stars`,
    `2. App made booking easier: ${data.get("appHelped") === "yes" ? "Yes" : "No"}`,
    "",
    `3. What could make The Point better:\n${data.get("improvements") || "No answer"}`,
    "",
    `4. Snack ideas:\n${data.get("snacks") || "No answer"}`
  ].join("\n");
  const subject = `Monthly check-in survey: ${data.get("surveyName")} (${surveyMonth})`;
  submitForm(form, surveyDialog, subject, body, data.get("surveyContact"), {
    sent: "Thanks! You’re entered into the $50 gift-card draw.",
    email: "Your email app is opening with your answers. Press Send to enter the draw."
  }).then(sent => { if (sent) localStorage.setItem("the-point-survey-completed", surveyMonth); });
});
