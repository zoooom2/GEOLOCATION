// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// // const mongoose = require('mongoose');
// // const GoogleUser = require('../models/passportUserModel');
// const User = require('../models/userModel');

// module.exports = (passport) => {
//   passport.use(
//     new GoogleStrategy(
//       {
//         clientID: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         callbackURL: '/api/v1/auth/google/callback',
//       },
//       async (accessToken, refreshToken, profile, cb) => {
//         const newUser = {
//           id: profile.id,
//           username: profile.displayName,
//           email: profile.emails[0].value,
//           firstName: profile.name.givenName,
//           lastName: profile.name.familyName,
//           photo: profile.photos[0].value,
//           //create a function that generates a random password
//         };

//         try {
//           let user = await User.findOne({ id: profile.id });

//           if (!user) {
//             user = await User.create(newUser);
//           }

//           cb(null, user);
//         } catch (error) {
//           // console.error(error);
//         }
//       },
//     ),
//   );

//   passport.serializeUser((user, cb) => {
//     process.nextTick(() =>
//       cb(null, {
//         id: user.id,
//         username: user.username,
//         picture: user.picture,
//       }),
//     );
//   });

//   passport.deserializeUser((user, cb) => {
//     process.nextTick(() => cb(null, user));
//   });
// };
