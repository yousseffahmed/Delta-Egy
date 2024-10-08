const item_picture = document.querySelector('.layers-transition')
function onClickIcon() {
    if (item_picture.classList.value === "layers-transition") {
        item_picture.classList.add('active')
    } else {
        item_picture.classList.remove('active')
    }

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

function toggleMenu() {
        var dropdownMenu = document.getElementById("dropdown-menu");
        if (dropdownMenu.style.display === "flex") {
            dropdownMenu.style.display = "none";
        } else {
            dropdownMenu.style.display = "flex";
        }
    }