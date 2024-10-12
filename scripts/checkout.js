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

let isDeliveryFeeApplied = false;

function toggleShippingAddress() {
    const fees = 80;
    const shippingMethod = document.querySelector('input[name="shippingMethod"]:checked').value;
    const shippingAddressFieldset = document.getElementById('shipping-address-fieldset');
    
    const addressField = document.getElementById('address');
    const city = document.getElementById('city');
    const building = document.getElementById('building');
    const floor = document.getElementById('floor');
    const post = document.getElementById('post');
    const aprt = document.getElementById('aprt');
    
    const cartSubtotalElement = document.getElementById('cart-subtotal');
    const subtotalValueElement = document.getElementById('subtotal');
    const deliveryFeeElement = document.getElementById('delivery-fee');
    let originalSubtotal = parseFloat(subtotalValueElement.value);
    
    if (shippingMethod === 'delivery') {
        shippingAddressFieldset.style.display = 'block';
        addressField.setAttribute('required', '');
        city.setAttribute('required', '');
        building.setAttribute('required', '');
        floor.setAttribute('required', '');
        post.setAttribute('required', '');
        aprt.setAttribute('required', '');

        if (!isDeliveryFeeApplied) {
            const newTotal = originalSubtotal + fees;
            cartSubtotalElement.textContent = newTotal;
            subtotalValueElement.value = newTotal;
            deliveryFeeElement.textContent = "Delivery Fee: 80 LE";
            isDeliveryFeeApplied = true;
        }
    } else {
        shippingAddressFieldset.style.display = 'none';
        addressField.removeAttribute('required');
        city.removeAttribute('required');
        building.removeAttribute('required');
        floor.removeAttribute('required');
        post.removeAttribute('required');
        aprt.removeAttribute('required');

        if (isDeliveryFeeApplied) {
            const newTotal = originalSubtotal - fees;
            cartSubtotalElement.textContent = newTotal;
            subtotalValueElement.value = newTotal;
            deliveryFeeElement.textContent = "Delivery Fee: 0 LE";
            isDeliveryFeeApplied = false;
        }
    }
}

document.querySelectorAll('input[name="shippingMethod"]').forEach(function(input) {
    input.addEventListener('change', toggleShippingAddress);
});

window.addEventListener('load', toggleShippingAddress);


var shippingMethodInputs = document.querySelectorAll('input[name="shippingMethod"]');
shippingMethodInputs.forEach(function(input) {
    input.addEventListener('change', toggleShippingAddress);
});

toggleShippingAddress();

function toggleMenu() {
    var dropdownMenu = document.getElementById("dropdown-menu");
    if (dropdownMenu.style.display === "flex") {
        dropdownMenu.style.display = "none";
    } else {
        dropdownMenu.style.display = "flex";
    }
}

document.getElementById('paymob-button').addEventListener('click', function() {
    fetch('/paymob-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: document.getElementById('subtotal').value,
        })
    })
    .then(response => response.json())
    .then(data => {
        window.location.href = data.payment_url;
    })
    .catch(error => {
        console.error('Error:', error);
    });
});