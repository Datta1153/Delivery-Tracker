const Shipment = require('../models/Shipment');
const TrackingEvent = require('../models/TrackingEvent');
const { SHIPMENT_STATUSES } = require('../models/Shipment');
const { generateTrackingId, generateBarcode } = require('../utils/generator');
const sendEmail = require('../utils/mailer');

// @desc    Create a new shipment
// @route   POST /api/shipments
// @access  Private/Admin
const createShipment = async (req, res) => {
    try {
        const {
            senderName,
            receiverName,
            originAddress,
            destinationAddress,
            packageWeight,
            customerEmail
        } = req.body;

        // Generate unique Tracking ID & Barcode
        let isUnique = false;
        let newTrackingId = '';
        while (!isUnique) {
            newTrackingId = generateTrackingId();
            const existing = await Shipment.findOne({ trackingId: newTrackingId });
            if (!existing) isUnique = true;
        }

        let barcodeUrl = '';
        try {
            barcodeUrl = await generateBarcode(newTrackingId);
        } catch (barcodeErr) {
            console.error('Barcode generation failed (non-fatal):', barcodeErr.message);
        }

        const shipment = new Shipment({
            trackingId: newTrackingId,
            barcode: barcodeUrl,
            senderName,
            receiverName,
            originAddress,
            destinationAddress,
            packageWeight,
            customerEmail,
            createdBy: req.user._id,
            status: 'Pending'
        });

        const createdShipment = await shipment.save();

        // Create initial tracking event
        await TrackingEvent.create({
            shipment: createdShipment._id,
            status: 'Pending',
            location: originAddress,
            description: 'Shipment order has been created in the system.',
            updatedBy: req.user._id
        });

        // Send email notification (fire-and-forget — never blocks the response)
        setImmediate(() => {
            try {
                const emailMessage = "<h2>Your Order Has Been Created!</h2>" +
                    "<p>Hello " + receiverName + ",</p>" +
                    "<p>Your package from <strong>" + senderName + "</strong> has been registered in our system and is awaiting pickup.</p>" +
                    "<br/>" +
                    "<p>You can track your package live using this Tracking ID: <strong>" + newTrackingId + "</strong></p>" +
                    "<p>Stay tuned for more updates!</p>";

                sendEmail({
                    email: customerEmail,
                    subject: "Logistiq - Order Created (" + newTrackingId + ")",
                    html: emailMessage
                }).catch(emailErr => console.error('Failed to send Order Created email:', emailErr));
            } catch (emailErr) {
                console.error('Failed to format Order Created email:', emailErr);
            }
        });

        res.status(201).json(createdShipment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating shipment' });
    }
};

// @desc    Get all shipments (with filtering & pagination)
// @route   GET /api/shipments
// @access  Private
const getShipments = async (req, res) => {
    try {
        const pageSize = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;

        // Customers only see their own shipments
        const query = {};
        if (req.user.role === 'CUSTOMER') {
            query.customerEmail = req.user.email;
        }

        if (req.query.status) {
            query.status = req.query.status;
        }

        const searchKeyword = req.query.keyword ? {
            trackingId: {
                $regex: req.query.keyword,
                $options: 'i',
            },
        } : {};

        const count = await Shipment.countDocuments({ ...query, ...searchKeyword });
        const shipments = await Shipment.find({ ...query, ...searchKeyword })
            .populate('createdBy', 'name email')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ createdAt: -1 });

        res.json({ shipments, page, pages: Math.ceil(count / pageSize), total: count });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching shipments' });
    }
};

// @desc    Get single shipment by tracking ID
// @route   GET /api/shipments/:trackingId
// @access  Public
const getShipmentByTrackingId = async (req, res) => {
    try {
        const shipment = await Shipment.findOne({ trackingId: req.params.trackingId })
            .populate('createdBy', 'name email');

        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        const events = await TrackingEvent.find({ shipment: shipment._id }).sort({ createdAt: 1 });

        res.json({ shipment, events });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching shipment' });
    }
};

// @desc    Update shipment status
// @route   PUT /api/shipments/status
// @access  Private
const updateShipmentStatus = async (req, res) => {
    try {
        const { trackingId, status, location, description, proofOfDelivery } = req.body;

        const shipment = await Shipment.findOne({ trackingId });

        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }



        // Strict Workflow Validation
        const currentStatusIndex = SHIPMENT_STATUSES.indexOf(shipment.status);
        const newStatusIndex = SHIPMENT_STATUSES.indexOf(status);

        if (newStatusIndex === -1) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        if (newStatusIndex !== currentStatusIndex + 1 && newStatusIndex !== currentStatusIndex) {
            return res.status(400).json({
                message: `Invalid status transition from ${shipment.status} to ${status}.Packages must proceed step - by - step.`
            });
        }

        shipment.status = status;
        if (proofOfDelivery) {
            shipment.proofOfDelivery = proofOfDelivery;
        }

        await shipment.save();

        const event = await TrackingEvent.create({
            shipment: shipment._id,
            status,
            location: location || '',
            description: description || `Status updated to ${status}`,
            updatedBy: req.user._id
        });

        // Emit real-time socket event
        if (req.io) {
            req.io.to(trackingId).emit('status_update', { shipment, event });
        }

        // Send Email Notification (fire-and-forget — never blocks the response)
        setImmediate(() => {
            try {
                let emailMessage = "<h2>Delivery Update: " + status + "</h2>" +
                    "<p>Hello,</p>" +
                    "<p>The status of your package (Tracking ID: <strong>" + trackingId + "</strong>) has been updated.</p>" +
                    "<p><strong>New Status:</strong> <span style=\"color: #2563eb;\">" + status + "</span></p>";

                if (location) {
                    emailMessage += "<p><strong>Current Location:</strong> " + location + "</p>";
                }
                if (description) {
                    emailMessage += "<p><strong>Notes:</strong> " + description + "</p>";
                }

                emailMessage += "<br/><p>Thank you for using Logistiq.</p>";

                sendEmail({
                    email: shipment.customerEmail,
                    subject: "Logistiq Update: " + trackingId + " is " + status,
                    html: emailMessage
                }).catch(emailErr => console.error('Failed to send Status Update email:', emailErr));
            } catch (emailErr) {
                console.error('Failed to format Status Update email:', emailErr);
            }
        });

        res.json(shipment);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating status' });
    }
};

// @desc    Delete shipment
// @route   DELETE /api/shipments/:id
// @access  Private/Admin
const deleteShipment = async (req, res) => {
    console.log(`[DELETE] Request received for shipment ID: ${req.params.id} `);
    try {
        const shipment = await Shipment.findById(req.params.id);

        if (!shipment) {
            console.log(`[DELETE] Shipment not found for ID: ${req.params.id} `);
            return res.status(404).json({ message: 'Shipment not found' });
        }

        await TrackingEvent.deleteMany({ shipment: shipment._id });
        await Shipment.deleteOne({ _id: shipment._id });

        res.json({ message: 'Shipment removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting shipment' });
    }
};

module.exports = {
    createShipment,
    getShipments,
    getShipmentByTrackingId,
    updateShipmentStatus,
    deleteShipment
};
