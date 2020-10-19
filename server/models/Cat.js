const mongoose = require('mongoose');

let CatModel;

// name the "fields" of Cat
// give them a type
// see here for schemea types: https://mongoosejs.com/docs/guide.html
const CatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  bedsOwned: {
    type: Number,
    min: 0,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// schemas can have functions
// static functions

// the cat's name is a unique value - therefor it is the *primary key* of the `Cat`
CatSchema.statics.findByName = (name, callback) => {
  const search = {
    name,
  };
  // findOne() is built into mongoose
  // https://mongoosejs.com/docs/api.html
  return CatModel.findOne(search, callback);
};

CatModel = mongoose.model('Cat', CatSchema);

module.exports = { CatModel, CatSchema };
