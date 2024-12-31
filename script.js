var inc = 0, exp = 0; // income and expense values 
let transactions = []; // Expense transactions
let income = []; // Income transactions
let priorityExpenses = [] // Expenses containing other than cut down expenses 
let savingGoal = 0;
function loadTransactions() {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
    }
    const storedIncome = localStorage.getItem('income');
    if (storedIncome) {
        income = JSON.parse(storedIncome);
    }
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('income', JSON.stringify(income));
}

function deleteTransaction(index, type) {
    if (type === 'Expense') {
        transactions = transactions.filter(transaction => transaction.id !== index);
        exp = 0;
    } else if (type === 'Income') {
        income = income.filter(item => item.id !== index);
        inc = 0;
    }
    saveTransactions();
    renderList();
}

function renderPriorityExpensesChart() {
    const ctx = document.getElementById('priorityExpensesChart');
    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ensure the canvas context is found
    if (!ctx) {
        console.error("Canvas element not found");
        return;
    }

    const chartContext = ctx.getContext('2d');

    // Ensure priorityExpenses is an array and not empty
    if (!Array.isArray(priorityExpenses) || priorityExpenses.length === 0) {
        console.error("Priority expenses data is missing or empty");
        return;
    }
    const labels = priorityExpenses.map(expense => expense.name);
    const data = priorityExpenses.map(expense => expense.amount);

    console.log("Priority Expenses:", priorityExpenses);
    console.log("Labels:", labels);
    console.log("Data:", data);

    // Check if the chart is already initialized and destroy it properly
    if (window.priorityExpensesChart instanceof Chart) {
        window.priorityExpensesChart.destroy();
    }

    // Define background colors for the pie chart
    const backgroundColors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];
    // Create a new chart instance
    window.priorityExpensesChart = new Chart(chartContext, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Priority Expenses',
                data: data,
                backgroundColor: backgroundColors.slice(0, data.length),
                borderColor: '#ef6c00',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

function renderPriorityExpensesChart2() {
    const ctx = document.getElementById('priorityExpensesChart2');
    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ensure the canvas context is found
    if (!ctx) {
        console.error("Canvas element not found");
        return;
    }

    const chartContext = ctx.getContext('2d');

    // Ensure priorityExpenses is an array and not empty
    if (!Array.isArray(priorityExpenses) || priorityExpenses.length === 0) {
        console.error("Priority expenses data is missing or empty");
        return;
    }
    const labels = priorityExpenses.map(expense => expense.name);
    const data = priorityExpenses.map(expense => expense.amount);

    console.log("Priority Expenses:", priorityExpenses);
    console.log("Labels:", labels);
    console.log("Data:", data);

    // Check if the chart is already initialized and destroy it properly
    // if (window.priorityExpensesChart instanceof Chart) {
    //     window.priorityExpensesChart.destroy();
    // }

    // Define background colors for the pie chart
    const backgroundColors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];
    // Create a new chart instance
    window.priorityExpensesChart = new Chart(chartContext, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Priority Expenses',
                data: data,
                backgroundColor: backgroundColors.slice(0, data.length),
                borderColor: '#ef6c00',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

function savingValue(){
     let saving = document.getElementById('savingInput').value;
        

    if (saving>=inc || saving<=0) {
        alert('Invalid Saving Amount.');
        return;
    }
   savingGoal=saving;
   saving.innerHTML=''
   greedyExpense();
}
function greedyExpense() {
    priorityExpenses = [];
    for (const transaction of transactions) {
        transaction.impRatio = transaction.amount / transaction.priority
    }
    for (let i = 0; i < transactions.length; i++) {
        for (let j = 0; j < transactions.length - i; j++) {
            if (transactions[i].impRatio > transactions[j].impRatio) {
                let temp = transactions[i];
                transactions[i] = transactions[j];
                transactions[j] = temp;
            }
        }
    }

    let remainingAmount = inc - savingGoal;
    let sum = 0;

    // Step 4: Iterate through the sorted transactions and accumulate expenses to cut
    for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];

        if (sum + transaction.amount <= remainingAmount) {
            // Cut the entire expense if it fits within the remaining amount
            sum += transaction.amount;
            priorityExpenses.push({ ...transaction, cutAmount: transaction.amount });
        } else {
            // Partially cut the expense if the remaining amount is less than the transaction amount
            let partialCut = remainingAmount - sum;
            if (partialCut > 0) {
                priorityExpenses.push({ ...transaction, cutAmount: partialCut });
                sum += partialCut;
            }
            break; // Stop once we have reached the required savings
        }
    }

    document.getElementById('GR').innerHTML="Greedy Approach";
    renderPriorityExpenses()
    dynamicProgExpense();

}

