// controllers/paymentController.js - ONLY logic & responses
const PaymentModel = require('../models/paymentModel');

const getApplicationsForPayment = async (req, res) => {
    try {
        const applications = await PaymentModel.getApplicationsForPayment();

        res.json({
            success: true,
            count: applications.length,
            applications
        });

    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch applications'
        });
    }
};

const createPaymentRecord = async (req, res) => {
    try {
        const { 
            applicationId, 
            schemeId, 
            totalAmount, 
            notes,
            isCustomPayment,
            uponEnrollment,
            installmentCount,
            installmentAmount
        } = req.body;

        if (!applicationId || !totalAmount) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Application ID and total amount are required'
            });
        }

        const exists = await PaymentModel.checkPaymentExists(applicationId);

        if (exists) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Payment record already exists for this application'
            });
        }

        const result = await PaymentModel.createPaymentRecord({
            applicationId,
            schemeId,
            totalAmount,
            uponEnrollment,
            installmentCount,
            installmentAmount,
            isCustomPayment: isCustomPayment || false,
            notes,
            userId: req.user.userId
        });

        await PaymentModel.linkPaymentToApplication(applicationId, result.insertId);

        res.status(201).json({
            success: true,
            message: 'Payment record created and sent to cashier',
            paymentRecordId: result.insertId
        });

    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to create payment record'
        });
    }
};


const getPaymentSchemes = async (req, res) => {
    try {
        const schemes = await PaymentModel.getPaymentSchemes();

        res.json({
            success: true,
            schemes
        });

    } catch (error) {
        console.error('Get schemes error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch payment schemes'
        });
    }
};

const createPaymentScheme = async (req, res) => {
    try {
        const { 
            schemeName, 
            schoolLevel, 
            gradeLevel, 
            totalAmount, 
            uponEnrollment,      // Match this
            installmentCount,
            installmentAmount,
            cashDiscount,
            description
        } = req.body;

        if (!schemeName || !schoolLevel || !totalAmount) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Scheme name, school level, and total amount are required'
            });
        }

        const result = await PaymentModel.createPaymentScheme({
            schemeName,
            schoolLevel,
            gradeLevel,
            totalAmount,
            uponEnrollment: uponEnrollment || 0,    // Pass it here
            installmentCount,
            installmentAmount,
            cashDiscount: cashDiscount || 0,
            description
        });

        res.status(201).json({
            success: true,
            message: 'Payment scheme created successfully',
            schemeId: result.insertId
        });

    } catch (error) {
        console.error('Create scheme error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to create payment scheme'
        });
    }
};

const getPaymentStatistics = async (req, res) => {
    try {
        const statistics = await PaymentModel.getPaymentStatistics();

        res.json({
            success: true,
            statistics
        });

    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch statistics'
        });
    }
};

const getPendingPayments = async (req, res) => {
    try {
        const payments = await PaymentModel.getPendingPayments();

        res.json({
            success: true,
            count: payments.length,
            payments
        });

    } catch (error) {
        console.error('Get pending payments error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch pending payments'
        });
    }
};

const recordPayment = async (req, res) => {
    try {
        const { paymentRecordId, amount, paymentMethod, referenceNumber, notes } = req.body;

        if (!paymentRecordId || !amount || !paymentMethod) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Payment record ID, amount, and payment method are required'
            });
        }

        const payment = await PaymentModel.getPaymentById(paymentRecordId);

        if (!payment) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Payment record not found'
            });
        }

        const newAmountPaid = parseFloat(payment.amount_paid || 0) + parseFloat(amount);
        const totalAmount = parseFloat(payment.total_amount);

        let newStatus;
        if (newAmountPaid >= totalAmount) {
            newStatus = 'paid';
        } else if (newAmountPaid > 0) {
            newStatus = 'partial';
        } else {
            newStatus = 'pending';
        }

        // Record transaction
        await PaymentModel.recordPaymentTransaction({
            paymentRecordId,
            amount,
            paymentMethod,
            referenceNumber,
            userId: req.user.userId
        });

        // Update payment record
        await PaymentModel.updatePaymentRecord(paymentRecordId, newAmountPaid, newStatus);

        // DON'T automatically enroll - let cashier send to accounting manually
        res.json({
            success: true,
            message: 'Payment recorded successfully',
            newStatus,
            amountPaid: newAmountPaid
        });

    } catch (error) {
        console.error('Record payment error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to record payment'
        });
    }
};


