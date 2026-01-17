import Application from "../Models/application.js";
import Job from "../Models/job.js";
import User from "../Models/user.js";
import { sendApplicationConfirmationEmail, sendApplicationStatusUpdateEmail } from "../Services/emailService.js";

export async function applyJob(req, res) {
  try {
    const { coverLetter, resume } = req.body;
    const jobId = req.params.jobId;

    // Validate job exists
    const job = await Job.findById(jobId).populate('postedBy', 'name companyName email');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    let application = await Application.findOne({
      userId: req.userId,
      jobId: jobId,
    });

    if (application) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    // Get user details
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create application
    application = new Application({
      userId: req.userId,
      jobId: jobId,
      coverLetter,
      resume,
    });

    await application.save();

    // Add user to job applicants
    await Job.findByIdAndUpdate(
      jobId,
      { $addToSet: { applicants: req.userId } },
      { new: true }
    );

    // Send confirmation email to applicant
    try {
      await sendApplicationConfirmationEmail(user.email, job.title, job.companyName || 'Our Company');
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails, just log it
    }

    await application.populate('jobId', 'title companyName');

    res.status(201).json({
      message: 'Application submitted successfully. Check your email for confirmation.',
      application,
    });
  } catch (error) {
    console.error('Apply job error:', error);
    res.status(500).json({ message: error.message });
  }
}

export async function checkApplications(req, res) {
  try {
    // Get all jobs posted by the employer
    const jobs = await Job.find({ postedBy: req.userId });
    const jobIds = jobs.map(job => job._id);

    // Get all applications for these jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('userId', 'name email phone location skills experience')
      .populate('jobId', 'title companyName')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Check applications error:', error);
    res.status(500).json({ message: error.message });
  }
}

export async function getUserApplications(req, res) {
  try {
    const applications = await Application.find({ userId: req.userId })
      .populate({
        path: 'jobId',
        select: 'title description location salary jobType companyName postedBy',
        populate: { path: 'postedBy', select: 'name companyName email' },
      })
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({ message: error.message });
  }
}

export async function updateApplicationStatus(req, res) {
  try {
    const { status } = req.body;
    const { applicationId } = req.params;

    // Validate status
    const validStatuses = ['applied', 'shortlisted', 'rejected', 'accepted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find application
    const application = await Application.findById(applicationId).populate('jobId');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check authorization (only employer who posted the job can update status)
    const job = application.jobId;
    if (job.postedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    // Update status
    application.status = status;
    await application.save();

    // Send status update email to applicant
    try {
      const applicant = await User.findById(application.userId);
      if (applicant && applicant.email) {
        await sendApplicationStatusUpdateEmail(applicant.email, job.title, status);
      }
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
      // Don't fail the request if email fails
    }

    await application.populate({
      path: 'jobId',
      select: 'title companyName',
    });
    await application.populate('userId', 'name email');

    res.json({
      message: `Application status updated to ${status}. Notification email sent to applicant.`,
      application,
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: error.message });
  }
}

export async function getApplicationStats(req, res) {
  try {
    const jobs = await Job.find({ postedBy: req.userId });
    const jobIds = jobs.map(job => job._id);

    const applications = await Application.find({ jobId: { $in: jobIds } });

    const stats = {
      total: applications.length,
      applied: applications.filter(a => a.status === 'applied').length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
    };

    res.json(stats);
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({ message: error.message });
  }
}
