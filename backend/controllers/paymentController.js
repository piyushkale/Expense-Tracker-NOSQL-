const Cashfree = require("../config/cashfree");
const { ObjectId } = require("mongodb");

const { getOrderCollection } = require("../models/orderModel");
const { getUserCollection } = require("../models/userModel");

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const { userId } = req.user;

    const orders = getOrderCollection();

    const orderId = "ORDER_" + Date.now();

    const request = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: "USER_123",
        customer_email: "test@gmail.com",
        customer_phone: "9999999999",
      },
      order_meta: {
        return_url:
          "http://localhost:3000/expense.html?order_id={order_id}",
      },
    };

    const response = await Cashfree.PGCreateOrder("2023-08-01", request);

    // ✅ Insert into MongoDB
    await orders.insertOne({
      orderId,
      amount: request.order_amount,
      status: "PENDING",
      userId: new ObjectId(userId),
      createdAt: new Date(),
    });

    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.log("Cashfree Error:", error.message);

    res.status(500).json({
      error: error.response?.data || error.message || "Payment order failed",
    });
  }
};

exports.paymentVerify = async (req, res) => {
  try {
    const { orderId } = req.params;

    const orders = getOrderCollection();
    const users = getUserCollection();

    const response = await Cashfree.PGFetchOrder("2023-08-01", orderId);
    const orderStatus = response.data.order_status;

    // ✅ Find order
    const order = await orders.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // ✅ Update order status
    await orders.updateOne(
      { orderId },
      { $set: { status: orderStatus } }
    );

    // ✅ Upgrade user ONLY once
    if (orderStatus === "PAID" && order.status !== "PAID") {
      await users.updateOne(
        { _id: new ObjectId(order.userId) },
        { $set: { isPremium: true } }
      );
    }

    res.status(200).json({ status: orderStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Payment verification failed" });
  }
};