const getPaymentHistory = async (req, res) => {
    try {
        const { paymentRecordId } = req.params;

        const transactions = await PaymentModel.getPaymentHistory(paymentRecordId);

        res.json({
            success: true,
            transactions
        });

    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch payment history'
        });
    }
};

// Send student to accounting after initial payment
const sendToAccounting = async (req, res) => {
    const { paymentRecordId } = req.body;
    
    if (!paymentRecordId) {
        return res.status(400).json({ 
            success: false, 
            message: 'Payment record ID is required' 
        });
    }
    
    try {
        const payment = await PaymentModel.getPaymentById(paymentRecordId);
        
        if (!payment) {
            return res.status(404).json({ 
                success: false, 
                message: 'Payment record not found' 
            });
        }
        
        const amountPaid = parseFloat(payment.amount_paid);
        const totalAmount = parseFloat(payment.total_amount);
        const downPayment = parseFloat(payment.upon_enrollment || 0);
        const installmentCount = parseInt(payment.installment_count || 1);
        
        // Determine required amount
        let requiredAmount = downPayment;
        let paymentType = 'installment';
        
        // Cash payment scheme - require full payment
        if (installmentCount === 1 && downPayment === 0) {
            paymentType = 'cash';
            requiredAmount = totalAmount;
        }
        
        // Validate minimum payment
        if (amountPaid < requiredAmount) {
            const message = paymentType === 'cash'
                ? `Full payment required for cash scheme. Required: ₱${totalAmount.toFixed(2)}, Paid: ₱${amountPaid.toFixed(2)}`
                : `Minimum payment not met. Required: ₱${requiredAmount.toFixed(2)}, Paid: ₱${amountPaid.toFixed(2)}`;
                
            return res.status(400).json({ 
                success: false, 
                message 
            });
        }
        
        // Update status to 'processing' so accounting can see it
        await PaymentModel.updatePaymentStatus(paymentRecordId, 'processing');
        
        res.json({ 
            success: true, 
            message: 'Student sent to accounting successfully' 
        });
        
    } catch (error) {
        console.error('Send to accounting error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send to accounting' 
        });
    }
};

const getProcessingStudents = async (req, res) => {
    try {
        const students = await PaymentModel.getProcessingStudents();

        res.json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error('Get processing students error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch processing students'
        });
    }
};

const enrollStudent = async (req, res) => {
    const { paymentRecordId } = req.body;
    
    try {
        const payment = await PaymentModel.getPaymentById(paymentRecordId);
        
        if (!payment) {
            return res.status(404).json({ 
                success: false, 
                message: 'Payment record not found' 
            });
        }

        const app = await PaymentModel.getApplicationById(payment.application_id);
        
        // Generate student number
        const year = new Date().getFullYear();
        const lastStudent = await PaymentModel.getLastStudentNumber();
        
        let studentNumber;
        if (lastStudent) {
            const lastNum = parseInt(lastStudent.student_number.split('-')[1]);
            studentNumber = `${year}-${String(lastNum + 1).padStart(6, '0')}`;
        } else {
            studentNumber = `${year}-000001`;
        }

        // Create student record
        await PaymentModel.createStudent({
            studentNumber,
            applicationId: payment.application_id,  // ADD THIS LINE
            first_name: app.first_name,
            middle_name: app.middle_name,
            last_name: app.last_name,
            suffix: app.suffix,
            date_of_birth: app.date_of_birth,
            gender: app.gender,
            email: app.email,
            phone_number: app.phone_number,
            address_line1: app.street,
            address_line2: app.barangay,
            city: app.city,
            province: app.province,
            zip_code: app.zip_code,  // Note: your DB column is 'zipcode' not 'zip_code'
            guardian_name: app.guardian_name,
            guardian_relationship: app.guardian_relationship,
            guardian_phone: app.guardian_phone,
            guardian_email: app.guardian_email,
            school_level: app.school_level,
            grade_level: app.grade_level,
            strand: app.strand
        });


        // Update admission to enrolled
        await PaymentModel.updateAdmissionToEnrolled(payment.application_id);
        
        // Update payment status
        await PaymentModel.updatePaymentStatus(paymentRecordId, 'completed');

        console.log(`✅ Student enrolled: ${studentNumber} - ${app.first_name} ${app.last_name}`);

        res.json({ 
            success: true, 
            message: 'Student enrolled successfully',
            studentNumber
        });
        
    } catch (error) {
        console.error('Enroll student error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to enroll student' 
        });
    }
};

