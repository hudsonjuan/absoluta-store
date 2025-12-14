/**
 * Absoluta Store - Main JavaScript
 * 
 * Este arquivo contém a lógica principal do site da Absoluta Store.
 * Foi desenvolvido seguindo boas práticas de JavaScript puro, sem dependências externas.
 */

// Variável global para armazenar os produtos
let allProducts = [];
let currentCategory = 'all';
let currentSearchTerm = '';

// Mapeamento de categorias para URLs
const categoryMap = {
    'skincare': 'skincare',
    'maquiagem': 'maquiagem',
    'cabelos': 'cabelos',
    'acessorios': 'acessorios'
};

// Carrega todos os produtos
async function loadProducts() {
    try {
        const response = await fetch('./data/products.json');
        if (!response.ok) throw new Error('Erro ao carregar produtos');
        allProducts = await response.json();
        return allProducts;
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        showNotification('Não foi possível carregar os produtos');
        return [];
    }
}

// Filtra produtos por categoria e termo de busca
function filterProducts(category = 'all', searchTerm = '') {
    let filtered = [...allProducts];
    
    // Filtra por categoria
    if (category && category !== 'all') {
        filtered = filtered.filter(product => 
            product.category === category || 
            (categoryMap[product.category] === category)
        );
    }
    
    // Filtra por termo de busca
    if (searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(term) ||
            (product.description && product.description.toLowerCase().includes(term))
        );
    }
    
    return filtered;
}

// Atualiza a URL sem recarregar a página
function updateURL(category) {
    let newURL = '#';
    if (category && category !== 'all') {
        newURL = `#${category}`;
    }
    if (currentSearchTerm) {
        newURL += `?search=${encodeURIComponent(currentSearchTerm)}`;
    }
    window.history.pushState({}, '', newURL);
}

// Processa a hash da URL e parâmetros de busca
function processHash() {
    const hash = window.location.hash.substring(1) || 'all';
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search') || '';
    
    // Atualiza o campo de busca
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = searchTerm;
    }
    
    // Atualiza as variáveis globais
    currentCategory = hash;
    currentSearchTerm = searchTerm;
    
    // Atualiza a classe ativa no menu
    document.querySelectorAll('.category-card, .menu-link').forEach(item => {
        const itemCategory = item.dataset.category || 'all';
        const isActive = (hash === 'all' && itemCategory === 'all') || 
                        (hash === itemCategory || hash === categoryMap[itemCategory]);
        
        item.classList.toggle('active', isActive);
        
        // Atualiza o link para incluir o termo de busca
        if (isActive && item.href) {
            const baseUrl = hash === 'all' ? '#' : `#${hash}`;
            item.href = searchTerm ? `${baseUrl}?search=${encodeURIComponent(searchTerm)}` : baseUrl;
        }
    });
    
    // Filtra e renderiza os produtos
    const filteredProducts = filterProducts(hash, searchTerm);
    renderFeaturedProducts(filteredProducts);
    
    // Mostra mensagem se não houver resultados
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) {
        emptyState.style.display = filteredProducts.length ? 'none' : 'block';
    }
}

// Configura os filtros de categoria e pesquisa
async function setupFilters() {
    // Carrega os produtos
    await loadProducts();
    
    // Configura os cliques nas categorias
    document.addEventListener('click', (e) => {
        const categoryCard = e.target.closest('.category-card, .menu-link');
        if (categoryCard) {
            e.preventDefault();
            const category = categoryCard.dataset.category || 'all';
            currentCategory = category;
            updateURL(category);
            processHash();
        }
    });
    
    // Configura a busca em tempo real
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentSearchTerm = e.target.value.trim();
                updateURL(currentCategory);
                processHash();
            }, 300);
        });
        
        // Permite busca ao pressionar Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                currentSearchTerm = e.target.value.trim();
                updateURL(currentCategory);
                processHash();
            }
        });
    }
    
    // Processa a URL inicial
    if (window.location.hash || window.location.search) {
        processHash();
    } else {
        // Se não houver hash ou busca, mostra todos os produtos em destaque
        const featuredProducts = allProducts.filter(p => p.featured);
        renderFeaturedProducts(featuredProducts);
    }
    
    // Atualiza quando a URL mudar
    window.addEventListener('popstate', processHash);
    
    // Adiciona um listener para o evento de carregamento da página
    window.addEventListener('load', () => {
        // Força a atualização da exibição após o carregamento completo
        setTimeout(processHash, 100);
    });
}

// Inicialização quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    setupSmoothScrolling();
    setupAnimations();
    setupCartInteractions();
    setupFilters(); // Substitui o setupCategoryFilters
});