function dynamicProgExpense() {
    // Clear the global priorityExpenses array at the beginning
    priorityExpenses.length = 0; // Clear the existing contents of the array

    const n = transactions.length;
    const budget = inc - savingGoal;

    // Initialize the DP table with zeros
    const dp = Array.from({ length: n + 1 }, () => Array(budget + 1).fill(0));

    // Fill the DP table
    for (let i = 1; i <= n; i++) {
        const { amount, priority } = transactions[i - 1];
        for (let j = 0; j <= budget; j++) {
            if (amount <= j) {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i - 1][j - amount] + priority);
            } else {
                dp[i][j] = dp[i - 1][j];
            }
        }
    }

    // Trace back to find the transactions included in the optimal solution
    let remainingBudget = budget;
    let sum = 0;

    for (let i = n; i > 0; i--) {
        if (dp[i][remainingBudget] !== dp[i - 1][remainingBudget]) {
            const transaction = transactions[i - 1];
            if (sum + transaction.amount <= budget) {
                sum += transaction.amount;
                priorityExpenses.push({ ...transaction, cutAmount: transaction.amount });
                remainingBudget -= transaction.amount;
            } else {
                let partialCut = budget - sum;
                if (partialCut > 0) {
                    priorityExpenses.push({ ...transaction, cutAmount: partialCut });
                    sum += partialCut;
                }
                break;
            }
        }
    }
    document.getElementById('DP').innerHTML="DP Approach";
    renderPriorityExpenses2();
    
}


function renderPriorityExpenses() {
    const priorityList = document.getElementById('priorityItems');
    priorityList.innerHTML = '';

    if (priorityExpenses.length === 0) {
        priorityList.innerHTML = '<li>No expenses to cut.</li>';
        priorityList.style.color = 'red';
        return;
    }

    priorityExpenses.forEach(({ name, amount, priority, cutAmount }) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="box1">
                <div class="PriExpname"><h4>${name}</h4></div>
                <div class="PriExpamount"><h4>Original: $${amount}</h4></div>
                <div class="PriExpcutAmount"><h4>Cut: $${cutAmount}</h4></div>
                <div class="PriExppriority"><h4>Priority: ${priority}</h4></div>
            </div>`;
        priorityList.appendChild(li);
    });
    renderPriorityExpensesChart();
}

function renderPriorityExpenses2() {
    const priorityList = document.getElementById('priorityItems2');
    priorityList.innerHTML = '';

    if (priorityExpenses.length === 0) {
        priorityList.innerHTML = '<li>No expenses to cut.</li>';
        priorityList.style.color = 'red';
        return;
    }

    priorityExpenses.forEach(({ name, amount, priority, cutAmount }) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="box1">
                <div class="PriExpname"><h4>${name}</h4></div>
                <div class="PriExpamount"><h4>Original: $${amount}</h4></div>
                <div class="PriExpcutAmount"><h4>Cut: $${cutAmount}</h4></div>
                <div class="PriExppriority"><h4>Priority: ${priority}</h4></div>
            </div>`;
        priorityList.appendChild(li);
    });
    renderPriorityExpensesChart2();
}

// function handleEdit(transaction, index, type) {
//     let transactionItem = type === 'Expense' ? transactions[index] : income[index];

//     const nameElement = transaction.querySelector('.name');
//     const amountElement = transaction.querySelector('.amount');
//     const priorityElement = transaction.querySelector('.priority');


//     const name = nameElement.textContent;
//     const amount = amountElement.textContent;
//     const priority = priorityElement.textContent;

//     nameElement.innerHTML = `<input type="text" class="edit-name" value="${name}" />`;
//     amountElement.innerHTML = `<input type="number" class="edit-amount" placeholder="amount" value="${amount}" />`;
//     priorityElement.innerHTML = `<input type="number" class="edit-priority" placeholder="priority" value="${priority}" />`;

//     const nameInput = transaction.querySelector('.edit-name');
//     nameInput.focus();

//     transaction.addEventListener('keydown', (event) => {
//         if (event.key === 'Enter') {
//             event.preventDefault();
//             const newName = nameInput.value;
//             const newAmount = transaction.querySelector('.edit-amount').value;
//             const newPriority = transaction.querySelector('.edit-priority').value;

//             if (newName === '' || isNaN(parseInt(newAmount)) || parseInt(newAmount) <= 0 || parseInt(newPriority) <= 0 || isNaN(parseInt(newPriority))) {
//                 alert('Please fill all fields or enter data correctly.');
//                 return;
//             }

//             transactionItem.name = newName.toUpperCase();
//             transactionItem.amount = parseInt(newAmount);
//             transactionItem.priority = parseInt(newPriority);

//             if (type === 'Expense') {
//                 exp = 0;
//             } else {
//                 inc = 0;
//             }

//             saveTransactions();
//             renderList();

//             nameElement.innerHTML = newName;
//             amountElement.innerHTML = newAmount;
//             priorityElement.innerHTML = newPriority;
//         }
//     });
// }



const list = document.getElementById('items');
const list2 = document.getElementById('items2');
const state = document.getElementById('items');
const state2 = document.getElementById('items2');
var remainAmount = document.getElementById('totalAmount');
var deficitAmount = document.getElementById('deficitAmount');
var incAmount = document.getElementById('incomeAmount');
var expAmount = document.getElementById('expenseAmount');

