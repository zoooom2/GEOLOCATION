// const paypal = require('@paypal/checkout-server-sdk');
// const Product = require('../models/productsModel');
// const catchAsync = require('../utils/catchAsync');

// const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;

// // This sample uses SandboxEnvironment. In production, use LiveEnvironment
// const environment = new paypal.core.SandboxEnvironment(
//   PAYPAL_CLIENT_ID,
//   PAYPAL_APP_SECRET,
// );
// const client = new paypal.core.PayPalHttpClient(environment);

// // Construct a request object and set desired parameters
// // Here, OrdersCreateRequest() creates a POST request to /v2/checkout/orders

// // Call API with your client and get a response for your call
// exports.createOrder = catchAsync(async (req, res) => {
//   let amount = 0;
//   let itemTotal = 0;

//   const cart = await Promise.all(
//     req.body.orderItems.map(async (item) => {
//       const product = await Product.findById(item.productID);
//       itemTotal += product.price * item.quantity;
//       return {
//         name: product.productName,
//         unit_amount: { currency_code: 'USD', value: product.price },
//         description: product.description,
//         quantity: item.quantity,
//       };
//     }),
//   );
//   amount = itemTotal + req.body.shippingPrice;

//   const request = new paypal.orders.OrdersCreateRequest();
//   request.requestBody({
//     intent: 'CAPTURE',
//     purchase_units: [
//       {
//         amount: {
//           currency_code: 'USD',
//           value: amount,
//           // this is where to add handling fee, total disocunt, etc
//           breakdown: {
//             shipping: { currency_code: 'USD', value: req.body.shippingPrice },
//             item_total: { currency_code: 'USD', value: itemTotal },
//           },
//         },
//         items: cart,
//         description: req.body.description,
//         shipping: {
//           address: {
//             country_code: req.body.shippingInfo.countryCode,
//             address_line_1: req.body.shippingInfo.address,
//             admin_area_2: req.body.shippingInfo.city,
//             postal_code: req.body.shippingInfo.postalCode,
//           },
//           name: { full_name: req.body.shippingInfo.name },
//           type: req.body.shippingInfo.type,
//           payee: {
//             email_address: 'www.bazng@gmail.com',
//           },
//         },
//       },
//     ],
//   });

//   const response = await client.execute(request);
//   // console.log(`Response: ${JSON.stringify(response)}`);

//   // If call returns body in response, you can get the deserialized version from the result attribute of the response.
//   // console.log(`Order: ${JSON.stringify(response.result)}`);

//   res.status(201).json({
//     response: response.result,
//   });
// });

// exports.captureOrder = async function (req, res) {
//   const { orderID } = req.params;
//   const request = new paypal.orders.OrdersCaptureRequest(orderID);
//   request.requestBody({});
//   // Call API with your client and get a response for your call
//   const response = await client.execute(request);
//   // console.log(`Response: ${JSON.stringify(response)}`);
//   // If call returns body in response, you can get the deserialized version from the result attribute of the response.
//   // console.log(`Capture: ${JSON.stringify(response.result)}`);

//   res.status(201).json({
//     response,
//   });
// };
