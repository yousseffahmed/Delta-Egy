let complaintsData = [];

document.addEventListener('DOMContentLoaded', function() {
    fetchComplaints();
});

function fetchComplaints() {
    fetch('/api/complaints')
        .then(response => response.json())
        .then(data => {
            complaintsData = data;
            renderComplaints(complaintsData);
        })
        .catch(error => console.error('Error fetching complaints:', error));
}

function renderComplaints(complaints) {
    const tableBody = document.querySelector('#complaintsTable tbody');
    tableBody.innerHTML = '';
    complaints.forEach(complaint => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${complaint.name}</td>
            <td>${complaint.email}</td>
            <td>${complaint.number}</td>
            <td>${complaint.message}</td>
            <td>${complaint.status}</td>
            <td>
                <button class="status-button" onclick="changeStatus('${complaint._id}')">Mark as Answered</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function filterComplaints(status) {
    const filteredComplaints = status ? complaintsData.filter(complaint => complaint.status === status) : complaintsData;
    renderComplaints(filteredComplaints);
}

function changeStatus(id) {
    fetch(`/api/complaints/${id}/status`, {
        method: 'PUT'
    })
    .then(response => response.json())
    .then(updatedComplaint => {
        complaintsData = complaintsData.map(complaint => complaint._id === updatedComplaint._id ? updatedComplaint : complaint);
        renderComplaints(complaintsData);
    })
    .catch(error => console.error('Error updating status:', error));
}