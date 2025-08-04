let cart =[];
document.addEventListener('DOMContentLoaded', async () => {

    // --- DOM Element References ---
    const navbar = {
        logo: document.querySelector('.logo'),
        aboutLink: document.getElementById('nav-about'),
        aboutLink_m: document.getElementById('nav-about-mobile'),
        productLink: document.getElementById('nav-product'),
        productLink_m: document.getElementById('nav-product-mobile'),
        mediaLink: document.getElementById('nav-media'),
        mediaLink_m: document.getElementById('nav-media-mobile'),
        memberLink: document.getElementById('nav-member'),
        memberLink_m: document.getElementById('nav-member-mobile'),
        contactLink: document.getElementById('nav-contact'), // Assuming contact might scroll to footer
        contactLink_m: document.getElementById('nav-contact-mobile'),
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
    /*
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
    }*/

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
    
function renderMedia(mediaData) {
  const mediaGrid = document.getElementById('media-grid');
  if (!mediaGrid || !mediaData || !mediaData.length) return;

  mediaGrid.innerHTML = ''; // Clear previous

  mediaData.forEach(item => {
    const videoId = extractYouTubeId(item.videoUrl);
    const iframeSrc = `https://www.youtube.com/embed/${videoId}`;

    const card = document.createElement('div');
    card.className = 'media-card';

    card.innerHTML = `
      <iframe src="${iframeSrc}" allowfullscreen></iframe>
      <p>${item.altText}</p>
    `;

    mediaGrid.appendChild(card);
  });
}

// Helper to extract ID from Shorts/normal URLs
function extractYouTubeId(url) {
  const shortsMatch = url.match(/shorts\/([\w-]+)/);
  const normalMatch = url.match(/v=([\w-]+)/);
  return shortsMatch?.[1] || normalMatch?.[1] || '';
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
    const grid = contentContainers.productGrid;
    if (!grid) {
        console.error("Product grid container not found!");
        return;
    }
    grid.innerHTML = '';

    const filteredProducts = (currentFilterCategory === 'All')
        ? products
        : products.filter(p => (p.category || 'Other') === currentFilterCategory);

    if (!filteredProducts || filteredProducts.length === 0) {
        grid.innerHTML = '<p>此分類目前沒有商品。</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product-item');
        productDiv.setAttribute('data-product-id', product.id);

        let outOfStockOverlay = '';
        if (product.stock === 'N') {
            productDiv.classList.add('out-of-stock');
            outOfStockOverlay = '<div class="stock-overlay"><p>補貨中</p></div>';
        }

        const imageSrc = getFirstImage(product);
        const priceDisplay = formatPriceDisplay(product);

        productDiv.innerHTML = `
            ${outOfStockOverlay}
            <img src="${imageSrc}" alt="${product.name}">
            <h3>${product.name}</h3>
            ${priceDisplay}
            ${product.title ? `<p class="product-title">${product.title}</p>` : ''}
        `;
        grid.appendChild(productDiv);
    });
}

// Helper function to format price display based on pricing structure
function formatPriceDisplay(product) {
    // First, try to parse the new 'pricing' field
    if (product.pricing) {
        const pricingData = parsePricingData(product.pricing);
        if (pricingData && pricingData.length > 0) {
            if (pricingData.length === 1) {
                // Single price option
                const item = pricingData[0];
                return `
                    <div class="pricing-display">
                        <span class="price-large">$${item.price}</span>
                        <span class="size-small">${item.size}</span>
                    </div>
                `;
            } else {
                // Multiple price options - show all options
                const priceOptionsHtml = pricingData.map(item => `
                    <div class="price-option">
                        <span class="price-large">$${item.price}</span>
                        <span class="size-small">${item.size}</span>
                    </div>
                `).join('');
                
                return `<div class="pricing-display multiple-prices">${priceOptionsHtml}</div>`;
            }
        }
    }
    
    // Fallback to legacy 'price' field if pricing doesn't exist or is invalid
    if (product.price) {
        return `<p class="price">${product.price}</p>`;
    }
    
    // Final fallback
    return '<p class="price">價格請洽詢</p>';
}

function getFirstImage(product) {
    try {
        if (typeof product.imgUrls === 'string') {
            const parsed = JSON.parse(product.imgUrls);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        } else if (Array.isArray(product.imgUrls) && product.imgUrls.length > 0) {
            return product.imgUrls[0];
        }
        if (typeof product.imgUrl === 'string' && product.imgUrl.startsWith('[')) {
            const parsed = JSON.parse(product.imgUrl);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        }
        return product.imgUrl || 'fallback.jpg';
    } catch (e) {
        console.warn("Failed to parse image URLs for product", product.id, e);
        return 'fallback.jpg';
    }
}
function getAllImages(product) {
    try {
        if (typeof product.imgUrls === 'string') return JSON.parse(product.imgUrls);
        if (Array.isArray(product.imgUrls)) return product.imgUrls;
        if (typeof product.imgUrl === 'string' && product.imgUrl.startsWith('[')) return JSON.parse(product.imgUrl);
        return product.imgUrl ? [product.imgUrl] : [];
    } catch (e) {
        return [];
    }
}

async function renderItemDetails(productId) {
    if (!allItemDetails || !Object.keys(allItemDetails).length) {
        allItemDetails = await fetchData('items_test.json');
    }

    const itemData = allItemDetails[productId];
    if (!itemData) {
        mainBody.itemWrapper.innerHTML = `<p>Error: Product details not found for ID ${productId}.</p>`;
        switchView('content');
        return;
    }

    const pricingData = parsePricingData(itemData.price);
    const pricingHtml = generatePricingHtml(pricingData, itemData.id);
    const imageList = getAllImages(itemData);

    const imageGalleryHtml = imageList.map(url => `<img src="${url}" alt="${itemData.name}" class="gallery-thumb">`).join('');

    mainBody.itemWrapper.innerHTML = `
        <article class="item-detail">
            <div class="image-gallery">
                <div class="main-image">
                    <img src="${imageList[0] || 'fallback.jpg'}" alt="${itemData.name}" id="main-product-image">
                </div>
                <div class="thumbnail-row">
                    ${imageGalleryHtml}
                </div>
            </div>
            <div class="item-info">
                <h2>${itemData.name} <img src="image/share.png" class='share-btn'>
                </h2>
                <p>${itemData.description}</p>
                ${itemData.specs ? `<ul>${Object.entries(itemData.specs).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('')}</ul>` : ''}
                ${pricingHtml}
                <div class="button-row">
                    <button class="back-to-products-btn" style="cursor: pointer">返回產品頁</button> 
                </div>
            </div>
        </article>
    `;

    const backBtn = mainBody.itemWrapper.querySelector('.back-to-products-btn');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentView !== 'content') switchView('content');
            document.getElementById('product-container')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    const shareBtn = mainBody.itemWrapper.querySelector('.share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const shareUrl = `${window.location.origin}?product=${encodeURIComponent(itemData.id)}`;
        
        Swal.fire({
          title: '分享商品',
          html: `
            <div style="display:flex;justify-content:space-around;align-items:center;font-size:2rem;">
              <a href="https://line.me/R/msg/text/?${encodeURIComponent(itemData.name + ' ' + shareUrl)}" target="_blank" title="LINE">
                <img src="image/line.png" alt="LINE" style="width:40px;height:40px;">
              </a>
              <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}" target="_blank" title="Facebook">
                <img src="image/facebook.png" alt="Facebook" style="width:40px;height:40px;">
              </a>
              <a href="https://www.instagram.com/?url=${encodeURIComponent(shareUrl)}" target="_blank" title="Instagram">
                <img src="image/instagram.png" alt="Instagram" style="width:40px;height:40px;">
              </a>
              <a href="https://www.threads.net/intent/post?url=${encodeURIComponent(shareUrl)}" target="_blank" title="Threads">
                <img src="image/threads.png" alt="Threads" style="width:40px;height:40px;">
              </a>
            </div>
          `,
          showConfirmButton: false,
          showCloseButton: true
        });
      });
    }
    const thumbs = mainBody.itemWrapper.querySelectorAll('.gallery-thumb');
    thumbs.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            const mainImg = document.getElementById('main-product-image');
            if (mainImg) mainImg.src = img.src;
        });
    });

    const singleAddBtn = mainBody.itemWrapper.querySelector('.add-to-cart-single-btn');
    if (singleAddBtn) {
        singleAddBtn.addEventListener('click', () => {
            const productId = singleAddBtn.getAttribute('data-product-id');
            const selectEl = mainBody.itemWrapper.querySelector('.size-selector');
            const selectedSize = selectEl.value;
            const selectedPrice = selectEl.options[selectEl.selectedIndex].dataset.price;
            handleAddToCartManual(productId, selectedSize, selectedPrice);
        });
    }

    const addToCartBtns = mainBody.itemWrapper.querySelectorAll('.add-to-cart-btn');
        addToCartBtns.forEach(btn => {
        btn.removeEventListener('click', handleAddToCart); // Remove old listener
        btn.addEventListener('click', handleAddToCart);   // Add new listener
    });
}
function parsePricingData(priceData) {
    try {
        // If it's already an array, return it
        if (Array.isArray(priceData)) {
            return priceData.filter(p => p.size && p.price);
        }
        
        // If it's a string, try to parse as JSON
        if (typeof priceData === 'string') {
            // Check if it looks like JSON array
            if (priceData.trim().startsWith('[')) {
                const parsed = JSON.parse(priceData);
                if (Array.isArray(parsed)) {
                    return parsed.filter(p => p.size && p.price);
                }
            }
            
            // If it's just a number string, convert to single pricing
            const numPrice = parseFloat(priceData);
            if (!isNaN(numPrice)) {
                return [{ size: 'Standard', price: numPrice }];
            }
        }
        
        // If it's a number, convert to single pricing
        if (typeof priceData === 'number') {
            return [{ size: 'Standard', price: priceData }];
        }
        
        // Fallback: return empty array
        console.warn('Unable to parse pricing data:', priceData);
        return [];
        
    } catch (error) {
        console.error('Error parsing pricing data:', error, priceData);
        return [];
    }
}

/**
 * Generates HTML for pricing options with add to cart functionality
 * @param {array} pricingData - Array of pricing objects
 * @param {string} productId - Product ID
 * @returns {string} HTML string for pricing section
 */
