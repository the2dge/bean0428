//document.addEventListener('DOMContentLoaded', () => {
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
    let cart = [];
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
            sideCart.itemsContainer.innerHTML = '<p>Your cart is empty.</p>';
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

    function calculateTotal() {
        let total = 0;
        cart.forEach(item => {
            // Remove '$' and convert to number for calculation
            const price = parseFloat(item.price.replace(/[^0-9.-]+/g,""));
            if (!isNaN(price)) {
                total += price * item.quantity;
            } else {
                console.warn(`Could not parse price for item ${item.id}: ${item.price}`);
            }
        });
        return `$${total.toFixed(2)}`; // Format as currency
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
    // 1. Get the URL search params
    const urlParams = new URLSearchParams(window.location.search);

    // 2. Extract ECPay returned values
    const MerchantID = urlParams.get('MerchantID');
    const CVSStoreID = urlParams.get('CVSStoreID');
    const CVSStoreName = urlParams.get('CVSStoreName');
    const CVSAddress = urlParams.get('CVSAddress');
    const MerchantTradeNo = urlParams.get('MerchantTradeNo'); // Your OrderId
    const ExtraData = urlParams.get('ExtraData'); // Optional

    // 3. Check if this page is loaded via ECPay response
    if (MerchantID && CVSStoreID && CVSStoreName && CVSAddress) {
        console.log("Received Store Info from ECPay:", {
            MerchantID,
            CVSStoreID,
            CVSStoreName,
            CVSAddress,
            MerchantTradeNo,
            ExtraData
        });
        const storeInfo = {
            CVSStoreID,
            CVSStoreName,
            CVSAddress,
            MerchantTradeNo
        };
        // 🛠 NEW: Render Checkout with store info
        renderCheckoutPage(cart, storeInfo);
        switchView('checkout');

        // 4. (Optional) Save the selected store info globally if needed
        window.selectedStoreInfo = storeInfo;
        
        // 5. Clean up URL (optional, for better UX)
        window.history.replaceState({}, document.title, window.location.pathname);
        
    } else {
        console.log("No ECPay store data returned, normal page load.");
    }
}
    /* THIS new also check orderId(Timestamp)
    function ECpayStoreDataBackTransfer() {
    console.log("data from ECPay received!");
    const urlParams = new URLSearchParams(window.location.search);

    const MerchantID = urlParams.get('MerchantID');
    const CVSStoreID = urlParams.get('CVSStoreID');
    const CVSStoreName = urlParams.get('CVSStoreName');
    const CVSAddress = urlParams.get('CVSAddress');
    const MerchantTradeNo = urlParams.get('MerchantTradeNo');

    if (MerchantID && CVSStoreID && CVSStoreName && CVSAddress && MerchantTradeNo) {
        console.log("Received Store Info:", { CVSStoreID, CVSStoreName, CVSAddress, MerchantTradeNo });

        // 🛡️ Secure check: Only accept if MerchantTradeNo matches currentOrderId
        if (window.currentOrderId && MerchantTradeNo === window.currentOrderId) {
            console.log("Order ID match, accepting store info.");

            const pickupInfoDiv = document.getElementById('pickup-store-info');
            if (pickupInfoDiv) {
                pickupInfoDiv.innerHTML = `
                    <p><strong>7-11 門市資訊</strong></p>
                    <p>店號: ${CVSStoreID}</p>
                    <p>店名: ${CVSStoreName}</p>
                    <p>地址: ${CVSAddress}</p>
                `;
            }

            window.selectedStoreInfo = {
                CVSStoreID,
                CVSStoreName,
                CVSAddress,
                MerchantTradeNo
            };

            // Optional clean URL
            window.history.replaceState({}, document.title, window.location.pathname);

        } else {
            console.warn("Order ID mismatch! Ignoring returned store info.");
            alert("門市資訊不正確，請重新選擇。");
        }
    }
}*/

function renderCheckoutPage(cartItems, storeInfo = null) {
    mainBody.checkoutWrapper.innerHTML = ''; // Clear previous checkout content

    // --- Checkout Main Title + Member Login Button ---
    const titleRow = document.createElement('div');
    titleRow.classList.add('checkout-title-row');

    const checkoutTitle = document.createElement('h2');
    checkoutTitle.textContent = '- 結帳 -';
    titleRow.appendChild(checkoutTitle);

    const memberLoginBtn = document.createElement('button');
    memberLoginBtn.textContent = 'Member Login';
    memberLoginBtn.classList.add('member-login-btn');
    memberLoginBtn.addEventListener('click', () => {
        alert('Redirecting to Member Login... (simulate)');
    });
    titleRow.appendChild(memberLoginBtn);

    mainBody.checkoutWrapper.appendChild(titleRow);

    // --- Ordered Items Title ---
    const orderedItemsTitle = document.createElement('h2');
    orderedItemsTitle.textContent = 'Ordered Items';
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
        totalRow.innerHTML = `<strong>Total:</strong> $${totalPrice.toFixed(2)}`;
        mainBody.checkoutWrapper.appendChild(totalRow);
    }

    // --- Checkout Form ---
    const checkoutForm = document.createElement('form');
    checkoutForm.id = 'checkout-form';

    checkoutForm.innerHTML = `
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" required>

        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>

        <label for="telephone">電話:</label>
        <input type="tel" id="telephone" name="telephone" required>

        <label for="discount_code">折扣碼:</label>
        <input type="text" id="discount_code" name="discount_code">

        <label for="address">取貨方式:</label>
        <select id="address" name="address" required>
            <option value="來商店取貨">來商店取貨</option>
            <option value="7-11 商店取貨">7-11 商店取貨</option>
        </select>
        <div id="pickup-store-info"></div>
        <button type="submit">下單</button>
    `;
    mainBody.checkoutWrapper.appendChild(checkoutForm);
    // --- Event Listener: Monitor Address Dropdown ---
    const addressSelect = checkoutForm.querySelector('#address');
    addressSelect.addEventListener('change', (e) => {
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
            sessionStorage.setItem('cart', JSON.stringify(cart));
            sessionStorage.setItem('currentOrderId', orderId);

            openLogisticsMap(orderId);
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
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert("Thank you for your order! (This is a simulation)");
        sessionStorage.removeItem('cart');
        sessionStorage.removeItem('currentOrderId');
        checkoutForm.reset();
        switchView('content');
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
                cart = []; // Clear cart
                renderSideCart(); // Update side cart visually
                switchView('checkout');
                sideCart.aside.classList.remove('open'); // Close side cart
            } else {
                alert("Your cart is empty. Add some items before checking out.");
            }
        });

        // Checkout Form Submission
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent actual form submission
            // In a real app, you'd collect form data and send it to a server
            const formData = new FormData(checkoutForm);
            const orderData = Object.fromEntries(formData.entries());
            console.log("Placing order with:", orderData);
            console.log("Cart items:", cart);

            alert("Thank you for your order! (This is a simulation)");

            // Clear cart and go back to content view after "successful" submission
            cart = [];
            renderSideCart(); // Update cart display (empty)
            checkoutForm.reset(); // Clear form fields
            switchView('content');
        });
    }

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
        const savedCart = sessionStorage.getItem('cart');
        const savedOrderId = sessionStorage.getItem('currentOrderId');

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
    }//END of init()

    // --- Start the application ---
    init();
    ECpayStoreDataBackTransfer();

}); // End DOMContentLoaded
