let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Set today's date as default
document.getElementById("date").valueAsDate = new Date();

document
  .getElementById("expense-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    if (description && !isNaN(amount) && category && date) {
      addExpense(description, amount, category, date);
      updateTotal();
      this.reset();
      // Reset date to today after form submission
      document.getElementById("date").valueAsDate = new Date();
    }
  });

function addExpense(description, amount, category, date) {
  const expense = {
    id: Date.now(),
    description,
    amount,
    category,
    date,
  };
  expenses.push(expense);
  saveToLocalStorage();
  renderExpenses();
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2); // last two digits
    return `${day}/${month}/${year}`;
}

function renderExpenses() {
  const expenseList = document.getElementById("expense-list");
  expenseList.innerHTML = "";

  // Group expenses by category
  const grouped = expenses.reduce((acc, exp) => {
    if (!acc[exp.category]) acc[exp.category] = [];
    acc[exp.category].push(exp);
    return acc;
  }, {});

  // Render grouped expenses
  for (const category in grouped) {
    const categorySection = document.createElement("div");
    categorySection.classList.add("category-section");

    // Category heading
    const heading = document.createElement("h3");
    heading.textContent = category;
    categorySection.appendChild(heading);

    // Expense list inside category
    const ul = document.createElement("ul");
    let categoryTotal = 0;

    // 🔹 Sort by date ascending before rendering
    grouped[category].sort((a, b) => new Date(a.date) - new Date(b.date));

    grouped[category].forEach((expense) => {
      categoryTotal += expense.amount;

      const li = document.createElement("li");
      li.innerHTML = `
          <span class="expense-item">
              <strong class="expense-desc">${expense.description}</strong>
              <span class="expense-amount">Rs. ${expense.amount.toFixed(2)}</span>
              <span class="expense-meta">
                  <span class="expense-date">📅 ${formatDate(expense.date)}</span>
              </span>
          </span>
          <div>
              <button onclick="editExpense(${expense.id})">Edit</button>
              <button onclick="deleteExpense(${expense.id})">Delete</button>
          </div>
      `;
      ul.appendChild(li);
    });

    categorySection.appendChild(ul);

    // Category subtotal
    const subtotal = document.createElement("p");
    subtotal.classList.add("category-total");
    subtotal.innerHTML = `<strong>Total ${category}:</strong> Rs. ${categoryTotal.toFixed(2)} | <strong>Items:</strong> ${grouped[category].length}
    `;
    categorySection.appendChild(subtotal);

    expenseList.appendChild(categorySection);
  }
}

function exportToExcel() {
  if (expenses.length === 0) {
    alert("No expenses to export!");
    return;
  }

  // Prepare data
  const data = expenses.map(exp => ({
    Description: exp.description,
    Amount: exp.amount,
    Category: exp.category,
    Date: formatDate(exp.date)
  }));

  // Add overall total row
  data.push({});
  data.push({ Description: "TOTAL", Amount: calculateTotal(expenses) });

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Auto column widths
  const colWidths = [
    { wch: 25 }, // Description
    { wch: 10 }, // Amount
    { wch: 15 }, // Category
    { wch: 12 }  // Date
  ];
  ws['!cols'] = colWidths;

  // Create workbook and append
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Expenses");

  // Export file
  XLSX.writeFile(wb, "expenses.xlsx");
}



function editExpense(id) {
  const expense = expenses.find((exp) => exp.id === id);
  if (expense) {
    document.getElementById("description").value = expense.description;
    document.getElementById("amount").value = expense.amount;
    document.getElementById("category").value = expense.category;
    document.getElementById("date").value = expense.date;

    // Remove the expense being edited
    deleteExpense(id);
  }
}

function deleteExpense(id) {
  expenses = expenses.filter((exp) => exp.id !== id);
  saveToLocalStorage();
  renderExpenses();
  updateTotal();
}

function updateTotal() {
  const totalAmount = calculateTotal(expenses);
  document.getElementById("total-amount").textContent = totalAmount.toFixed(2);
}

function calculateTotal(expenses) {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

function saveToLocalStorage() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

// Initial render
renderExpenses();
updateTotal();