function generatePricingHtml(pricingData, productId) {
    if (!pricingData || pricingData.length === 0) {
        return '<p class="price-error">Price information not available</p>';
    }

    if (pricingData.length === 1) {
        const pricing = pricingData[0];
        return `
            <div class="pricing-section single-price">
                <p class="price">$${pricing.price}</p>
                <button class="add-to-cart-btn" 
                        data-product-id="${productId}" 
                        data-size="${pricing.size}" 
                        data-price="${pricing.price}">
                    加入購物車
                </button>
            </div>
        `;
    }

    // For multiple sizes, use dropdown
    return `
        <div class="pricing-section multiple-prices">
            <h3>選擇包裝尺寸:</h3>
            <select class="size-selector" data-product-id="${productId}">
                ${pricingData.map(p => `<option value="${p.size}" data-price="${p.price}">${p.size} - $${p.price}</option>`).join('')}
            </select>
            <button class="add-to-cart-single-btn" data-product-id="${productId}">加入購物車</button>
        </div>
    `;
}
// Replace the renderSideCart() function with this grouped version
function renderSideCart() {
    sideCart.itemsContainer.innerHTML = ''; // Clear current items
    if (cart.length === 0) {
        sideCart.itemsContainer.innerHTML = '<p>您的購物車是空的。<br>歡迎重選您喜歡的商品</p>';
        hideSideCartDiscountSection();
        setTimeout(() => {
            switchView('content');
        }, 1500);
    } else {
        // Group cart items by product ID
        const groupedItems = cart.reduce((groups, item) => {
            if (!groups[item.id]) {
                groups[item.id] = {
                    productInfo: {
                        id: item.id,
                        name: item.name,
                        img: item.img
                    },
                    variants: []
                };
            }
            groups[item.id].variants.push(item);
            return groups;
        }, {});

        // Render each product group
        Object.values(groupedItems).forEach(productGroup => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('side-cart-product-group');
            
            // Calculate total for this product (all variants)
            let productTotal = 0;
            let productDiscountedTotal = 0;
            let hasSelectedVariants = false;
            
            productGroup.variants.forEach(variant => {
                const isSelected = variant.selected !== false;
                if (isSelected) {
                    hasSelectedVariants = true;
                    const unitPrice = parseFloat(variant.price.replace(/[^0-9.-]+/g, ""));
                    const variantSubtotal = !isNaN(unitPrice) ? unitPrice * variant.quantity : 0;
                    const variantDiscountAmount = variantSubtotal * (currentDiscountRate / 100);
                    productTotal += variantSubtotal;
                    productDiscountedTotal += (variantSubtotal - variantDiscountAmount);
                }
            });

            const productDiscountAmount = productTotal - productDiscountedTotal;

            // Generate product total display
            let productTotalDisplay = '';
            if (hasSelectedVariants) {
                if (currentDiscountRate > 0) {
                    productTotalDisplay = `
                        <div class="product-total-container">
                            <div class="product-total-line">
                                <span class="total-label">單品總計:</span>
                                <span class="original-total">$${productTotal.toFixed(0)}</span>
                            </div>
                            <div class="discount-total-line">
                                <span class="total-label">折後總計:</span>
                                <span class="discounted-total">$${productDiscountedTotal.toFixed(0)}</span>
                            </div>
                            <div class="product-savings">
                                <span class="product-savings-badge">省 $${productDiscountAmount.toFixed(0)}</span>
                            </div>
                        </div>
                    `;
                } else {
                    productTotalDisplay = `
                        <div class="product-total-container">
                            <div class="product-total-line">
                                <span class="total-label">單品總計:</span>
                                <span class="final-total">$${productTotal.toFixed(0)}</span>
                            </div>
                        </div>
                    `;
                }
            }

            productDiv.innerHTML = `
                <!-- Product Header: Image (30%) + Name (70%) -->
                <div class="product-header">
                    <div class="product-image-container">
                        <img src="${productGroup.productInfo.img}" alt="${productGroup.productInfo.name}" class="product-image">
                    </div>
                    <div class="product-name-container">
                        <h3 class="product-name">${productGroup.productInfo.name}</h3>
                    </div>
                </div>
                
                <!-- Variants List -->
                <div class="variants-container">
                    ${productGroup.variants.map(variant => {
                        const isSelected = variant.selected !== false;
                        const unitPrice = parseFloat(variant.price.replace(/[^0-9.-]+/g, ""));
                        const variantSubtotal = !isNaN(unitPrice) ? unitPrice * variant.quantity : 0;
                        const variantDiscountAmount = variantSubtotal * (currentDiscountRate / 100);
                        const variantDiscountedTotal = variantSubtotal - variantDiscountAmount;

                        let variantPriceDisplay;
                        if (currentDiscountRate > 0 && isSelected) {
                            variantPriceDisplay = `
                                <div class="variant-price">
                                    <span class="variant-original">$${variantSubtotal.toFixed(0)}</span>
                                    <span class="variant-discounted">$${variantDiscountedTotal.toFixed(0)}</span>
                                </div>
                            `;
                        } else {
                            variantPriceDisplay = `
                                <div class="variant-price">
                                    <span class="variant-final">$${variantSubtotal.toFixed(0)}</span>
                                </div>
                            `;
                        }

                        return `
                            <div class="variant-item ${!isSelected ? 'variant-unselected' : ''}" data-cart-key="${variant.cartKey}">
                                <div class="variant-controls">
                                    <label class="variant-checkbox-container">
                                        <input type="checkbox" class="item-select-checkbox" ${isSelected ? 'checked' : ''} data-cart-key="${variant.cartKey}">
                                        
                                    </label>
                                    
                                    <div class="variant-info">
                                        <div class="variant-details">
                                            <span class="variant-size">${variant.size}</span>
                                            <span class="variant-unit-price">${variant.price}/個</span>
                                        </div>
                                        <div class="variant-quantity-price">
                                            <div class="variant-quantity-control">
                                                <button class="decrease-qty-btn" data-cart-key="${variant.cartKey}">➖</button>
                                                <span class="variant-quantity">${variant.quantity}</span>
                                                <button class="increase-qty-btn" data-cart-key="${variant.cartKey}">➕</button>
                                            </div>
                                            ${variantPriceDisplay}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <!-- Product Total -->
                ${productTotalDisplay}
            `;
            
            sideCart.itemsContainer.appendChild(productDiv);
        });
        
        showSideCartDiscountSection();
    }

    // Update total and item count
    updateSideCartTotals();

    // Show/hide checkout button based on selected items
    const hasSelectedItems = cart.some(item => item.selected !== false);
    sideCart.checkoutBtn.style.display = hasSelectedItems ? 'block' : 'none';
    
    // Add event listeners for checkboxes and quantity buttons
    const checkboxes = sideCart.itemsContainer.querySelectorAll('.item-select-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleItemSelection);
    });
    const increaseButtons = sideCart.itemsContainer.querySelectorAll('.increase-qty-btn');
    const decreaseButtons = sideCart.itemsContainer.querySelectorAll('.decrease-qty-btn');
    
    increaseButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const cartKey = e.target.dataset.cartKey;
            changeCartQuantityByKey(cartKey, 1);
        });
    });
    
    decreaseButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const cartKey = e.target.dataset.cartKey;
            changeCartQuantityByKey(cartKey, -1);
        });
    });
    // Update totals
    updateSideCartTotals();
}

// Update renderSideCartItemsOnly() with the same grouped structure
function renderSideCartItemsOnly() {
    sideCart.itemsContainer.innerHTML = '';
    
    // Group cart items by product ID
    const groupedItems = cart.reduce((groups, item) => {
        if (!groups[item.id]) {
            groups[item.id] = {
                productInfo: {
                    id: item.id,
                    name: item.name,
                    img: item.img
                },
                variants: []
            };
        }
        groups[item.id].variants.push(item);
        return groups;
    }, {});

    // Render each product group
    Object.values(groupedItems).forEach(productGroup => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('side-cart-product-group');
        
        // Calculate total for this product (all variants)
        let productTotal = 0;
        let productDiscountedTotal = 0;
        let hasSelectedVariants = false;
        
        productGroup.variants.forEach(variant => {
            const isSelected = variant.selected !== false;
            if (isSelected) {
                hasSelectedVariants = true;
                const unitPrice = parseFloat(variant.price.replace(/[^0-9.-]+/g, ""));
                const variantSubtotal = !isNaN(unitPrice) ? unitPrice * variant.quantity : 0;
                const variantDiscountAmount = variantSubtotal * (currentDiscountRate / 100);
                productTotal += variantSubtotal;
                productDiscountedTotal += (variantSubtotal - variantDiscountAmount);
            }
        });

        const productDiscountAmount = productTotal - productDiscountedTotal;

        // Generate product total display
        let productTotalDisplay = '';
        if (hasSelectedVariants) {
            if (currentDiscountRate > 0) {
                productTotalDisplay = `
                    <div class="product-total-container">
                        <div class="product-total-line">
                            <span class="total-label">單品總計:</span>
                            <span class="original-total">$${productTotal.toFixed(0)}</span>
                        </div>
                        <div class="discount-total-line">
                            <span class="total-label">折後總計:</span>
                            <span class="discounted-total">$${productDiscountedTotal.toFixed(0)}</span>
                        </div>
                        <div class="product-savings">
                            <span class="product-savings-badge">省 $${productDiscountAmount.toFixed(0)}</span>
                        </div>
                    </div>
                `;
            } else {
                productTotalDisplay = `
                    <div class="product-total-container">
                        <div class="product-total-line">
                            <span class="total-label">單品總計:</span>
                            <span class="final-total">$${productTotal.toFixed(0)}</span>
                        </div>
                    </div>
                `;
            }
        }

        productDiv.innerHTML = `
            <!-- Product Header: Image (30%) + Name (70%) -->
            <div class="product-header">
                <div class="product-image-container">
                    <img src="${productGroup.productInfo.img}" alt="${productGroup.productInfo.name}" class="product-image">
                </div>
                <div class="product-name-container">
                    <h3 class="product-name">${productGroup.productInfo.name}</h3>
                </div>
            </div>
            
            <!-- Variants List -->
            <div class="variants-container">
                ${productGroup.variants.map(variant => {
                    const isSelected = variant.selected !== false;
                    const unitPrice = parseFloat(variant.price.replace(/[^0-9.-]+/g, ""));
                    const variantSubtotal = !isNaN(unitPrice) ? unitPrice * variant.quantity : 0;
                    const variantDiscountAmount = variantSubtotal * (currentDiscountRate / 100);
                    const variantDiscountedTotal = variantSubtotal - variantDiscountAmount;

                    let variantPriceDisplay;
                    if (currentDiscountRate > 0 && isSelected) {
                        variantPriceDisplay = `
                            <div class="variant-price">
                                <span class="variant-original">$${variantSubtotal.toFixed(0)}</span>
                                <span class="variant-discounted">$${variantDiscountedTotal.toFixed(0)}</span>
                            </div>
                        `;
                    } else {
                        variantPriceDisplay = `
                            <div class="variant-price">
                                <span class="variant-final">$${variantSubtotal.toFixed(0)}</span>
                            </div>
                        `;
                    }

                    return `
                        <div class="variant-item ${!isSelected ? 'variant-unselected' : ''}" data-cart-key="${variant.cartKey}">
                            <div class="variant-controls">
                                <label class="variant-checkbox-container">
                                    <input type="checkbox" class="item-select-checkbox" ${isSelected ? 'checked' : ''} data-cart-key="${variant.cartKey}">
                                </label>
                                
                                <div class="variant-info">
                                    <div class="variant-details">
                                        <span class="variant-size">${variant.size}</span>
                                        <span class="variant-unit-price">${variant.price}/個</span>
                                    </div>
                                    <div class="variant-quantity-price">
                                        <div class="variant-quantity-control">
                                            <button class="decrease-qty-btn" data-cart-key="${variant.cartKey}">➖</button>
                                            <span class="variant-quantity">${variant.quantity}</span>
                                            <button class="increase-qty-btn" data-cart-key="${variant.cartKey}">➕</button>
                                        </div>
                                        ${variantPriceDisplay}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <!-- Product Total -->
            ${productTotalDisplay}
        `;
        
        sideCart.itemsContainer.appendChild(productDiv);
    });
    
    // Re-add event listeners
    const checkboxes = sideCart.itemsContainer.querySelectorAll('.item-select-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleItemSelection);
    });
    
    const increaseButtons = sideCart.itemsContainer.querySelectorAll('.increase-qty-btn');
    const decreaseButtons = sideCart.itemsContainer.querySelectorAll('.decrease-qty-btn');
    
    increaseButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const cartKey = e.target.dataset.cartKey;
            changeCartQuantityByKey(cartKey, 1);
        });
    });
    
    decreaseButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const cartKey = e.target.dataset.cartKey;
            changeCartQuantityByKey(cartKey, -1);
        });
    });
}

