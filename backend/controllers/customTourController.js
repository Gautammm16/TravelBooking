import CustomTourRequest from '../models/CustomTour.js';

export const createRequest = async (req, res) => {
  try {
    const request = await CustomTourRequest.create({
      ...req.body,
      user: req.user._id
    });
    res.status(201).json({ success: true, request });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getUserRequests = async (req, res) => {
  try {
    const requests = await CustomTourRequest.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      requests
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getAllRequests = async (req, res) => {
  try {
    const requests = await CustomTourRequest.find().populate('user', 'firstName email');
    res.status(200).json({ success: true, requests });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const request = await CustomTourRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.status(200).json({ success: true, request });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
