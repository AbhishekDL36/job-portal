import Application from "../Models/application.js";
import Job from "../Models/job.js";

 export async function postJOb (req, res) {
   try {
     const { coverLetter, resume } = req.body;
 
 
     let application = await Application.findOne({
       userId: req.userId,
       jobId: req.params.jobId,
     });
 
     if (application) {
       return res.status(400).json({ message: 'Already applied to this job' });
     }
 
     application = new Application({
       userId: req.userId,
       jobId: req.params.jobId,
       coverLetter,
       resume,
     });
 
     await application.save();
 
     await Job.findByIdAndUpdate(
       req.params.jobId,
       { $addToSet: { applicants: req.userId } },
       { new: true }
     );
 
     res.status(201).json(application);
   } catch (error) {
     res.status(500).json({ message: error.message });
   }
 }


 export async function checkJob(req, res)  {
   try {
    
     const jobs = await Job.find({ postedBy: req.userId });
     const jobIds = jobs.map(job => job._id);
 
 
     const applications = await Application.find({ jobId: { $in: jobIds } })
       .populate('userId', 'name email phone')
       .populate('jobId', 'title')
       .sort({ appliedAt: -1 });
 
     res.json(applications);
   } catch (error) {
     res.status(500).json({ message: error.message });
   }
 }

 export async function userApplication(req, res)  {
   try {
     const applications = await Application.find({ userId: req.userId })
       .populate({
         path: 'jobId',
         populate: { path: 'postedBy', select: 'name companyName' },
       })
       .sort({ appliedAt: -1 });
 
     res.json(applications);
   } catch (error) {
     res.status(500).json({ message: error.message });
   }
 }

 export async function checkStatus (req, res) {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    
    const job = await Job.findById(application.jobId);
    if (job.postedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}