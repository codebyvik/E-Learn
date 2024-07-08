"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newPayment = exports.sendStripePublishableKey = exports.getAllOrdersAdmin = exports.createOrder = void 0;
const catchAsyncError_1 = __importDefault(require("../middleware/catchAsyncError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const user_model_1 = __importDefault(require("../models/user.model"));
const course_model_1 = __importDefault(require("../models/course.model"));
const order_service_1 = require("../services/order.service");
const notification_model_1 = __importDefault(require("../models/notification.model"));
const redis_1 = require("../utils/redis");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// create order
exports.createOrder = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { courseId, payment_info } = req.body;
        if (payment_info) {
            if ("id" in payment_info) {
                const paymentIntentID = payment_info.id;
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID);
                if (paymentIntent.status !== "succeeded") {
                    return next(new errorHandler_1.default("Payment not authorised", 400));
                }
            }
        }
        const user = await user_model_1.default.findById(req.user?._id);
        await redis_1.redis.set(user._id, JSON.stringify(user));
        const courseExistsInUser = user?.courses.some((course) => course._id.toString() === courseId);
        if (courseExistsInUser) {
            return next(new errorHandler_1.default("You have already purchased this course", 400));
        }
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            return next(new errorHandler_1.default("Course not found", 404));
        }
        const data = {
            courseId: course._id,
            userId: user?._id,
        };
        const maildata = {
            order: {
                _id: course._id.toString().slice(0, 6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
            },
        };
        const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/order-confirmation.ejs"), maildata);
        try {
            if (user) {
                await (0, sendMail_1.default)({
                    email: user.email,
                    subject: "Order confirmation",
                    template: "order-confirmation.ejs",
                    data: maildata,
                });
            }
        }
        catch (error) {
            return next(new errorHandler_1.default(error.message, 500));
        }
        user?.courses.push(course._id);
        await user?.save();
        //   notification for admin
        await notification_model_1.default.create({
            user: user?._id,
            title: "New Order",
            message: `You have a new order from ${course.name}`,
        });
        if (course) {
            course.purchased += 1;
        }
        await course.save();
        (0, order_service_1.newOrder)(data, res, next);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
// Get all orders --  admin only
exports.getAllOrdersAdmin = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        (0, order_service_1.getAllOrdersService)(res);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
//  send stripe publishble key
exports.sendStripePublishableKey = (0, catchAsyncError_1.default)(async (req, res) => {
    res.status(200).json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});
// new payment
exports.newPayment = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const myPayment = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: "INR",
            description: "E-learning course services",
            metadata: {
                company: "E-Learn",
            },
            automatic_payment_methods: {
                enabled: true,
            },
            shipping: {
                name: "Jenny Rosen",
                address: {
                    line1: "510 Townsend St",
                    postal_code: "560001",
                    city: "San Francisco",
                    state: "CA",
                    country: "IN",
                },
            },
        });
        res.status(201).json({
            success: true,
            client_secret: myPayment.client_secret,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
