const CLIENT_ID = "2006943877"; // LINE Channel ID
const REDIRECT_URI = "https://the2dge.github.io/bean0428"; //網站 callback URL
function loginWithLINE() {
  
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("currentOrderId", window.currentOrderId || '');

  const loginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=profile%20openid%20email&state=checkout`;
  window.location.href = loginUrl;
}
/*
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
*/
function updateNavbarWithUserName(userName) {
  console.log('🔁 Updating login button with user:', userName);

  const loginBtn = document.getElementById('member-login-btn');
  if (loginBtn) {
    const userDisplay = document.createElement('span');
    userDisplay.id = 'member-name-display';
    userDisplay.textContent = `👤 ${userName}`;
    loginBtn.replaceWith(userDisplay);
  } else {
    console.warn('⚠️ member-login-btn not found in DOM');
  }
}

// Call this after login is confirmed
const storedUserName = sessionStorage.getItem('lineUserName');
if (storedUserName) updateNavbarWithUserName(storedUserName);
  
