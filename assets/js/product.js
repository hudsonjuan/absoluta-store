/**
 * Product Page JavaScript
 * Handles the product detail page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    // DOM Elements
    const mainImage = document.getElementById('mainProductImage');
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    const productTitle = document.getElementById('productTitle');
    const productSku = document.getElementById('productSku');
    const productPrice = document.getElementById('productPrice');
    const productInstallments = document.getElementById('productInstallments');
    const productShortDescription = document.getElementById('productShortDescription');
    const productLongDescription = document.getElementById('productLongDescription');
    const productIngredients = document.getElementById('productIngredients');
    const productHowToUse = document.getElementById('productHowToUse');
    const productBenefits = document.getElementById('productBenefits');
    const colorVariants = document.getElementById('colorVariants');
    const categoryBreadcrumb = document.getElementById('categoryBreadcrumb');
    const productBreadcrumb = document.getElementById('productBreadcrumb');
    const relatedProductsContainer = document.getElementById('relatedProducts');
    const addToCartBtn = document.getElementById('addToCartBtn');
    const buyNowBtn = document.getElementById('buyNowBtn');
    const productRating = document.getElementById('productRating');
    const averageRating = document.getElementById('averageRating');
    const totalReviews = document.getElementById('totalReviews');
    const reviewsList = document.getElementById('reviewsList');
    
    // Product data
    let product = null;
    let allProducts = [];
    let selectedColor = null;
    
    // Initialize the page
    async function init() {
        await loadProducts();
        if (productId) {
            displayProduct();
            loadRelatedProducts();
            setupEventListeners();
        } else {
            showError('Produto não encontrado');
        }
    }
    
    // Load products from JSON
    async function loadProducts() {
        try {
            const response = await fetch('data/products.json');
            if (!response.ok) throw new Error('Erro ao carregar produtos');
            allProducts = await response.json();
            product = allProducts.find(p => p.id === productId);
            
            if (!product) {
                showError('Produto não encontrado');
                return;
            }
            
            // Set default values if not exists
            if (!product.images) {
                product.images = [product.image || 'assets/images/product-placeholder.png'];
            }
            
            if (!product.longDescription) {
                product.longDescription = product.description || 'Descrição detalhada não disponível.';
            }
            
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            showNotification('Não foi possível carregar os detalhes do produto');
        }
    }
    
    // Display product details
    function displayProduct() {
        if (!product) return;
        
        // Set product images
        if (product.images && product.images.length > 0) {
            mainImage.src = product.images[0];
            mainImage.alt = product.name;
            
            // Create thumbnails
            thumbnailContainer.innerHTML = '';
            product.images.forEach((image, index) => {
                const thumbnail = document.createElement('div');
                thumbnail.className = 'thumbnail-item' + (index === 0 ? ' active' : '');
                thumbnail.innerHTML = `<img src="${image}" alt="${product.name} - Imagem ${index + 1}">`;
                thumbnail.addEventListener('click', () => changeMainImage(image, thumbnail));
                thumbnailContainer.appendChild(thumbnail);
            });
        }
        
        // Set product info
        document.title = `${product.name} - Absoluta Store`;
        productTitle.textContent = product.name;
        productSku.textContent = `ABS-${product.id.toString().padStart(4, '0')}`;
        
        // Format and set price
        const formattedPrice = product.price.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        productPrice.textContent = formattedPrice;
        
        // Calculate and set installments
        const installments = Math.floor(product.price / 12);
        const formattedInstallment = installments.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        productInstallments.textContent = `ou 12x de ${formattedInstallment} sem juros`;
        
        // Set descriptions
        productShortDescription.textContent = product.description || '';
        productLongDescription.textContent = product.longDescription || product.description || '';
        
        // Set ingredients or show message if not available
        if (product.ingredients) {
            productIngredients.textContent = product.ingredients;
        } else {
            productIngredients.textContent = 'Informações sobre ingredientes não disponíveis.';
        }
        
        // Set how to use or show message if not available
        if (product.howToUse) {
            productHowToUse.textContent = product.howToUse;
        } else {
            productHowToUse.textContent = 'Instruções de uso não disponíveis.';
        }
        
        // Set benefits if available
        if (product.benefits && product.benefits.length > 0) {
            productBenefits.innerHTML = '<h4>Benefícios:</h4><ul>' + 
                product.benefits.map(benefit => `<li>${benefit}</li>`).join('') + 
                '</ul>';
        } else {
            productBenefits.innerHTML = '';
        }
        
        // Set color variants if available
        if (product.colors && product.colors.length > 0) {
            colorVariants.innerHTML = `
                <div class="variant-title">Cor: <span id="selectedColor">${product.colors[0]}</span></div>
                <div class="color-swatches">
                    ${product.colors.map((color, index) => `
                        <div class="color-swatch ${index === 0 ? 'active' : ''}" 
                             style="background-color: ${getColorCode(color)}" 
                             data-color="${color}" 
                             title="${color}">
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Set initial selected color
            selectedColor = product.colors[0];
            
            // Add event listeners to color swatches
            document.querySelectorAll('.color-swatch').forEach(swatch => {
                swatch.addEventListener('click', function() {
                    // Remove active class from all swatches
                    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                    // Add active class to clicked swatch
                    this.classList.add('active');
                    // Update selected color
                    selectedColor = this.dataset.color;
                    document.getElementById('selectedColor').textContent = selectedColor;
                });
            });
        } else {
            colorVariants.innerHTML = '';
        }
        
        // Set breadcrumbs
        if (product.category) {
            const categoryName = formatCategory(product.category);
            categoryBreadcrumb.textContent = categoryName;
            categoryBreadcrumb.href = `index.html?category=${product.category}`;
        }
        productBreadcrumb.textContent = product.name;
        
        // Set rating if available
        if (product.rating) {
            productRating.textContent = product.rating.toFixed(1);
            averageRating.textContent = product.rating.toFixed(1);
            
            // Set star rating (assuming 5 is max)
            const stars = Math.round(product.rating);
            // This would be more dynamic with actual reviews
            totalReviews.textContent = 'Baseado em avaliações reais';
            
            // Generate mock reviews for demo
            generateMockReviews();
        }
    }
    
    // Change main product image when thumbnail is clicked
    function changeMainImage(src, clickedThumbnail) {
        mainImage.style.opacity = 0;
        
        // Remove active class from all thumbnails
        document.querySelectorAll('.thumbnail-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked thumbnail
        clickedThumbnail.classList.add('active');
        
        // Change image with fade effect
        setTimeout(() => {
            mainImage.src = src;
            mainImage.style.opacity = 1;
        }, 150);
    }
    
    // Load related products
    function loadRelatedProducts() {
        if (!product || !relatedProductsContainer) return;
        
        // Get 4 random products from the same category (excluding current product)
        const related = allProducts
            .filter(p => p.id !== product.id && p.category === product.category)
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);
        
        if (related.length === 0) {
            relatedProductsContainer.innerHTML = '<p>Nenhum produto relacionado encontrado.</p>';
            return;
        }
        
        // Create product cards
        relatedProductsContainer.innerHTML = related.map(p => createProductCard(p)).join('');
        
        // Add event listeners to related products
        document.querySelectorAll('.related-product').forEach(card => {
            card.addEventListener('click', function(e) {
                // Don't navigate if clicking on add to cart button
                if (e.target.closest('.add-to-cart')) {
                    e.preventDefault();
                    e.stopPropagation();
                    const productId = parseInt(this.dataset.productId);
                    addToCart(productId, 1);
                    return;
                }
                
                // Navigate to product page
                window.location.href = `produto.html?id=${this.dataset.productId}`;
            });
        });
    }
    
    // Create a product card for related products
    function createProductCard(product) {
        const formattedPrice = product.price.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        
        return `
            <div class="product-card related-product" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.images ? product.images[0] : product.image || 'assets/images/product-placeholder.png'}" 
                         alt="${product.name}">
                    ${product.rating ? `
                        <div class="product-badge">
                            <span class="rating">
                                <i class="fas fa-star"></i> ${product.rating.toFixed(1)}
                            </span>
                        </div>
                    ` : ''}
                </div>
                <div class="product-details">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-category">${formatCategory(product.category)}</p>
                    <div class="product-footer">
                        <span class="product-price">${formattedPrice}</span>
                        <button class="add-to-cart" data-product-id="${product.id}">
                            Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Format category name
    function formatCategory(category) {
        if (!category) return '';
        return category
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    // Get color code for swatches
    function getColorCode(colorName) {
        const colors = {
            'preto': '#000000',
            'branco': '#ffffff',
            'vermelho': '#ff0000',
            'azul': '#0000ff',
            'verde': '#008000',
            'amarelo': '#ffff00',
            'roxo': '#800080',
            'rosa': '#ff69b4',
            'laranja': '#ffa500',
            'marrom': '#8b4513',
            'cinza': '#808080',
            'dourado': '#ffd700',
            'prata': '#c0c0c0',
            'bege': '#f5f5dc',
            'transparente': 'rgba(255, 255, 255, 0.5)'
        };
        
        // Try to find a matching color (case insensitive)
        const lowerColor = colorName.toLowerCase();
        return colors[lowerColor] || '#cccccc';
    }
    
    // Generate mock reviews for demo
    function generateMockReviews() {
        if (!reviewsList) return;
        
        // This would normally come from an API
        const mockReviews = [
            {
                id: 1,
                author: 'Ana Silva',
                rating: product.rating,
                date: '15/05/2024',
                text: 'Produto excelente! Superou minhas expectativas. A entrega foi rápida e o produto é de ótima qualidade.'
            },
            {
                id: 2,
                author: 'Carlos Oliveira',
                rating: Math.min(5, product.rating + 0.5),
                date: '10/05/2024',
                text: 'Muito bom! Estou satisfeito com a compra. Recomendo a todos que buscam qualidade.'
            },
            {
                id: 3,
                author: 'Mariana Santos',
                rating: Math.max(1, product.rating - 0.5),
                date: '05/05/2024',
                text: 'Bom produto, mas acho que poderia ter um melhor custo-benefício.'
            }
        ];
        
        // Clear existing reviews
        reviewsList.innerHTML = '';
        
        if (mockReviews.length === 0) {
            reviewsList.innerHTML = '<p class="no-reviews">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>';
            return;
        }
        
        // Add reviews to the list
        mockReviews.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.className = 'review-item';
            
            // Create star rating
            const stars = '★'.repeat(Math.floor(review.rating)) + '☆'.repeat(5 - Math.floor(review.rating));
            
            reviewElement.innerHTML = `
                <div class="review-header">
                    <span class="review-author">${review.author}</span>
                    <span class="review-date">${review.date}</span>
                </div>
                <div class="review-rating" title="${review.rating} estrelas">
                    ${stars}
                </div>
                <div class="review-text">
                    ${review.text}
                </div>
            `;
            
            reviewsList.appendChild(reviewElement);
        });
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Quantity controls
        document.getElementById('decreaseQty').addEventListener('click', () => {
            const qtyInput = document.getElementById('productQty');
            let qty = parseInt(qtyInput.value) || 1;
            if (qty > 1) {
                qtyInput.value = qty - 1;
            }
        });
        
        document.getElementById('increaseQty').addEventListener('click', () => {
            const qtyInput = document.getElementById('productQty');
            let qty = parseInt(qtyInput.value) || 1;
            if (qty < 99) {
                qtyInput.value = qty + 1;
            }
        });
        
        // Add to cart
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                const qty = parseInt(document.getElementById('productQty').value) || 1;
                addToCart(product.id, qty);
            });
        }
        
        // Buy now
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', () => {
                const qty = parseInt(document.getElementById('productQty').value) || 1;
                addToCart(product.id, qty, true);
            });
        }
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                
                // Update active tab button
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Show corresponding tab content
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                });
                document.getElementById(`${tabId}Tab`).classList.add('active');
            });
        });
        
        // Social sharing
        document.querySelectorAll('.social-share').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const network = this.dataset.network;
                shareProduct(network);
            });
        });
        
        // Write review button
        const writeReviewBtn = document.getElementById('writeReviewBtn');
        if (writeReviewBtn) {
            writeReviewBtn.addEventListener('click', () => {
                // In a real app, this would open a review form
                showNotification('Faça login para escrever uma avaliação');
            });
        }
    }
    
    // Add product to cart
    function addToCart(productId, quantity = 1, redirectToCheckout = false) {
        // This would normally be handled by the cart system in main.js
        // For now, we'll just show a notification
        const productToAdd = allProducts.find(p => p.id === productId);
        if (productToAdd) {
            // Get existing cart from localStorage or create new one
            let cart = JSON.parse(localStorage.getItem('absoluta-cart')) || [];
            
            // Check if product is already in cart
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                // Update quantity if product already in cart
                existingItem.quantity += quantity;
            } else {
                // Add new item to cart
                cart.push({
                    id: productToAdd.id,
                    name: productToAdd.name,
                    price: productToAdd.price,
                    image: productToAdd.images ? productToAdd.images[0] : productToAdd.image,
                    quantity: quantity,
                    color: selectedColor || null
                });
            }
            
            // Save cart to localStorage
            localStorage.setItem('absoluta-cart', JSON.stringify(cart));
            
            // Update cart count
            updateCartCount();
            
            // Show success message
            showNotification(`${quantity}x ${productToAdd.name} adicionado${quantity > 1 ? 's' : ''} ao carrinho`);
            
            // Redirect to checkout if buy now was clicked
            if (redirectToCheckout) {
                // This would normally go to checkout
                showNotification('Redirecionando para o checkout...');
                // window.location.href = 'checkout.html';
            }
        }
    }
    
    // Update cart count in header
    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (!cartCount) return;
        
        const cart = JSON.parse(localStorage.getItem('absoluta-cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    // Share product on social media
    function shareProduct(network) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(product.name);
        const text = encodeURIComponent(`Confira ${product.name} na Absoluta Store!`);
        
        let shareUrl = '';
        
        switch (network) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
                break;
            case 'pinterest':
                const imageUrl = encodeURIComponent(product.images ? product.images[0] : product.image);
                shareUrl = `https://pinterest.com/pin/create/button/?url=${url}&media=${imageUrl}&description=${text}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${text}%20${url}`;
                break;
            default:
                return;
        }
        
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    // Show notification
    function showNotification(message, type = 'success') {
        // This would normally show a nice toast notification
        alert(message);
    }
    
    // Show error message
    function showError(message) {
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 50px 20px;">
                    <h2>${message}</h2>
                    <p>Desculpe, não foi possível carregar o produto solicitado.</p>
                    <a href="index.html" class="btn" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #333; color: white; text-decoration: none; border-radius: 4px;">
                        Voltar para a loja
                    </a>
                </div>
            `;
        } else {
            document.body.innerHTML = `
                <div style="text-align: center; padding: 50px 20px;">
                    <h2>${message}</h2>
                    <p>Desculpe, não foi possível carregar o produto solicitado.</p>
                    <a href="index.html" style="color: #333; text-decoration: underline;">Voltar para a loja</a>
                </div>
            `;
        }
    }
    
    // Initialize the page
    init();
});
