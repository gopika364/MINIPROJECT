const PDFDocument = require('pdfkit');
const fs = require('fs');
const ExcelJS = require('exceljs');
const orderCollection = require('../models/orderSchema');
const { OrderDetails } = require('./adminOrderDetails');


const salesReport = (req,res) => {
const status = 'listBanner';
res.render('admin/salesReport',{status});
}




//salesPDFReport

const salesPDFReport = async (req, res) => {
  try {
    const startDate = new Date(req.params.startDate);
    const endDate = new Date(req.params.endDate);

    const orderDetails = await orderCollection.find({
      date: {
        $gte: startDate,
        $lt: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1),
      }
    });

    
    if (orderDetails.length === 0) {
      return res.status(404).json({ message: 'No orders found for the selected date range' });
    }

    // Create a PDF stream and set response headers
    const pdfStream = new PDFDocument();
    res.setHeader('Content-Disposition', 'attachment; filename="sales_report.pdf"');
    res.setHeader('Content-Type', 'application/pdf');

    const generatePDF = () => {
      return new Promise((resolve, reject) => {
        // PDF content generation
        pdfStream.font('Helvetica-Bold').fontSize(14).text('Sales Report', { align: 'center' });
        pdfStream.moveDown();

        orderDetails.forEach(order => {
          pdfStream.font('Helvetica-Bold').fontSize(12).text(`Order ID: ${order._id}`);
          pdfStream.font('Helvetica').fontSize(12).text(`Order Date: ${order.date.toISOString().split('T')[0]}`);
          pdfStream.moveDown();

          // Customer Details
          pdfStream.font('Helvetica').fontSize(12).text(`Customer Name: ${order.userEmail}`);
          pdfStream.text(`Address: ${order.address}`);
          pdfStream.moveDown();

          // Order Details
          pdfStream.font('Helvetica-Bold').fontSize(12).text('Order Details');
          order.orderItems.forEach(item => {
            pdfStream.font('Helvetica').fontSize(12).text(`Product Name: ${item.productName}`);
            pdfStream.text(`Quantity: ${item.quantity}`);
            pdfStream.text(`Price per unit: ${item.price}`);
            pdfStream.text(`Total: ${item.totalPrice}`);
            pdfStream.moveDown();
          });

          // Grand Total
          pdfStream.font('Helvetica-Bold').fontSize(12).text(`Grand Total: ${order.grandTotal}`);

          pdfStream.moveDown();
          pdfStream.font('Helvetica').text('---------------------------------------');
        });

        pdfStream.moveDown();
        pdfStream.font('Helvetica').text('Thank you for your business!');
        
        // Finish the PDF stream and resolve the Promise
        pdfStream.end();
        pdfStream.pipe(res);
        pdfStream.on('finish', () => resolve());
    });
};


// Call the function and send the response when the PDF is generated
await generatePDF();
   

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


//Excel
const generateExcelReport = async (res, data) => {
  try {
    if (data.length === 0) {
      return res.status(404).json({ message: 'No data available for the report' });
    }

    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    // Add column headers
    worksheet.addRow([
      'Order ID',
      'Order Date',
      'Customer Name',
      'Address',
      'Product Name',
      'Quantity',
      'Price per unit',
      'Total',
      'Grand Total',
    ]);

    // Add data rows
    data.forEach((item) => {
      worksheet.addRow([
        item.orderId,
        item.orderDate,
        item.customerName,
        item.address,
        item.productName,
        item.quantity,
        item.price,
        item.totalPrice,
        item.grandTotal,
      ]);
    });

    // Set response headers for Excel download
    res.setHeader('Content-Disposition', 'attachment; filename="sales_report.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Write the Excel workbook to the response
    await workbook.xlsx.write(res);

    // End the response
    res.end();
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const salesExcelReport = async (req, res) => {
  try {
    const startDate = new Date(req.params.startDate);
    const endDate = new Date(req.params.endDate);

    const orderDetails = await orderCollection.find({
      date: {
        $gte: startDate,
        $lt: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1),
      },
    });

    const reportData = [];

    orderDetails.forEach((order) => {
      order.orderItems.forEach((item) => {
        reportData.push({
          orderId: order._id,
          orderDate: order.date.toISOString().split('T')[0],
          customerName: order.userEmail,
          address: order.address,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.totalPrice,
          grandTotal: order.grandTotal,
        });
      });
    });

    await generateExcelReport(res, reportData);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

  

module.exports = {salesPDFReport,salesReport,salesExcelReport}


