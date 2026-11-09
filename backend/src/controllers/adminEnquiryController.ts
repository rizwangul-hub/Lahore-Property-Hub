import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Enquiry, EnquiryStatus } from '../models/Enquiry.js';
import { AuditLog } from '../models/AuditLog.js';

/**
 * GET /api/admin/enquiries
 * Retrieves paginated, filterable property lead enquiries for authenticated admins.
 */
export const getAdminEnquiries = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 15));
    const skip = (page - 1) * limit;

    const { status, search, startDate, endDate, sort } = req.query;

    const filter: Record<string, any> = {};

    // Filter by status if not "ALL"
    if (status && status !== 'ALL') {
      filter.status = status;
    }

    // Filter out spam records by default unless requested
    if (req.query.includeSpam !== 'true') {
      filter.isSpam = false;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Search by customer name, phone, or property title
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const term = search.trim();
      filter.$or = [
        { customerName: { $regex: term, $options: 'i' } },
        { customerPhone: { $regex: term, $options: 'i' } },
        { customerEmail: { $regex: term, $options: 'i' } },
        { propertyTitle: { $regex: term, $options: 'i' } },
        { propertyReferenceId: { $regex: term, $options: 'i' } },
      ];
    }

    // Sort order
    let sortOption: Record<string, any> = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const [enquiries, total] = await Promise.all([
      Enquiry.find(filter)
        .populate('propertyId', 'title slug referenceId price location images status')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Enquiry.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        enquiries,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/enquiries/:id
 * Retrieves full details of a single enquiry.
 */
export const getAdminEnquiryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid enquiry ID' });
      return;
    }

    const enquiry = await Enquiry.findById(id).populate(
      'propertyId',
      'title slug referenceId price location images status contactInfo'
    );

    if (!enquiry) {
      res.status(404).json({ success: false, message: 'Enquiry not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: { enquiry },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/enquiries/:id/status
 * Updates enquiry status (NEW, CONTACTED, FOLLOW_UP, CONVERTED, CLOSED).
 */
export const updateEnquiryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses: EnquiryStatus[] = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED', 'CLOSED'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      res.status(404).json({ success: false, message: 'Enquiry not found' });
      return;
    }

    const oldStatus = enquiry.status;
    enquiry.status = status;
    await enquiry.save();

    // Record Audit Log
    if (req.admin) {
      try {
        await AuditLog.create({
          adminId: req.admin.id,
          adminEmail: req.admin.email,
          action: 'STATUS_CHANGE',
          propertyTitle: enquiry.propertyTitle,
          details: `Enquiry (${enquiry._id}) status changed from ${oldStatus} to ${status}`,
          ipAddress: req.ip || '',
          timestamp: new Date(),
        });
      } catch (logErr) {
        console.warn('[AuditLog] Failed to record enquiry status change:', logErr);
      }
    }

    res.status(200).json({
      success: true,
      message: `Enquiry status updated to ${status}`,
      data: { enquiry },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/enquiries/:id/notes
 * Updates internal administrator notes for an enquiry.
 */
export const updateEnquiryNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (typeof notes !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Notes must be a string value',
      });
      return;
    }

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      res.status(404).json({ success: false, message: 'Enquiry not found' });
      return;
    }

    enquiry.adminNotes = notes.trim();
    await enquiry.save();

    res.status(200).json({
      success: true,
      message: 'Administrative notes saved successfully',
      data: { enquiry },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/enquiries/:id
 * Removes an enquiry record.
 */
export const deleteEnquiry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const enquiry = await Enquiry.findByIdAndDelete(id);
    if (!enquiry) {
      res.status(404).json({ success: false, message: 'Enquiry not found' });
      return;
    }

    if (req.admin) {
      try {
        await AuditLog.create({
          adminId: req.admin.id,
          adminEmail: req.admin.email,
          action: 'DELETE',
          propertyTitle: enquiry.propertyTitle,
          details: `Deleted lead enquiry from ${enquiry.customerName} (${enquiry.customerPhone})`,
          ipAddress: req.ip || '',
          timestamp: new Date(),
        });
      } catch (logErr) {
        console.warn('[AuditLog] Failed to record enquiry deletion:', logErr);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
