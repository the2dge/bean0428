//document.addEventListener('DOMContentLoaded', () => {
let cart =[];
document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM Element References ---
    const navbar = {
        logo: document.querySelector('.logo'),
        aboutLink: document.getElementById('nav-about'),
        productLink: document.getElementById('nav-product'),
        contactLink: document.getElementById('nav-contact'), // Assuming contact might scroll to footer
        cartIconBtn: document.getElementById('cart-icon'),
        cartItemCountSpan: document.getElementById('cart-item-count')
    };

    const mainBody = {
        contentWrapper: document.getElementById('content-wrapper'),
        itemWrapper: document.getElementById('item-wrapper'),
        checkoutWrapper: document.getElementById('checkout-wrapper')
    };

    const contentContainers = {
        bannerSlider: document.getElementById('banner-slider-container'),
        about: document.getElementById('about-container'),
        productContainer: document.getElementById('product-container'), // Keep main container ref
        categoryFiltersContainer: document.querySelector('.category-filters'), // ADD Filter container ref
        productGrid: document.querySelector('#product-container .product-grid') // ADD Single grid ref
    };
     // --- State Variables ---
    // let cart = []; a Global parameter now
    let currentView = 'content';
    let allProductsData = []; // Store the original full list of products
    let allItemDetails = {};
    let currentFilterCategory = 'All'; // ADD state for the active filter, default to 'All'

    const sideCart = {
        aside: document.getElementById('side-cart'),
        itemsContainer: document.getElementById('side-cart-items'),
        closeBtn: document.getElementById('close-cart-btn'),
        totalSpan: document.getElementById('cart-total'),
        checkoutBtn: document.getElementById('checkout-btn')
    };

    const checkoutForm = document.getElementById('checkout-form');

    // --- Data Fetching Functions ---
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Could not fetch data from ${url}:`, error);
            return null; // Return null or appropriate error indicator
        }
    }
    //Re-calculate Cart Total
    function calculateCartTotal() {
        let total = 0;
        cart.forEach(item => {
            const price = parseFloat(item.price.replace(/[^0-9.-]+/g,""));
            if (!isNaN(price)) {
                total += price * item.quantity;
            }
        });
        return total;
    }
    //Validate Promo Code
    function validateDiscountCode(inputCode) {
      const member = membershipData.find(m =>
        m.discountCode.toLowerCase() === inputCode.trim().toLowerCase()
      );

      if (member) {
        const tier = member.tier.toLowerCase();

        // ✅ Save for later use (reward, display, etc.)
        sessionStorage.setItem('discountCode', member.discountCode);
        sessionStorage.setItem('discountTier', member.tier);
       

        switch (tier) {
          case 'gold':
            return 0.05;
          case 'silver':
            return 0.03;
          case 'bronze':
            return 0.01;
          default:
            return 0;
        }
      } else {
        // ❌ Clear old values if invalid
        sessionStorage.removeItem('discountCode');
        sessionStorage.removeItem('discountTier'); 
        return 0;
      }
    }

    //Read Discount Code pushed from GAS!
        let membershipData = []; // Store membership data globally

        async function loadMembershipData() {
            try {
                const response = await fetch(' https://script.google.com/macros/s/AKfycbzZhiPYkL62ZHeRMi1-RCkVQUodJDe6IR7UvNouwM1bkHmepJAfECA4JF1_HHLn9Zu7Yw/exec'); // Replace with your Web App URL
                membershipData = await response.json();
                console.log("Loaded membership promo codes:", membershipData);
            } catch (error) {
                console.error('Failed to load membership data:', error);
            }
        }
    // --- Rendering Functions ---

     function renderBanner(bannerData) {
        const bannerContainer = $('#banner-slider-container'); // Use jQuery selector
        bannerContainer.empty(); // Clear previous content
        
        if (!bannerData || bannerData.length === 0) {
             bannerContainer.html('<p>No banners available.</p>');
             return false; // Indicate failure or no banners
        }

        // Create slides using jQuery
        bannerData.forEach((banner, index) => {
            
            const slide = $('<div>') // Create <div>
                .addClass('banner-slide') // Add class
                .append( // Add image inside
                    $('<img>').attr('src', banner.imageUrl).attr('alt', banner.altText)
                );
            if (index === 0) {
                slide.show(); // Show the first slide initially (CSS also handles this)
            }
            bannerContainer.append(slide); // Add slide to container
        });
        return true; // Indicate success
    }

    // --- NEW: jQuery Slideshow Logic ---
    function startBannerSlideshow() {
        const $slides = $('.banner-slide'); // Get all slides
        if ($slides.length <= 1) return; // Don't start slideshow if 0 or 1 slide

        let currentSlideIndex = 0;
        const slideInterval = 4000; // Time per slide in milliseconds (e.g., 4 seconds)

        setInterval(() => {
            const $currentSlide = $slides.eq(currentSlideIndex); // Get current slide jQuery object

            // Calculate next slide index, looping back to 0
            let nextSlideIndex = (currentSlideIndex + 1) % $slides.length;
            const $nextSlide = $slides.eq(nextSlideIndex); // Get next slide jQuery object

            // Fade out current slide and fade in next slide
            $currentSlide.fadeOut(1000); // 1 second fade out
            $nextSlide.fadeIn(1000); // 1 second fade in

            currentSlideIndex = nextSlideIndex; // Update the current index
        }, slideInterval);
    }


    function renderAbout(aboutData) {
         if (!aboutData) {
             contentContainers.about.innerHTML = '<p>Error loading about information.</p>';
             return;
         }
        contentContainers.about.innerHTML = `
            <h2>${aboutData.title}</h2>
            <div>${aboutData.content}</div>
        `;
    }
    function renderCategoryFilters(products) {
        if (!contentContainers.categoryFiltersContainer) return; // Exit if container not found

        const container = contentContainers.categoryFiltersContainer;
        container.innerHTML = ''; // Clear existing buttons

        // Extract unique categories
        const categories = [...new Set(products.map(p => p.category || 'Other'))].sort();

        // Create "All" button
        const allButton = document.createElement('button');
        allButton.classList.add('filter-btn');
        allButton.setAttribute('data-category', 'All');
        allButton.textContent = 'all'; // Or use a local term like '全部'
        if (currentFilterCategory === 'All') {
            allButton.classList.add('active'); // Mark as active initially
        }
        container.appendChild(allButton);

        // Create buttons for each unique category
        categories.forEach(category => {
            const button = document.createElement('button');
            button.classList.add('filter-btn');
            button.setAttribute('data-category', category);
            button.textContent = category; // e.g., "堅果"
            if (currentFilterCategory === category) {
                button.classList.add('active'); // Mark as active if it's the current filter
            }
            container.appendChild(button);
        });
    }
    function renderProductGrid(products) {
        const grid = contentContainers.productGrid; // Target the single grid
        if (!grid) {
            console.error("Product grid container not found!");
            return;
        }
        grid.innerHTML = ''; // Clear previous products

        // Filter products based on the current state
        const filteredProducts = (currentFilterCategory === 'All')
            ? products // Show all if 'All' is selected
            : products.filter(p => (p.category || 'Other') === currentFilterCategory);

        if (!filteredProducts || filteredProducts.length === 0) {
            grid.innerHTML = '<p>No products found in this category.</p>';
            return;
        }

        // Render only the filtered products
        filteredProducts.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product-item');
            productDiv.setAttribute('data-product-id', product.id);
            productDiv.innerHTML = `
                <img src="${product.thumbnailUrl}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.price}</p>
                ${product.title ? `<p class="product-title">${product.title}</p>` : ''}
            `;
            grid.appendChild(productDiv);
        });
    }
/* IT was used before the product Category is used
    function renderProductGrid(products) {
        if (!products) {
             contentContainers.productGrid.innerHTML = '<p>Error loading products.</p>';
             return;
         }
        contentContainers.productGrid.innerHTML = ''; // Clear previous content
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product-item');
            productDiv.setAttribute('data-product-id', product.id);
            productDiv.innerHTML = `
                <img src="${product.thumbnailUrl}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.price}</p>
            `;
            contentContainers.productGrid.appendChild(productDiv);
        });
    }
*/ 
    function renderItemDetails(productId) {
        const itemData = allItemDetails[productId];
        if (!itemData) {
            mainBody.itemWrapper.innerHTML = `<p>Error: Product details not found for ID ${productId}.</p>`;
            switchView('content'); // Go back if details aren't found
            return;
        }

        mainBody.itemWrapper.innerHTML = `
            <article class="item-detail">
                <img src="${itemData.largeImageUrl}" alt="${itemData.name}">
                <div class="item-info">
                    <h2>${itemData.name}</h2>
                    <p>${itemData.description}</p>
                    ${itemData.specs ? `<ul>${Object.entries(itemData.specs).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('')}</ul>` : ''}
                    <p class="price">${itemData.price}</p>
                    <button class="add-to-cart-btn" data-product-id="${itemData.id}">加入購物車</button>
                     <button class="back-to-products-btn">返回產品頁</button> </div>
            </article>
        `;
         // Add listener specifically for the new back button
        const backBtn = mainBody.itemWrapper.querySelector('.back-to-products-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => switchView('content'));
        }
    }

    function renderSideCart() {
        sideCart.itemsContainer.innerHTML = ''; // Clear current items
        if (cart.length === 0) {
            sideCart.itemsContainer.innerHTML = '<p>您的購物車是空的。</p>';
        } else {
            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('side-cart-item');
                cartItemDiv.setAttribute('data-cart-item-id', item.id);
                cartItemDiv.innerHTML = `
                    <img src="${item.img}" alt="${item.name}">
                    <div class="item-info">
                        <p class="name">${item.name}</p>
                        <p class="price">${item.price}</p>
                        <div class="quantity-control">
                            <button class="decrease-qty-btn" data-product-id="${item.id}">➖</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="increase-qty-btn" data-product-id="${item.id}">➕</button>
                        </div>
                    </div>
                    <button class="remove-item-btn">Remove</button>
                `;
                sideCart.itemsContainer.appendChild(cartItemDiv);
            });
            
        }

        // Update total and item count
        sideCart.totalSpan.textContent = calculateTotal();
        navbar.cartItemCountSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

        // Show/hide checkout button based on cart content
        sideCart.checkoutBtn.style.display = cart.length > 0 ? 'block' : 'none';
    }

    // --- View Switching ---
    function switchView(viewName) {
        currentView = viewName;
        // Hide all wrappers
        mainBody.contentWrapper.classList.remove('active');
        mainBody.itemWrapper.classList.remove('active');
        mainBody.checkoutWrapper.classList.remove('active');

        // Show the target wrapper
        switch (viewName) {
            case 'content':
                mainBody.contentWrapper.classList.add('active');
                break;
            case 'item':
                mainBody.itemWrapper.classList.add('active');
                break;
            case 'checkout':
                mainBody.checkoutWrapper.classList.add('active');
                break;
        }
         window.scrollTo(0, 0); // Scroll to top on view change
    }

    // --- Cart Logic ---
    function addToCart(productId) {
        const productToAdd = allProductsData.find(p => p.id === productId);
        const itemDetails = allItemDetails[productId]; // Get details for image etc.

        if (!productToAdd || !itemDetails) {
            console.error("Cannot add product to cart: Data missing.");
            alert("Sorry, there was an error adding this item.");
            return;
        }

        const existingCartItemIndex = cart.findIndex(item => item.id === productId);

        if (existingCartItemIndex > -1) {
            // Item already in cart, increase quantity
            cart[existingCartItemIndex].quantity += 1;
        } else {
            // Add new item to cart
            cart.push({
                id: productId,
                name: productToAdd.name,
                price: productToAdd.price, // Use price from product grid data
                img: productToAdd.thumbnailUrl, // Use thumbnail for cart
                quantity: 1
            });
        }

        console.log("Cart updated:", cart);
        renderSideCart(); // Update the visual cart display
        // Optional: Briefly open the side cart to show the item was added
        // sideCart.aside.classList.add('open');
        // setTimeout(() => sideCart.aside.classList.remove('open'), 1500); // Auto close after 1.5s
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        console.log("Cart updated after removal:", cart);
        renderSideCart(); // Update the visual cart display
    }

    function calculateTotal(discountPercent = 0) {
      let total = 0;

      cart.forEach(item => {
        const price = parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
        if (!isNaN(price)) {
          total += price * item.quantity;
        }
      });

      if (discountPercent > 0) {
        total *= (1 - discountPercent / 100);
      }

      return `$${total.toFixed(2)}`;
    }
    function changeCartQuantity(productId, changeAmount) {
        const cartItemIndex = cart.findIndex(item => item.id === productId);
        if (cartItemIndex > -1) {
            cart[cartItemIndex].quantity += changeAmount;

            if (cart[cartItemIndex].quantity <= 0) {
                // Remove the item if quantity is zero or less
                cart.splice(cartItemIndex, 1);
            }

            renderSideCart(); // Re-render cart after change
        }
    }
    function openLogisticsMap(orderId) {
      //const orderId = window.currentOrderId;
        
      if (!orderId) {
        alert("Order ID 尚未生成，無法開啟門市選擇頁面");
        return;
      }
      // Open the Cloud Function, passing orderId to ECPay
      const url = `https://mrbean-website-store-select-545199463340.asia-east1.run.app?orderId=${encodeURIComponent(orderId)}`;
      window.open(url, "_self");
    }
