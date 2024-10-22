document.getElementById("switch_toggle").addEventListener("change", function() {
    var lightImage = document.getElementById("light_image");
    if (this.checked) {
       lightImage.src = "images/on.jpeg";
    } else {
       lightImage.src = "images/off.jpeg";
    }
});

const photoUploadInputKC = document.getElementById("photo-upload-KC");
const addToCartButtonKC = document.getElementById("add-to-cart-btn-KC");

photoUploadInputKC.addEventListener("change", function() {
    if (this.files && this.files[0]) {
        addToCartButtonKC.style.display = "block";
    } else {
        addToCartButtonKC.style.display = "none";
    }
});

const photoUploadInputFLAT = document.getElementById("photo-upload-FLAT");
const addToCartButtonFLAT = document.getElementById("add-to-cart-btn-FLAT");

photoUploadInputFLAT.addEventListener("change", function() {
    if (this.files && this.files[0]) {
        addToCartButtonFLAT.style.display = "block";
    } else {
        addToCartButtonFLAT.style.display = "none";
    }
});

const photoUploadInputCurved = document.getElementById("photo-upload-curved");
const addToCartButtonCurved = document.getElementById("add-to-cart-btn-curved");

photoUploadInputCurved.addEventListener("change", function() {
    if (this.files && this.files[0]) {
        addToCartButtonCurved.style.display = "block";
    } else {
        addToCartButtonCurved.style.display = "none";
    }
});

const sizeRadioButtons = document.getElementsByName("size-flat");
const includeRadioButtons = document.getElementsByName("stand-flat");
const priceLabelFLAT = document.querySelector("#priceFlat");
const quantitySelectFlat = document.getElementById("quantityFlat");

function updatePriceFlat() {
    let basePrice = 0;

    if (sizeRadioButtons[0].checked) {
        basePrice = 250; // Small
    } else if (sizeRadioButtons[1].checked) {
        basePrice = 400; // Medium
    } else if (sizeRadioButtons[2].checked) {
        basePrice = 650; // Large
    }

    if (includeRadioButtons[0].checked && sizeRadioButtons[0].checked) {
        basePrice += 20; // Additional price for stand
    } else if (includeRadioButtons[0].checked && sizeRadioButtons[1].checked){
        basePrice += 30; // Additional price for stand
    } else if (includeRadioButtons[0].checked && sizeRadioButtons[2].checked){
        basePrice += 50; // Additional price for stand
    }

    const quantity = parseInt(quantitySelectFlat.value);
    const totalPrice = basePrice * quantity;

    priceLabelFLAT.textContent = "Price: " + totalPrice;
}

sizeRadioButtons.forEach(function(radioButton) {
    radioButton.addEventListener("change", updatePriceFlat);
});

includeRadioButtons.forEach(function(radioButton) {
    radioButton.addEventListener("change", updatePriceFlat);
});

quantitySelectFlat.addEventListener("change", updatePriceFlat);

const sizeRadioButtonsCurved = document.getElementsByName("size-curved");
const priceLabelCurved = document.querySelector("#priceCurved");
const quantitySelectCurved = document.getElementById("quantityCurved");

function updatePriceCurved() {
    let basePrice = 0;

    if (sizeRadioButtonsCurved[0].checked) {
        basePrice = 300; // Small
    } else if (sizeRadioButtonsCurved[1].checked) {
        basePrice = 450; // Medium
    } else if (sizeRadioButtonsCurved[2].checked) {
        basePrice = 700; // Large
    }

    const quantity = parseInt(quantitySelectCurved.value);
    const totalPrice = basePrice * quantity;

    priceLabelCurved.textContent = "Price: " + totalPrice;
}

sizeRadioButtonsCurved.forEach(function(radioButton) {
    radioButton.addEventListener("change", updatePriceCurved);
});

quantitySelectCurved.addEventListener("change", updatePriceCurved);