// Create and show discount section in side cart
function showSideCartDiscountSection() {
    let discountSection = document.getElementById('side-cart-discount-section');
    
    if (!discountSection) {
        // Create discount section if it doesn't exist
        discountSection = document.createElement('div');
        discountSection.id = 'side-cart-discount-section';
        discountSection.className = 'side-cart-discount';
        
        discountSection.innerHTML = `
            <div class="discount-form">
                <label for="side-cart-discount-code">折扣碼 (選填):</label>
                <div class="discount-input-group">
                    <input type="text" id="side-cart-discount-code" placeholder="輸入折扣碼" class="discount-input">
                    <button type="button" id="side-cart-apply-discount" class="apply-discount-btn">套用</button>
                </div>
                <small id="side-cart-discount-message" class="discount-message"></small>
            </div>
        `;
        
        // Insert after cart total but before checkout button
        const cartTotalElement = sideCart.totalSpan.parentElement;
        cartTotalElement.parentNode.insertBefore(discountSection, sideCart.checkoutBtn);
        
        // Add event listener for apply discount button
        document.getElementById('side-cart-apply-discount').addEventListener('click', applySideCartDiscount);
        
        // Add enter key support for discount input
        document.getElementById('side-cart-discount-code').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applySideCartDiscount();
            }
        });
    }
    
    discountSection.style.display = 'block';
    
    // Restore previously applied discount if exists
    const savedDiscountCode = sessionStorage.getItem('discountCode');
    if (savedDiscountCode) {
        document.getElementById('side-cart-discount-code').value = savedDiscountCode;
        const discountMessage = document.getElementById('side-cart-discount-message');
        const discountTier = sessionStorage.getItem('discountTier');
      //  discountMessage.textContent = `已套用 ${discountTier || ''} 折扣!`;
        discountMessage.className = 'discount-message success';
    }
}

// Hide discount section
function hideSideCartDiscountSection() {
    const discountSection = document.getElementById('side-cart-discount-section');
    if (discountSection) {
        discountSection.style.display = 'none';
    }
}

function applySideCartDiscount() {
    const discountInput = document.getElementById('side-cart-discount-code');
    const discountMessage = document.getElementById('side-cart-discount-message');
    const code = discountInput.value.trim();
    
    if (!code) {
        discountMessage.textContent = '請輸入折扣碼。';
        discountMessage.className = 'discount-message warning';
        currentDiscountRate = 0;
    } else {
        // membershipData must be loaded and accessible
        const discountPercentage = validateDiscountCode(code);
        if (discountPercentage > 0) {
            currentDiscountRate = discountPercentage;
            discountMessage.textContent = `已套用 ${sessionStorage.getItem('discountTier') || ''} 折扣 (${discountPercentage}% off)!`;
            discountMessage.className = 'discount-message success';
        } else {
            currentDiscountRate = 0;
            discountMessage.textContent = '無效的折扣碼。';
            discountMessage.className = 'discount-message error';
        }
    }
    
    // IMPORTANT: Re-render the entire side cart to update:
    // 1. Product-level subtotals with discount
    // 2. Individual variant pricing with discount  
    // 3. Main cart total
    renderSideCart();
}

// Update side cart totals with discount consideration
function updateSideCartTotals() {
    const subtotal = calculateSelectedSubtotal();
    const discountAmount = subtotal * (currentDiscountRate / 100);
    const finalTotal = subtotal - discountAmount;
    
    // Update the displayed totals
    sideCart.totalSpan.textContent = `$${finalTotal.toFixed(0)}`;
    navbar.cartItemCountSpan.textContent = getSelectedItemCount();
    
    // Store values for checkout
    sessionStorage.setItem('currentDiscountRate', currentDiscountRate.toString());
    sessionStorage.setItem('orderDiscountAmountForSubmission', discountAmount.toString());
}


// Calculate subtotal for selected items only (without discount)
function calculateSelectedSubtotal() {
    let total = 0;
    cart.forEach(item => {
        if (item.selected !== false) {
            const price = parseFloat(item.price.replace(/[^0-9.-]+/g, ""));
            if (!isNaN(price)) {
                total += price * item.quantity;
            }
        }
    });
    return total;
}

// Handle item selection/deselection (updated to use new total function)
function handleItemSelection(event) {
    const cartKey = event.target.dataset.cartKey;
    const isChecked = event.target.checked;
    
    // Find the item in cart and update its selected state
    const cartItem = cart.find(item => item.cartKey === cartKey);
    if (cartItem) {
        cartItem.selected = isChecked;
        
        // IMPORTANT: Re-render the entire side cart to update:
        // 1. Visual checkbox states
        // 2. Product-level totals (單品總計)
        // 3. Variant visual styling (selected/unselected)
        renderSideCart();
        
        // Update main cart totals and checkout button
        const hasSelectedItems = cart.some(item => item.selected !== false);
        sideCart.checkoutBtn.style.display = hasSelectedItems ? 'block' : 'none';
    }
}

// Calculate total for selected items only (legacy function for backward compatibility)
function calculateSelectedTotal() {
    const subtotal = calculateSelectedSubtotal();
    const discountAmount = subtotal * (currentDiscountRate / 100);
    const finalTotal = subtotal - discountAmount;
    return `${finalTotal.toFixed(2)}`;
}

// Change cart quantity using cartKey (fixes the bug with multiple items)
function changeCartQuantityByKey(cartKey, changeAmount) {
    const cartItemIndex = cart.findIndex(item => item.cartKey === cartKey);
    if (cartItemIndex > -1) {
        cart[cartItemIndex].quantity += changeAmount;

        if (cart[cartItemIndex].quantity <= 0) {
            // Remove the item if quantity is zero or less
            cart.splice(cartItemIndex, 1);
        }

        renderSideCart(); // Re-render cart after change
    }
}

// Get count of selected items
function getSelectedItemCount() {
    return cart.reduce((sum, item) => {
        if (item.selected !== false) {
            return sum + item.quantity;
        }
        return sum;
    }, 0);
}
function handleAddToCart(e) {
    e.stopPropagation(); // Prevent event bubbling
    const productId = e.target.dataset.productId;
    const size = e.target.dataset.size;
    const price = e.target.dataset.price;
    
    // Debounce - prevent multiple rapid clicks
    e.target.disabled = true;
    setTimeout(() => e.target.disabled = false, 500);
    
    handleAddToCartManual(productId, size, price);
}
// Modified handleAddToCartManual to ensure new items are selected by default
function handleAddToCartManual(productId, size, price) {
    const product = allItemDetails[productId];
    const cartKey = `${productId}_${size}`;
    const imageSrc = getFirstImage(product);

    const existingItem = cart.find(item => item.cartKey === cartKey);
    if (existingItem) {
        existingItem.quantity += 1;
        existingItem.selected = true;
    } else {
        cart.push({
            cartKey,
            id: productId,
            name: product.name,
            size,
            price: `$${price}`,
            img: imageSrc,
            quantity: 1,
            selected: true
        });
    }
    renderSideCart();
}

// Remove discount code section from checkout form (call this in your checkout rendering)
function removeDiscountFromCheckoutForm() {
    // When rendering checkout page, remove or hide the discount code section
    // since it's now handled in the side cart
    const checkoutDiscountSection = document.querySelector('#checkout-form-refactored .form-group');
    if (checkoutDiscountSection && checkoutDiscountSection.innerHTML.includes('折扣碼')) {
        checkoutDiscountSection.style.display = 'none';
    }
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
                img: productToAdd.imgUrl, // Use thumbnail for cart
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
        Swal.fire("Order ID 尚未生成，無法開啟門市選擇頁面");
        return;
    }
    // Open the Cloud Function, passing orderId to ECPay
    const url = `https://mrbean-website-store-select-545199463340.asia-east1.run.app?orderId=${encodeURIComponent(orderId)}`;
    window.open(url, "_self");
}
/*
function ECpayStoreDataBackTransfer() {
  const urlParams = new URLSearchParams(window.location.search);

  const MerchantID = urlParams.get('MerchantID');
  const CVSStoreID = urlParams.get('CVSStoreID');
  const CVSStoreName = urlParams.get('CVSStoreName');
  const CVSAddress = urlParams.get('CVSAddress');
  const MerchantTradeNo = urlParams.get('MerchantTradeNo');

  if (MerchantID && CVSStoreID && CVSStoreName && CVSAddress) {
      window.selectedStoreInfo = { CVSStoreID, CVSStoreName, CVSAddress, MerchantTradeNo };

    // Save to sessionStorage so it persists across re-renders
    sessionStorage.setItem('selectedStoreInfo', JSON.stringify(window.selectedStoreInfo));
    // Fill store info
    const pickupInfoDiv = document.getElementById('pickup-store-info');
    if (pickupInfoDiv) {
      pickupInfoDiv.innerHTML = `
        <p><strong>7-11 門市資訊</strong></p>
        <p>店號: ${CVSStoreID}</p>
        <p>店名: ${CVSStoreName}</p>
        <p>地址: ${CVSAddress}</p>
      `;
    }

    // Update address select
    const addressSelect = document.getElementById('address');
    if (addressSelect) addressSelect.value = '7-11 商店取貨';

    // 🧠 Recalculate Total and Display Summary
    const totalDiv = document.querySelector('.checkout-total');
    let totalAmount = 0;
    if (totalDiv) {
      const match = totalDiv.textContent.match(/\$([\d.]+)/);
      if (match) {
        totalAmount = parseFloat(match[1]);
      }
    }

    const shippingFee = totalAmount < 1000 ? 60 : 0;
    const finalTotal = totalAmount + shippingFee;

    // Update checkout total block
    if (totalDiv) {
      totalDiv.innerHTML = `
        <div><strong>商品總額:</strong> $${totalAmount.toFixed(0)}</div>
        ${shippingFee > 0 ? `<div style="color:red;"><strong>🚚 運費 (7-11 未滿 $1200):</strong> $70</div>` : ''}
        <div><strong>總金額:</strong> $${finalTotal.toFixed(0)}</div>
      `;
    }

    // Save store info globally
    window.selectedStoreInfo = {
      CVSStoreID, CVSStoreName, CVSAddress, MerchantTradeNo,
      shippingFee, finalTotal // optional for reuse
    };
  }
} */

// Global or module-scoped variables for checkout state
let currentShippingCost = 0;
let currentDiscountRate = 0; // Store as percentage, e.g., 5 for 5%

