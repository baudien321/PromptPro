import { withAuth } from '../../../lib/auth';
import connectDB from '../../../lib/mongoose';
import AuditLog from '../../../models/auditLog';
import User from '../../../models/user'; // To populate user details
import mongoose from 'mongoose';

// Define how many logs per page
const LOGS_PER_PAGE = 50;

async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).end('Method Not Allowed');
    }

    // --- Authorization Check: Ensure user is an admin --- 
    // Note: Relies on the 'role' being correctly populated in the session by NextAuth
    if (!req.session?.role || req.session.role !== 'admin') {
        console.warn(`Unauthorized audit log access attempt by user: ${req.session?.sub}`);
        return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }

    const adminUserId = req.session.sub; // Logged-in admin user

    // --- Pagination --- 
    const page = parseInt(req.query.page || '1', 10);
    const limit = LOGS_PER_PAGE;
    const skip = (page - 1) * limit;

    try {
        await connectDB();

        // Fetch total count for pagination
        const totalLogs = await AuditLog.countDocuments();
        const totalPages = Math.ceil(totalLogs / limit);

        // Fetch paginated logs, newest first, populate user details
        const auditLogs = await AuditLog.find()
            .sort({ timestamp: -1 }) // Sort by timestamp descending
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name email username') // Populate user fields
            .lean(); // Use lean for performance if not modifying docs

        // Return data with pagination info
        return res.status(200).json({
            logs: auditLogs,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalLogs: totalLogs,
                logsPerPage: limit
            }
        });

    } catch (error) {
        console.error(`Error fetching audit logs for admin ${adminUserId}:`, error);
        return res.status(500).json({ message: 'Internal server error fetching audit logs.' });
    }
}

// Wrap with authentication - ensures user is logged in
// The internal check verifies the 'admin' role
export default withAuth(handler); 