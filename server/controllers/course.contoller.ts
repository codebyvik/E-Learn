import { NextFunction, Response, Request } from "express";
import courseModel from "../models/course.model";
import cloudinary from "cloudinary";
import CatchAsyncError from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import { createCourse } from "../services/course.service";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";

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

      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(thumbnail.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const courseId = req.params.id;

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

        await redis.set(courseId, JSON.stringify(course));

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

      await course?.save();

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

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