/**
 * Inicializa o menu mobile
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.main-nav');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        });
        
        // Fecha o menu ao clicar em um link
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}

/**
 * Busca os produtos em destaque do arquivo JSON
 */
async function fetchFeaturedProducts() {
    try {
        const response = await fetch('./data/products.json');
        if (!response.ok) {
            throw new Error('Erro ao carregar produtos');
        }
        const products = await response.json();
        const featured = products.filter(product => product.featured === true);
        renderFeaturedProducts(featured);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        const container = document.getElementById('featured-products');
        if (container) {
            container.innerHTML = '<p class="error-message">Não foi possível carregar os produtos. Tente novamente mais tarde.</p>';
        }
    }
}

/**
 * Renderiza os produtos em destaque na página
 * @param {Array} products - Lista de produtos em destaque
 */
function renderFeaturedProducts(products) {
    const container = document.getElementById('featured-products');
    if (!container) return;

    container.innerHTML = '';
    products.forEach((product, index) => {
        const productElement = createProductCard(product, index);
        container.appendChild(productElement);
    });
}

/**
 * Cria o elemento HTML para um produto
 * @param {Object} product - Dados do produto
 * @param {number} index - Índice para animação
 * @returns {HTMLElement} Elemento do produto
 */
function createProductCard(product, index) {
    const productElement = document.createElement('div');
    productElement.className = 'product-card';
    productElement.style.animationDelay = `${index * 0.1}s`;
    
    const formattedPrice = product.price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    
    productElement.innerHTML = `
        <div class="product-image">
            <img src="${product.image || 'assets/images/product-placeholder.png'}" alt="${product.name}">
        </div>
        <div class="product-details">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-category">${formatCategory(product.category)}</p>
            <p class="product-description">${product.description || ''}</p>
            <div class="product-footer">
                <span class="product-price">${formattedPrice}</span>
                <button class="add-to-cart" data-product-id="${product.id}">
                    Adicionar ao Carrinho
                </button>
            </div>
        </div>
    `;
    
    return productElement;
}

/**
 * Formata o nome da categoria para exibição
 * @param {string} category - Slug da categoria
 * @returns {string} Nome formatado da categoria
 */
function formatCategory(category) {
    const categories = {
        'skincare': 'Skincare',
        'maquiagem': 'Maquiagem',
        'cabelos': 'Cabelos',
        'cabelo': 'Cabelos',
        'acessorios': 'Acessórios'
    };
    return categories[category] || category;
}

/**
 * Configura a rolagem suave para links âncora
 */
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#' && document.querySelector(targetId)) {
                e.preventDefault();
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Configura as animações de entrada
 */
function setupAnimations() {
    const animateElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animateElements.forEach(element => observer.observe(element));
}

/**
 * Obtém o carrinho do localStorage
 * @returns {Array} Lista de itens no carrinho
 */
function getCart() {
    const cart = localStorage.getItem('absoluta_cart');
    return cart ? JSON.parse(cart) : [];
}

/**
 * Salva o carrinho no localStorage
 * @param {Array} cart - Lista de itens no carrinho
 */
function saveCart(cart) {
    localStorage.setItem('absoluta_cart', JSON.stringify(cart));
    updateCartCount();
}

/**
 * Adiciona um produto ao carrinho
 * @param {Object} product - Produto a ser adicionado
 */
function addToCart(product) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart(cart);
    showNotification('Produto adicionado ao carrinho');
}

/**
 * Remove um item do carrinho
 * @param {number} productId - ID do produto a ser removido
 */
function removeFromCart(productId) {
    const cart = getCart().filter(item => item.id !== productId);
    saveCart(cart);
    renderCart();
}

/**
 * Calcula o total do carrinho
 * @returns {number} Valor total do carrinho
 */
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Atualiza o contador de itens no carrinho
 */
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update header cart count
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
    
    // Update floating cart button count
    const floatingCartCount = document.querySelector('.floating-cart-count');
    if (floatingCartCount) {
        floatingCartCount.textContent = totalItems;
        floatingCartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

/**
 * Abre o carrinho
 */
function openCart() {
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Processa o checkout redirecionando para o Mercado Pago
 */
async function processCheckout() {
    const cart = getCart();
    
    if (cart.length === 0) {
        showNotification('Adicione itens ao carrinho antes de finalizar');
        return;
    }
    
    // Mostrar loading
    const checkoutBtn = document.querySelector('.checkout-btn');
    const originalBtnText = checkoutBtn ? checkoutBtn.innerHTML : '';
    if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<div class="spinner"></div> Processando...';
    }
    
    try {
        // Formata os itens para o formato esperado pelo Mercado Pago
        const items = cart.map(item => ({
            id: item.id,
            title: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            picture_url: item.image || 'https://via.placeholder.com/150',
            description: `Produto: ${item.name}`,
            category_id: 'beauty'
        }));
        
        // Calcula o total do pedido
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Chama a Netlify Function para criar a preferência de pagamento
        const response = await fetch('/.netlify/functions/create-preference', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items, total })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao processar o pagamento');
        }
        
        const data = await response.json();
        
        // Redireciona para o checkout do Mercado Pago
        window.location.href = data.url;
        
    } catch (error) {
        console.error('Erro no checkout:', error);
        showNotification(`Erro ao processar o pagamento: ${error.message}`);
        
        // Restaura o botão de checkout
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = originalBtnText;
        }
    }
}

