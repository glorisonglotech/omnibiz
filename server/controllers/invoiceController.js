const Invoice = require("../models/invoice");
const { createTransactionFromInvoice } = require("./transactionController");

// Create a new invoice - OPTIMIZED FOR SPEED
exports.createInvoice = async (req, res) => {
  try {
    // Quick validation
    if (!req.body.items || req.body.items.length === 0) {
      return res.status(400).json({ error: 'Invoice must have at least one item' });
    }

    const invoice = new Invoice({
      ...req.body,
      userId: req.user.id
    });

    // Save without waiting for population
    await invoice.save();
    
    // Return lean data immediately for speed
    res.status(201).json({ 
      message: 'Invoice created successfully', 
      invoice: {
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        paymentStatus: invoice.paymentStatus,
        createdAt: invoice.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get all invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id }).populate("userId", "name email");
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: error.message });
  }
};


// Get a single invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("userId");
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an invoice
exports.updateInvoice = async (req, res) => {
  try {
    const userId = req.user.id;
    const oldInvoice = await Invoice.findOne({ _id: req.params.id, userId });

    if (!oldInvoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("userId", "name email");

    // If payment status changed to Paid, create a transaction
    if (oldInvoice.paymentStatus !== 'Paid' && req.body.paymentStatus === 'Paid') {
      await createTransactionFromInvoice(invoice._id, userId);
    }

    res.json({ message: 'Invoice updated successfully', invoice });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(400).json({ error: error.message });
  }
};

// Mark invoice as paid
exports.markInvoiceAsPaid = async (req, res) => {
  try {
    const userId = req.user.id;
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId },
      { paymentStatus: 'Paid' },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Create transaction for the payment
    await createTransactionFromInvoice(invoice._id, userId);

    res.json({ message: 'Invoice marked as paid successfully', invoice });
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete an invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};