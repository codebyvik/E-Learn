import { NextFunction, Response, Request } from "express";
import courseModel from "../models/course.model";
import cloudinary from "cloudinary";
import CatchAsyncError from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import { createCourse, getAllCoursesService } from "../services/course.service";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import notificationModel from "../models/notification.model";
import axios from "axios";

// upload course
export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;

      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      createCourse(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// edit course
export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;

      const courseId = req.params.id;
      const courseData: any = await courseModel.findById(courseId);

      if (thumbnail && !thumbnail.startsWith("https")) {
        await cloudinary.v2.uploader.destroy(courseData.thumbnail.public_id);

        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
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

      const course = await courseModel.findByIdAndUpdate(
        courseId,
        {
          $set: data,
        },
        { new: true }
      );

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get all course - without purchase
export const getAllCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isCacheExists = await redis.get("allCourses");

      if (isCacheExists) {
        const courses = JSON.parse(isCacheExists);
        res.status(200).json({ success: true, courses });
      } else {
        const courses = await courseModel
          .find()
          .select(
            "-courseData.videoUrl -courseData.suggestion  -courseData.questions -courseData.links"
          );

        await redis.set("allCourses", JSON.stringify(courses));

        res.status(200).json({
          success: true,
          courses,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
// get single course - without purchase

export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const isCacheExists = await redis.get(courseId);
      if (isCacheExists) {
        const course = JSON.parse(isCacheExists);
        res.status(200).json({ success: true, course });
      } else {
        const course = await courseModel
          .findById(req.params.id)
          .select(
            "-courseData.videoUrl -courseData.suggestion  -courseData.questions -courseData.links"
          );

        await redis.set(courseId, JSON.stringify(course), "EX", 604800);

        res.status(200).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get course content - only for purchased user

export const getCourseByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;

      const courseExists = await userCourseList?.find((course: any) => {
        return course._id.toString() === courseId;
      });

      if (!courseExists) {
        return next(new ErrorHandler("You are not eligible to access this resource", 401));
      }

      const course = await courseModel.findById(courseId);

      const content = course?.courseData;

      res.status(200).json({
        success: true,
        content,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// add question in course
interface IAddQuestionData {
  question: string;
  courseId: string;
  contentId: string;
}

export const addQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId }: IAddQuestionData = req.body;
      const course = await courseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content id", 500));
      }

      const courseContent = await course?.courseData?.find((item: any) =>
        item._id.equals(contentId)
      );

      //   create a new question object

      const newQuestion: any = {
        user: req.user,
        question,
        questionReplies: [],
      };

      // add the question to courseContent
      courseContent?.questions.push(newQuestion);

      // save the updated course

      await notificationModel.create({
        user: req.user?._id,
        title: "New Question Received",
        message: `You have a new question from ${courseContent?.title}`,
      });

      await course?.save();

      await redis.set(courseId, JSON.stringify(course));

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// add replies/answer to course content questions
interface IAddAnswerData {
  answer: string;
  questionId: string;
  courseId: string;
  contentId: string;
}

export const addAnswer = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, questionId, courseId, contentId }: IAddAnswerData = req.body;
      const course = await courseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content id", 500));
      }

      const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId));

      const question = courseContent?.questions?.find((item: any) => item._id.equals(questionId));

      if (!question) {
        return next(new ErrorHandler("Invalid question id", 500));
      }

      //   create a new question object
      const newAnswer: any = {
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
        await notificationModel.create({
          user: req.user?._id,
          title: "New Question reply receieved",
          message: `You have a new reply for the question from ${courseContent?.title}`,
        });
      } else {
        const data = {
          name: question.user.name,
          title: courseContent?.title,
        };
        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/question-reply.ejs"),
          data
        );

        try {
          sendMail({
            email: question.user.email,
            subject: "Question Reply",
            template: "question-reply.ejs",
            data,
          });
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 500));
        }
      }

      await redis.set(courseId, JSON.stringify(course));

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Add review in course
interface IAddReviewData {
  review: string;
  rating: number;
}

export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;

      // check if course id exists in user course list
      const courseExists = userCourseList?.some(
        (course: any) => course._id.toString() === courseId
      );

      if (!courseExists) {
        return next(new ErrorHandler("You are not eligible to access this course", 500));
      }

      const course = await courseModel.findById(courseId);

      const { review, rating } = req.body as IAddReviewData;
      const reviewData: any = {
        user: req.user,
        comment: review,
        rating,
      };

      course?.reviews.push(reviewData);

      let avg = 0;
      course?.reviews.forEach((rev: any) => {
        avg += rev.rating;
      });

      if (course) {
        course.ratings = avg / course?.reviews.length;
      }

      await course?.save();

      // create notification

      await notificationModel.create({
        user: req.user?._id,
        title: "New Review Received",
        message: `${req.user?.name} has given a review in ${course?.name}`,
      });

      await redis.set(courseId, JSON.stringify(course));

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// add reply to review => admin only
interface IAddReplyToReviewData {
  comment: string;
  courseId: string;
  reviewId: string;
}
export const addReplyToReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId }: IAddReplyToReviewData = req.body;

      const course = await courseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const review = course.reviews?.find((rev: any) => rev._id.toString() === reviewId);

      if (!review) {
        return next(new ErrorHandler("review not found", 404));
      }

      const replyData: any = {
        user: req.user,
        comment,
      };

      if (!review.commentReplies) {
        review.commentReplies = [];
      }

      review.commentReplies?.push(replyData);

      await course.save();
      await redis.set(courseId, JSON.stringify(course));
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Get all courses --  admin only

export const getAllCoursesAdmin = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllCoursesService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// delete course -- admin only

export const deleteCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const course = await courseModel.findById(id);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      await course.deleteOne({ id });

      await redis.del(id);

      res.status(200).json({ success: true, message: "Course deleted successfully" });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// generate video url
export const generateVideoUrl = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { videoId } = req.body;
      const response = await axios.post(
        `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
        { ttl: 300 },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
          },
        }
      );
      res.json(response.data);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
