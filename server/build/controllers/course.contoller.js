"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVideoUrl = exports.deleteCourse = exports.getAllCoursesAdmin = exports.addReplyToReview = exports.addReview = exports.addAnswer = exports.addQuestion = exports.getCourseByUser = exports.getSingleCourse = exports.getAllCourses = exports.editCourse = exports.uploadCourse = void 0;
const course_model_1 = __importDefault(require("../models/course.model"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const catchAsyncError_1 = __importDefault(require("../middleware/catchAsyncError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const course_service_1 = require("../services/course.service");
const redis_1 = require("../utils/redis");
const mongoose_1 = __importDefault(require("mongoose"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const axios_1 = __importDefault(require("axios"));
// upload course
exports.uploadCourse = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        (0, course_service_1.createCourse)(data, res, next);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
// edit course
exports.editCourse = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        const courseId = req.params.id;
        const courseData = await course_model_1.default.findById(courseId);
        if (thumbnail && !thumbnail.startsWith("https")) {
            await cloudinary_1.default.v2.uploader.destroy(courseData.thumbnail.public_id);
            const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        if (thumbnail.startsWith("https")) {
            data.thumbnail = {
                public_id: courseData?.thumbnail.public_id,
                url: courseData?.thumbnail.url,
            };
        }
        const course = await course_model_1.default.findByIdAndUpdate(courseId, {
            $set: data,
        }, { new: true });
        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
// get all course - without purchase
exports.getAllCourses = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const isCacheExists = await redis_1.redis.get("allCourses");
        if (isCacheExists) {
            const courses = JSON.parse(isCacheExists);
            res.status(200).json({ success: true, courses });
        }
        else {
            const courses = await course_model_1.default
                .find()
                .select("-courseData.videoUrl -courseData.suggestion  -courseData.questions -courseData.links");
            await redis_1.redis.set("allCourses", JSON.stringify(courses));
            res.status(200).json({
                success: true,
                courses,
            });
        }
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
// get single course - without purchase
exports.getSingleCourse = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const isCacheExists = await redis_1.redis.get(courseId);
        if (isCacheExists) {
            const course = JSON.parse(isCacheExists);
            res.status(200).json({ success: true, course });
        }
        else {
            const course = await course_model_1.default
                .findById(req.params.id)
                .select("-courseData.videoUrl -courseData.suggestion  -courseData.questions -courseData.links");
            await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800);
            res.status(200).json({
                success: true,
                course,
            });
        }
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
// get course content - only for purchased user
exports.getCourseByUser = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        const courseExists = await userCourseList?.find((course) => {
            return course._id.toString() === courseId;
        });
        if (!courseExists) {
            return next(new errorHandler_1.default("You are not eligible to access this resource", 401));
        }
        const course = await course_model_1.default.findById(courseId);
        const content = course?.courseData;
        res.status(200).json({
            success: true,
            content,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
exports.addQuestion = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { question, courseId, contentId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            return next(new errorHandler_1.default("Invalid content id", 500));
        }
        const courseContent = await course?.courseData?.find((item) => item._id.equals(contentId));
        //   create a new question object
        const newQuestion = {
            user: req.user,
            question,
            questionReplies: [],
        };
        // add the question to courseContent
        courseContent?.questions.push(newQuestion);
        // save the updated course
        await notification_model_1.default.create({
            user: req.user?._id,
            title: "New Question Received",
            message: `You have a new question from ${courseContent?.title}`,
        });
        await course?.save();
        await redis_1.redis.set(courseId, JSON.stringify(course));
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
exports.addAnswer = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { answer, questionId, courseId, contentId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            return next(new errorHandler_1.default("Invalid content id", 500));
        }
        const courseContent = course?.courseData?.find((item) => item._id.equals(contentId));
        const question = courseContent?.questions?.find((item) => item._id.equals(questionId));
        if (!question) {
            return next(new errorHandler_1.default("Invalid question id", 500));
        }
        //   create a new question object
        const newAnswer = {
            user: req.user,
            answer,
        };
        // add the question to courseContent
        question?.questionReplies?.push(newAnswer);
        // save the updated course
        await course?.save();
        //   notification for reply and answer
        if (req.user?._id === question.user._id) {
            // user is replying to his question
            // send notification
            await notification_model_1.default.create({
                user: req.user?._id,
                title: "New Question reply receieved",
                message: `You have a new reply for the question from ${courseContent?.title}`,
            });
        }
        else {
            const data = {
                name: question.user.name,
                title: courseContent?.title,
            };
            const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/question-reply.ejs"), data);
            try {
                (0, sendMail_1.default)({
                    email: question.user.email,
                    subject: "Question Reply",
                    template: "question-reply.ejs",
                    data,
                });
            }
            catch (error) {
                return next(new errorHandler_1.default(error.message, 500));
            }
        }
        await redis_1.redis.set(courseId, JSON.stringify(course));
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
exports.addReview = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        // check if course id exists in user course list
        const courseExists = userCourseList?.some((course) => course._id.toString() === courseId);
        if (!courseExists) {
            return next(new errorHandler_1.default("You are not eligible to access this course", 500));
        }
        const course = await course_model_1.default.findById(courseId);
        const { review, rating } = req.body;
        const reviewData = {
            user: req.user,
            comment: review,
            rating,
        };
        course?.reviews.push(reviewData);
        let avg = 0;
        course?.reviews.forEach((rev) => {
            avg += rev.rating;
        });
        if (course) {
            course.ratings = avg / course?.reviews.length;
        }
        await course?.save();
        // create notification
        await notification_model_1.default.create({
            user: req.user?._id,
            title: "New Review Received",
            message: `${req.user?.name} has given a review in ${course?.name}`,
        });
        await redis_1.redis.set(courseId, JSON.stringify(course));
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
exports.addReplyToReview = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { comment, courseId, reviewId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            return next(new errorHandler_1.default("Course not found", 404));
        }
        const review = course.reviews?.find((rev) => rev._id.toString() === reviewId);
        if (!review) {
            return next(new errorHandler_1.default("review not found", 404));
        }
        const replyData = {
            user: req.user,
            comment,
        };
        if (!review.commentReplies) {
            review.commentReplies = [];
        }
        review.commentReplies?.push(replyData);
        await course.save();
        await redis_1.redis.set(courseId, JSON.stringify(course));
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
// Get all courses --  admin only
exports.getAllCoursesAdmin = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        (0, course_service_1.getAllCoursesService)(res);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// delete course -- admin only
exports.deleteCourse = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await course_model_1.default.findById(id);
        if (!course) {
            return next(new errorHandler_1.default("Course not found", 404));
        }
        await course.deleteOne({ id });
        await redis_1.redis.del(id);
        res.status(200).json({ success: true, message: "Course deleted successfully" });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// generate video url
exports.generateVideoUrl = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { videoId } = req.body;
        const response = await axios_1.default.post(`https://dev.vdocipher.com/api/videos/${videoId}/otp`, { ttl: 300 }, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
            },
        });
        res.json(response.data);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
