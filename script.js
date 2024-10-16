
let investments = JSON.parse(localStorage.getItem('investments')) || [];


const investmentForm = document.getElementById('investmentForm');
const investmentTable = document.getElementById('investmentTable');
const totalValueEl = document.getElementById('totalValue');
const investmentChartCtx = document.getElementById('investmentChart').getContext('2d');


const addInvestmentBtn = document.getElementById('addInvestmentBtn');
const addInvestmentModal = document.getElementById('addInvestmentModal');
const closeAddModal = document.getElementById('closeAddModal');

const updateInvestmentModal = document.getElementById('updateInvestmentModal');
const closeUpdateModal = document.getElementById('closeUpdateModal');
const updateInvestmentForm = document.getElementById('updateInvestmentForm');


function saveInvestments() {
    localStorage.setItem('investments', JSON.stringify(investments));
}


function calculateTotalValue() {
    const total = investments.reduce((acc, inv) => acc + inv.currentValue, 0);
    totalValueEl.textContent = total.toFixed(2);
}


function calculatePercentageChange(investment) {
    if (investment.amountInvested === 0) return '0.00%';
    const change = ((investment.currentValue - investment.amountInvested) / investment.amountInvested) * 100;
    return `${change.toFixed(2)}%`;
}


function renderTable() {
    investmentTable.innerHTML = '';

    investments.forEach((investment, index) => {
        const row = document.createElement('tr');
        row.classList.add('text-center');

        row.innerHTML = `
            <td class="border px-4 py-2">${investment.assetName}</td>
            <td class="border px-4 py-2">$${investment.amountInvested.toFixed(2)}</td>
            <td class="border px-4 py-2">$${investment.currentValue.toFixed(2)}</td>
            <td class="border px-4 py-2">${calculatePercentageChange(investment)}</td>
            <td class="border px-4 py-2">
                <button class="bg-yellow-500 text-white hover:bg-yellow-600 px-2 py-1 rounded mr-2" onclick="openUpdateModal(${index})">Update</button>
                <button class="bg-red-500 text-white hover:bg-red-600 px-2 py-1 rounded" onclick="removeInvestment(${index})">Remove</button>
            </td>
        `;
        investmentTable.appendChild(row);
    });
}

// Function to remove an investment
function removeInvestment(index) {
    if (confirm('Are you sure you want to remove this investment?')) {
        investments.splice(index, 1);
        saveInvestments();
        renderTable();
        updateChart();
        calculateTotalValue();
    }
}

function openAddModal() {
    addInvestmentModal.classList.remove('hidden');
}


function closeAddInvestmentModal() {
    addInvestmentModal.classList.add('hidden');
    investmentForm.reset();
}


function openUpdateModal(index) {
    const investment = investments[index];
    document.getElementById('updateIndex').value = index;
    document.getElementById('updateName').value = investment.assetName;
    document.getElementById('updateAmount').value = investment.amountInvested;
    document.getElementById('updateCurrentValue').value = investment.currentValue;
    updateInvestmentModal.classList.remove('hidden');
}


function closeUpdateInvestmentModal() {
    updateInvestmentModal.classList.add('hidden');
    updateInvestmentForm.reset();
}


addInvestmentBtn.addEventListener('click', openAddModal);


closeAddModal.addEventListener('click', closeAddInvestmentModal);


investmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const assetName = document.getElementById('name').value.trim();
    const amountInvested = parseFloat(document.getElementById('amount').value);
    const currentValue = parseFloat(document.getElementById('currentValue').value);

    // Data Validation
    if (assetName === '' || isNaN(amountInvested) || isNaN(currentValue)) {
        alert('Please fill in all fields correctly.');
        return;
    }

    if (amountInvested < 0 || currentValue < 0) {
        alert('Investment amounts must be positive numbers.');
        return;
    }

    // Add new investment
    investments.push({ assetName, amountInvested, currentValue });
    saveInvestments();
    renderTable();
    updateChart();
    calculateTotalValue();


    closeAddInvestmentModal();
});


closeUpdateModal.addEventListener('click', closeUpdateInvestmentModal);


updateInvestmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const index = document.getElementById('updateIndex').value;
    const updatedCurrentValue = parseFloat(document.getElementById('updateCurrentValue').value);


    if (isNaN(updatedCurrentValue)) {
        alert('Please enter a valid current value.');
        return;
    }

    if (updatedCurrentValue < 0) {
        alert('Current value must be a positive number.');
        return;
    }

    
    investments[index].currentValue = updatedCurrentValue;
    saveInvestments();
    renderTable();
    updateChart();
    calculateTotalValue();

    closeUpdateInvestmentModal();
});

// Initialize Chart.js Pie Chart
let investmentChart = new Chart(investmentChartCtx, {
    type: 'pie',
    data: {
        labels: [],
        datasets: [{
            label: 'Investment Distribution',
            data: [],
            backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
                '#FF9F80', '#36A2B4', '#FFCD56', '#4BC0C0'
            ],
            borderWidth: 1,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        let value = context.raw || 0;
                        return `${label}: $${value.toFixed(2)}`;
                    }
                }
            }
        }
    }
});

function updateChart() {
    const labels = investments.map(inv => inv.assetName);
    const data = investments.map(inv => inv.currentValue);

    investmentChart.data.labels = labels;
    investmentChart.data.datasets[0].data = data;
    investmentChart.update();
}

// Initial Rendering
renderTable();
updateChart();
calculateTotalValue();
