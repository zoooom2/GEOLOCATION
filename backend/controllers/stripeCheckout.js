const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/productsModel');
const Order = require('../models/orderModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const cart = await Promise.all(
    req.body.orderItems.map(async (item) => {
      const product = await Product.findById(item.productID);
      // console.log(product);
      return { price: product.priceID, quantity: item.quantity };
    }),
  );

  // console.log(cart);
  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    // payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get(
      'host',
    )}/api/v1/order/stripe-payment`,
    cancel_url: `${req.protocol}://${req.get('host')}/api/v1/order`,
    mode: 'payment',
    currency: 'ngn',
    // automatic_tax: { enabled: true },
    billing_address_collection: 'auto',
    customer_email: req.user.email,
    line_items: cart,
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

const createOrder = async (session) => {
  await Order.create({ session });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  // console.log(event.data.object);
  if (event.type === 'checkout.session.completed')
    createOrder(event.data.object);

  res.status(200).json({ received: true });
};

exports.createBooking = factory.createOne(Order);