// --- Main Function to Render Checkout Page ---
async function renderCheckoutPage(cartItems) {
    // keep only items where selected !== false (i.e. checked)
    const selectedItems = cartItems.filter(item => item.selected !== false);
    mainBody.checkoutWrapper.innerHTML = ''; // Clear previous content
    window.scrollTo(0, 0);

    // --- Data Retrieval ---
    const storedStoreInfo = JSON.parse(sessionStorage.getItem('selectedStoreInfo'));
    const lineUserId = sessionStorage.getItem('lineUserId');
    const lineUserName = sessionStorage.getItem('lineUserName');
    const lineUserEmail = sessionStorage.getItem('lineUserEmail') || '';
   
    let isMember = false;

      if (lineUserId) {
        const res = await fetch(`https://script.google.com/macros/s/AKfycbzZhiPYkL62ZHeRMi1-RCkVQUodJDe6IR7UvNouwM1bkHmepJAfECA4JF1_HHLn9Zu7Yw/exec?mode=getMemberInfo&lineUserId=${lineUserId}`);
        const data = await res.json();
        if (data.status === 'success') {
          isMember = true;
        }
      }

     console.log("LINE ID and isMember?:  ", lineUserId, isMember);
    // 1. Render Checkout Header (Title "結帳", Login/Member Button)
    //renderCheckoutHeaderDOM(lineUserName);
    
    // 2. Render Ordered Items Summary ("我訂購的商品", list, totals container)
    renderOrderedItemsSummaryDOM(selectedItems);

    // 3. Render "Back for More Items" Button
    renderBackToShoppingButtonDOM();

    // 4. Create and Append Checkout Form
    const checkoutFormElement = createCheckoutFormDOM(lineUserName, lineUserEmail, storedStoreInfo);
    mainBody.checkoutWrapper.appendChild(checkoutFormElement);

    // Get a local reference to the shipping select element FROM THE NEWLY CREATED FORM
    // This is used for the initial calculation of shipping cost.
    const localShippingSelectElement = checkoutFormElement.querySelector('#shipping-method');

    // 6. Initial Calculation of Shipping Cost (Moved before step 5 in execution order for clarity)
    // This calculation is based on the initial state of the form,
    // especially the #shipping-method value which createCheckoutFormDOM might have pre-set.
    if (localShippingSelectElement) { // Ensure the element was found
        if (localShippingSelectElement.value === 'seven_eleven') {
            // This implies createCheckoutFormDOM set its value because storedStoreInfo was present
            currentShippingCost = calculateCartTotal() < 1200 ? 70 : 0;
        } else if (localShippingSelectElement.value === 'store_pickup') {
            currentShippingCost = 0;
        } else { // Default for "" (empty value) or other unexpected values
            currentShippingCost = 0;
        }
    } else {
        console.warn('#shipping-method element not found for initial cost calculation in renderCheckoutPage.');
        currentShippingCost = 0; // Fallback if element isn't found
    }
    updateOrderSummaryDisplay(selectedItems, currentShippingCost, currentDiscountRate);

    // 5. Initial UI State & Event Listeners
    // This function will set up all event listeners and may call updateOrderSummaryDisplay again
    // if, for example, it restores a discount code from session storage.
    initializeCheckoutFormStateAndListeners(checkoutFormElement, selectedItems, storedStoreInfo);
    switchView("checkout");
    // Note: The call to updateOrderSummaryDisplay at the end of initializeCheckoutFormStateAndListeners
    // will ensure the display is accurate after all its internal setup, including potential restoration
    // of discount codes which would affect currentDiscountRate.
}

// --- Helper for Top Header: "結帳" Title & Member/Login Button ---
function handleTopUp(amount) {
  // TODO: replace with real top-up call
  Swal.fire(`您選擇了儲值 ${amount}`);
}
function renderCheckoutHeaderDOM(lineUserName) {
    const titleRow = document.createElement('div');
    titleRow.className = 'checkout-title-row'; // Add a class for styling
    titleRow.style.display = 'flex';
    titleRow.style.justifyContent = 'space-between';
    titleRow.style.alignItems = 'center';
    titleRow.style.marginBottom = '20px';

    const checkoutTitle = document.createElement('h2');
    checkoutTitle.textContent = '結帳';
    checkoutTitle.style.margin = '0'; // Remove default margin
    titleRow.appendChild(checkoutTitle);

    if (lineUserName) {
        const memberWrapper = document.createElement('div');
        memberWrapper.classList.add('member-dropdown-wrapper');
        memberWrapper.style.position = 'relative'; // For dropdown positioning

        const nameBtn = document.createElement('button');
        nameBtn.textContent = `👤 ${lineUserName} ▾`;
        nameBtn.classList.add('member-name-btn'); // Add class for styling

        const dropdown = document.createElement('div');
        dropdown.classList.add('member-dropdown');
        dropdown.style.display = 'none';
        dropdown.style.position = 'absolute';
        dropdown.style.right = '0';
        dropdown.style.top = '100%';
        dropdown.style.backgroundColor = 'white';
        dropdown.style.border = '1px solid #ccc';
        dropdown.style.zIndex = '100';
        dropdown.style.minWidth = '150px';


        const viewOrders = document.createElement('div');
        viewOrders.textContent = '查看訂單';
        viewOrders.className = 'dropdown-item'; // Add class for styling
        viewOrders.addEventListener('click', () => {
            alert('📦 很抱歉, 此功能正在開發中');
            dropdown.style.display = 'none';
        });

        const creditBalance = document.createElement('div');
        creditBalance.textContent = '儲值餘額';
        creditBalance.className = 'dropdown-item';
        creditBalance.addEventListener('click', async () => {
            const lineUserId = sessionStorage.getItem('lineUserId');
            if (!lineUserId) {
                Swal.fire('⚠️ 尚未登入 LINE 帳號，請先登入會員');
                dropdown.style.display = 'none';
                return;
            }
            try {
                // Ensure your GAS URL is correct and supports GET with these params
                const res = await fetch(`https://script.google.com/macros/s/AKfycbzZhiPYkL62ZHeRMi1-RCkVQUodJDe6IR7UvNouwM1bkHmepJAfECA4JF1_HHLn9Zu7Yw/exec?mode=getMemberInfo&lineUserId=${lineUserId}`);
                const data = await res.json();
                if (data.status === 'success') {
                    Swal.fire(`💰 目前點數餘額：${data.creditBalance}`);
                } else if (data.status === 'not_found') {
                  const goToSignup = confirm('⚠️ 查無此會員資料，是否前往註冊頁面？');
                  if (goToSignup) {
                    window.location.href = 'https://www.mrbean.tw/signup';
                  }
                } else {
                    Swal.fire(`❌ 無法取得點數資料：${data.message || '請稍後再試'}`);
                }
            } catch (err) {
                console.error('Error fetching credit balance:', err);
                Swal.fire('🚫 發生錯誤，請檢查網路或稍後再試');
            }
            dropdown.style.display = 'none';
        });
dropdown.appendChild(creditBalance);
  // ─── NEW “儲值” DROPDOWN WITH SCROLLABLE OPTIONS ───
  const topUpWrapper = document.createElement('div');
  topUpWrapper.className = 'dropdown-item topup-wrapper';
  topUpWrapper.style.position = 'relative'; 

  const topUpLabel = document.createElement('div');
  topUpLabel.textContent = '儲值';
  topUpLabel.style.cursor = 'pointer';
  topUpWrapper.appendChild(topUpLabel);

  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'topup-options';
  Object.assign(optionsContainer.style, {
    display: 'none',
    position: 'absolute',
    top: '100%',
    left: '0',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    maxHeight: '80px',
    overflowY: 'auto',
    width: '100%',
    boxSizing: 'border-box',
    zIndex: '100'
  });

  ['$1000', '$3000', '$5000'].forEach(amount => {
    const opt = document.createElement('div');
    opt.textContent = amount;
    opt.className = 'dropdown-item';
    opt.style.padding = '5px 10px';
    opt.style.cursor = 'pointer';
    opt.addEventListener('click', () => {
      optionsContainer.style.display = 'none';
      dropdown.style.display = 'none';
      handleTopUp(amount);
    });
    optionsContainer.appendChild(opt);
  });

  topUpWrapper.appendChild(optionsContainer);
  dropdown.appendChild(topUpWrapper);

  // show/hide on hover
  topUpLabel.addEventListener('mouseenter', () => {
    optionsContainer.style.display = 'block';
  });
  topUpWrapper.addEventListener('mouseleave', () => {
    optionsContainer.style.display = 'none';
  });

  // ─── end 新增 “儲值” ───
        const logout = document.createElement('div');
        logout.textContent = 'Logout';
        logout.className = 'dropdown-item';
        logout.addEventListener('click', () => {
            sessionStorage.removeItem('lineUserName');
            sessionStorage.removeItem('lineUserEmail');
            sessionStorage.removeItem('lineUserId');
            localStorage.removeItem('cart');
            localStorage.removeItem('currentOrderId');
          //  sessionStorage.removeItem('selectedStoreInfo');
          //  sessionStorage.removeItem('discountCode');
          //  sessionStorage.removeItem('discountTier');
            Swal.fire('已登出，購物車及部分結帳資訊已清除。');
            window.location.reload();
        });

        dropdown.appendChild(viewOrders);
        dropdown.appendChild(creditBalance);
        dropdown.appendChild(logout);

        nameBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent window click from immediately closing
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });

        memberWrapper.appendChild(nameBtn);
        memberWrapper.appendChild(dropdown);
        titleRow.appendChild(memberWrapper);

        // Close dropdown if clicked outside
        window.addEventListener('click', (e) => {
            if (!memberWrapper.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });

    } else {
        const memberLoginBtn = document.createElement('button');
        memberLoginBtn.textContent = '會員登入';
        memberLoginBtn.classList.add('member-login-btn'); // Add class for styling
        memberLoginBtn.addEventListener('click', () => {
            if (typeof loginWithLINE === 'function') {
                loginWithLINE();
            } else {
                console.error('loginWithLINE function is not defined.');
                Swal.fire('登入功能暫時無法使用。');
            }
        });
        titleRow.appendChild(memberLoginBtn);
    }
    mainBody.checkoutWrapper.appendChild(titleRow);
}

// --- Helper for "我訂購的商品" Title, List, and Totals Placeholders ---
function renderOrderedItemsSummaryDOM(cartItems) {
    const itemsHeader = document.createElement('h2');
    itemsHeader.textContent = '結帳 -- 感謝您選擇荳荳先生';
    mainBody.checkoutWrapper.appendChild(itemsHeader);
    const itemsTitle = document.createElement('h3');
    itemsTitle.textContent = '我訂購的商品';
    itemsTitle.style.marginTop = '20px';
    mainBody.checkoutWrapper.appendChild(itemsTitle);

    const listElement = document.createElement('div');
    listElement.className = 'checkout-items-list'; // Add class for styling
    if (!cartItems || cartItems.length === 0) {
        listElement.innerHTML = '<p>您的購物車是空的。</p>';
    } else {
        cartItems.forEach(item => {
           const itemDiv = document.createElement('div');
            itemDiv.className = 'checkout-item-display'; // Add class for styling
            itemDiv.style.display = 'flex';
            itemDiv.style.justifyContent = 'space-between';
            itemDiv.style.padding = '5px 0';
            itemDiv.innerHTML = `
                <span style="flex-basis: 50%;"><img src="${item.img}" alt="${item.name}" style="width:60px; height:60px; margin-right:10px; vertical-align:middle;"> ${item.name}</span>
                <span style="flex-basis: 25%; text-align:center;">${item.size}</span>
                <span style="flex-basis: 15%; text-align:center;">x ${item.quantity}</span>
                <span style="flex-basis: 30%; text-align:center;">${item.price}</span>
            `;
            listElement.appendChild(itemDiv);
        });
    }
    mainBody.checkoutWrapper.appendChild(listElement);

    const totalsContainer = document.createElement('div');
    totalsContainer.id = 'order-summary-totals';
    totalsContainer.style.marginTop = '15px';
    totalsContainer.style.paddingTop = '15px';
    totalsContainer.style.borderTop = '1px solid #eee';
    totalsContainer.innerHTML = `
        <div id="order-subtotal" style="display:flex; justify-content:space-between;"><strong>商品總額:</strong> <span>$0.00</span></div>
        <div id="order-discount" style="display:none; justify-content:space-between; color:green;"><strong>折扣:</strong> <span>-$0.00</span></div>
        <div id="order-shipping" style="display:none; justify-content:space-between; color:red;"><strong>運費:(滿$1200可免)</strong> <span>$0.00</span></div>
        <div id="order-final-total" style="font-weight:bold; margin-top:10px; display:flex; justify-content:space-between; font-size:1.3em;"><strong>總金額:</strong> <span>$0.00</span></div>
    `;
    mainBody.checkoutWrapper.appendChild(totalsContainer);
}

