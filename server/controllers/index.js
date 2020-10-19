// pull in our models. This will automatically load the index.js from that folder
const models = require('../models');

const Cat = models.Cat.CatModel;

// default fake data so that we have something to work with until we make a real Cat
const defaultData = {
  name: 'unknown',
  bedsOwned: 0,
};

let lastAdded = new Cat(defaultData); // this creates a Mongoose object
console.dir(lastAdded);

const hostIndex = (req, res) => {
  res.render('index', {
    currentName: lastAdded.name,
    title: 'Home',
    pageName: 'Home Page',
  });
};

const readAllCats = (req, res, callback) => {
  // get all cats
  // https://mongoosejs.com/docs/api.html#model_Model.find
  // without a filter object parameter I get every Cat document back
  // .lean() gives me just the Mongo document and filters out all other mongoose stuff
  Cat.find(callback).lean();
};

const readCat = (req, res) => {
  // get 1 cat
  const name1 = req.query.name;

  // "error first" style
  // mongoose will return either an error, or a Document (i.e. a result)
  const callback = (err, doc) => {
    if (err) {
      return res.status(500).json({ err }); // in a production env we would not send back the entire error message
    }
    return res.json(doc);
  };
  Cat.findByName(name1, callback); // see CatSchema.statics.findByName in Cat.j
};

const hostPage1 = (req, res) => {
  // "error first" style again
  // mongoose will return either an error, or an *array* of Documents, which we call `docs` this time
  const callback = (err, docs) => {
    if (err) {
      return res.status(500).json({ err }); // in a production env we would not send back the entire error message
    }

    return res.render('page1', { cats: docs });
  };

  readAllCats(req, res, callback);
};

const hostPage2 = (req, res) => {
  res.render('page2');
};

const hostPage3 = (req, res) => {
  res.render('page3');
};

const getName = (req, res) => res.json({ name: lastAdded.name });

const setName = (req, res) => {
  if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
    return res.status(400).json({ error: 'firstname,lastname and beds are all required' });
  }
  // create new cat
  const name = `${req.body.firstname} ${req.body.lastname}`;
  const cataData = {
    name,
    bedsOwned: req.body.beds,
  };

  const newCat = new Cat(cataData);
  const savePromise = newCat.save();

  savePromise.then(() => {
    lastAdded = newCat;
    res.json({
      name: lastAdded.name,
      beds: lastAdded.bedsOwned,
    });
  });

  savePromise.catch((err) => {
    res.status(500).json({ err });
  });

  return res; // to keep ESLint happy
};

const searchName = (req, res) => {
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  return Cat.findByName(req.query.name, (err, doc) => {
    if (err) {
      return res.status(500).json({ err });
    }

    // When there are no matches findOne() returns null!
    if (!doc) {
      return res.json({ error: 'No cats found!' });
    }

    return res.json({
      name: doc.name,
      beds: doc.bedsOwned,
    });
  });
};

const updateLast = (req, res) => {
  // update lastAdded Cat
  lastAdded.bedsOwned++;

  // save the changes to mongo
  const savePromise = lastAdded.save();
  savePromise.then(() => {
    // return the updated Cat if successful
    res.json({
      name: lastAdded.name,
      beds: lastAdded.bedsOwned,
    });
  });

  // // return an error message if not successful
  savePromise.catch((err) => {
    res.status(500).json({ err });
  });
};

const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};

module.exports = {
  index: hostIndex,
  page1: hostPage1,
  page2: hostPage2,
  page3: hostPage3,
  readCat,
  getName,
  setName,
  updateLast,
  searchName,
  notFound,
};
