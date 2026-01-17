import SavedJob from "../Models/savedJob.js";
import Job from "../Models/job.js";

// Get all saved jobs for a user
export async function getSavedJobs(req, res) {
  try {
    const userId = req.userId;

    const savedJobs = await SavedJob.find({ userId })
      .populate('jobId')
      .sort({ savedAt: -1 });

    if (!savedJobs) {
      return res.status(200).json({ savedJobs: [] });
    }

    res.json({
      message: 'Saved jobs retrieved successfully',
      savedJobs: savedJobs,
      count: savedJobs.length,
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({ message: error.message });
  }
}

// Save a job
export async function saveJob(req, res) {
  try {
    const { jobId } = req.params;
    const userId = req.userId;

    // Validate job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already saved
    const existingSave = await SavedJob.findOne({ userId, jobId });
    if (existingSave) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    // Save job
    const savedJob = new SavedJob({
      userId,
      jobId,
    });

    await savedJob.save();

    res.status(201).json({
      message: 'Job saved successfully',
      savedJob: savedJob,
    });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ message: error.message });
  }
}

// Unsave a job
export async function unsaveJob(req, res) {
  try {
    const { jobId } = req.params;
    const userId = req.userId;

    const result = await SavedJob.findOneAndDelete({ userId, jobId });

    if (!result) {
      return res.status(404).json({ message: 'Saved job not found' });
    }

    res.json({
      message: 'Job removed from saved jobs',
    });
  } catch (error) {
    console.error('Unsave job error:', error);
    res.status(500).json({ message: error.message });
  }
}

// Check if job is saved by user
export async function isJobSaved(req, res) {
  try {
    const { jobId } = req.params;
    const userId = req.userId;

    const savedJob = await SavedJob.findOne({ userId, jobId });

    res.json({
      isSaved: !!savedJob,
    });
  } catch (error) {
    console.error('Check saved job error:', error);
    res.status(500).json({ message: error.message });
  }
}

// Get count of saved jobs
export async function getSavedJobsCount(req, res) {
  try {
    const userId = req.userId;

    const count = await SavedJob.countDocuments({ userId });

    res.json({
      count: count,
    });
  } catch (error) {
    console.error('Get saved jobs count error:', error);
    res.status(500).json({ message: error.message });
  }
}
