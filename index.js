const express = require('express');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/create-invoice', (req, res) => {
  const invoiceData = req.body;
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const fileName = `invoice-${Date.now()}.pdf`;
  const filePath = path.join(__dirname, fileName);

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Add a header
  doc
    .fontSize(20)
    .text('INVOICE', { align: 'center' })
    .moveDown();

  // Company and Customer Info
  doc
    .fontSize(12)
    .text('Address: P.O. Box 3158-00506 Nairobi', { align: 'left' })
    .text('Till Number: 9604753', { align: 'left' })
    .moveDown()
    .text('Jamos Solutions', { align: 'left' })
    .text('P.O. Box 3158-00506 Nairobi', { align: 'left' })
    .text(`Customer: ${invoiceData.customerName}`, { align: 'left' })
    .moveDown()
    .text('ruchu traders', { align: 'right' })
    .text('mumbi near bahamas', { align: 'right' })
    .text('0723565126', { align: 'right' })
    .moveDown()
    .text(`Kra Number: `, { align: 'right' })
    .text(`Invoice Date: ${invoiceData.invoiceDate}`, { align: 'right' })
    .text(`Payment Terms: ${invoiceData.paymentTerms}`, { align: 'right' })
    .text(`Due Date: ${invoiceData.dueDate}`, { align: 'right' })
    .moveDown();

  // Invoice Title
  doc
    .fontSize(20)
    .text('INVOICE', { align: 'center' })
    .moveDown();

  // Thank You Note
  doc
    .fontSize(12)
    .text('Thank you for shopping with us', { align: 'center' })
    .moveDown();

  // Table Headers
  const tableTop = doc.y;
  const itemDescriptions = ["Description", "Date", "Quantity", "Unit Price", "Total"];
  const itemOffsets = [50, 200, 300, 400, 500];

  itemDescriptions.forEach((desc, i) => {
    doc.fontSize(12).text(desc, itemOffsets[i], tableTop, { width: 100, align: 'left' });
  });

  doc.moveDown();
  drawLine(doc, tableTop + 15);

  // Table Content
  let tableY = tableTop + 30;

  invoiceData.items.forEach(item => {
    doc.fontSize(12)
      .text(item.description, 50, tableY, { width: 150, align: 'left' })
      .text(item.date, 200, tableY, { width: 100, align: 'left' })
      .text(item.quantity, 300, tableY, { width: 100, align: 'left' })
      .text(`ksh ${item.unitPrice}`, 400, tableY, { width: 100, align: 'left' })
      .text(`ksh ${item.total}`, 500, tableY, { width: 100, align: 'left' });

    tableY += 20;
  });

  drawLine(doc, tableY + 5);

  // Net Total
  doc.fontSize(12).text(`Net total: ksh ${invoiceData.netTotal}`, 400, tableY + 10, { align: 'left' });

  // Total Amount Due
  doc.fontSize(11).text(`Total amount due: ksh ${invoiceData.totalAmountDue}`, 400, tableY + 25, { align: 'left' });

  // Footer

  doc.end();

  stream.on('finish', () => {
    res.json({ message: 'Invoice created', path: filePath });
  });

  stream.on('error', (err) => {
    res.status(500).json({ error: err.message });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Helper function to draw a line
function drawLine(doc, y) {
  doc.moveTo(50, y)
     .lineTo(550, y)
     .stroke();
}