// --- Helper for "繼續購買" (Back for More Items) Button ---
function renderBackToShoppingButtonDOM() {
    const backButton = document.createElement('button');
    backButton.id = 'backForMoreItemsBtn';
    backButton.textContent = '🔙 繼續購買';
    backButton.type = 'button'; // Important for forms
    // Basic styling, can be moved to CSS
    Object.assign(backButton.style, {
        backgroundColor: '#5cb85c', color: 'white', padding: '10px 15px',
        border: 'none', borderRadius: '4px', cursor: 'pointer',
        marginTop: '20px', marginBottom: '20px'
    });

    backButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof switchView === 'function') {
            switchView('content');
            document.getElementById('product-container')?.scrollIntoView({ behavior: 'smooth' });
        } else {
            console.error('switchView function is not defined.');
        }
    });
    mainBody.checkoutWrapper.appendChild(backButton);
}

// --- Helper to Create Checkout Form DOM Structure ---
function createCheckoutFormDOM(lineUserName, lineUserEmail, storedStoreInfo) {
    const form = document.createElement('form');
    form.id = 'checkout-form-refactored';

    const storedName = sessionStorage.getItem('lineUserName') || '';
    const storedPhone = ''; // Or retrieve if you store phone number elsewhere

    form.innerHTML = `
        <h4>顧客資訊 及 取貨選項</h4>

        <div class="form-group">
            <label for="shipping-method">取貨方式:</label>
            <select id="shipping-method" name="shipping_method" class="form-control" required>
                <option value="">請選擇取貨方式</option>
                <option value="store_pickup">宅配</option>
                <option value="seven_eleven">7-11 商店取貨</option>
            </select>
        </div>

        <div id="pickup-store-info-display" class="alert alert-info" style="display:none; margin-top:10px; padding:10px; border:1px solid #bce8f1; border-radius:4px; background-color:#d9edf7;">
            </div>

        <div class="form-group">
            <label for="customer_name">收件人姓名:</label>
            <input type="text" id="customer_name" name="customer_name" class="form-control" value="${storedName}" required>
        </div>
        <div class="form-group" id="home-delivery-address-wrapper" style="display: none; flex-direction: column; align-items: stretch;">
          <label for="delivery-city">宅配地址：</label>

          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <select id="delivery-city" class="form-control" style="flex: 1;">
              <option value="">請選擇縣市</option>
              <option value="台北市">台北市</option><!--1-->
              <option value="新北市">新北市</option><!--2-->
              <option value="桃園市">桃園市</option><!--3-->
              <option value="台中市">台中市</option><!--4-->
              <option value="台南市">台南市</option><!--5-->
              <option value="高雄市">高雄市</option><!--6-->
              <option value="基隆市">基隆市</option><!--7-->
              <option value="新竹市">新竹市</option><!--8-->
              <option value="嘉義市">嘉義市</option><!--9-->
              <option value="宜蘭縣">宜蘭縣</option><!--10-->
              <option value="苗栗縣">苗栗縣</option><!--11-->
              <option value="彰化縣">彰化縣</option><!--12-->
              <option value="南投縣">南投縣</option><!--13-->
              <option value="雲林縣">雲林縣</option><!--14-->
              <option value="嘉義縣">嘉義縣</option><!--15-->
              <option value="臺東縣">臺東縣</option><!--16-->
              <option value="花蓮縣">花蓮縣</option><!--17-->
              <option value="澎湖縣">澎湖縣</option><!--18-->
              <option value="金門縣">金門縣</option><!--19-->
              <option value="連江縣">連江縣</option><!--20-->
            </select>

            <input type="text" id="delivery-address" class="form-control" placeholder="請輸入街道、門牌等詳細地址" style="flex: 2;">
          </div>
        </div>
        <div class="form-group">
            <label for="customer_email">Email:</label>
            <input type="email" id="customer_email" name="customer_email" class="form-control" value="${lineUserEmail}" style="display:none">
        </div>
        <div class="form-group">
            <label for="customer_phone">電話:</label>
            <input type="tel" id="customer_phone" name="customer_phone" class="form-control" pattern="09[0-9]{8}" value="${storedPhone}" placeholder="例如: 0912345678" required>
        </div>

        <div class="form-group">
            <label for="payment-option">付款方式:</label>
            <select id="payment-option" name="payment_option" class="form-control" required>
                <option value="pay_at_store">到店付款</option>
                <option value="credit_card_ecpay">信用卡付款 (透過第三方支付:綠界 ECPay)</option>
                ${lineUserName ? '<option value="credit_point">💰 會員儲值金付款 </option>' : ''}
            </select>
        </div>

        <div id="submit-area" style="margin-top: 20px;">
            <button type="submit" id="final-submit-btn" class="btn btn-primary btn-lg btn-block" style="display:block; width:100%; padding:10px; font-size:1.2em;">確認訂單</button>
              <div id="credit-card-wrapper" style="display:none; text-align: center;">
                <h4>💳 請點選信用卡圖示進行付款</h4>
                <img src="image/creditcard.png" alt="Pay with Credit Card" id="ecpay-credit-card-btn"
                  style="cursor:pointer; max-width:150px;" />
              </div>
        </div>
    `;

    // Apply stored 7-11 info if available (for initial render)
    const storeInfoDiv = form.querySelector('#pickup-store-info-display');
    if (storedStoreInfo && storedStoreInfo.CVSStoreID) {
        storeInfoDiv.innerHTML = `
            <p style="margin:0;"><strong>已選擇 7-11 門市</strong></p>
            <p style="margin:0;">店號: ${storedStoreInfo.CVSStoreID}</p>
            <p style="margin:0;">店名: ${storedStoreInfo.CVSStoreName}</p>
            <p style="margin:0;">地址: ${storedStoreInfo.CVSAddress}</p>
        `;
        storeInfoDiv.style.display = 'block';
        form.querySelector('#shipping-method').value = 'seven_eleven';
    }

    return form;
}

// --- Helper to Update Displayed Order Summary (Subtotal, Discount, Shipping, Total) ---
function updateOrderSummaryDisplay(cartItems, shippingCost, discountPercentage) {
    // Sum only selectedItems
    const subtotal = cartItems.reduce((sum, item) => {
        const unit = parseFloat(item.price.replace(/[^0-9.-]+/g, ""));
        return sum + (isNaN(unit) ? 0 : unit * item.quantity);
    }, 0);
    const discountAmount = subtotal * (discountPercentage / 100);
    const totalAfterDiscount = subtotal - discountAmount;
    const finalTotal = totalAfterDiscount + shippingCost;

    document.querySelector('#order-subtotal span').textContent = `$${subtotal.toFixed(0)}`;

    const discountDiv = document.getElementById('order-discount');
    if (discountAmount > 0) {
        discountDiv.querySelector('span').textContent = `-$${discountAmount.toFixed(1)}`;
        discountDiv.style.display = 'flex';
    } else {
        discountDiv.style.display = 'none';
    }

    const shippingDiv = document.getElementById('order-shipping');
    if (shippingCost > 0) {
        const shippingMethod = document.getElementById('shipping-method')?.value;
        const threshold = shippingMethod === 'seven_eleven' ? 1200 : 3000;
        shippingDiv.innerHTML = `
            <strong>運費(${shippingMethod === 'seven_eleven' ? '7-11 未滿 $1200' : '宅配未滿 $3000'}):</strong> 
            <span>$${shippingCost.toFixed(0)}</span>
        `;
        shippingDiv.style.display = 'flex';
    } else {
        shippingDiv.style.display = 'none';
    }

    document.querySelector('#order-final-total span').textContent = `$${finalTotal.toFixed(0)}`;

    // Store numeric values for submission if needed
    sessionStorage.setItem('finalOrderAmountForSubmission', finalTotal.toFixed(0));
    sessionStorage.setItem('orderShippingCostForSubmission', shippingCost.toFixed(0));
    sessionStorage.setItem('orderDiscountAmountForSubmission', discountAmount.toFixed(0));
    sessionStorage.setItem('orderSubtotalForSubmission', subtotal.toFixed(0));
}


