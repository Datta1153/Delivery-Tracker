const Shipment = require('../models/Shipment');

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
    try {
        const totalShipments = await Shipment.countDocuments();
        const deliveredShipments = await Shipment.countDocuments({ status: 'Delivered' });
        const inTransitShipments = await Shipment.countDocuments({ status: 'In Transit' });

        // Using simple stats, can be extended for more complex analytics

        // Get recent shipments
        const recentShipments = await Shipment.find()
            .sort({ createdAt: -1 })
            .limit(5);

        // Group shipments by status for Chart.js
        const statusCounts = await Shipment.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const chartData = {
            labels: statusCounts.map(s => s._id),
            data: statusCounts.map(s => s.count),
        };

        res.json({
            totalShipments,
            deliveredShipments,
            inTransitShipments,
            recentShipments,
            chartData
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching analytics' });
    }
};

module.exports = {
    getAnalytics,
};
