const Comment = require('../models/commentModel');
const catchAsyncErrors = require('../utils/catchAsyncErrors.js');
const controllersBuilder = require('./builders/controllersBuilder');
const AppError = require('../utils/appError.js');
const { speechPrediction } = require('../utils/hateSpeechPrediction.js');

const popOptions = { path: 'userID', select: 'userName photoLink city' };

exports.createComment = catchAsyncErrors(async (req, res, next) => {
  const { content } = req.body;
  const prediction = await speechPrediction(content);
  console.log(prediction);
  if (prediction === 1)
    return next(new AppError('Hating Speech Not Allowing', 400));

  const newDocument = await Comment.create(req.body);
  let populatedDocument = newDocument;
  if (popOptions) {
    populatedDocument = await newDocument.populate(popOptions);
  }
  res.status(201).json({
    status: 'success',
    data: {
      document: populatedDocument,
    },
  });
});
exports.getAllComments = controllersBuilder.getAll(Comment, popOptions);
exports.getComment = controllersBuilder.getOne(Comment, popOptions);
exports.updateComment = controllersBuilder.updateOne(Comment, popOptions);
exports.deleteComment = controllersBuilder.deleteOne(Comment);
exports.uploadCommentPhotos = controllersBuilder.uploadPhoto(
  'commentPhotos',
  'comment'
);
exports.updateCommentPhotos = controllersBuilder.addPhotosInfo(
  Comment,
  popOptions
);

exports.isUserAuthorized = catchAsyncErrors(async (req, res, next) => {
  if (req.model.role === 'admin') return next();

  if (req.method === 'POST' && req.model.id === req.body.userID) return next();
  else if (req.method === 'POST' && req.model.id !== req.body.userID)
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );

  const comment = await Comment.findById(req.params.id);
  if (!comment) return next(new AppError('no found comment with this id', 404));
  if (req.model.id !== comment.userID.toString())
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );

  next();
});