const quantitySelectKC = document.getElementById("quantityKC");
const priceLabelKC = document.querySelector("#priceKC");

function updatePriceKC() {
    let basePrice = 80;

    const quantity = parseInt(quantitySelectKC.value);
    const totalPrice = basePrice * quantity;

    priceLabelKC.textContent = "Price: " + totalPrice;
}

quantitySelectKC.addEventListener("change", updatePriceKC);

updatePriceFlat();
updatePriceKC();
updatePriceCurved();

function addToCartFlat() {
    const uploadedImage = document.getElementById('photo-upload-FLAT').files[0];
    const name = "Flat Frame";
    const size = document.querySelector('input[name="size-flat"]:checked').value;
    const includeStand = document.querySelector('input[name="stand-flat"]:checked').value;
    const quantity = parseInt(document.getElementById('quantityFlat').value, 10);
    let price = document.getElementById('priceFlat').textContent.split(":")[1].trim();

    price = parseFloat(price);

    const unitPrice = (price / quantity).toFixed(2);

    const id = generateId();

    const formData = new FormData();
    formData.append('image', uploadedImage);
    formData.append('name', name);
    formData.append('size', size);
    formData.append('includeStand', includeStand);
    formData.append('quantity', quantity);
    formData.append('price', unitPrice);
    formData.append('id', id);

    document.getElementById('progress-container').style.display = 'block';

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', function (e) {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            document.getElementById('progress-bar').value = percentComplete;
        }
    });

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById('progress-container').style.display = 'none';
            openPopup();
        }
    };

    xhr.open('POST', '/upload-flat', true);
    xhr.send(formData);
}

function addToCartCurved() {
    const uploadedImage = document.getElementById('photo-upload-curved').files[0];
    const name = "Curved Frame";
    const size = document.querySelector('input[name="size-curved"]:checked').value;
    const quantity = document.getElementById('quantityCurved').value;
    let price = document.getElementById('priceCurved').textContent.split(":")[1].trim();

    price = parseFloat(price);
    const unitPrice = (price / quantity).toFixed(2);

    const id = generateId();

    const formData = new FormData();
    formData.append('image', uploadedImage);
    formData.append('name', name);
    formData.append('size', size);
    formData.append('quantity', quantity);
    formData.append('price', unitPrice);
    formData.append('id', id);

    document.getElementById('progress-container').style.display = 'block';

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', function (e) {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            document.getElementById('progress-bar').value = percentComplete;
        }
    });

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById('progress-container').style.display = 'none';
            openPopup();
        }
    };

    xhr.open('POST', '/upload-curved', true);
    xhr.send(formData);
}

function addToCartKey() {
    const uploadedImage = document.getElementById('photo-upload-KC').files[0];
    const name = "Keychain";
    const quantity = document.getElementById('quantityKC').value;
    let price = document.getElementById('priceKC').textContent.split(":")[1].trim();

    price = parseFloat(price);
    const unitPrice = (price / quantity).toFixed(2);

    const id = generateId();

    const formData = new FormData();
    formData.append('image', uploadedImage);
    formData.append('name', name);
    formData.append('quantity', quantity);
    formData.append('price', unitPrice);
    formData.append('id', id);

    document.getElementById('progress-container').style.display = 'block';

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', function (e) {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            document.getElementById('progress-bar').value = percentComplete;
        }
    });

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById('progress-container').style.display = 'none';
            openPopup();
        }
    };

    xhr.open('POST', '/upload-kc', true);
    xhr.send(formData);
}

function openPopup() {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('popup').style.display = 'block';
}

function closePopup() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('popup').style.display = 'none';
    location.reload();
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

function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function toggleMenu() {
    var dropdownMenu = document.getElementById("dropdown-menu");
    if (dropdownMenu.style.display === "flex") {
        dropdownMenu.style.display = "none";
    } else {
        dropdownMenu.style.display = "flex";
    }
}
