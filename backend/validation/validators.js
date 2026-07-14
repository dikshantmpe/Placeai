// Email validation regex
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Password validation - 8+ chars with uppercase, lowercase, number, special character
const isValidPassword = (password) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[^a-zA-Z0-9]/.test(password)) return false;
  return true;
};

// Get password strength score
const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const strengths = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
  return strengths[Math.min(score - 1, 4)] || "Weak";
};

// Validate name
const isValidName = (name) => {
  return name && name.trim().length >= 2;
};

module.exports = {
  isValidEmail,
  isValidPassword,
  getPasswordStrength,
  isValidName
};