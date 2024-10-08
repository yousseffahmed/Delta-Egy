let ordersData = [];

document.addEventListener('DOMContentLoaded', function() {
    fetchOrders();
});

function fetchOrders() {
    fetch('/api/orders')
        .then(response => response.json())
        .then(data => {
            ordersData = data;
            renderOrders(ordersData);
        })
        .catch(error => console.error('Error fetching orders:', error));
}

function renderOrders(orders) {
    const tableBody = document.querySelector('#orderTable tbody');
    tableBody.innerHTML = '';
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.orderNumber}</td>
            <td>${order.fname} ${order.lname}</td>
            <td>${order.email}</td>
            <td>${order.number}</td>
            <td>${order.shippingMethod}</td>
            <td>${order.address || '-'}</td>
            <td>${order.city || '-'}</td>
            <td>${order.building || '-'}</td>
            <td>${order.floor || '-'}</td>
            <td>${order.aprt || '-'}</td>
            <td>${order.post || '-'}</td>
            <td>${order.workingAddress ? 'Yes' : 'No'}</td>
            <td>${order.total}</td>
            <td>${order.status}</td>
            <td>
                <button class="status-button" onclick="changeStatus('${order.orderNumber}')">Mark as Done</button>
                <button class="cancel-button" onclick="cancelOrder('${order.orderNumber}')">Cancel Order</button>
                <button class="view-cart-button" onclick="viewCart('${order.orderNumber}')">View Cart</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function filterOrders(status) {
    const filteredOrders = status ? ordersData.filter(order => {
        return order.status === status;
    }) : ordersData;
    renderOrders(filteredOrders);
}

function searchOrder(orderNumber) {
    const searchedOrders = ordersData.filter(order => {
        return order.orderNumber.toLowerCase().includes(orderNumber.toLowerCase());
    });
    renderOrders(searchedOrders);
}

function changeStatus(orderNumber) {
    fetch(`/api/orders/${orderNumber}/status`, {
        method: 'PUT'
    })
    .then(response => response.json())
    .then(updatedOrder => {
        ordersData = ordersData.map(order => order.orderNumber === updatedOrder.orderNumber ? updatedOrder : order);
        renderOrders(ordersData);
    })
    .catch(error => console.error('Error updating status:', error));
}

function cancelOrder(orderNumber) {
    fetch(`/api/orders/${orderNumber}/cancel`, {
        method: 'PUT'
    })
    .then(response => response.json())
    .then(updatedOrder => {
        ordersData = ordersData.map(order => order.orderNumber === updatedOrder.orderNumber ? updatedOrder : order);
        renderOrders(ordersData);
    })
    .catch(error => console.error('Error cancelling order:', error));
}

function viewCart(orderNumber) {
    window.location.href = `/order/cart-details/${orderNumber}`;
}