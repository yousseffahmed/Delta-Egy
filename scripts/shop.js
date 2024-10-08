const currentImageIndex = {};

function prevImage(productId) {
    const images = JSON.parse(document.getElementById(`image-${productId}`).dataset.images);
    if (!currentImageIndex[productId]) {
        currentImageIndex[productId] = 0;
    }
    currentImageIndex[productId] = (currentImageIndex[productId] - 1 + images.length) % images.length;
    document.getElementById(`image-${productId}`).src = images[currentImageIndex[productId]];
}

function nextImage(productId) {
    const images = JSON.parse(document.getElementById(`image-${productId}`).dataset.images);
    if (!currentImageIndex[productId]) {
        currentImageIndex[productId] = 0;
    }
    currentImageIndex[productId] = (currentImageIndex[productId] + 1) % images.length;
    document.getElementById(`image-${productId}`).src = images[currentImageIndex[productId]];
}

function updateCartCount() {
    fetch('/cart/count')
        .then(response => response.json())
        .then(data => {
            document.getElementById('cart-count').textContent = data.count;
            document.getElementById('cart-count-mobile').textContent = data.count;
        })
        .catch(error => console.error('Error updating cart count:', error));
}

window.addEventListener('load', updateCartCount);

function updatePrice(productId, unitPrice) {
    const quantity = document.getElementById(`quantity-${productId}`).value;
    const newPrice = (unitPrice * quantity).toFixed(2);
    document.getElementById(`price-${productId}`).textContent = `${newPrice}`;
}

function addToCart(productId) {
    const quantity = document.getElementById(`quantity-${productId}`).value;
    const color = document.getElementById(`color-${productId}`).value;
    
    fetch('/cart/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, quantity, color })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Product added to cart') {
            const popup = document.getElementById('popup');
            popup.style.display = 'block';

            updateCartCount();
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error adding product to cart:', error));
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

function toggleMenu() {
    var dropdownMenu = document.getElementById("dropdown-menu");
    if (dropdownMenu.style.display === "flex") {
        dropdownMenu.style.display = "none";
    } else {
        dropdownMenu.style.display = "flex";
    }
}

function handleSearch() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const products = document.querySelectorAll('.product');

    products.forEach(product => {
        const productName = product.querySelector('h2').textContent.toLowerCase();
        if (productName.includes(query)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

function sortProducts() {
    const sortBy = document.getElementById('sort').value;
    let products = Array.from(document.querySelectorAll('.product'));
    
    products.sort((a, b) => {
        let nameA = a.querySelector('h2').textContent.toUpperCase();
        let nameB = b.querySelector('h2').textContent.toUpperCase();
        let priceA = parseFloat(a.querySelector('.price').textContent);
        let priceB = parseFloat(b.querySelector('.price').textContent);
        
        if (sortBy === 'name-asc') {
            return nameA > nameB ? 1 : -1;
        } else if (sortBy === 'price-low-high') {
            return priceA - priceB;
        } else if (sortBy === 'price-high-low') {
            return priceB - priceA;
        }
    });

    const productContainer = document.querySelector('.products');
    productContainer.innerHTML = '';
    products.forEach(product => productContainer.appendChild(product));
}