/**
 * Exibe uma notificação
 * @param {string} message - Mensagem a ser exibida
 */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Renderiza o carrinho
 */
function renderCart() {
    const cart = getCart();
    const cartContainer = document.querySelector('.cart-container');
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="cart-empty">
                <p>Seu carrinho está vazio</p>
                <a href="#produtos" class="btn">Ver Produtos</a>
            </div>
        `;
        return;
    }
    
    const total = getCartTotal();
    const formattedTotal = total.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    
    cartContainer.innerHTML = `
        <div class="cart-items">
            ${cart.map(item => {
                const itemTotal = (item.price * item.quantity).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                });
                return `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <div class="cart-item-price">
                                ${item.price.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} × 
                                <button class="quantity-btn" data-action="decrease" data-id="${item.id}">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="quantity-btn" data-action="increase" data-id="${item.id}">+</button>
                            </div>
                        </div>
                        <button class="remove-item" data-id="${item.id}">&times;</button>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="cart-total">
            <span>Total:</span>
            <strong>${formattedTotal}</strong>
        </div>
        <button class="btn btn-checkout">Finalizar Compra</button>
    `;
    
    // Adiciona os event listeners para os botões do carrinho
    cartContainer.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(btn.dataset.id);
            removeFromCart(productId);
        });
    });
    
    cartContainer.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = btn.dataset.action;
            const productId = parseInt(btn.dataset.id);
            updateCartItemQuantity(productId, action === 'increase' ? 1 : -1);
        });
    });
    
    // Configura o botão de finalizar compra
    const checkoutBtn = cartContainer.querySelector('.btn-checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', processCheckout);
    }
}

/**
 * Atualiza a quantidade de um item no carrinho
 * @param {number} productId - ID do produto
 * @param {number} change - Quantidade a ser adicionada (pode ser negativa)
 */
function updateCartItemQuantity(productId, change) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart(cart);
            renderCart();
        }
    }
}

/**
 * Configura as interações do carrinho
 */
function setupCartInteractions() {
    // Adicionar ao carrinho
    document.addEventListener('click', (e) => {
        const addToCartBtn = e.target.closest('.add-to-cart');
        if (addToCartBtn) {
            const productCard = addToCartBtn.closest('.product-card');
            if (productCard) {
                const product = {
                    id: parseInt(addToCartBtn.dataset.productId),
                    name: productCard.querySelector('.product-title')?.textContent || 'Produto',
                    price: parseFloat(
                        productCard.querySelector('.product-price')?.textContent
                            .replace(/[^0-9,]/g, '')
                            .replace(',', '.') || 0
                    ),
                    image: productCard.querySelector('.product-image img')?.src || ''
                };
                addToCart(product);
            }
        }
        
        // Abrir/fechar carrinho
        const cartIcon = e.target.closest('.cart-icon, .cart-icon *');
        if (cartIcon) {
            e.preventDefault();
            const isOpening = !document.body.classList.contains('cart-open');
            document.body.classList.toggle('cart-open');
            if (isOpening) {
                renderCart();
            }
        }
        
        // Fechar carrinho ao clicar fora
        if (e.target.classList.contains('cart-overlay')) {
            document.body.classList.remove('cart-open');
        }
    });
    
    // Fechar carrinho ao clicar no botão de fechar
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('close-cart')) {
            document.body.classList.remove('cart-open');
        }
    });
    
    // Configurar botão de finalizar compra
    document.addEventListener('click', (e) => {
        // Botão flutuante do carrinho (mobile)
        const floatingCartBtn = e.target.closest('.floating-cart-btn, .floating-cart-btn *');
        if (floatingCartBtn) {
            e.preventDefault();
            document.querySelector('.cart-icon')?.click();
            return;
        }
        
        const checkoutBtn = e.target.closest('.btn-checkout');
        if (checkoutBtn) {
            e.preventDefault();
            processCheckout();
        }
    });
    
    // Inicializar contador do carrinho
    updateCartCount();
}
