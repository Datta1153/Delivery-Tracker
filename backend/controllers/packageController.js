import Package from '../models/Package.js';
import StatusUpdate from '../models/StatusUpdate.js';
import { validationResult } from 'express-validator';
import { generateTrackingNumber } from '../utils/generateTrackingNumber.js';
import { sendEmail } from '../utils/sendEmail.js';
import { emailTemplates } from '../utils/emailTemplates.js';

// helper for pagination
const getPaginated = async (model, query, { page = 1, limit = 20, sort = { createdAt: -1 } }) => {
  const skip = (page - 1) * limit;
  const docs = await model.find(query).sort(sort).skip(skip).limit(limit);
  const total = await model.countDocuments(query);
  return { docs, total };
};

const createPackage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const fieldErrors = {};
    errors.array().forEach(error => {
      fieldErrors[error.param] = error.msg;
    });
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors: fieldErrors 
    });
  }

  try {
    let {
      trackingNumber,
      senderName,
      senderAddress,
      recipientName,
      recipientAddress,
      description,
      weight,
      estimatedDelivery,
    } = req.body;

    // generate number if not provided
    if (!trackingNumber) {
      trackingNumber = await generateTrackingNumber();
    }

    let pkg = await Package.findOne({ trackingNumber });
    if (pkg) {
      return res
        .status(400)
        .json({ success: false, message: 'Package with this tracking number already exists' });
    }

    pkg = new Package({
      trackingNumber,
      user: req.userId,
      senderName,
      senderAddress,
      recipientName,
      recipientAddress,
      description,
      weight,
      estimatedDelivery,
      status: 'pending',
      createdBy: req.userId,
      updatedBy: req.userId,
    });

    await pkg.save();

    // Send package created notification email
    try {
      const owner = await pkg.populate('user');
      if (owner.user && owner.user.email) {
        const appUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const trackingUrl = `${appUrl}/track`;
        const emailTemplate = emailTemplates.packageCreatedEmail(
          pkg.trackingNumber,
          senderName,
          recipientName,
          estimatedDelivery || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          trackingUrl
        );
        await sendEmail({
          to: owner.user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        });
      }
    } catch (mailErr) {
      console.error('Failed to send package creation email:', mailErr);
    }

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      package: pkg,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPackages = async (req, res) => {
  try {
    // pagination, search and filters
    const { page = 1, limit = 20, status, q, sort } = req.query;
    const query = {};

    // customers only see own packages; staff/admin can view all
    if (req.user.role === 'customer') {
      query.user = req.userId;
    }

    if (status) query.status = status;
    if (q) {
      const regex = new RegExp(q, 'i');
      query.$or = [
        { trackingNumber: regex },
        { recipientName: regex },
        { senderName: regex },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'name_asc') sortOption = { recipientName: 1 };
    if (sort === 'name_desc') sortOption = { recipientName: -1 };

    const { docs: packages, total } = await getPaginated(Package, query, {
      page: Number(page),
      limit: Number(limit),
      sort: sortOption,
    });

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      packages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    if (pkg.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this package' });
    }

    const statusUpdates = await StatusUpdate.find({ package: pkg._id }).sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      package: pkg,
      statusUpdates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePackageStatus = async (req, res) => {
  try {
    const { status, location, notes, lat, lng } = req.body;

    // helper to produce pseudo-random coordinate near previous
    const randomOffset = () => (Math.random() - 0.5) * 0.01; // ~1km

    let pkg = await Package.findById(req.params.id);

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    if (pkg.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this package' });
    }

    // Create status update record
    const statusUpdateData = {
      package: pkg._id,
      status,
      location,
      notes,
      createdBy: req.userId,
      updatedBy: req.userId,
    };
    if (lat && lng) {
      statusUpdateData.coords = { lat: Number(lat), lng: Number(lng) };
      pkg.coords = { lat: Number(lat), lng: Number(lng) };
    } else {
      // simulate coords if none provided
      let baseLat = pkg.coords?.lat || 40.7128;
      let baseLng = pkg.coords?.lng || -74.0060;
      const simLat = baseLat + randomOffset();
      const simLng = baseLng + randomOffset();
      statusUpdateData.coords = { lat: simLat, lng: simLng };
      pkg.coords = { lat: simLat, lng: simLng };
    }
    if (req.file) {
      statusUpdateData.proofUrl = `/uploads/${req.file.filename}`;
    }
    const statusUpdate = new StatusUpdate(statusUpdateData);

    await statusUpdate.save();

    // Update package
    pkg.status = status;
    pkg.currentLocation = location;
    pkg.updatedBy = req.userId;

    // basic ETA prediction: if there is an estimatedDelivery use it, else add 2 days
    if (!pkg.eta && pkg.estimatedDelivery) {
      pkg.eta = pkg.estimatedDelivery;
    }
    if (!pkg.eta) {
      const twoDays = 2 * 24 * 60 * 60 * 1000;
      pkg.eta = new Date(Date.now() + twoDays);
    }

    if (status === 'delivered') {
      pkg.deliveryDate = new Date();
      pkg.eta = pkg.deliveryDate;
    }

    await pkg.save();

    // send notification email to owner of package if they have an email
    try {
      const owner = await pkg.populate('user');
      if (owner.user && owner.user.email) {
        const appUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const trackingUrl = `${appUrl}/track`;
        let emailTemplate;

        if (status === 'delivered') {
          emailTemplate = emailTemplates.deliveryCompletedEmail(
            pkg.trackingNumber,
            pkg.recipientName,
            trackingUrl
          );
        } else if (status === 'failed') {
          emailTemplate = emailTemplates.deliveryFailedEmail(
            pkg.trackingNumber,
            notes || 'Delivery attempt unsuccessful',
            trackingUrl
          );
        } else {
          emailTemplate = emailTemplates.packageStatusUpdateEmail(
            pkg.trackingNumber,
            status,
            location,
            trackingUrl
          );
        }

        await sendEmail({
          to: owner.user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        });
      }
    } catch (mailErr) {
      console.error('Failed to send notification email', mailErr);
    }

    res.status(200).json({
      success: true,
      message: 'Package status updated successfully',
      package: pkg,
      statusUpdate,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePackage = async (req, res) => {
  try {
    let pkg = await Package.findById(req.params.id);

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    // Allow deletion if user is admin OR if they're the package owner
    if (req.user.role !== 'admin' && pkg.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this package' });
    }

    await Package.findByIdAndDelete(req.params.id);
    await StatusUpdate.deleteMany({ package: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Package deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createPackage, getPackages, getPackageById, updatePackageStatus, deletePackage };