// --- Helper for Checkout Form Event Listeners & Initial State Management ---
function initializeCheckoutFormStateAndListeners(form, cartItems, initialStoredStoreInfo) {
    const shippingSelect = form.querySelector('#shipping-method');
    const paymentSelect = form.querySelector('#payment-option');
    const submitButton = form.querySelector('#final-submit-btn');
    const creditCardImageButton = form.querySelector('#credit-card-wrapper');
    const nameInput = form.querySelector('#customer_name');
    const emailInput = form.querySelector('#customer_email');
    const phoneInput = form.querySelector('#customer_phone');
   // const discountInput = form.querySelector('#discount_code');
   // const applyDiscountBtn = form.querySelector('#apply-discount-btn');
    const discountMessage = form.querySelector('#discount-message');
    const storeInfoDiv = form.querySelector('#pickup-store-info-display');

    // Initial state for submit buttons
    async function toggleSubmitButtonVisibility() {
    const isValid = validateFormFields();
    const paymentMethod = paymentSelect.value;
    const submitAmount = parseFloat(sessionStorage.getItem('finalOrderAmountForSubmission')) || 0;

    document.getElementById('delivery-city')?.addEventListener('change', toggleSubmitButtonVisibility);
    document.getElementById('delivery-address')?.addEventListener('input', toggleSubmitButtonVisibility);
   
    // Default: disable both buttons
    submitButton.disabled = true;
    creditCardImageButton.style.display = 'none';

    if (!isValid) return;

    if (paymentMethod === 'credit_point') {
        const lineUserId = sessionStorage.getItem('lineUserId');
        if (!lineUserId) {
            Swal.fire('⚠️ 未登入會員，無法使用點數付款');
            return;
        }

        try {
            const res = await fetch(`https://script.google.com/macros/s/AKfycbzZhiPYkL62ZHeRMi1-RCkVQUodJDe6IR7UvNouwM1bkHmepJAfECA4JF1_HHLn9Zu7Yw/exec?mode=getMemberInfo&lineUserId=${lineUserId}`);
            const data = await res.json();

            if (data.status === 'success') {
                const creditBalance = parseFloat(data.creditBalance) || 0;
                if (creditBalance >= submitAmount) {
                    submitButton.disabled = false;
                } else {
                    Swal.fire(`❌ 儲值金不足。目前餘額：${creditBalance}，需支付：${submitAmount}`);
                }
            } else {
                Swal.fire('⚠️ 無法取得會員點數，請稍後再試');
            }
        } catch (err) {
            console.error('點數查詢失敗:', err);
            Swal.fire('🚫 發生錯誤，請稍後再試');
        }
    } else if (paymentMethod === 'credit_card_ecpay') {
        creditCardImageButton.style.display = 'block';
    } else {
        submitButton.disabled = false;
    }
}

    function validateCustomerName() {
  const nameField = document.getElementById('customer_name');
  const name = nameField.value.trim();

  // 1) No digits or symbols allowed
  if (/[0-9!@#$%^&*(),.?":{}|<>_\-+=\\/\[\]]/.test(name)) {
    Swal.fire('⚠️ 姓名不能包含數字或符號。請重新輸入。');
    return false;
  }

  // 2) Pure Chinese? (Han script only)
  if (/^[\p{Script=Han}]+$/u.test(name)) {
    if (name.length < 2) {
      Swal.fire('⚠️ 中文姓名應至少兩個字元。請重新輸入。');
      return false;
    }
    return true;
  }

  // 3) Pure English? (letters and spaces only)
  if (/^[A-Za-z\s]+$/.test(name)) {
    const parts = name.split(/\s+/);
    if (parts.length > 2) {
      Swal.fire('⚠️ 英文姓名僅能包含一個空格，例如：John Doe');
      return false;
    }
    // Count letters (no spaces)
    const lettersOnly = name.replace(/\s+/g, '');
    if (lettersOnly.length < 2) {
      Swal.fire('⚠️ 請輸入至少兩個字母的英文姓名。');
      return false;
    }
    return true;
  }

  // 4) Mixed or other scripts: just require >=2 chars
  if ([...name].length < 2) {
    Swal.fire('⚠️ 姓名應至少兩個字元。請重新輸入。');
    return false;
  }
  
  return true;
}
    function validateFormFields() {
        const isShippingSelected = shippingSelect.value !== "";
        const is711StoreSelectedIfApplicable = shippingSelect.value !== 'seven_eleven' || (shippingSelect.value === 'seven_eleven' && sessionStorage.getItem('selectedStoreInfo'));

        return isShippingSelected &&
               is711StoreSelectedIfApplicable &&
               nameInput.value.trim() !== '' &&
               emailInput.checkValidity() && // Built-in email validation
               phoneInput.checkValidity(); // For pattern matching e.g. "09[0-9]{8}"
    }

    // Add event listeners to form fields for validation
    [nameInput, emailInput, phoneInput, shippingSelect, paymentSelect].forEach(el => {
        el.addEventListener('input', toggleSubmitButtonVisibility);
        el.addEventListener('change', toggleSubmitButtonVisibility); // For select elements
    });

shippingSelect.addEventListener('change', () => {
  const selection = shippingSelect.value;
  const currentCartTotal = calculateCartTotal();
  const deliveryAddressWrapper = document.getElementById('home-delivery-address-wrapper');
  const paymentSelect = form.querySelector('#payment-option');
  const payAtStoreOption = paymentSelect.querySelector('option[value="pay_at_store"]');

      if (shippingSelect.value === 'store_pickup') {
      // 宅配：hide 到店付款
      if (payAtStoreOption) payAtStoreOption.style.display = 'none';

      // Optionally switch to credit card by default if needed
      if (paymentSelect.value === 'pay_at_store') {
        paymentSelect.value = 'credit_card_ecpay';
      }
    } else {
      // 非宅配：show 到店付款
      if (payAtStoreOption) payAtStoreOption.style.display = 'block';
    }
     if (shippingSelect.value === 'store_pickup') {
        deliveryAddressWrapper.style.display = 'block';
      } else {
        deliveryAddressWrapper.style.display = 'none';
      }
  // If user picks 7-11…
  if (selection === 'seven_eleven') {
    const existingStore = JSON.parse(sessionStorage.getItem('selectedStoreInfo'));

    // --- CASE A: No store chosen yet → open map immediately ---
    if (!existingStore || !existingStore.CVSStoreID) {
      // generate new orderId
      const now = new Date();
      const orderId = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}${Math.floor(Math.random()*1000)}`;
      const discountCode = sessionStorage.getItem('discountCode') || '';
      window.currentOrderId = orderId;
      localStorage.setItem('currentOrderId', orderId);
      localStorage.setItem('cart', JSON.stringify(cart));

      sessionStorage.setItem('checkoutFormDataBeforeECPay', JSON.stringify({
        name: nameInput.value, email: emailInput.value, phone: phoneInput.value,
        payment: paymentSelect.value, discountCode: document.getElementById('side-cart-discount-code').value.trim(),
        currentDiscountRate: currentDiscountRate
      }));

      openLogisticsMap(orderId);
      return; // stop further processing
    }

    // --- CASE B: Store already chosen → show info + “reselect” button ---
    currentShippingCost = currentCartTotal < 1200 ? 70 : 0;
    storeInfoDiv.innerHTML = `
      <p style="margin:0;"><strong>已選擇 7-11 門市</strong></p>
      <p style="margin:0;">店號: ${existingStore.CVSStoreID}</p>
      <p style="margin:0;">店名: ${existingStore.CVSStoreName}</p>
      <p style="margin:0;">地址: ${existingStore.CVSAddress}</p>
      <button type="button" id="reselect-store-btn" style="margin-top:8px;">🔄 重新選擇門市</button>
    `;
    storeInfoDiv.style.display = 'block';

    // wire up the “reselect” button
    document.getElementById('reselect-store-btn')
      .addEventListener('click', () => {
        const discountCode = sessionStorage.getItem('discountCode') || '';
        sessionStorage.setItem('checkoutFormDataBeforeECPay', JSON.stringify({
          name: nameInput.value,
          email: emailInput.value,
          phone: phoneInput.value,
          payment: paymentSelect.value,
          discountCode,
          currentDiscountRate: currentDiscountRate
        }));
          // 🔁 Also re-save cart and orderId (in case cart updated)
        const now = new Date();
        const orderId = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}${Math.floor(Math.random()*1000)}`;
          window.currentOrderId = orderId;
          localStorage.setItem('currentOrderId', orderId);
        localStorage.setItem('cart', JSON.stringify(cart));
        // clear previous info, then open map
        sessionStorage.removeItem('selectedStoreInfo');
        shippingSelect.value = 'seven_eleven'; // keep dropdown
        openLogisticsMap(window.currentOrderId);
      });

  } else {
    // other shipping methods
    if (selection === 'seven_eleven') {
    currentShippingCost = currentCartTotal < 1200 ? 70 : 0;
    } else if (selection === 'store_pickup') { // 宅配
        currentShippingCost = currentCartTotal < 3000 ? 120 : 0;
    } else {
        currentShippingCost = 0;
    }
    storeInfoDiv.style.display = 'none';
    storeInfoDiv.innerHTML = '';
  }

  // update totals and button state
  updateOrderSummaryDisplay(cartItems, currentShippingCost, currentDiscountRate);
  toggleSubmitButtonVisibility();
});

//This part is no use as discount code is entered in sideCart Now!
/*    applyDiscountBtn.addEventListener('click', () => {
        const code = discountInput.value.trim();
        if (!code) {
            discountMessage.textContent = '請輸入折扣碼。';
            discountMessage.className = 'form-text text-warning';
            currentDiscountRate = 0; // Reset discount
        } else {
            // membershipData must be loaded and accessible
            const discountPercentage = validateDiscountCode(code); // Expects percentage (e.g., 5 for 5%)
            if (discountPercentage > 0) {
                currentDiscountRate = discountPercentage;
                discountMessage.textContent = `已套用 ${sessionStorage.getItem('discountTier') || ''} 折扣 (${discountPercentage}% off)!`;
                discountMessage.className = 'form-text text-success';
            } else {
                currentDiscountRate = 0; // Reset discount
                discountMessage.textContent = '無效的折扣碼。';
                discountMessage.className = 'form-text text-danger';
            }
        }
        updateOrderSummaryDisplay(cartItems, currentShippingCost, currentDiscountRate);
    });
*/
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const submitBtn = document.getElementById('final-submit-btn');
      // Prevent double submission
      if (submitBtn.disabled) return; 
      if (!validateCustomerName()) return;
        submitBtn.disabled = true; // Disable immediately
        submitBtn.textContent = '處理中...';
        
        e.preventDefault();
        if (!validateFormFields()) {
            alert('請完整填寫表單並選擇有效的取貨方式。');
            return;
        }
const shippingMethodValue = shippingSelect.value; // e.g., 'seven_eleven' or 'store_pickup'
let calculatedAddress = 'N/A'; // Default
let cvsStoreIDValue = null;    // Default
const selectedStoreInfo = JSON.parse(sessionStorage.getItem('selectedStoreInfo')); // May be null

if (shippingMethodValue === 'seven_eleven' && selectedStoreInfo) {
    calculatedAddress = selectedStoreInfo.CVSAddress || '7-11 CVS Address Not Provided';
    cvsStoreIDValue = selectedStoreInfo.CVSStoreID || null;
} else if (shippingMethodValue === 'store_pickup') {
    const citySelect = document.getElementById('delivery-city');
    const addressInput = document.getElementById('delivery-address');

    const city = citySelect?.value?.trim() || '';
    const address = addressInput?.value?.trim() || '';

    if (city && address) {
        calculatedAddress = `宅配:${city}${address}`;
    } else {
        calculatedAddress = null; // Incomplete input
    }
}
const discountAmount = parseFloat(sessionStorage.getItem('orderDiscountAmountForSubmission')) || 0;
const discountRate = parseFloat(currentDiscountRate) || 0;

// Multiply directly (not divide by 1), then round
const calculatedRewardAmount = parseFloat((discountAmount).toFixed(1)); 

const orderId = generateCustomOrderId();

const orderData = {
  orderId,
  name: nameInput.value,
  email: emailInput.value,
  telephone: phoneInput.value,
  paymentMethod: paymentSelect.value,
  address: calculatedAddress,
  CVSStoreID: cvsStoreIDValue || null,
  discountCode: sessionStorage.getItem('discountCode') || null,

  // ✅ Send as strings (e.g., "$345")
  totalAmount: `$${sessionStorage.getItem('finalOrderAmountForSubmission') || '0'}`,
  rewardAmount: `$${calculatedRewardAmount}`,

  lineUserName: sessionStorage.getItem('lineUserName') || null,
  lineUserId: sessionStorage.getItem('lineUserId') || null,
  cartItems: cart
};