function ECpayStoreDataBackTransfer() {
  const urlParams = new URLSearchParams(window.location.search);

  const MerchantID = urlParams.get('MerchantID');
  const CVSStoreID = urlParams.get('CVSStoreID');
  const CVSStoreName = urlParams.get('CVSStoreName');
  const CVSAddress = urlParams.get('CVSAddress');
  const MerchantTradeNo = urlParams.get('MerchantTradeNo');

  if (MerchantID && CVSStoreID && CVSStoreName && CVSAddress) {
    console.log("🛍️ Store info received from ECPay:", CVSStoreID, CVSStoreName, CVSAddress);

    const pickupInfoDiv = document.getElementById('pickup-store-info');
    if (pickupInfoDiv) {
      pickupInfoDiv.innerHTML = `
        <p><strong>7-11 門市資訊</strong></p>
        <p>店號: ${CVSStoreID}</p>
        <p>店名: ${CVSStoreName}</p>
        <p>地址: ${CVSAddress}</p>
      `;
    }

    const addressSelect = document.getElementById('address');
    if (addressSelect) addressSelect.value = '7-11 商店取貨';

    window.selectedStoreInfo = { CVSStoreID, CVSStoreName, CVSAddress, MerchantTradeNo };
  }
}
    /*
    function ECpayStoreDataBackTransfer() {
    const urlParams = new URLSearchParams(window.location.search);

    const MerchantID = urlParams.get('MerchantID');
    const CVSStoreID = urlParams.get('CVSStoreID');
    const CVSStoreName = urlParams.get('CVSStoreName');
    const CVSAddress = urlParams.get('CVSAddress');
    const MerchantTradeNo = urlParams.get('MerchantTradeNo');

    if (MerchantID && CVSStoreID && CVSStoreName && CVSAddress && MerchantTradeNo) {
        console.log("Received Store Info from ECPay:", {
            MerchantID,
            CVSStoreID,
            CVSStoreName,
            CVSAddress,
            MerchantTradeNo
        });

        // 🛑 First, restore cart from sessionStorage
        const savedCart = sessionStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            console.log("Restored cart inside ECpayStoreDataBackTransfer:", cart);
        } else {
            console.warn("No saved cart found in sessionStorage.");
        }

        const storeInfo = {
            CVSStoreID,
            CVSStoreName,
            CVSAddress,
            MerchantTradeNo
        };

        renderCheckoutPage(cart, storeInfo); // ✅ Now use correct cart
        console.log("checkPt only");
        switchView('checkout');

        window.selectedStoreInfo = storeInfo;

        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        console.log("No ECPay store data returned, normal page load.");
    }
}
*/

