const CLIENT_ID = "2006943877"; // LINE Channel ID
const REDIRECT_URI = "https://the2dge.github.io/bean0428"; //網站 callback URL
function loginWithLINE() {
  // fallback: try to load cart from sessionStorage if not in memory
  const storedCart = sessionStorage.getItem("cart");
  const currentCart = storedCart ? JSON.parse(storedCart) : [];
  // Store current scroll position
  sessionStorage.setItem("scrollPosition", window.scrollY);
  sessionStorage.setItem("cart", JSON.stringify(currentCart));  // 🔁 Important
  
   // Set a custom "state" to tell after login go to checkout
  const loginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=profile%20openid%20email&state=checkout`;

  //const loginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=profile%20openid%20email&state=12345`;
  
  // Redirect the browser to the LINE login page
  window.location.href = loginUrl;
}

function updateNavbarWithUserName(userName) {
  const loginBtn = document.getElementById('member-login-btn');
  if (loginBtn) {
    loginBtn.textContent = `👤 ${userName}`;
    loginBtn.disabled = true; // Optional: prevent re-clicking
  }
}

// Call this after login is confirmed
const storedUserName = sessionStorage.getItem('lineUserName');
if (storedUserName) updateNavbarWithUserName(storedUserName);
  