console.log("Order Data for Submission to GAS (New Structure):", JSON.stringify(orderData, null, 2));

        // Send to your Cloud Function or Web App here
      await fetch('https://script.google.com/macros/s/AKfycbzZhiPYkL62ZHeRMi1-RCkVQUodJDe6IR7UvNouwM1bkHmepJAfECA4JF1_HHLn9Zu7Yw/exec', {
        method: 'POST',
        mode: "no-cors",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      // Reset state
      cart = [];
      localStorage.removeItem('cart'); 
      localStorage.removeItem('currentOrderId');
      sessionStorage.removeItem('cart')
      renderSideCart();
      switchView('content');
      Swal.fire('✅ 感謝您的訂購！');
        // Clear cart, session storage for checkout, and redirect or show success message
        // cart.length = 0; // Clear the global cart array
        // renderSideCart(); // Update side cart display
        // sessionStorage.removeItem('selectedStoreInfo');
        // sessionStorage.removeItem('discountCode');
        // sessionStorage.removeItem('discountTier');
        // localStorage.removeItem('currentOrderId');
        // switchView('thankyou'); // Or navigate to a thank you page
    });

    creditCardImageButton.addEventListener('click', async () => {
        if (!validateFormFields()) {
            alert('請完整填寫表單並選擇有效的取貨方式。');
            return;
        }
        creditCardImageButton.style.pointerEvents = 'none';              
              // Show loading indicator
              const loadingDiv = document.createElement('div');
              loadingDiv.id = 'payment-loading';
              loadingDiv.innerHTML = '<p>正在連結綠界(ECPay)處理付款請求......</p>';
              loadingDiv.style.position = 'fixed';
              loadingDiv.style.top = '50%';
              loadingDiv.style.left = '50%';
              loadingDiv.style.transform = 'translate(-50%, -50%)';
              loadingDiv.style.background = 'rgba(255,255,255,0.9)';
              loadingDiv.style.padding = '20px';
              loadingDiv.style.borderRadius = '5px';
              loadingDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
              loadingDiv.style.zIndex = '9999';
              document.body.appendChild(loadingDiv);
        const shippingMethodValue = shippingSelect.value; // e.g., 'seven_eleven' or 'store_pickup'
        let calculatedAddress = 'N/A'; // Default
        let cvsStoreIDValue = null;    // Default
        let pickupOption = "N/A";
  
        const selectedStoreInfo = JSON.parse(sessionStorage.getItem('selectedStoreInfo')); // May be null
        const discountAmount = parseFloat(sessionStorage.getItem('orderDiscountAmountForSubmission')) || 0;
        const calculatedRewardAmount = parseFloat((discountAmount).toFixed(1)); 
        if (shippingMethodValue === 'seven_eleven' && selectedStoreInfo) {
            calculatedAddress = selectedStoreInfo.CVSAddress || '7-11 CVS Address Not Provided';
            cvsStoreIDValue = selectedStoreInfo.CVSStoreID || null;
            pickupOption = "便利商店";
       
        } else if (shippingMethodValue === 'store_pickup') {
            const citySelect = document.getElementById('delivery-city');
            const addressInput = document.getElementById('delivery-address');

            const city = citySelect?.value?.trim() || '';
            const address = addressInput?.value?.trim() || '';

            if (city && address) {
                calculatedAddress = `宅配:${city}${address}`;
                pickupOption = "宅配";
            } else {
                calculatedAddress = null; // Incomplete input
            }
        }
        const totalForECPay = parseFloat(sessionStorage.getItem('finalOrderAmountForSubmission'));
        let orderIdForECPay = localStorage.getItem('currentOrderId');

        if (!orderIdForECPay) { // Should ideally always exist if 7-11 was chosen
            const now = new Date();
            orderIdForECPay = `ECP${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}${Math.floor(Math.random()*1000)}`;
            localStorage.setItem('currentOrderId', orderIdForECPay);
        }

        const itemNames = cartItems.map(item => `${item.name.substring(0,40)} x${item.quantity}`).join('#').substring(0,190); // ECPay length limits
        const orderId = generateCustomOrderId();
        const orderData = {
          orderId,
          name: nameInput.value,
          email: emailInput.value,
          telephone: phoneInput.value,
          paymentMethod: paymentSelect.value,
          address: calculatedAddress,
          CVSStoreID: cvsStoreIDValue || null,
          discountCode: sessionStorage.getItem('discountCode') || null,

          // ✅ Send as strings (e.g., "$345")
          totalAmount: `$${sessionStorage.getItem('finalOrderAmountForSubmission') || '0'}`,
          rewardAmount: `$${calculatedRewardAmount}`,

          lineUserName: sessionStorage.getItem('lineUserName') || null,
          lineUserId: sessionStorage.getItem('lineUserId') || null,
          cartItems: cart
        };
        const itemsString = Array.isArray(cart)
  ? cartItems.map(item => `${item.name} x${item.quantity}`).join(', ')
  : ''; 

        const ecpayData = {
            orderId,
            name: nameInput.value,
            // MerchantTradeDate: Formatted YYYY/MM/DD HH:MM:SS (Server should generate this ideally)
            totalAmount: sessionStorage.getItem('finalOrderAmountForSubmission') || 0,
            customField1: pickupOption,
            customField2: sessionStorage.getItem('lineUserId') || null,
            customField3: nameInput.value,
            customField4: phoneInput.value,
            tradeDesc: 'Order Description', // Replace with your order description
            itemName: itemsString, // Replace with your product name
            returnUrl: 'https://asia-east1-ecpay-rtnmessage.cloudfunctions.net/handleECPayPost', // Replace with your ReturnURL
            clientBackUrl: 'https://www.mrbean.tw/' 
        };
        console.log("Data for ECPay Credit Card (to be sent to server):", ecpayData);

        // Send to your Cloud Function or Web App here
      await fetch('https://script.google.com/macros/s/AKfycbzZhiPYkL62ZHeRMi1-RCkVQUodJDe6IR7UvNouwM1bkHmepJAfECA4JF1_HHLn9Zu7Yw/exec', {
        method: 'POST',
        mode: "no-cors",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });   

    // Reset state
      cart = [];
      localStorage.removeItem('cart'); 
      localStorage.removeItem('currentOrderId');
      sessionStorage.removeItem('cart')
      renderSideCart();
        
          // Send a POST request to the Cloud Function
  fetch('https://mrbean-creditpayment-production-545199463340.asia-east1.run.app', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(ecpayData)
  })
  .then(response => {
    if (!response.ok) {
      // If we get an error response, convert it to text and throw
      return response.text().then(text => {
        throw new Error(`Server responded with ${response.status}: ${text}`);
      });
    }
    return response.text();
  })
  .then(html => {
    // Remove loading indicator
    document.getElementById('payment-loading').remove();
    
    // Replace the current document with the payment form
    document.open();
    document.write(html);
    document.close();
  })
  .catch(error => {
    console.error('Error initiating payment:', error);
    
    // Remove loading indicator
    if (document.getElementById('payment-loading')) {
      document.getElementById('payment-loading').remove();
    }
    
    // Re-enable the button
    document.getElementById('creditCardImage').style.pointerEvents = 'auto';
    
    // Show error message
    alert('Failed to initiate payment. Please try again. Error: ' + error.message);
  });
});

    // Restore form data if returning from ECPay map selection (if it was saved)
    const savedCheckoutData = JSON.parse(sessionStorage.getItem('checkoutFormDataBeforeECPay'));
    if (savedCheckoutData) {
        nameInput.value = savedCheckoutData.name || '';
        emailInput.value = savedCheckoutData.email || '';
        phoneInput.value = savedCheckoutData.phone || '';
        paymentSelect.value = savedCheckoutData.payment || 'pay_at_store';
        if (savedCheckoutData.currentDiscountRate) {
            currentDiscountRate = savedCheckoutData.currentDiscountRate || 0;
        }
        sessionStorage.removeItem('checkoutFormDataBeforeECPay'); // Clean up
    }

    // Initial call to set button states and summary
    updateOrderSummaryDisplay(cartItems, currentShippingCost, currentDiscountRate);
    toggleSubmitButtonVisibility();
}

// --- Modified ECpayStoreDataBackTransfer ---
// This function is assumed to be called on DOMContentLoaded or when ECPay redirects back.
function ECpayStoreDataBackTransfer() {
    const shippingSelect = document.querySelector('#shipping-method');
    if (!shippingSelect) {
        console.warn('shippingSelect not found');
        return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const CVSStoreID = urlParams.get('CVSStoreID');
    const CVSStoreName = urlParams.get('CVSStoreName');
    const CVSAddress = urlParams.get('CVSAddress');
    const MerchantTradeNo = urlParams.get('MerchantTradeNo'); // This is the orderId

    // Check if we are on the checkout page by looking for a specific element
    const checkoutFormRefactored = document.getElementById('checkout-form-refactored');
    console.log("CVSStoreID, CVSAddress, OrderID and checkout-form-refactored: ", CVSStoreID, CVSAddress, MerchantTradeNo, checkoutFormRefactored);
    if (CVSStoreID && CVSStoreName && CVSAddress && MerchantTradeNo) {
        const selectedStoreData = { CVSStoreID, CVSStoreName, CVSAddress, MerchantTradeNo };
        sessionStorage.setItem('selectedStoreInfo', JSON.stringify(selectedStoreData));
        // Ensure currentOrderId in localStorage is also updated if it changed (it shouldn't from ECPay map)
        localStorage.setItem('currentOrderId', MerchantTradeNo);

        const storeInfoDiv = document.getElementById('pickup-store-info-display');
        const shippingSelect = document.getElementById('shipping-method');

        if (storeInfoDiv) {
            storeInfoDiv.innerHTML = `
                <p style="margin:0;"><strong>已選擇 7-11 門市</strong></p>
                <p style="margin:0;">店號: ${CVSStoreID}</p>
                <p style="margin:0;">店名: ${CVSStoreName}</p>
                <p style="margin:0;">地址: ${CVSAddress}</p>
            `;
            storeInfoDiv.style.display = 'block';
        }
        if (shippingSelect) {
            shippingSelect.value = 'seven_eleven'; // Pre-select the dropdown
        }

        const cartTotal = calculateCartTotal();
        if (localShippingSelectElement.value === 'seven_eleven') {
            currentShippingCost = cartTotal < 1200 ? 70 : 0;
        } else if (localShippingSelectElement.value === 'store_pickup') {
            currentShippingCost = cartTotal < 3000 ? 120 : 0;
        } else {
            currentShippingCost = 0;
        }
        // Restore other form fields that might have been cleared by navigation
        const savedCheckoutData = JSON.parse(sessionStorage.getItem('checkoutFormDataBeforeECPay'));
        if (savedCheckoutData) {
            document.getElementById('customer_name').value = savedCheckoutData.name || '未填寫完整';
            document.getElementById('customer_email').value = savedCheckoutData.email || '';
            document.getElementById('customer_phone').value = savedCheckoutData.phone || '';
            document.getElementById('payment-option').value = savedCheckoutData.payment || 'pay_at_store';
            if (savedCheckoutData.currentDiscountRate) {
                currentDiscountRate = savedCheckoutData.currentDiscountRate || 0;
            }
            sessionStorage.removeItem('checkoutFormDataBeforeECPay'); // Clean up
        }
        
        // 'cart' must be globally available or passed to updateOrderSummaryDisplay
        updateOrderSummaryDisplay(cart, currentShippingCost, currentDiscountRate);

        // Manually trigger change on shippingSelect to re-validate form and button states
        if (shippingSelect) {
            const event = new Event('change');
            shippingSelect.dispatchEvent(event);
        }
        
        // Clean URL: Remove ECPay parameters to prevent re-processing on refresh.
        // Do this carefully, only if you're sure the state is fully restored.
        // window.history.replaceState({}, document.title, window.location.pathname);
    } else if (checkoutFormRefactored && !CVSStoreID && shippingSelect.value === 'seven_eleven' && !sessionStorage.getItem('selectedStoreInfo')) {
        // If 7-11 is selected but no store info exists (e.g. user refreshed after ECPay redirect without params, or navigated back)
        // and we are on checkout page, prompt to select store or clear selection
        shippingSelect.value = ""; // Reset dropdown
        document.getElementById('pickup-store-info-display').style.display = 'none';
        currentShippingCost = 0;
        updateOrderSummaryDisplay(cart, currentShippingCost, currentDiscountRate);
        Swal.fire("請重新選擇7-11門市，或選擇其他取貨方式。");
         const event = new Event('change');
         shippingSelect.dispatchEvent(event); // Trigger validation
    }
}


// --- Utility: Validate Discount Code ---
// Make sure membershipData is loaded before this is called.
function validateDiscountCode(inputCode) {
    if (!membershipData || membershipData.length === 0) {
        console.warn("Membership data not loaded. Cannot validate discount code.");
        return 0;
    }
    const codeToValidate = inputCode.trim().toLowerCase();
    const member = membershipData.find(m => m.discountCode.toLowerCase() === codeToValidate);

    if (member) {
        sessionStorage.setItem('discountCode', member.discountCode); // Store the actual code used
        sessionStorage.setItem('discountTier', member.tier);
        const tier = member.tier.toLowerCase();
        switch (tier) {
            case '鑽石級': return 10;
            case '金級': return 5;   // 5%
            case '銀級': return 3; // 3%
            case '銅級': return 2; // 1%
            default: return 0;
        }
    } else {
        sessionStorage.removeItem('discountCode');
        sessionStorage.removeItem('discountTier');
        return 0;
    }
}

// --- Utility: Calculate Cart Subtotal (Numeric) ---
// Ensure 'cart' is accessible.
function calculateCartTotal() {
    let total = 0;
    if (!cart || cart.length === 0) return 0;
    cart.forEach(item => {
        const priceString = String(item.price); // Ensure it's a string before replacing
        const price = parseFloat(priceString.replace(/[^0-9.-]+/g, ""));
        if (!isNaN(price)) {
            total += price * item.quantity;
        }
    });
    return total;
}

// --- Assumed globally available functions (you need to ensure these exist) ---
// function loginWithLINE() { /* ... */ }
// function openLogisticsMap(orderId) { /* ... */ }
// function switchView(viewName) { /* ... */ }
// let cart = []; // Global cart variable
// let membershipData = []; // Global membership data

// Call ECpayStoreDataBackTransfer on page load to handle returns from ECPay
document.addEventListener('DOMContentLoaded', () => {
    // Load membership data if not already loaded
    if (typeof loadMembershipData === 'function' && (!membershipData || membershipData.length === 0) ) {
        loadMembershipData().then(() => {
            // Potentially re-render or update parts of checkout if it's already visible
            // and dependent on membershipData (e.g. auto-applying a default discount)
        });
    }
    ECpayStoreDataBackTransfer();
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
  
      if (productId) {
        // Load product details directly
        renderItemDetails(productId);
        switchView('item');
      }
});
    //For Page Refresh when returning from ECPay Payment
    window.addEventListener('pageshow', async (event) => {
    if (event.persisted) {
        // Page was restored from BFCache, re-initialize content
        console.log("Page restored from BFCache. Re-initializing content.");
        init(); // Re-run initial content rendering, which includes renderMainContent()
        ECpayStoreDataBackTransfer(); // Re-process ECPay data if any, as it might be relevant on BFCache restore
    }
});
    // --- Event Listeners Setup ---
    function setupEventListeners() {
        // Navbar Links (Scroll within content view)
        navbar.aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentView !== 'content') switchView('content');
            document.getElementById('about-container')?.scrollIntoView({ behavior: 'smooth' });
        });
        navbar.aboutLink_m.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentView !== 'content') switchView('content');
            document.getElementById('about-container')?.scrollIntoView({ behavior: 'smooth' });
        });
        navbar.productLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentView !== 'content') switchView('content');
            document.getElementById('product-container')?.scrollIntoView({ behavior: 'smooth' });
        });
        navbar.productLink_m.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentView !== 'content') switchView('content');
            document.getElementById('product-container')?.scrollIntoView({ behavior: 'smooth' });
        });
        navbar.mediaLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentView !== 'content') switchView('content');
            document.getElementById('media-container')?.scrollIntoView({ behavior: 'smooth' });
        });
        navbar.mediaLink_m.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentView !== 'content') switchView('content');
            document.getElementById('media-container')?.scrollIntoView({ behavior: 'smooth' });
        });
        navbar.memberLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentView !== 'content') switchView('content');
            document.getElementById('membership-container')?.scrollIntoView({ behavior: 'smooth' });
        });
        navbar.memberLink_m.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentView !== 'content') switchView('content');
            document.getElementById('membership-container')?.scrollIntoView({ behavior: 'smooth' });
        });
        navbar.contactLink.addEventListener('click', (e) => {
            e.preventDefault();
             // Assuming contact scrolls to footer
            document.querySelector('.footer')?.scrollIntoView({ behavior: 'smooth' });
        });
        navbar.contactLink_m.addEventListener('click', (e) => {
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

            // MODIFIED: Add a check to ensure the item is NOT out of stock before proceeding.
            if (productItem && !productItem.classList.contains('out-of-stock')) {
                const productId = productItem.dataset.productId;
                renderItemDetails(productId); // Render the detail view
                switchView('item');           // Switch to the item view
            }
            // If the item has the 'out-of-stock' class, nothing happens.
        });

         // Add to Cart Click (Event Delegation on item wrapper)
        mainBody.itemWrapper.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const productId = e.target.dataset.productId;
                addToCart(productId);
                Swal.fire(`${allItemDetails[productId]?.name || 'Item'} 已加入購物車!`); // Simple feedback
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
            }
            // Quantity control is now handled by setupSideCartEventListeners()
        });
        

        // Checkout Button Click (in Side Cart)
        // Checkout Button Click (in Side Cart) - FIXED
        sideCart.checkoutBtn.addEventListener('click', () => {
            const selectedItems = cart.filter(item => item.selected !== false);
            if (selectedItems.length > 0) {
                renderCheckoutPage(selectedItems); // ⬅️ Pass only selected items
                switchView('checkout');
                sideCart.aside.classList.remove('open'); // Close side cart
            } else {
                Swal.fire("請選擇要結帳的商品。");
            }
        });
     
    }

    async function exchangeCodeForToken(code) {
      const cloudFunctionURL = 'https://mrbean-website-line-login-545199463340.asia-east1.run.app'; // <-- replace with your real function URL

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
          console.log("In Code Exchange: LindID is: ", sessionStorage.getItem('lineUserId'));

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

            Swal.fire('✅ 訂單已成功送出！謝謝您的購買！');
        } catch (error) {
            console.error('Failed to submit order:', error);
            Swal.fire('❌ 訂單提交失敗，請稍後再試。');
        }
    }
