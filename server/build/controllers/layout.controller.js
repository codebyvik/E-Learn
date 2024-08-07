"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLayoutByType = exports.editLayout = exports.createLayout = void 0;
const catchAsyncError_1 = __importDefault(require("../middleware/catchAsyncError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const layout_models_1 = __importDefault(require("../models/layout.models"));
const cloudinary_1 = __importDefault(require("cloudinary"));
// create Layout
exports.createLayout = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { type } = req.body;
        const isTypeExists = await layout_models_1.default.findOne({ type });
        if (isTypeExists) {
            return next(new errorHandler_1.default(`${type} already exists`, 400));
        }
        if (type === "Banner") {
            const { image, title, subTitle } = req.body;
            const myCloud = await cloudinary_1.default.v2.uploader.upload(image, {
                folder: "layout",
            });
            const banner = {
                type: "Banner",
                banner: {
                    image: {
                        public_id: myCloud.public_id,
                        url: myCloud.secure_url,
                    },
                    title,
                    subTitle,
                },
            };
            await layout_models_1.default.create(banner);
        }
        if (type === "FAQ") {
            const { faq } = req.body;
            const faqItems = await Promise.all(faq.map(async (item) => {
                return {
                    question: item.question,
                    answer: item.answer,
                };
            }));
            await layout_models_1.default.create({ type: "FAQ", faq: faqItems });
        }
        if (type === "Categories") {
            const { categories } = req.body;
            const categoryItems = await Promise.all(categories.map(async (item) => {
                return {
                    title: item.title,
                };
            }));
            await layout_models_1.default.create({ type: "Categories", categories: categoryItems });
        }
        res.status(200).json({
            success: true,
            message: `Layout created successfully`,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// edit Layout
exports.editLayout = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { type } = req.body;
        if (type === "Banner") {
            const { image, title, subTitle } = req.body;
            const bannerData = await layout_models_1.default.findOne({ type: "Banner" });
            const data = image.startsWith("https")
                ? bannerData
                : await cloudinary_1.default.v2.uploader.upload(image, {
                    folder: "layout",
                });
            const banner = {
                type: "Banner",
                image: {
                    public_id: image.startsWith("https")
                        ? bannerData.banner.image.public_id
                        : data?.public_id,
                    url: image.startsWith("https") ? bannerData.banner.image.url : data?.secure_url,
                },
                title,
                subTitle,
            };
            await layout_models_1.default.findByIdAndUpdate(bannerData._id, { banner });
        }
        if (type === "FAQ") {
            const { faq } = req.body;
            const faqdata = await layout_models_1.default.findOne({ type: "FAQ" });
            const faqItems = await Promise.all(faq.map(async (item) => {
                return {
                    question: item.question,
                    answer: item.answer,
                };
            }));
            await layout_models_1.default.findByIdAndUpdate(faqdata._id, { type: "FAQ", faq: faqItems });
        }
        if (type === "Categories") {
            const { categories } = req.body;
            const categoriesData = await layout_models_1.default.findOne({ type: "Categories" });
            const categoryItems = await Promise.all(categories.map(async (item) => {
                return {
                    title: item.title,
                };
            }));
            await layout_models_1.default.findByIdAndUpdate(categoriesData._id, {
                type: "Categories",
                categories: categoryItems,
            });
        }
        res.status(200).json({
            success: true,
            message: `Layout created successfully`,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// get Layout by type
exports.getLayoutByType = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const { type } = req.params;
        const layout = await layout_models_1.default.findOne({ type });
        res.status(201).json({
            success: true,
            layout,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
