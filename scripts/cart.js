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

document.getElementById('checkout').addEventListener('click', function() {
    var subtotal = document.getElementById('subtotal').value;
    fetch('/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ total: subtotal }),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Network response was not ok.');
    })
    .then(data => {
        window.location.href = '/checkout';
    })
    .catch(error => {
        console.error('Error updating total:', error);
    });
});

document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', function() {
        const itemId = this.getAttribute('data-item-id');

        fetch(`/cart/remove/${itemId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                window.location.reload();
            } else {
                throw new Error('Failed to remove item from cart');
            }
        })
        .catch(error => {
            console.error('Error removing item from cart:', error);
        });
    });
});

function toggleMenu() {
    var dropdownMenu = document.getElementById("dropdown-menu");
    if (dropdownMenu.style.display === "flex") {
        dropdownMenu.style.display = "none";
    } else {
        dropdownMenu.style.display = "flex";
    }
}

document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', function () {
        const itemId = this.dataset.itemId;
        const newQuantity = parseInt(this.value, 10);

        if (newQuantity === 0) {
            removeItemFromCart(itemId);
        } else {
            updateCartQuantity(itemId, newQuantity);
        }
    });
});

function updateCartQuantity(itemId, newQuantity) {
    fetch(`/cart/update/${itemId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            quantity: newQuantity
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('cart-subtotal').textContent = data.newSubtotal;
            updateCartCount();
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function removeItemFromCart(itemId) {
    fetch(`/cart/remove/${itemId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            window.location.reload();
        } else {
            throw new Error('Failed to remove item from cart');
        }
    })
    .catch(error => {
        console.error('Error removing item from cart:', error);
    });
}

function validateQuantity(input) {
    // Remove any non-numeric characters (except .)
    input.value = input.value.replace(/[^0-9]/g, '');

    // Ensure the value is not less than 1
    if (input.value < 1 || input.value === "") {
        input.value = 1;
    }
}