async function updateNavbarWithUserName(userName) {
  let isMember = false;
  const loginBtn = document.getElementById('member-login-button');
  const memberService = document.getElementById('member-service-container');
  const storedUserId = sessionStorage.getItem('lineUserId');

  if (!storedUserId) return;

  try {
   const res = await fetch(`https://script.google.com/macros/s/AKfycbzZhiPYkL62ZHeRMi1-RCkVQUodJDe6IR7UvNouwM1bkHmepJAfECA4JF1_HHLn9Zu7Yw/exec?mode=getMemberInfo&lineUserId=${storedUserId}`);
   const data = await res.json();

    if (data.status === 'success') {
      isMember = true;
    }

    if (loginBtn) {
        loginBtn.innerHTML = `<span style="color: orange;font-size: 1.2rem">👤</span> ${userName}`;
        loginBtn.disabled = true;
    }

    if (isMember) {
      memberService.style.display = "block";
    } else {
      // Ask to complete registration
      const { value: phoneNumber } = await Swal.fire({
        title: '歡迎加入會員 🎉',
        text: '是否願意提供電話號碼以完成會員註冊？',
        input: 'tel',
        inputLabel: '手機號碼',
        inputPlaceholder: '請輸入您的手機號碼',
        inputAttributes: {
          maxlength: 12,
          autocapitalize: 'off',
          autocorrect: 'off'
        },
        confirmButtonText: '提交',
        showCancelButton: true,
        cancelButtonText: '稍後再說'
      });

      if (phoneNumber) {
        // Send registration request
        await fetch('https://script.google.com/macros/s/AKfycbzZhiPYkL62ZHeRMi1-RCkVQUodJDe6IR7UvNouwM1bkHmepJAfECA4JF1_HHLn9Zu7Yw/exec', {
          method: 'POST',
          mode: "no-cors",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mode: 'registerMember',
            lineUserId: storedUserId,
            lineUserName: userName,
            telephone: phoneNumber
          })
        });

        Swal.fire('完成註冊', '感謝您提供資料！已成功註冊會員。', 'success');
        memberService.style.display = "block";
      }
    }

    console.log("LineId is:", storedUserId, "IsMember:", isMember);

  } catch (err) {
    console.error('Error checking membership:', err);
  }
}
    function showUserDropdown(displayName) {
      document.getElementById('login-link').style.display = 'none';
      document.getElementById('user-name').textContent = displayName || '會員';
      document.getElementById('user-dropdown').style.display = 'block';
    }


    // --- Initialization Function ---
async function init() {
  const urlParams = new URLSearchParams(window.location.search);

  // ── Case A: OAuth “code” return ──
  const code = urlParams.get('code');
  if (code) {
  //  let profile = {};
    try {
      profile = await exchangeCodeForToken(code) || {};
    } catch (e) {
      console.error("LINE exchange failed:", e);
    }
 //   const nameToSave  = profile.displayName || profile.name || "";
 //   const emailToSave = profile.email       || "";
 //   const idToSave    = profile.userId      || profile.id   || "";
 //   console.log("Stored LINE Profile is:", profile);

 //   sessionStorage.setItem('lineUserName',  nameToSave);
 //   sessionStorage.setItem('lineUserEmail', emailToSave);
 //   sessionStorage.setItem('lineUserId',    idToSave);
 //   localStorage.setItem('lineUser', JSON.stringify(profile));
    console.log("lineUserId Check after LINE Login: ", sessionStorage.getItem('lineUserId'));
    // restore cart
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (savedCart.length) {
      cart = savedCart;
      renderSideCart();
    }

    // now render home UI
    await renderMainContent();
    defer(renderDeferredContent);
    switchView('content');

    // clean URL & done
    window.history.replaceState({}, document.title, window.location.pathname);
    console.log("last lineUserId Check: ", sessionStorage.getItem('lineUserId'));
    return;
  }

  // ── Case B: legacy name/email/lineUserId ──
  const name        = urlParams.get('name');
  const email       = urlParams.get('email');
  const legacyId    = urlParams.get('lineUserId');
  if (name && legacyId) {
    sessionStorage.setItem('lineUserName',  name);
    sessionStorage.setItem('lineUserEmail', email || "");
    sessionStorage.setItem('lineUserId',    legacyId);

    const saved = JSON.parse(localStorage.getItem('cart') || '[]');
    if (saved.length) {
      cart = saved;
      renderSideCart();
    }

    await renderMainContent();
    defer(renderDeferredContent);
    switchView('content');

    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }

  // ── Case C: 7-11 store return (unchanged) ──
  const storeID      = urlParams.get('CVSStoreID');
  const storeName    = urlParams.get('CVSStoreName');
  const storeAddress = urlParams.get('CVSAddress');
  if (storeID && storeName && storeAddress) {
    sessionStorage.setItem('selectedStoreInfo', JSON.stringify({
      CVSStoreID:   storeID,
      CVSStoreName: storeName,
      CVSAddress:   storeAddress
    }));
    window.history.replaceState({}, document.title, window.location.pathname);

    const saved = JSON.parse(localStorage.getItem('cart') || '[]');
    if (saved.length) {
      cart = saved;
      await renderCheckoutPage(cart);
      return;
    }
  }

  // ── Normal startup ──
  await renderMainContent();
  defer(renderDeferredContent);
}
async function renderMainContent() {
    try {
        const [bannerData, aboutData, productData] = await Promise.all([
            fetchData('banner.json'),
            fetchData('about.json'),
            fetchData('products_test.json'),
        ]);

        const bannerRendered = renderBanner(bannerData);
        renderAbout(aboutData);
        renderProductGrid(productData);
        allProductsData = productData;

        startSlideshowIfReady(bannerRendered);
    } catch (error) {
        console.error("Error rendering main content:", error);
    }
}

function renderDeferredContent() {
    fetchData('media.json').then(renderMedia);
    loadMembershipData();  // Only needed for checkout or discounts
    renderSideCart();      // UI enhancement only
    setupEventListeners(); // DOM event bindings
}

function startSlideshowIfReady(bannerRendered) {
    if (bannerRendered) {
        startBannerSlideshow();
    }
}

// Utility: Use browser idle time or fallback to timeout
function defer(callback) {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(callback);
    } else {
        setTimeout(callback, 200);
    }
}

    // --- Start the application when DOM is ready ---
    init();
        // Call this after login is confirmed
    const storedUserName = sessionStorage.getItem('lineUserName');
    
    console.log("LINE user name exist!", sessionStorage.getItem('lineUserName'));
    if (storedUserName) updateNavbarWithUserName(storedUserName);

    ECpayStoreDataBackTransfer();

}); // End DOMContentLoaded