function renderList() {
    list.innerHTML = "";
    list2.innerHTML = "";
    exp = 0;
    inc = 0;

    if (transactions.length === 0) {
        state.innerHTML = 'No transactions.';
    }
    if (income.length === 0) {
        state2.innerHTML = 'No transactions.';
    } 
    
    else {
        state.innerHTML = '';
        remainAmount.innerHTML = '';
        incAmount.innerHTML = '';
        expAmount.innerHTML = '';
    }

    transactions.forEach(({ name, amount, id, priority }) => {
        const li = document.createElement('li');
        list.appendChild(li);
        exp += amount;

        li.innerHTML = `<div class="box1"><div class="name"><h5>${name}</h5></div> <div class="amount"><h5>$ ${amount}</h5></div> <div class="priority"><h5>${priority}</h5></div></div> <div class="box2"><div class="delBtn"><button type="submit" class="deleteButton" data-index="${id}" data-type="Expense">Delete</button></div></div> `;

        const deleteButton = li.querySelector('.deleteButton');
        deleteButton.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            const type = this.dataset.type;
            deleteTransaction(index, type);
        });

    });

    income.forEach(({ name, amount, id }) => {
        const li = document.createElement('li');
        list2.appendChild(li);
        inc += amount;

        li.innerHTML = `<div class="box1"><div class="name"><h6>${name}</h6></div> <div class="amount"><h6>$ ${amount}</h6></div></div> <div class="box2"><div class="delBtn"><button type="submit" class="deleteButton2" data-index="${id}" data-type="Income">Delete</button></div></div> `;

        const deleteButton = li.querySelector('.deleteButton2');
        deleteButton.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            const type = this.dataset.type;
            deleteTransaction(index, type);
        });
    });

    incAmount.innerHTML = '$ ' + inc;
    expAmount.innerHTML = '$ ' + exp;
    if (inc - exp < 0) {
        deficitAmount.innerHTML = '- $ ' + (-(inc - exp));
        remainAmount.innerHTML = '$ 0';
        deficitAmount.style.color = 'red';
    } else {
        deficitAmount.innerHTML = '$ 0';
        deficitAmount.style.color = 'black';
        remainAmount.innerHTML = '$ ' + (inc - exp);
    }

    renderIncomeExpenseChart();
    renderPriorityExpensesChart();
}

document.addEventListener('DOMContentLoaded', function() {
    loadTransactions();
    renderList();
    renderIncomeExpenseChart();
});

function addTransaction() {
    // let type = document.getElementById('type').value;
    let money = parseInt(document.getElementById('moneyInput1').value);
    let newName = document.getElementById('categoryInput1').value;
    let value = document.getElementById('priorityInput').value;

    if ( money <= 0 || isNaN(money) || newName === ''||isNaN(value)||value<=0) {
        alert('Please fill all fields or enter data correctly.');
        return;
    }
    
        const newTransaction = {
            id: transactions.length,
            name: newName.toUpperCase(),
            amount: money,
            priority: value,
            impRatio: 0
        };
        transactions.push(newTransaction);

    saveTransactions();
    renderList();

}

function addIncome() {
    // let type = document.getElementById('type').value;
    let money = parseInt(document.getElementById('moneyInput').value);
    let newName = document.getElementById('categoryInput').value;
    // let value = document.getElementById('priorityInput').value;

    if ( money <= 0 || isNaN(money) || newName === '') {
        alert('Please fill all fields.');
        return;
    }
     
        const newIncome = {
            id: income.length,
            name: newName.toUpperCase(),
            amount: money
        };
        income.push(newIncome);
    

    saveTransactions();
    renderList();

}

function renderIncomeExpenseChart() {
    const ctx = document.getElementById('incomeExpenseChart').getContext('2d');

    // Destroy existing chart instance if it already exists to avoid overlap
    // if (window.incomeExpenseChart) {
    //     window.incomeExpenseChart.destroy();
    // }

    // Prepare data for the chart
    const data = {
        labels: ['Income', 'Expenses'],
        datasets: [{
            label: 'Amount in $',
            data: [inc, exp],
            backgroundColor: ['rgba(54, 162, 235, 0.5)','rgba(255, 99, 132, 0.5)'],
            borderColor: ['rgb(54, 162, 235)','rgb(255, 99, 132)'],
            borderWidth: 1
        }]
    };

    // Create a bar chart
    window.incomeExpenseChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Income vs Expenses' }
            },
            scales: {
            x: {
                ticks: {
                    color: '#000', // Dark color for x-axis labels
                    font: {
                        size: 14, // Increase font size for better visibility
                        weight: 'bold'
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.7)', // Darker grid lines
                    lineWidth: 1.5 // Thicker grid lines
                }
            },
            y: {
                ticks: {
                    color: '#000', // Dark color for y-axis labels
                    font: {
                        size: 14, // Increase font size for better visibility
                        weight: 'bold'
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.7)', // Darker grid lines
                    lineWidth: 1.5 // Thicker grid lines
                },
                title: {
                    display: true,
                    text: 'Amount ($)',
                    color: '#000',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        },
        }
    });
}
