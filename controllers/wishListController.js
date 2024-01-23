const wishListCollection = require('../models/wishListSchema');
const cartCollection = require('../models/cartSchema')

// wishList
const wishList = async (req, res) => {
  try {
    const user = req.session.user;
    const user1 = req.session.user;

    const cart = await cartCollection.find({userEmail:user1});


  const wishListItems = await wishListCollection
  .find({ userEmail: req.session.user })
  .populate('productId','images name price');
  


    res.render('user/wishList', {cart,wishListItems,user,wishListItems});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
};


//addtoWishList

const addToWishlist = async (req, res) => {
  try {
      const id = req.params.id;

      const name = await wishListCollection.findOne({ productId: id });

      if (name === null) {
          const data = {
              productId: id,
              userEmail: req.session.user
          };

          await wishListCollection.insertMany([data]);

          res.redirect('/wishList');
      } else {
          res.redirect('/');
      }
  } catch (error) {
      console.error("Error in addToWishlist function:", error);

      req.session.message = {
          message: 'Error while adding to wishlist',
          type: 'error'
      };

      res.redirect('/');
  }
};



  //remove wishList

  const removeWishList = async(req,res) => {
    const id = req.params.id;

    await wishListCollection.findOneAndDelete({productId:id});

    res.redirect('/wishList');
  }



module.exports = {
  wishList,addToWishlist,removeWishList
};
