import Package from '../models/Package.js';

// returns counts grouped by status and optionally by date
export const getDeliveryStats = async (req, res) => {
  try {
    const match = {};
    // staff/admin can view all, customers only their own
    if (req.user.role === 'customer') {
      match.user = req.userId;
    }

    // optional date range
    const { start, end } = req.query;
    if (start || end) {
      match.createdAt = {};
      if (start) match.createdAt.$gte = new Date(start);
      if (end) match.createdAt.$lte = new Date(end);
    }

    const stats = await Package.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};