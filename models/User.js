const _ = require('lodash');
const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
  },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  facebook: String,
  google: String,
  tokens: Array,

  profile: {
    firstName: String,
    lastName: String,
    gender: String,
    phone: String,
    birthdate: String,
    address: {
      street: String,
      street2: String,
      city: String,
      state: String,
      zipcode: String,
    },
    player: {
      throw: {
        type: String,
        enum: ['right', 'left'],
      },
      bat: {
        type: String,
        enum: ['right', 'left', 'switch'],
      },
      skillLevel: {
        type: String,
        enum: [
          'Novice',
          'Recreational',
          'Competitive',
        ],
      },
      positions: {
        type: [String],
        validate: {
          validator: (v) => {
            if (_.isEmpty(v)) {
              return true;
            }

            const positions = ['P', 'C', '1B', '2B', '3B', 'LF', 'CF', 'RF', 'INF', 'MINF', 'OF', 'UTIL', 'DH'];

            return _.filter(v, val => _.includes(positions, val)).length > 0 &&
              _.reject(v, val => _.includes(positions, val)).length === 0;
          },
        },
        message: '{VALUE} does not include only values from P, C, 1B, 2B, 3B, LF, CF, RF, INF, MINF, OF, UTIL, DH',
      },
      pro: Boolean,
      experience: {
        type: [String],
        validate: {
          validator: (v) => {
            if (_.isEmpty(v)) {
              return true;
            }

            const experience = [
              'Recreational',
              'Babe Ruth',
              'Pony',
              'High School',
              'American Legion',
              'College',
            ];

            return _.filter(v, val => _.includes(experience, val)).length > 0 &&
              _.reject(v, val => _.includes(experience, val)).length === 0;
          }
        },
      },
      lastPlayedDate: Date,
      lastPlayedLocation: String,
    }
  }
}, { timestamps: true });

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
