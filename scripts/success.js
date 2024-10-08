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

const urlParams = new URLSearchParams(window.location.search);
const orderNumber = urlParams.get('orderNumber');

document.getElementById('orderNumber').textContent = orderNumber;

function toggleMenu() {
    var dropdownMenu = document.getElementById("dropdown-menu");
    if (dropdownMenu.style.display === "flex") {
        dropdownMenu.style.display = "none";
    } else {
        dropdownMenu.style.display = "flex";
    }
}