const registerForm = document.getElementById('registerForm');
const orderForm = document.getElementById('orderForm');

const namePattern = /^[A-Z][a-z]{1,}(?: [A-Z][a-z]{1,})*$/;
const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const phonePattern = /^(09|\+639)\d{9}$/;
const addressPattern = /^.{5,}$/;

document.addEventListener('DOMContentLoaded', () => {
    updateCart();

    const orderContent = document.getElementById('orderContent');
    const orderFormSection = document.getElementById('orderFormSection');
    const displayFields = {
        name: document.getElementById('displayName'),
        email: document.getElementById('displayEmail'),
        phone: document.getElementById('displayPhone'),
        address: document.getElementById('displayAddress')
    };

    if (orderContent && orderFormSection) {
        if (customerData.firstName && customerData.phone) {
            orderContent.style.display = 'none';
            orderFormSection.style.display = 'block';
            
            if(displayFields.name) displayFields.name.textContent = `${customerData.firstName} ${customerData.lastName}`;
            if(displayFields.email) displayFields.email.textContent = customerData.email;
            if(displayFields.phone) displayFields.phone.textContent = customerData.phone;
            if(displayFields.address) displayFields.address.textContent = customerData.address;
        }
    }

    if (document.getElementById('reviewsBox')) {
        startReviewSlideshow();
    }
});

const fields = {
    firstName: document.getElementById('firstName'),
    lastName: document.getElementById('lastName'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    address: document.getElementById('address')
};

function validateField(field, pattern) {
    if(!field) return;
    field.addEventListener('keyup', () => {
        const isValid = pattern.test(field.value);
        field.className = isValid ? 'accepted' : 'rejected';
    });
}

validateField(fields.firstName, namePattern);
validateField(fields.lastName, namePattern);
validateField(fields.email, emailPattern);
validateField(fields.phone, phonePattern);
validateField(fields.address, addressPattern);


function showRegisterForm() {
    document.getElementById('orderContent').style.display = 'none';
    document.getElementById('registerSection').style.display = 'block';
}

if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const fNameValid = namePattern.test(fields.firstName.value);
        const lNameValid = namePattern.test(fields.lastName.value);
        const emailValid = emailPattern.test(fields.email.value);
        const phoneValid = phonePattern.test(fields.phone.value);
        const addrValid = addressPattern.test(fields.address.value);

        if (fNameValid && lNameValid && emailValid && phoneValid && addrValid) {
            tempCustomerData = {
                firstName: fields.firstName.value,
                lastName: fields.lastName.value,
                email: fields.email.value,
                phone: fields.phone.value,
                address: fields.address.value
            };

            document.getElementById('confirmName').textContent = `${tempCustomerData.firstName} ${tempCustomerData.lastName}`;
            document.getElementById('confirmEmail').textContent = tempCustomerData.email;
            document.getElementById('confirmPhone').textContent = tempCustomerData.phone;
            document.getElementById('confirmAddress').textContent = tempCustomerData.address;
            
            document.getElementById('infoConfirmModal').style.display = 'flex';
        } else {
            document.getElementById('registerError').style.display = 'block';
        }
    });
}

function confirmInformation() {
    customerData = { ...tempCustomerData };
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(customerData));

    document.getElementById('infoConfirmModal').style.display = 'none';
    document.getElementById('registerSuccess').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';

    setTimeout(() => {
        window.location.reload(); 
    }, 1500);
}

function closeInfoModal() {
    document.getElementById('infoConfirmModal').style.display = 'none';
}

const orderItem = document.getElementById('orderItem');
const quantity = document.getElementById('quantity');
const totalPrice = document.getElementById('totalPrice');

function updateTotalPrice() {
    if (!orderItem) return;
    const selectedOption = orderItem.options[orderItem.selectedIndex];
    
    if (!selectedOption.hasAttribute('data-price')) {
        totalPrice.textContent = '₱0';
        return;
    }

    const price = selectedOption.getAttribute('data-price');
    const qty = quantity.value;
    const total = price * qty;
    totalPrice.textContent = '₱' + total;
}

if(orderItem) orderItem.addEventListener('change', updateTotalPrice);
if(quantity) quantity.addEventListener('input', updateTotalPrice);

if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const selectedOption = orderItem.options[orderItem.selectedIndex];
        if (!selectedOption.value) return;

        const newItem = {
            name: selectedOption.value,
            price: parseInt(selectedOption.getAttribute('data-price')),
            quantity: parseInt(quantity.value),
            notes: document.getElementById('notes').value
        };

        cart.push(newItem);
        localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart)); 
        
        updateCart();
        
        const successMsg = document.getElementById('orderSuccess');
        successMsg.style.display = 'block';
        
        quantity.value = 1;
        document.getElementById('notes').value = '';
        orderItem.selectedIndex = 0;
        updateTotalPrice();

        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 2000);
    });
}

