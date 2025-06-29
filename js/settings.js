// Account Settings Form
const accountSettingsForm = document.getElementById("account-settings-form");
accountSettingsForm.addEventListener("submit", function (e) {
  e.preventDefault();
  // Retrieve form values
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  // Perform form validation and save changes
  if (password !== confirmPassword) {
    alert("Password and confirm password do not match.");
  } else {
    // Save changes to the server or perform other actions
    console.log("Account settings saved.");
  }
});

// Notification Settings Form
const notificationSettingsForm = document.getElementById("notification-settings-form");
notificationSettingsForm.addEventListener("submit", function (e) {
  e.preventDefault();
  // Retrieve form values
  const enableNotifications = document.getElementById("enable-notifications").checked;
  const notificationFrequency = document.getElementById("notification-frequency").value;
  // Save changes to the server or perform other actions
  console.log("Notification settings saved.");
});

// Energy Usage Preferences Form
const energyUsagePreferencesForm = document.getElementById("energy-usage-preferences-form");
energyUsagePreferencesForm.addEventListener("submit", function (e) {
  e.preventDefault();
  // Retrieve form values
  const preferredTime = document.getElementById("preferred-time").value;
  const energyThreshold = document.getElementById("energy-threshold").value;
  // Save changes to the server or perform other actions
  console.log("Energy usage preferences saved.");
});

// Data Privacy Form
const dataPrivacyForm = document.getElementById("data-privacy-form");
dataPrivacyForm.addEventListener("submit", function (e) {
  e.preventDefault();
  // Retrieve form values
  const dataSharing = document.getElementById("data-sharing").value;
  const dataRetention = document.getElementById("data-retention").value;
  // Save changes to the server or perform other actions
  console.log("Data privacy settings saved.");
});

// Language and Localization Form
const languageLocalizationForm = document.getElementById("language-localization-form");
languageLocalizationForm.addEventListener("submit", function (e) {
  e.preventDefault();
  // Retrieve form values
  const language = document.getElementById("language").value;
  const location = document.getElementById("location").value;
  // Save changes to the server or perform other actions
  console.log("Language and localization settings saved.");
});

// Theme and Display Settings Form
const themeDisplaySettingsForm = document.getElementById("theme-display-settings-form");
themeDisplaySettingsForm.addEventListener("submit", function (e) {
  e.preventDefault();
  // Retrieve form values
  const theme = document.getElementById("theme").value;
  const displayMode = document.getElementById("display-mode").value;
  // Save changes to the server or perform other actions
  console.log("Theme and display settings saved.");
});

// Energy Goals and Targets Form
const energyGoalsTargetsForm = document.getElementById("energy-goals-targets-form");
energyGoalsTargetsForm.addEventListener("submit", function (e) {
  e.preventDefault();
  // Retrieve form values
  const energyGoal = document.getElementById("energy-goal").value;
  const energyTarget = document.getElementById("energy-target").value;
  // Save changes to the server or perform other actions
  console.log("Energy goals and targets saved.");
});

// Integration Settings Form
const integrationSettingsForm = document.getElementById("integration-settings-form");
integrationSettingsForm.addEventListener("submit", function (e) {
  e.preventDefault();
  // Retrieve form values
  const apiKey = document.getElementById("integration-api-key").value;
  const endpoint = document.getElementById("integration-endpoint").value