function renderCheckoutPage(cartItems, storeInfo = null) {
    mainBody.checkoutWrapper.innerHTML = ''; // Clear previous checkout content
        // --- Checkout Form ---
    const checkoutForm = document.createElement('form');
    checkoutForm.id = 'checkout-form';
    const storedName = sessionStorage.getItem('lineUserName') || '';
    const storedEmail = sessionStorage.getItem('lineUserEmail') || '';

    checkoutForm.innerHTML = `
    <label for="name">收件人姓名</label>
    <input type="text" id="name" name="name" value="${storedName}" required>

    <label for="email">Email:</label>
    <input type="email" id="email" name="email"  value="${storedEmail}" required>

    <label for="telephone">電話:</label>
    <input type="tel" id="telephone" name="telephone" required>
    
    <label for="address">取貨方式:</label>
    <select id="address" name="address" required>
        <option value="取貨選擇">請選擇 7-11 或來店取</option>
        <option value="來商店取貨">來商店取貨</option>
        <option value="7-11 商店取貨">7-11 商店取貨</option>
    </select>

    <div id="pickup-store-info"></div>
    <label for="payment-method">付款方式:</label>
    <select id="payment-method" name="payment-method" required>
        <option value="store">到店付款 (Pay at Store)</option>
        <option value="credit-card">信用卡付款 (Pay by Credit Card)</option>
        
    </select>
    <div id="credit-proof-wrapper" style="display: none;">
    <label for="credit_payment">信用卡付款:</label>
    <img src ="image/creditcard.png" width="80px">
    </div>
    <div id="discount-code-wrapper" style="display: none;">
        <label for="discount_code">折扣碼:</label>
        <input type="text" id="discount_code" name="discount_code">
    </div>



    <button  id="submit-order-btn" type="submit">下單</button>
`;
    
    // --- Checkout Main Title + Member Login Button ---
    const titleRow = document.createElement('div');
    titleRow.classList.add('checkout-title-row');

    const checkoutTitle = document.createElement('h2');
    checkoutTitle.textContent = '- 結帳 -';
    titleRow.appendChild(checkoutTitle);

    const lineUserName = sessionStorage.getItem('lineUserName');

if (lineUserName) {
    const paymentMethodSelect = checkoutForm.querySelector('#payment-method');
    const creditOption = document.createElement('option');
    creditOption.value = 'credit-point';
    creditOption.textContent = '點數付款 (Pay by Credit Point)';
    paymentMethodSelect.appendChild(creditOption);
    
    const memberWrapper = document.createElement('div');
    memberWrapper.classList.add('member-dropdown-wrapper');

    // Display name button
    const nameBtn = document.createElement('button');
    nameBtn.textContent = `👤 ${lineUserName} ▾`;
    nameBtn.classList.add('member-name-btn');

    // Dropdown menu
    const dropdown = document.createElement('div');
    dropdown.classList.add('member-dropdown');
    dropdown.style.display = 'none';

    // View Orders
    const viewOrders = document.createElement('div');
    viewOrders.textContent = '查看訂單';
    viewOrders.classList.add('dropdown-item');
    viewOrders.addEventListener('click', () => {
        alert('📦 顯示訂單列表 (模擬)');
        dropdown.style.display = 'none';
    });

    // Credit Balance
    const creditBalance = document.createElement('div');
    creditBalance.textContent = 'Credit Balance';
    creditBalance.classList.add('dropdown-item');

    creditBalance.addEventListener('click', async () => {
      const lineUserId = sessionStorage.getItem('lineUserId');

      if (!lineUserId) {
        alert('⚠️ 尚未登入 LINE 帳號，請先登入會員');
        dropdown.style.display = 'none';
        return;
      }

      try {
        const res = await fetch(`https://script.google.com/macros/s/AKfycbzZhiPYkL62ZHeRMi1-RCkVQUodJDe6IR7UvNouwM1bkHmepJAfECA4JF1_HHLn9Zu7Yw/exec?mode=getMemberInfo&lineUserId=${lineUserId}`);
        const data = await res.json();

        if (data.status === 'success') {
          alert(`💰 目前點數餘額：${data.creditBalance}`);
        } else if (data.status === 'not_found') {
          alert('⚠️ 查無此會員資料，請聯絡客服');
        } else {
          alert('❌ 無法取得點數資料，請稍後再試');
        }
      } catch (err) {
        console.error('Error fetching credit balance:', err);
        alert('🚫 發生錯誤，請檢查網路或稍後再試');
      }

      dropdown.style.display = 'none';
    });

    // Logout
    const logout = document.createElement('div');
    logout.textContent = 'Logout';
    logout.classList.add('dropdown-item');
    logout.addEventListener('click', () => {
        sessionStorage.removeItem('lineUserName');
        sessionStorage.removeItem('lineUserEmail');
        sessionStorage.removeItem('lineUserId');
        localStorage.removeItem('cart');
        localStorage.removeItem('currentOrderId');
        alert('已登出，請重新登入');
        window.location.reload(); // refresh the site
    });

    dropdown.appendChild(viewOrders);
    dropdown.appendChild(creditBalance);
    dropdown.appendChild(logout);

    nameBtn.addEventListener('click', () => {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });

    memberWrapper.appendChild(nameBtn);
    memberWrapper.appendChild(dropdown);
    titleRow.appendChild(memberWrapper);
} else {
    // ❌ Not logged in → show login button
    const memberLoginBtn = document.createElement('button');
    memberLoginBtn.textContent = '會員登入';
    memberLoginBtn.classList.add('member-login-btn');
    memberLoginBtn.addEventListener('click', () => {
        loginWithLINE();
    });
    titleRow.appendChild(memberLoginBtn);
}

    mainBody.checkoutWrapper.appendChild(titleRow);

    // --- Ordered Items Title ---
    const orderedItemsTitle = document.createElement('h2');
    orderedItemsTitle.textContent = '我訂購的商品';
    mainBody.checkoutWrapper.appendChild(orderedItemsTitle);

    // --- Ordered Items List ---
    let totalPrice = 0;
    if (cartItems.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'No items to checkout.';
        mainBody.checkoutWrapper.appendChild(emptyMessage);
    } else {
        const checkoutList = document.createElement('div');
        checkoutList.classList.add('checkout-list');

        cartItems.forEach(item => {
            const itemRow = document.createElement('div');
            itemRow.classList.add('checkout-item-row');

            itemRow.innerHTML = `
                <img src="${item.img}" alt="${item.name}">
                <span class="checkout-name">${item.name}</span>
                <span class="checkout-quantity">x ${item.quantity}</span>
                <span class="checkout-price">${item.price}</span>
            `;

            checkoutList.appendChild(itemRow);

            const priceNumber = parseFloat(item.price.replace(/[^0-9.]/g, ''));
            if (!isNaN(priceNumber)) {
                totalPrice += priceNumber * item.quantity;
            }
        });

        mainBody.checkoutWrapper.appendChild(checkoutList);

        // --- Total Price ---
        const totalRow = document.createElement('div');
        totalRow.classList.add('checkout-total');
        totalRow.id = 'checkout-total-row'; // <-- add ID for updating later(DiscountCode)
        totalRow.innerHTML = `<strong>Total:</strong> $${totalPrice.toFixed(2)}`;
        mainBody.checkoutWrapper.appendChild(totalRow);
    }



    mainBody.checkoutWrapper.appendChild(checkoutForm);
    // --- Event Listener: Monitor Address Dropdown ---
    
    const addressSelect = checkoutForm.querySelector('#address');
    const submitBtn = document.getElementById('submit-order-btn');
    // Disable on initial load
    submitBtn.disabled = true;
    addressSelect.addEventListener('change', (e) => {
        const selected = addressSelect.value;
        if (selected === '7-11 商店取貨' || selected === '來商店取貨') {
            submitBtn.disabled = false;
          } else {
            submitBtn.disabled = true;
          }

        if (e.target.value === '7-11 商店取貨') {
            // Generate timestamp orderId
            const now = new Date();
            const orderId = now.getFullYear().toString() +
                            String(now.getMonth() + 1).padStart(2, '0') +
                            String(now.getDate()).padStart(2, '0') +
                            String(now.getHours()).padStart(2, '0') +
                            String(now.getMinutes()).padStart(2, '0') +
                            String(now.getSeconds()).padStart(2, '0');
            window.currentOrderId = orderId; // 🛡️ Save the current order ID
            localStorage.setItem('cart', JSON.stringify(cart));
            localStorage.setItem('currentOrderId', orderId);
            console.log("Saving cart to sessionStorage before going to ECPay:", cart); // 👈 Important log

            openLogisticsMap(orderId);
        }
    });
    
    const paymentMethodSelect = checkoutForm.querySelector('#payment-method');
    const discountCodeWrapper = checkoutForm.querySelector('#discount-code-wrapper');
    const creditProofWrapper = checkoutForm.querySelector('#credit-proof-wrapper');

    paymentMethodSelect.addEventListener('change', async (e) => {
  const selectedMethod = e.target.value;
  const addressValue = document.getElementById('address').value;
  const submitBtn = document.getElementById('submit-order-btn');

  if (selectedMethod === 'credit-point') {
    discountCodeWrapper.style.display = 'block';
    creditProofWrapper.style.display = 'none';

    // Run credit point balance check
    const lineUserId = sessionStorage.getItem('lineUserId');
    const totalText = document.querySelector('.checkout-total')?.textContent || '';
    const totalAmount = parseFloat(totalText.replace(/[^0-9.]/g, ''));

    if (!lineUserId) {
      alert('⚠️ 尚未登入會員，無法使用點數付款');
      submitBtn.disabled = true;
      return;
    }

    try {
      const res = await fetch(`https://script.google.com/macros/s/AKfycbzZhiPYkL62ZHeRMi1-RCkVQUodJDe6IR7UvNouwM1bkHmepJAfECA4JF1_HHLn9Zu7Yw/exec?mode=getMemberInfo&lineUserId=${lineUserId}`);
      const data = await res.json();

      if (data.status === 'success') {
        const creditBalance = parseFloat(data.creditBalance || '0');
        sessionStorage.setItem('creditBalance', creditBalance); // Cache

        if (creditBalance >= totalAmount) {
          submitBtn.disabled = false;
        } else {
          submitBtn.disabled = true;
          alert(`❌ 點數不足：目前餘額 $${creditBalance.toFixed(2)}，訂單金額 $${totalAmount.toFixed(2)}`);
        }
      } else {
        submitBtn.disabled = true;
        alert('⚠️ 會員資料取得失敗');
      }
    } catch (err) {
      console.error('信用點數驗證錯誤:', err);
      submitBtn.disabled = true;
      alert('⚠️ 無法驗證點數餘額');
    }

  } else if (selectedMethod === 'credit-card') {
    discountCodeWrapper.style.display = 'block';
    creditProofWrapper.style.display = 'block';
    submitBtn.disabled = !(addressValue === '7-11 商店取貨' || addressValue === '來商店取貨');

  } else {
    discountCodeWrapper.style.display = 'none';
    creditProofWrapper.style.display = 'none';
    submitBtn.disabled = !(addressValue === '7-11 商店取貨' || addressValue === '來商店取貨');
  }
});
    // -- Use Discount Code case --
    const discountInput = checkoutForm.querySelector('#discount_code');

    discountInput.addEventListener('blur', () => {
        const discountRate = validateDiscountCode(discountInput.value);
        if (discountRate > 0) {
            
            const originalTotal = calculateCartTotal();
            const discountedTotal = originalTotal * (1 - discountRate);

            // Update the Total Row
            const totalRow = document.getElementById('checkout-total-row');
            if (totalRow) {
                totalRow.innerHTML = `<strong>折扣後總額：</strong> $${discountedTotal.toFixed(0)} 🎉 (${(discountRate * 100).toFixed(0)}% 優惠)`;
            }

            alert(`🎉 折扣碼成功套用！享有 ${(discountRate * 100).toFixed(0)}% 優惠！`);

        } else {
            alert('❌ 折扣碼無效或不存在');
            // (Optional) Reset total to original if invalid
            const totalRow = document.getElementById('checkout-total-row');
            if (totalRow) {
                const originalTotal = calculateCartTotal();
                totalRow.innerHTML = `<strong>Total:</strong> $${originalTotal.toFixed(2)}`;
            }
        }
    });
    // --- Inject Store Info if available ---
    if (storeInfo) {
        const pickupInfoDiv = checkoutForm.querySelector('#pickup-store-info');
        if (pickupInfoDiv) {
            pickupInfoDiv.innerHTML = `
                <p><strong>7-11 門市資訊</strong></p>
                <p>店號: ${storeInfo.CVSStoreID}</p>
                <p>店名: ${storeInfo.CVSStoreName}</p>
                <p>地址: ${storeInfo.CVSAddress}</p>
            `;
        }
    }

    // --- Form Submit Event Listener ---
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(checkoutForm);
      const data = Object.fromEntries(formData.entries());

      const discountCode = data['discount_code']?.trim();
      const discountTierMap = {
        'GOLD': 5,
        'SILVER': 3,
        'BRONZE': 1
      };
      // Use pre-fetched membership discount (from sessionStorage)
      const memberDiscountCode = sessionStorage.getItem('discountCode');
      const memberTier = sessionStorage.getItem('discountTier');

      let appliedDiscountPercent = 0;
      console.log("dCode, mdCode, Tier are: ", discountCode, memberDiscountCode, memberTier );
      if (discountCode && memberDiscountCode && discountCode === memberDiscountCode && memberTier) {
    appliedDiscountPercent = discountTierMap[memberTier.toUpperCase()] || 0;
  }

      const totalAmount = calculateTotal(appliedDiscountPercent); 
      const lineUserName = sessionStorage.getItem('lineUserName') || '';
      //const totalAmount = calculateTotal(); // your existing function, returns string like "$123.00"
      let rewardToCodeOwner = 0;
      const discountRate = validateDiscountCode(discountCode);
      console.log("rewardRate is: ", discountRate);
      const numericTotal = parseFloat(totalAmount.replace(/[^0-9.-]+/g, ''));
      if (discountRate > 0) {
          rewardToCodeOwner = numericTotal * (discountRate / 1);
        }
      const rewardAmount = `$${rewardToCodeOwner.toFixed(0)}`;
      const orderId = generateCustomOrderId();

      // Replace address with actual store if 7-11
      let finalAddress = data.address;
      if (finalAddress === '7-11 商店取貨' && window.selectedStoreInfo?.CVSStoreName) {
        finalAddress = window.selectedStoreInfo.CVSStoreName;
      }

      const orderData = {
        orderId,
        name: data.name,
        email: data.email,
        telephone: data.telephone,
        paymentMethod: data['payment-method'],
        address: finalAddress,
        discountCode: data['discount_code'],
        totalAmount,
        rewardAmount,
        lineUserName,
        cartItems: cart.map(item => `${item.name} x${item.quantity}`) // optional
      };

      console.log("📦 Final orderData:", orderData);

      // Send to your Cloud Function or Web App here
      await fetch('https://script.google.com/macros/s/AKfycbzZhiPYkL62ZHeRMi1-RCkVQUodJDe6IR7UvNouwM1bkHmepJAfECA4JF1_HHLn9Zu7Yw/exec', {
        method: 'POST',
        mode: "no-cors",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      // Reset state
      cart = [];
      renderSideCart();
      checkoutForm.reset();
      switchView('content');
      alert('✅ Thank you for your order!');
    });

}
    // --- Event Listeners Setup ---
    function setupEventListeners() {
        // Navbar Links (Scroll within content view)
        navbar.aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentView !== 'content') switchView('content');
            document.getElementById('about-container')?.scrollIntoView({ behavior: 'smooth' });
        });
        navbar.productLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentView !== 'content') switchView('content');
            document.getElementById('product-container')?.scrollIntoView({ behavior: 'smooth' });
        });
         navbar.contactLink.addEventListener('click', (e) => {
            e.preventDefault();
             // Assuming contact scrolls to footer
            document.querySelector('.footer')?.scrollIntoView({ behavior: 'smooth' });
        });
        
        //Listener for Category Filter Button
        if (contentContainers.categoryFiltersContainer) {
            contentContainers.categoryFiltersContainer.addEventListener('click', (e) => {
                const categoryButton = e.target.closest('.category-btn');
                    if (categoryButton) {
                        const selectedCategory = categoryButton.dataset.category;

                        if (selectedCategory !== currentFilterCategory) {
                            currentFilterCategory = selectedCategory;

                            contentContainers.categoryFiltersContainer.querySelectorAll('.category-btn').forEach(btn => {
                                btn.classList.remove('active');
                            });
                            categoryButton.classList.add('active'); // Use categoryButton here!

                            renderProductGrid(allProductsData);
                        }
                    }
                /*if (e.target.classList.contains('category-btn')) {
                    const selectedCategory = e.target.dataset.category;
                    if (selectedCategory !== currentFilterCategory) {
                        // Update state
                        currentFilterCategory = selectedCategory;

                        // Update button active class
                        contentContainers.categoryFiltersContainer.querySelectorAll('.filter-btn').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        e.target.classList.add('active');

                        // Re-render the product grid with the filter applied
                        // Pass the *original full list* of products
                        renderProductGrid(allProductsData);
                    }
                }*/
            });
        } else {
             console.warn("Category filters container not found for event listener setup.");
        }
        // Product Item Click (Event Delegation)
        contentContainers.productContainer.addEventListener('click', (e) => {
            const productItem = e.target.closest('.product-item');
            if (productItem) {
                const productId = productItem.dataset.productId;
                renderItemDetails(productId); // Render the detail view
                switchView('item');        // Switch to the item view
            }
        });

         // Add to Cart Click (Event Delegation on item wrapper)
        mainBody.itemWrapper.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const productId = e.target.dataset.productId;
                addToCart(productId);
                alert(`${allItemDetails[productId]?.name || 'Item'} added to cart!`); // Simple feedback
            }
        });


        // Cart Icon Click
        navbar.cartIconBtn.addEventListener('click', () => {
            sideCart.aside.classList.toggle('open');
            if (sideCart.aside.classList.contains('open')) {
                renderSideCart(); // Ensure cart is up-to-date when opened
            }
        });

        // Close Cart Button Click
        sideCart.closeBtn.addEventListener('click', () => {
            sideCart.aside.classList.remove('open');
        });

        // Remove Item from Cart Click (Event Delegation)
        sideCart.itemsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item-btn')) {
                const cartItemDiv = e.target.closest('.side-cart-item');
                if (cartItemDiv) {
                    const productId = cartItemDiv.dataset.cartItemId;
                    removeFromCart(productId);
                }
            } else if (e.target.classList.contains('increase-qty-btn')) {
                const productId = e.target.dataset.productId;
                changeCartQuantity(productId, 1); // Increase quantity by 1
            } else if (e.target.classList.contains('decrease-qty-btn')) {
                const productId = e.target.dataset.productId;
                changeCartQuantity(productId, -1); // Decrease quantity by 1
            }
        });
        

        // Checkout Button Click (in Side Cart)
        sideCart.checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                renderCheckoutPage(cart); // ⬅️ Pass current cart
                //cart = []; // Clear cart
                renderSideCart(); // Update side cart visually
                switchView('checkout');
                sideCart.aside.classList.remove('open'); // Close side cart
            } else {
                alert("您的購物車是空的, 無法結帳。");
            }
        });

        
    }
    async function checkLINELogin() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state'); // <-- Get "state"

        if (code) {
            console.log('Detected LINE login code:', code);
            console.log('Detected state:', state);

            await exchangeCodeForToken(code); // Do the login exchange

            // After login success, check state
            if (state === 'checkout') {
                console.log('State=checkout → Switch to checkout page');
                renderCheckoutPage(cart); // ⬅️ Must render using restored cart
                switchView('checkout');
            } else {
                switchView('content'); // Default
            }

            // Clean up URL (remove code/state)
            window.history.replaceState({}, document.title, window.location.pathname);

        } else {
            // Normal page load
            const storedUserName = sessionStorage.getItem('lineUserName');
            if (storedUserName) {
                updateNavbarWithUserName(storedUserName);
            }
        }
    }
    async function exchangeCodeForToken(code) {
      const cloudFunctionURL = 'https://save-to-sheet-545199463340.asia-east1.run.app'; // <-- replace with your real function URL

      try {
        const response = await fetch(`${cloudFunctionURL}?mode=getLineProfile&code=${encodeURIComponent(code)}`);
        const data = await response.json();

        if (data.status === 'success' && data.profile) {
          const { name, email, sub } = data.profile;
          console.log('✅ LINE Login Success:', data.profile);

          // Store in sessionStorage
          sessionStorage.setItem('lineUserName', name);
          sessionStorage.setItem('lineUserEmail', email);
          sessionStorage.setItem('lineUserId', sub);

          updateNavbarWithUserName(name); // Optional UI update
        } else {
          console.warn('LINE profile fetch failed:', data);
        }
      } catch (err) {
        console.error('exchangeCodeForToken error:', err);
      }
    }
    async function submitOrderToWebApp(orderData) {
        try {
            const response = await fetch('https://script.google.com/macros/s/AKfycbzZhiPYkL62ZHeRMi1-RCkVQUodJDe6IR7UvNouwM1bkHmepJAfECA4JF1_HHLn9Zu7Yw/exec', {
                method: 'POST',
                mode: "no-cors", // Required for Google Apps Script
                body: JSON.stringify({
                    action: 'saveOrder',
                    orderData: orderData
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const text = await response.text();
            console.log('Order Save Result:', text);

            alert('✅ 訂單已成功送出！謝謝您的購買！');
        } catch (error) {
            console.error('Failed to submit order:', error);
            alert('❌ 訂單提交失敗，請稍後再試。');
        }
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


    // --- Initialization Function ---
    async function init() {
        // Fetch all necessary data concurrently
        const [bannerData, aboutData, productsData, itemDetailsData] = await Promise.all([
            fetchData('banner.json'),
            fetchData('about.json'),
            fetchData('products.json'),
            fetchData('items.json')
        ]);

        // --- Restore Cart & OrderId from SessionStorage ---
        //const savedCart = sessionStorage.getItem('cart');
        //const savedOrderId = sessionStorage.getItem('currentOrderId');
        // --- Restore Cart & OrderId from Storage ---
        const savedCart = localStorage.getItem('cart');
        const savedOrderId = localStorage.getItem('currentOrderId');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            console.log("Restored cart from session:", cart);
        }

        if (savedOrderId) {
            window.currentOrderId = savedOrderId;
            console.log("Restored orderId from session:", savedOrderId);
        }
        
        // --- Now render ---
        allProductsData = productsData || [];
        allItemDetails = itemDetailsData || {};

        const bannerRendered = renderBanner(bannerData);
        renderAbout(aboutData);
        renderProductGrid(allProductsData);
        renderSideCart();
        setupEventListeners();

        if (bannerRendered) {
            startBannerSlideshow();
        }

        console.log("E-commerce site initialized.");
        // --- 🟡 Put login + state logic HERE ---
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const CVSStoreID = urlParams.get('CVSStoreID');

    // --- Case 1: Returning from LINE login ---
    if (code) {
      await exchangeCodeForToken(code);

      const savedCart = localStorage.getItem('cart');
      if (savedCart) cart = JSON.parse(savedCart);

      if (state === 'checkout') {
        renderCheckoutPage(cart); // cart + user
        switchView('checkout');
      } else {
        switchView('content');
      }

      window.history.replaceState({}, document.title, window.location.pathname);
      return; // ✅ exit early
    }

    // --- Case 2: Returning from 7-11 store selection ---
    if (CVSStoreID) {
      console.log("Detected 7-11 store info via CVSStoreID");
      
      // 🟡 Restore cart before rendering
      const savedCart = localStorage.getItem('cart');
      if (savedCart) cart = JSON.parse(savedCart);

      renderCheckoutPage(cart); // store info will be handled inside
      switchView('checkout');
      
      // 🧠 Call the transfer function only to update UI
      ECpayStoreDataBackTransfer(); 

      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // --- Normal load ---
    switchView('content');
}//END of init()

    // --- Start the application ---
    await loadMembershipData();
    init();
    ECpayStoreDataBackTransfer();

}); // End DOMContentLoaded
