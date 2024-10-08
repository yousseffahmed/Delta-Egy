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

const item_picture = document.querySelector('.layers-transition');
const icon = document.querySelector('.icon');

function onClickIcon() {
    if (item_picture.classList.contains('active')) {
        item_picture.classList.remove('active');
        icon.style.display = 'block';
    } else {
        item_picture.classList.add('active');
        icon.style.display = 'none';
    }
}

function toggleMenu() {
    var dropdownMenu = document.getElementById("dropdown-menu");
    if (dropdownMenu.style.display === "flex") {
        dropdownMenu.style.display = "none";
    } else {
        dropdownMenu.style.display = "flex";
    }
}