const getStudentDetails = async (req, res) => {
    const { paymentRecordId } = req.params;
    
    try {
        const student = await PaymentModel.getStudentDetails(paymentRecordId);
        
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student not found' 
            });
        }

        res.json({ 
            success: true, 
            student 
        });
        
    } catch (error) {
        console.error('Get student details error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch student details' 
        });
    }
};

// In paymentController.js
const markSentToCashier = async (req, res) => {
  const { applicationId } = req.body;
  if (!applicationId) {
    return res.status(400).json({ success: false, message: 'Application ID required' });
  }
  try {
    await PaymentModel.markSentToCashier(applicationId);
    res.json({ success: true, message: 'Application sent to cashier' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send to cashier' });
  }
};

// Update payment scheme
const updatePaymentScheme = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            schemeName,
            schoolLevel,
            gradeLevel,
            totalAmount,
            uponEnrollment,
            installmentCount,
            installmentAmount,
            cashDiscount,
            description
        } = req.body;

        if (!schemeName || !schoolLevel || !totalAmount) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Scheme name, school level, and total amount are required'
            });
        }

        const affectedRows = await PaymentModel.updatePaymentScheme(id, {
            schemeName,
            schoolLevel,
            gradeLevel,
            totalAmount,
            uponEnrollment,
            installmentCount,
            installmentAmount,
            cashDiscount,
            description
        });

        if (affectedRows === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Payment scheme not found'
            });
        }

        res.json({
            success: true,
            message: 'Payment scheme updated successfully'
        });

    } catch (error) {
        console.error('Update scheme error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to update payment scheme'
        });
    }
};

// Delete payment scheme
const deletePaymentScheme = async (req, res) => {
    try {
        const { id } = req.params;

        const affectedRows = await PaymentModel.deletePaymentScheme(id);

        if (affectedRows === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Payment scheme not found'
            });
        }

        res.json({
            success: true,
            message: 'Payment scheme deleted successfully'
        });

    } catch (error) {
        console.error('Delete scheme error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to delete payment scheme'
        });
    }
};

const getSchemeDetails = async (req, res) => {
    const { paymentRecordId } = req.params;
    
    try {
        const scheme = await PaymentModel.getSchemeDetailsByPaymentRecord(paymentRecordId);
        
        if (!scheme) {
            return res.status(404).json({ 
                success: false, 
                message: 'Payment record not found' 
            });
        }
        
        res.json({ 
            success: true, 
            scheme 
        });
    } catch (error) {
        console.error('Get scheme details error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch scheme details' 
        });
    }
};

const voidTransaction = async (req, res) => {
    const { transactionId } = req.params;
    
    try {
        // Get transaction details
        const transaction = await PaymentModel.getTransactionById(transactionId);
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        // Get payment record
        const payment = await PaymentModel.getPaymentById(transaction.payment_record_id);
        
        // Calculate new amount paid
        const newAmountPaid = parseFloat(payment.amount_paid) - parseFloat(transaction.amount);
        const totalAmount = parseFloat(payment.total_amount);
        
        // Determine new status
        let newStatus;
        if (newAmountPaid >= totalAmount) {
            newStatus = 'paid';
        } else if (newAmountPaid > 0) {
            newStatus = 'partial';
        } else {
            newStatus = 'pending';
        }
        
        // Delete transaction
        await PaymentModel.deleteTransaction(transactionId);
        
        // Update payment record
        await PaymentModel.updatePaymentRecord(transaction.payment_record_id, newAmountPaid, newStatus);
        
        res.json({
            success: true,
            message: 'Transaction voided successfully'
        });
        
    } catch (error) {
        console.error('Void transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to void transaction'
        });
    }
};


module.exports = {
    getApplicationsForPayment,
    createPaymentRecord,
    getPaymentSchemes,
    createPaymentScheme,
    getPaymentStatistics,
    getPendingPayments,
    recordPayment,
    getPaymentHistory,
    sendToAccounting,
    getProcessingStudents,  // ADD THIS
    enrollStudent,           // ADD THIS
    getStudentDetails,
    markSentToCashier,
    updatePaymentScheme,
    deletePaymentScheme,
    getSchemeDetails,
    voidTransaction  // ADD THIS
};