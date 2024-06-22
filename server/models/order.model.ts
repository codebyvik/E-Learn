import mongoose, { Document, Model, Schema, mongo } from "mongoose";

interface IOrder extends Document {
  courseId: string;
  userId: string;
  payment_info: object;
}

const orderSchema = new Schema<IOrder>(
  {
    courseId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    payment_info: {
      type: Object,
      // required: true,
    },
  },
  { timestamps: true }
);

const orderModel: Model<IOrder> = mongoose.model("Order", orderSchema);

export default orderModel;