const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// @route   GET /api/jobs
// @desc    Get all open jobs with search and filter
router.get('/', async (req, res) => {
  try {
    const { search, location, type } = req.query;
    let query = { isOpen: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    if (location) query.location = { $regex: location, $options: 'i' };
    if (type) query.type = type;

    const jobs = await Job.find(query)
      .populate('employer', 'name company')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'name company companyDescription');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/jobs
// @desc    Create a new job (employer only)
router.post('/', auth, role('employer'), async (req, res) => {
  const { title, company, location, type, description, requirements, salaryMin, salaryMax } = req.body;

  try {
    const job = new Job({
      employer: req.user.id,
      title, company, location, type,
      description, requirements,
      salaryMin, salaryMax
    });

    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job (employer only)
router.put('/:id', auth, role('employer'), async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job (employer only)
router.delete('/:id', auth, role('employer'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await job.deleteOne();
    res.json({ message: 'Job removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;