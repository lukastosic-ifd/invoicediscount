'use strict';

// --- STATE MANAGEMENT ---
let state = {
    lines: [
        createNewLine(),
        createNewLine(),
        createNewLine(),
    ],
    finalAmount: 0,
};

// --- DOM ELEMENT REFERENCES ---
const invoiceLinesContainer = document.getElementById('invoice-lines-container');
const lineTemplate = document.getElementById('invoice-line-template');
const addLineBtn = document.getElementById('add-line-btn');
const finalAmountInput = document.getElementById('final-amount-input');
const totalPreDiscountEl = document.getElementById('total-pre-discount');
const totalDiscountableEl = document.getElementById('total-discountable');
const totalNonDiscountableEl = document.getElementById('total-non-discountable');
const totalDiscountAmountEl = document.getElementById('total-discount-amount');
const discountPercentageEl = document.getElementById('discount-percentage');
const calculatedFinalAmountEl = document.getElementById('calculated-final-amount');
const themeToggleBtn = document.getElementById('theme-toggle-btn');

// --- HELPER FUNCTIONS ---
function createNewLine() {
    return {
        id: crypto.randomUUID(),
        name: '',
        quantity: 1,
        price: 0,
        applyDiscount: true,
    };
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
};

// --- CORE LOGIC & RENDERING ---

/**
 * Performs all calculations and updates the summary panel and calculated values
 * in each invoice line DOM element without redrawing the inputs.
 */
function updateCalculationsAndDisplay() {
    // 1. Perform all calculations based on the current state
    let totalPreDiscount = 0;
    let discountableTotal = 0;
    let nonDiscountableTotal = 0;

    state.lines.forEach(line => {
        const lineTotal = line.quantity * line.price;
        totalPreDiscount += lineTotal;
        if (line.applyDiscount) {
            discountableTotal += lineTotal;
        } else {
            nonDiscountableTotal += lineTotal;
        }
    });

    const finalAmountForDiscountedItems = state.finalAmount - nonDiscountableTotal;
    const totalDiscountValue = discountableTotal - finalAmountForDiscountedItems;
    
    let discountPercentage = 0;
    if (discountableTotal > 0 && totalDiscountValue > 0) {
        discountPercentage = (totalDiscountValue / discountableTotal) * 100;
    }
    
    const totalDiscountAmount = state.finalAmount > 0 && totalPreDiscount > state.finalAmount ? totalPreDiscount - state.finalAmount : 0;
    const calculatedFinalAmount = nonDiscountableTotal + (discountableTotal * (1 - (discountPercentage / 100)));

    // 2. Update the summary panel
    totalPreDiscountEl.textContent = formatCurrency(totalPreDiscount);
    totalDiscountableEl.textContent = formatCurrency(discountableTotal);
    totalNonDiscountableEl.textContent = formatCurrency(nonDiscountableTotal);
    totalDiscountAmountEl.textContent = formatCurrency(totalDiscountAmount);
    discountPercentageEl.textContent = `${discountPercentage.toFixed(5)}%`;
    calculatedFinalAmountEl.textContent = formatCurrency(calculatedFinalAmount);
    
    // 3. Update the calculated values for each existing line in the DOM
    state.lines.forEach(line => {
        const lineElement = invoiceLinesContainer.querySelector(`[data-id="${line.id}"]`);
        if (lineElement) {
            const lineTotal = line.quantity * line.price;
            let priceAfterDiscount = lineTotal;
            if (line.applyDiscount && discountPercentage > 0) {
                priceAfterDiscount = lineTotal * (1 - discountPercentage / 100);
            }
            
            lineElement.querySelector('[data-role="line-total"]').textContent = formatCurrency(lineTotal);
            lineElement.querySelector('[data-role="line-discounted"]').textContent = formatCurrency(priceAfterDiscount);
        }
    });
}

/**
 * Creates and appends a single invoice line element to the DOM.
 * @param {object} line - The line item data from state.
 */
function renderLine(line) {
    const lineElement = document.importNode(lineTemplate.content, true).firstElementChild;
    lineElement.dataset.id = line.id;
    
    lineElement.querySelector('[data-field="name"]').value = line.name;
    lineElement.querySelector('[data-field="quantity"]').value = line.quantity;
    lineElement.querySelector('[data-field="price"]').value = line.price;
    lineElement.querySelector('[data-field="applyDiscount"]').checked = line.applyDiscount;
    
    invoiceLinesContainer.appendChild(lineElement);
}

/**
 * Renders all lines from the state. Used for initial setup.
 */
function renderAllLines() {
    invoiceLinesContainer.innerHTML = '';
    state.lines.forEach(renderLine);
}

// --- EVENT HANDLERS ---
function handleAddLine() {
    const newLine = createNewLine();
    state.lines.push(newLine);
    renderLine(newLine); // Append just the new line to the DOM
    updateCalculationsAndDisplay(); // Update totals
}

function handleFinalAmountChange(event) {
    state.finalAmount = parseFloat(event.target.value) || 0;
    updateCalculationsAndDisplay();
}

function handleLineItemChange(event) {
    const target = event.target;
    const lineElement = target.closest('[data-id]');
    if (!lineElement) return;

    const lineId = lineElement.dataset.id;
    
    // Handle remove button click by finding the button itself
    const removeButton = target.closest('[data-action="remove"]');
    if (removeButton && event.type === 'click') {
        if (state.lines.length > 1) {
            state.lines = state.lines.filter(line => line.id !== lineId);
            lineElement.remove(); // Remove from DOM directly
            updateCalculationsAndDisplay();
        }
        return; // Action is handled, no need to proceed
    }
    
    const field = target.dataset.field;
    // Handle input/checkbox changes
    if (field) {
        const line = state.lines.find(l => l.id === lineId);
        if (line) {
            let value;
            if (target.type === 'checkbox') {
                value = target.checked;
            } else if (target.type === 'number') {
                value = parseFloat(target.value) || 0;
            } else {
                value = target.value;
            }
            line[field] = value;
            updateCalculationsAndDisplay(); // Only update calculations, don't redraw
        }
    }
}

function handleThemeToggle() {
    const isDarkMode = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

// --- INITIALIZATION ---
function init() {
    // Attach event listeners
    addLineBtn.addEventListener('click', handleAddLine);
    finalAmountInput.addEventListener('input', handleFinalAmountChange);
    invoiceLinesContainer.addEventListener('input', handleLineItemChange);
    invoiceLinesContainer.addEventListener('click', handleLineItemChange);
    themeToggleBtn.addEventListener('click', handleThemeToggle);
    
    // Initial render
    renderAllLines();
    updateCalculationsAndDisplay();
}

// Run the app
init();
