// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    loadInitialData();
});

function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Load data for the active tab
            loadTabData(targetTab);
        });
    });
}

function loadTabData(tabName) {
    switch(tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'suppliers':
            loadSuppliers();
            break;
        case 'processes':
            loadProcesses();
            break;
        case 'dependencies':
            loadDependencies();
            break;
        case 'backup-plans':
            loadBackupPlans();
            break;
    }
}

function loadInitialData() {
    // Load dashboard if it's the active tab
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
        loadTabData(activeTab.getAttribute('data-tab'));
    }
}

// Modal functions
function showModal(content) {
    const modal = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = content;
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('modal-overlay');
    modal.classList.remove('active');
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

