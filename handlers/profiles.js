const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Profile = require('../schema/Profile');

// @desc    Get all profiles
// @route   GET /profiles
// @access  Public
exports.getProfiles = asyncHandler(async (req, res, next) => {
    const profiles = await Profile.find();

    res.status(200).json({
        success: true,
        count: profiles.length,
        data: profiles
    });
});

// @desc    Get current logged in user
// @route   GET /profiles/me
// @access  Protected
exports.getProfile = asyncHandler(async (req, res, next) => {
    // Protect middleware is called before getProfile and sets req.user
    // Check /routes/profiles.js and /middleware/protect/js for more info
    const profile = await Profile.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: profile
    });
});

// @desc    Register new profile
// @route   POST /profiles/register
// @access  Public
exports.registerProfile = asyncHandler(async (req, res, next) => {
    const profile = await Profile.create(req.body);

    sendTokenResponse(profile, 200, res);
});

// @desc    Update profile
// @route   PUT /profiles/:id
// @access  Protected
exports.updateProfile = asyncHandler(async (req, res, next) => {
    const profile = await Profile.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!profile) {
        return next(new ErrorResponse(`Profile not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: profile
    });
});

// @desc    Delete profile
// @route   DELETE /profiles/:id
// @access  Protected
exports.deleteProfile = asyncHandler(async (req, res, next) => {
    const profile = await Profile.findByIdAndDelete(req.params.id);

    if (!profile) {
        return next(new ErrorResponse(`Profile not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Login user
// @route   POST /profiles/login
// @access  Public
exports.loginProfile = asyncHandler(async (req, res, next) => {
    const {
        email,
        password,
    } = req.body;

    // Validate email & password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for profile
    const profile = await Profile.findOne({
        email
    }).select('+password');

    if (!profile) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await profile.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(profile, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (profile, statusCode, res) => {
    // Create token
    const token = profile.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token
    });
}