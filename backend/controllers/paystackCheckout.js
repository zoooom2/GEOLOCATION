const paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY);
const crypto = require('crypto');
const Order = require('../models/orderModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { updateStock } = require('./productsController');
const getUniqueValues = require('../utils/uniqueValues');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const { name, email } = req.user;
  const helper = new paystack.FeeHelper();

  //1) Initialize the transaction
  const session = await paystack.transaction.initialize({
    name,
    email,
    callback_url: `${process.env.CLIENT_URL}/order`,
    amount: helper.addFeesTo(req.body.total_amount * 100),
  });
  res.status(200).json({ data: session.data.authorization_url });
});

// const verifyPaystackTransaction = (reference) => async (req, res, next) => {
//   const verification = await paystack.transaction.verify({ reference });

//   if (verification.data.status !== 'success') {
//     next(new AppError('payment transaction verification failed', 401));
//   }
//   return verification;
// };

exports.createOrder = catchAsync(async (req, res, next) => {
  //2) Verify the transaction
  // const verification = await verifyPaystackTransaction(req.body.reference);
  const verification = await paystack.transaction.verify({
    reference: req.body.reference,
  });

  if (verification.data.status !== 'success') {
    next(new AppError('payment transaction verification failed', 401));
  }

  const orderItems = req.body.cart;

  const uniqueID = getUniqueValues(orderItems, 'productID');

  let newOrderItems = [];

  // pick the unique id, check each of the order items for any with the same unique ID, if it is the first copy all of its content into an object else just size and quantity into the sizes array

  newOrderItems = uniqueID.map((id) => {
    const baseObject = {
      productName: '',
      price: 0,
      image: '',
      sizes: [],
      productID: id,
    };
    orderItems.forEach((item) => {
      let count = 0;
      if (item.productID === id && count === 0) {
        baseObject.productName = item.productName;
        baseObject.price = item.price;
        baseObject.image = item.image;
        baseObject.sizes.push({
          size: item.size,
          quantity: item.amount,
        });
        count += 1;
      } else {
        baseObject.sizes.push({
          size: item.size,
          quantity: item.amount,
        });
        count += 1;
      }
    });
    return baseObject;
  });

  //3) create the order
  const {
    shippingInfo,
    total_amount: totalAmount,
    subtotal,
    total_items: totalItems,
  } = req.body;

  const order = await Order.create({
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    shippingInfo,
    total_amount: totalAmount,
    subtotal,
    total_items: totalItems,
    orderItems: newOrderItems,
    paidAt: verification.data.paid_at,
    createdAt: verification.data.created_at,
    paymentInfo: {
      reference: verification.data.reference,
      channel: verification.data.channel,
      status: verification.data.status,
      gateway: 'PAYSTACK',
    },
    user: req.user.id,
  });

  if (!order) {
    next(new AppError('Could not create order. Please try again.', 400));
  }

  //4) update the stock of each product
  await Promise.all(
    orderItems.map(async (item) => await updateStock(item.product, item)),
  );

  // 5) Create session as response
  res.status(200).json({
    status: 'success',
    order,
  });
});

// exports.updatePayStackOrderStatus = (reference, status, id) =>
//   catchAsync(async (req, res) => {
//     const order = await Order.findByIdAndUpdate(
//       id,
//       { orderStatus: status },
//       {
//         new: true,
//         runValidators: true,
//       }
//     );
//     res.status(200).json({ status: 'success', order });
//   });

exports.updatePayStackOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  const { status } = req.query;
  const verified = await paystack.transaction.verify({
    reference: order.paymentInfo.reference,
  });

  if (verified.data.status !== 'success')
    next(new AppError('invalid payment reference', 401));

  const { orderStatus, deliveredAt } = req.body;
  req.body = { orderStatus, deliveredAt };

  if (status === 'completed') {
    order.status = 'completed';
    order.deliveredAt = Date.now();
  } else {
    order.orderStatus = status;
  }
  order.save({ new: true });
  res.status(200).json({ status: 'success', order });
});

exports.payStackWebHook = catchAsync(async (req, res) => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');
  if (hash === req.headers['x-paystack-signature']) {
    // Retrieve the request's body
    // const event = req.body;
    // console.log(event);
  }

  res.status(200).json({});
});

// exports.filterUpdateOrder = catchAsync(async (req, res, next) => {
//   const { orderStatus, deliveredAt } = req.body;
//   req.body = { orderStatus, deliveredAt };
//   next();
// });
