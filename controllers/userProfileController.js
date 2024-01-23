const registercollection = require('../models/registerSchema');
const cartCollection = require('../models/cartSchema');
const bcrypt = require('bcrypt');



// userprofile
const userprofile = async (req, res) => {
  try {
      const user1 = req.session.user;

      const cart = await cartCollection.find({ userEmail: user1 });
      const user = await registercollection.findOne({ email: user1 });

      res.render('user/userprofile', { user, cart });
  } catch (error) {
      console.error("Error in userprofile function:", error);

      req.session.message = {
          message: "Error while fetching user profile data",
          type: "error",
      };

      res.redirect('/');
  }
};


// userAddAddress
const userAddAddress = async (req, res) => {
  try {
      const user1 = req.session.user;

      const cart = await cartCollection.find({ userEmail: user1 });
      const user = await registercollection.findOne({ email: user1 });

      res.render('user/addAddress', { user, cart });
  } catch (error) {
      console.error("Error in userAddAddress function:", error);

      req.session.message = {
          message: "Error while rendering the add address page",
          type: "error",
      };

      res.redirect('/');
  }
};


// postUserAddAddress
const postUserAddAddress = async (req, res) => {
  try {
      const address = {
          address1: req.body.address,
          city: req.body.city,
          state: req.body.state,
          postCode: req.body.postcode,
          name: req.body.name,
          mobile: req.body.mobile,
      };

      await registercollection.updateOne(
          { email: req.session.user },
          { $push: { address: address } }
      );

      res.redirect('/userAddAddress');
  } catch (error) {
      console.error("Error in postUserAddAddress function:", error);

      req.session.message = {
          message: "Error while adding address",
          type: "error",
      };

      res.redirect('/');
  }
};




// userDeleteAddress
const userDeleteAddress = async (req, res) => {
  try {
      const id = req.params.id;
      const user = req.session.user;

      await registercollection.updateOne(
          { email: user },
          { $pull: { address: { _id: id } } }
      );

      res.redirect('/userAddAddress');
  } catch (error) {
      console.error("Error in userDeleteAddress function:", error);

      req.session.message = {
          message: "Error while deleting address",
          type: "error",
      };

      res.redirect('/');
  }
};



// changePassword
const changePassword = async (req, res) => {
  try {
      const user1 = req.session.user;
      const message = req.session.message;
      req.session.message = null;

      const user = await registercollection.findOne({ email: user1 });
      const cart = await cartCollection.find({ userEmail: user1 });

      res.render('user/changePassword', { user, message, cart });
  } catch (error) {
      console.error("Error in changePassword function:", error);

      req.session.message = {
          message: "Error while rendering the change password page",
          type: "error",
      };

      res.redirect('/');
  }
};


//postChangePassword

const postChangePassword = async (req, res) => {
  try {
      const { password1, password2 } = req.body;
      const check = await registercollection.findOne({ email: req.session.user });
      
      if (!check) {
          throw new Error("User not found");
      }

      const storedHash = check.password;

      bcrypt.compare(password1, storedHash, async (err, result) => {
          if (err) {
              throw err;
          }

          if (result === false) {
              req.session.message = {
                  message: 'Invalid Password',
                  type: 'danger'
              };
              res.redirect('/changePassword');
          } else {
              const hashedPassword = await bcrypt.hash(password2, 10);
              await registercollection.findOneAndUpdate({ email: req.session.user }, { $set: { password: hashedPassword } });
              req.session.message = {
                  message: 'Password Updated and logged out',
                  type: 'success'
              };
              res.redirect('/logout');
          }
      });
  } catch (error) {
      console.error("Error in postChangePassword function:", error);

      req.session.message = {
          message: 'Error changing password',
          type: 'error'
      };

      res.redirect('/');
  }
};



module.exports = {
  userprofile,userAddAddress,postUserAddAddress,userDeleteAddress,changePassword,postChangePassword,
};