function updateCart() {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cartItemsDiv) return;

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<div style="text-align:center; padding:2rem; opacity:0.5;"><p style="font-size:2rem;">🛒</p><p>Cart is empty</p></div>';
        if(cartSummary) cartSummary.style.display = 'none';
    } else {
        let cartHTML = '';
        let subtotal = 0;
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            cartHTML += `
                <div class="cart-item" style="position: relative; padding-right: 30px;">
                    <h4>${item.name}</h4>
                    <p>${item.quantity} × ₱${item.price} = ₱${itemTotal}</p>
                    ${item.notes ? `<small style="opacity:0.8; font-style:italic;">Note: ${item.notes}</small>` : ''}
                    <button onclick="removeItem(${index})" 
                        style="position: absolute; top: 10px; right: 5px; background: none; border: none; cursor: pointer; color: #fff; font-size: 1.2rem;">
                        ×
                    </button>
                </div>
            `;
        });
        
        cartItemsDiv.innerHTML = cartHTML;
        
        if(cartSummary) {
            cartSummary.style.display = 'block';
            const orderType = document.getElementById('orderType');
            const deliveryFee = (orderType && orderType.value === 'pickup') ? 0 : 50;
            
            document.getElementById('cartSubtotal').textContent = '₱' + subtotal;
            if(document.getElementById('deliveryFee')) {
                document.getElementById('deliveryFee').textContent = '₱' + deliveryFee;
            }
            document.getElementById('cartGrandTotal').textContent = '₱' + (subtotal + deliveryFee);
        }
    }
}

function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
    updateCart();
}

const orderType = document.getElementById('orderType');
const paymentMethod = document.getElementById('paymentMethod');
const gcashProofInput = document.getElementById('gcashProof');

if(orderType) {
    orderType.addEventListener('change', () => {
        updateCart();
        togglePaymentMethod();
    });
}

if(paymentMethod) {
    paymentMethod.addEventListener('change', toggleGCashDetails);
}

if(gcashProofInput) {
    gcashProofInput.addEventListener('change', (e) => {
        const fileName = e.target.files[0] ? e.target.files[0].name : '';
        document.getElementById('fileName').textContent = fileName ? `✓ ${fileName}` : '';
    });
}

function togglePaymentMethod() {
    const pmSection = document.getElementById('paymentMethodSection');
    const gcashDetails = document.getElementById('gcashDetails');
    
    if (orderType.value === 'pickup') {
        pmSection.style.display = 'none';
        gcashDetails.style.display = 'none';
    } else {
        pmSection.style.display = 'block';
        toggleGCashDetails();
    }
}

function toggleGCashDetails() {
    const gcashDetails = document.getElementById('gcashDetails');
    const isGCash = paymentMethod.value === 'gcash';
    const isDelivery = orderType.value === 'delivery';
    
    gcashDetails.style.display = (isGCash && isDelivery) ? 'block' : 'none';
}

function finalizeOrder() {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }
    
    if (orderType.value === 'delivery' && paymentMethod.value === 'gcash') {
        if (!gcashProofInput.value) {
            alert('Please upload GCash payment proof.');
            return;
        }
    }
    
    document.getElementById('confirmModal').style.display = 'flex';
}

function confirmOrder() {
    const isPickup = orderType.value === 'pickup';
    const deliveryFee = isPickup ? 0 : 50;
    
    let subtotal = 0;
    let itemsHtml = '';
    
    cart.forEach(item => {
        const t = item.price * item.quantity;
        subtotal += t;
        itemsHtml += `<li class="receipt-item-row"><span>${item.quantity}x ${item.name}</span><span>₱${t}</span></li>`;
    });

    const grandTotal = subtotal + deliveryFee;

    const receiptHTML = `
        <div class="receipt-header">
            <span class="close-modal-x" onclick="closeSuccessModal()">×</span>
            <span class="icon">✓</span>
            <h2 style="margin:0;">Order Sent!</h2>
        </div>
        <div class="receipt-body">
            <div class="receipt-details">
                <p><strong>Name:</strong> ${customerData.firstName} ${customerData.lastName}</p>
                <p><strong>Type:</strong> ${isPickup ? 'Pickup' : 'Delivery'}</p>
                ${!isPickup ? `<p><strong>Addr:</strong> ${customerData.address}</p>` : ''}
            </div>
            <ul class="receipt-items-list">${itemsHtml}</ul>
            <div class="receipt-totals">
                <div class="row"><span>Total:</span> <span>₱${grandTotal}</span></div>
            </div>
            <button onclick="closeSuccessModal()" class="submit-btn" style="margin-top:1rem;">Back to Home</button>
        </div>
    `;

    document.getElementById('receiptContainer').innerHTML = receiptHTML;
    document.getElementById('confirmModal').style.display = 'none';
    document.getElementById('successModal').style.display = 'flex';

    cart = [];
    localStorage.removeItem(STORAGE_CART_KEY);
    updateCart();
}

