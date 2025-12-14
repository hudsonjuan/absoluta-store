/**
 * Absoluta Store - Main JavaScript
 * 
 * Este arquivo contém a lógica principal do site da Absoluta Store.
 * Foi desenvolvido seguindo boas práticas de JavaScript puro, sem dependências externas.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicialização dos componentes
    initMobileMenu();
    loadFeaturedProducts();
    setupSmoothScrolling();
    setupAnimations();
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
            
            // Impede o scroll do body quando o menu está aberto
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
 * Carrega os produtos em destaque
 */
function loadFeaturedProducts() {
    const productsContainer = document.getElementById('featured-products');
    
    if (!productsContainer) return;
    
    // Dados mockados dos produtos (será substituído por uma chamada à API no futuro)
    const featuredProducts = [
        {
            id: 1,
            name: 'Creme Facial Hidratante',
            category: 'skincare',
            price: 89.90,
            image: 'https://via.placeholder.com/300x300/f3e5f5/8a4fff?text=Creme+Facial',
            rating: 4.8,
            badge: 'Mais Vendido'
        },
        {
            id: 2,
            name: 'Paleta de Sombras',
            category: 'maquiagem',
            price: 129.90,
            image: 'https://via.placeholder.com/300x300/f3e5f5/8a4fff?text=Paleta+Sombras',
            rating: 4.9,
            badge: 'Novidade'
        },
        {
            id: 3,
            name: 'Shampoo Revitalizante',
            category: 'cabelos',
            price: 59.90,
            image: 'https://via.placeholder.com/300x300/f3e5f5/8a4fff?text=Shampoo',
            rating: 4.7
        },
        {
            id: 4,
            name: 'Kit Pincéis Profissionais',
            category: 'acessorios',
            price: 149.90,
            image: 'https://via.placeholder.com/300x300/f3e5f5/8a4fff?text=Kit+Pinceis',
            rating: 4.9,
            badge: 'Oferta'
        }
    ];
    
    // Limpa o conteúdo atual
    productsContainer.innerHTML = '';
    
    // Adiciona cada produto ao DOM
    featuredProducts.forEach((product, index) => {
        const productElement = createProductElement(product, index);
        productsContainer.appendChild(productElement);
    });
    
    // Inicializa os tooltips dos botões (será implementado posteriormente)
    initProductTooltips();
}

/**
 * Cria o elemento HTML para um produto
 * @param {Object} product - Dados do produto
 * @param {number} index - Índice do produto para animação
 * @returns {HTMLElement} Elemento do produto
 */
function createProductElement(product, index) {
    const productElement = document.createElement('div');
    productElement.className = 'product-card fade-in';
    productElement.style.animationDelay = `${index * 0.1}s`;
    productElement.setAttribute('data-category', product.category);
    
    // Formata o preço para o formato brasileiro
    const formattedPrice = product.price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    
    // Cria o HTML do produto
    productElement.innerHTML = `
        <div class="product-image" style="background-image: url('${product.image}')">
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
        </div>
        <div class="product-info">
            <span class="product-category">${formatCategory(product.category)}</span>
            <h3 class="product-title">${product.name}</h3>
            <div class="product-rating">
                ${createStarRating(product.rating)}
                <span>(${product.rating})</span>
            </div>
            <div class="product-price">${formattedPrice}</div>
            <button class="add-to-cart" data-product-id="${product.id}" aria-label="Adicionar ao carrinho">
                <span>Adicionar ao Carrinho</span>
            </button>
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
        'acessorios': 'Acessórios'
    };
    
    return categories[category] || category;
}

/**
 * Cria a avaliação em estrelas
 * @param {number} rating - Avaliação de 0 a 5
 * @returns {string} HTML das estrelas
 */
function createStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Estrelas cheias
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '★';
    }
    
    // Meia estrela
    if (hasHalfStar) {
        starsHTML += '½';
    }
    
    // Estrelas vazias
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '☆';
    }
    
    return starsHTML;
}

/**
 * Configura a rolagem suave para links âncora
 */
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Verifica se é um link âncora
            if (targetId !== '#' && document.querySelector(targetId)) {
                e.preventDefault();
                
                const targetElement = document.querySelector(targetId);
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Configura as animações de entrada dos elementos
 */
function setupAnimations() {
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.fade-in:not(.animated)');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('animated');
            }
        });
    };
    
    // Executa uma vez ao carregar a página
    animateOnScroll();
    
    // Executa ao rolar a página
    window.addEventListener('scroll', animateOnScroll);
}

/**
 * Inicializa os tooltips dos botões (será implementado posteriormente)
 */
function initProductTooltips() {
    // Implementação futura de tooltips para os botões
}

/**
 * Função para adicionar um produto ao carrinho (será implementada posteriormente)
 * @param {number} productId - ID do produto
 */
function addToCart(productId) {
    // Implementação futura do carrinho
    console.log(`Produto adicionado ao carrinho: ${productId}`);
    
    // Atualiza o contador do carrinho
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        let count = parseInt(cartCount.textContent) || 0;
        cartCount.textContent = count + 1;
        cartCount.classList.add('pulse');
        
        // Remove a classe de animação após a conclusão
        setTimeout(() => {
            cartCount.classList.remove('pulse');
        }, 300);
    }
}

// Adiciona o event listener para os botões de adicionar ao carrinho
document.addEventListener('click', function(e) {
    const addToCartBtn = e.target.closest('.add-to-cart');
    
    if (addToCartBtn) {
        e.preventDefault();
        const productId = addToCartBtn.getAttribute('data-product-id');
        if (productId) {
            addToCart(parseInt(productId));
            
            // Feedback visual
            addToCartBtn.textContent = 'Adicionado!';
            addToCartBtn.style.backgroundColor = '#4CAF50';
            
            // Reseta o botão após 1.5 segundos
            setTimeout(() => {
                addToCartBtn.innerHTML = '<span>Adicionar ao Carrinho</span>';
                addToCartBtn.style.backgroundColor = '';
            }, 1500);
        }
    }
});

// Adiciona suporte para o Intersection Observer para melhor desempenho nas animações
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('.fade-in').forEach(element => {
        observer.observe(element);
    });
}

// Exporta funções para uso global (se necessário)
window.AbsolutaStore = {
    addToCart,
    loadFeaturedProducts
};
