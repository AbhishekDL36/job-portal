import Job from "../Models/job.js";
import User from "../Models/user.js";

export async function getMyJobs(req, res) {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.userType !== 'employer') {
      return res.status(403).json({ message: 'Only employers can view their jobs' });
    }

    const jobs = await Job.find({ postedBy: req.userId })
      .populate('postedBy', 'name companyName email')
      .populate('applicants', 'name email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error('Get my jobs error:', error.message);
    res.status(500).json({ message: error.message });
  }
}

export async function getAllJobs(req, res) {
  try {
    const { category, location, search, jobType, minSalary, maxSalary } = req.query;
    const userId = req.headers.userid; // Optional - for filtering out own jobs

    let query = { status: 'active' };

    // Exclude jobs posted by current user
    if (userId) {
      query.postedBy = { $ne: userId };
    }

    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (jobType) query.jobType = jobType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ];
    }

    if (minSalary || maxSalary) {
      query['salary.min'] = {};
      if (minSalary) query['salary.min'].$gte = Number(minSalary);
      if (maxSalary) query['salary.max'] = { $lte: Number(maxSalary) };
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name companyName email industry')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(jobs);
  } catch (error) {
    console.error('Get all jobs error:', error.message);
    res.status(500).json({ message: error.message });
  }
}

export async function getJobById(req, res) {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name companyName email industry companyDescription')
      .populate('applicants', 'name email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job by ID error:', error.message);
    res.status(500).json({ message: error.message });
  }
}

export async function postJob(req, res) {
  try {
    // Check if user is employer
    const user = await User.findById(req.userId);
    if (!user || user.userType !== 'employer') {
      return res.status(403).json({ message: 'Only employers can post jobs' });
    }

    const {
      title,
      description,
      category,
      location,
      salary,
      jobType,
      skills,
      experience,
      jobDescription,
    } = req.body;

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required' });
    }

    const job = new Job({
      title,
      description,
      category,
      location,
      salary,
      jobType: jobType || 'full-time',
      skills: Array.isArray(skills) ? skills : [],
      experience,
      postedBy: req.userId,
      companyName: user.companyName,
    });

    await job.save();
    await job.populate('postedBy', 'name companyName email');

    res.status(201).json({
      message: 'Job posted successfully',
      job,
    });
  } catch (error) {
    console.error('Post job error:', error.message);
    res.status(500).json({ message: error.message });
  }
}

export async function updateJob(req, res) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check authorization
    if (job.postedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const {
      title,
      description,
      category,
      location,
      salary,
      jobType,
      skills,
      experience,
      status,
    } = req.body;

    // Update fields
    if (title) job.title = title;
    if (description) job.description = description;
    if (category) job.category = category;
    if (location) job.location = location;
    if (salary) job.salary = salary;
    if (jobType) job.jobType = jobType;
    if (skills) job.skills = skills;
    if (experience) job.experience = experience;
    if (status && ['active', 'closed'].includes(status)) job.status = status;

    job.updatedAt = Date.now();
    await job.save();
    await job.populate('postedBy', 'name companyName email');

    res.json({
      message: 'Job updated successfully',
      job,
    });
  } catch (error) {
    console.error('Update job error:', error.message);
    res.status(500).json({ message: error.message });
  }
}

export async function deleteJob(req, res) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check authorization
    if (job.postedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error.message);
    res.status(500).json({ message: error.message });
  }
}

export async function searchJobs(req, res) {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const jobs = await Job.find({
      status: 'active',
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { companyName: { $regex: q, $options: 'i' } },
        { skills: { $in: [new RegExp(q, 'i')] } },
      ],
    })
      .populate('postedBy', 'name companyName email')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(jobs);
  } catch (error) {
    console.error('Search jobs error:', error.message);
    res.status(500).json({ message: error.message });
  }
}
