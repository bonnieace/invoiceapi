const express = require('express');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const { uploadToS3, getS3Url } = require('./s3');
require('dotenv').config(); // Load environment variables


const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/create-invoice', async (req, res) => {
  const invoiceData = req.body;

  if (!invoiceData || !invoiceData.customerName || !invoiceData.invoiceDate || !invoiceData.items) {
    return res.status(400).json({ error: 'Missing required invoice data.' });
  }

  try {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Fonts
    doc.font('Times-Roman');

    // Add a header
    doc
      .fontSize(20)
      .text('INVOICE', { align: 'center' })
      .moveDown();

    // Company and Customer Info
    doc
      .fontSize(12)
      .text('Jamos Solutions', { align: 'left' })
      .text('P.O. Box 3158-00506 Nairobi', { align: 'left' })
      .text('Address: P.O. Box 3158-00506 Nairobi', { align: 'left' })
      .text('Till Number: 9604753', { align: 'left' })
      .moveDown()
      .text(`Customer: ${invoiceData.customerName}`, { align: 'left' })
      .moveDown()
      .text('ruchu traders', { align: 'right' })
      .text('mumbi near bahamas', { align: 'right' })
      .text('0723565126', { align: 'right' })
      .moveDown()
      .text(`Kra Number: ${invoiceData.kraNumber || 'N/A'}`, { align: 'right' })
      .text(`Invoice Date: ${invoiceData.invoiceDate}`, { align: 'right' })
      .text(`Payment Terms: ${invoiceData.paymentTerms}`, { align: 'right' })
      .text(`Due Date: ${invoiceData.dueDate}`, { align: 'right' })
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

    // Convert PDF to Buffer
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);
      try {
        const s3Response = await uploadToS3(pdfBuffer, 'invoice.pdf');
        const s3Url = getS3Url(s3Response.fileKey);
        res.json({ message: 'Invoice created and uploaded to S3', url: s3Url });
      } catch (uploadError) {
        res.status(500).json({ error: 'Failed to upload invoice to S3', details: uploadError.message });
      }
    });

    // End the document
    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice', details: error.message });
  }
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