function closeSuccessModal() {
    window.location.href = 'index.html';
}

function closeModal() {
    document.getElementById('confirmModal').style.display = 'none';
}


function startReviewSlideshow() {
    const reviews = [
        {
            author: "Mukz Hadain",
            text: "ang sarap, worth it ang craving, para ako napunta ulit sa malaysia. thank you craving satisfied. ♥️♥️🇲🇾"
        },
        {
            author: "Angelo Viloria",
            text: "Absolutely phenomenal Malaysian cuisine! Rich flavors, perfect spices, stunning presentation. A must-try! 5/5 ⭐"
        },
        {
            author: "Yehn Ollodo Jumalon",
            text: "Very authentic! thanks po! Great food."
        },
        {
            author: "Emelyn Haz Balabat",
            text: "Super naenjoy po namin at masarap lahat. Kunting sambal lang kasi super anghang hehe. Will definitely order again!"
        },
        {
            author: "Sara Yeo",
            text: "Authentic taste! Ordered 8 variants for a picnic. Packed well, superb flavors. Highly recommended! 🥰"
        },
        {
            author: "Nadine Gamalinda",
            text: "Lived 3 years in Malaysia. Didn't expect Makcik to taste this authentic. Ordering again this week!"
        },
        {
            author: "Mpn Joeshred",
            text: "Ordered Nasi Lemak Ayam via FoodPanda. Delicious and addicting! Sana bigger chicken option."
        },
        {
            author: "Cindy PC",
            text: "I'm Malaysian. This is 95% closest to home I've tasted in PH. Get extra sambal!"
        },
        {
            author: "Geraldine Maglalang Cabello",
            text: "Great makan experience! Authentic taste and superb sambal! Sedap!! 💖"
        },
        {
            author: "Rosella Perez Antiforda-Brisenio",
            text: "Authentic Malaysian food, good presentation, affordable and fast delivery."
        },
        {
            author: "Beth Periquet",
            text: "If you like Nasi Lemak, THIS IS IT! Will definitely order again."
        },
        {
            author: "Antonio Ram Fernandez Roldan",
            text: "Feels like Brunei! Authentic Nasi Lemak, amazing sambal! Sobrang sarap!"
        },
        {
            author: "Sheryline Di",
            text: "Sobrang sarap ng Nasi Lemak at Sambal! Ubos agad. Will order ulit for my family 😊"
        },
        {
            author: "Roger Eliseo Ocana",
            text: "Very organic Makcik Asian food! Nilapang namin!"
        },
        {
            author: "Yormelody Fortes Ocana",
            text: "Ayos sambal! Sakto tamis-anghang. Pre-order niyo na!"
        },
        {
            author: "Daniel Thony D Elizabeth",
            text: "Authentic and delicious Nasi Lemak!"
        },
        {
            author: "Tiger Edgrr",
            text: "First time trying Malaysian food — superb Nasi Lemak Ayam and sambal!"
        },
        {
            author: "Macy Chan",
            text: "First time trying Malaysian dish. Must try for spicy lovers!"
        }
    ];

    let currentReview = 0;
    const reviewText = document.getElementById("reviewText");
    const reviewAuthor = document.getElementById("reviewAuthor");
    const reviewsBox = document.getElementById("reviewsBox");

    function showReview(index) {
        reviewsBox.classList.remove("show");
        setTimeout(() => {
            reviewText.textContent = reviews[index].text;
            reviewAuthor.textContent = "— " + reviews[index].author;
            reviewsBox.classList.add("show");
        }, 500);
    }

    showReview(0);
    setInterval(() => {
        currentReview = (currentReview + 1) % reviews.length;
        showReview(currentReview);
    }, 5000);
}

window.onclick = function(event) {
    if (event.target === document.getElementById('successModal')) closeSuccessModal();
    if (event.target === document.getElementById('infoConfirmModal')) closeInfoModal();

}

