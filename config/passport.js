const GoogleStrategy = require('passport-google-oauth20').Strategy

const mongoose = require('mongoose')

const User = require('../models/user')

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log(profile)
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          image: profile.photos[0].value
        }

        try {
          // Check if user already exists in our database
          let user = await User.findOne({ googleId: profile.id })
          if (user) {
            done(null, user)
          } else {
            // Create a new user
            user = await User.create(newUser)
            done(null, user)
          }
        } catch (err) {
          console.error(err)
        }
      }
    )
  )
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user)
    })
  })
}

