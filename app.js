document.getElementById('invoice-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = {
        customerName: document.getElementById('customerName').value,
        kraNumber: document.getElementById('kraNumber').value,
        invoiceDate: document.getElementById('invoiceDate').value,
        paymentTerms: document.getElementById('paymentTerms').value,
        dueDate: document.getElementById('dueDate').value,
        items: JSON.parse(document.getElementById('items').value),
        netTotal: document.getElementById('netTotal').value,
        totalAmountDue: document.getElementById('totalAmountDue').value
    };

    try {
        const response = await fetch('http://localhost:3000/create-invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        const responseDiv = document.getElementById('response');

        if (response.ok) {
            responseDiv.className = 'alert success';
            responseDiv.innerHTML = `<p>Invoice created successfully. <a href="${result.url}">Download Invoice</a></p>`;
        } else {
            responseDiv.className = 'alert error';
            responseDiv.innerHTML = `<p>Error: ${result.error}</p>`;
        }
    } catch (error) {
        const responseDiv = document.getElementById('response');
        responseDiv.className = 'alert error';
        responseDiv.innerHTML = `<p>Error: ${error.message}</p>`;
    }

    document.getElementById('response').style.display = 'block';
});
