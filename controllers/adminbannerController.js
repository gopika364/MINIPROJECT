const bannerCollection = require('../models/bannerSchema');
const categoryCollection = require('../models/catergorySchema');
const sharp = require('sharp');
const path = require('path');



// addBanner
const addBanner = async (req, res) => {
  try {
    const status = 'addBanner';
    const message = req.session.message;
    req.session.message = null;
    const category = await categoryCollection.find();
    res.render('admin/addBanner', { status, message, category });
  } catch (error) {
    console.error('Error in addBanner:', error);
    res.status(500).send('Internal Server Error');
  }
};




// postAddBanner
const postAddBanner = async (req, res) => {
  try {
    const bannerData = {
      name: req.body.bannername,
      description: req.body.description,
      category: req.body.category,
    };

    // Process and crop each uploaded image
    const processedImages = await Promise.all(
      req.files.map(async (file) => {
        const processedImageBuffer = await sharp(file.buffer)
          .resize(1900, 700)
          .toBuffer();

        const imageName = `${Date.now()}_${file.originalname}`;
        const imagePath = path.join('public', 'img', imageName);
        await sharp(processedImageBuffer).toFile(imagePath);

        return imageName;
      })
    );

    bannerData.images = processedImages;

    await bannerCollection.insertMany([bannerData]);

    req.session.message = {
      message: 'Banner Added',
      type: 'success',
    };
    res.redirect('/admin/addBanner');
  } catch (error) {
    console.error('Error in postAddBanner:', error);
    res.status(500).send('Internal Server Error');
  }
};





// bannerList
const bannerList = async (req, res) => {
  try {
    const message = req.session.message;
    req.session.message = null;
    const status = 'listBanner';

    const banners = await bannerCollection.find();
    const category = await categoryCollection.find();

    res.render('admin/bannerList', { status, banners, message, category });
  } catch (error) {
    console.error('Error in bannerList:', error);
    res.status(500).send('Internal Server Error');
  }
};




// editBanner
const editBanner = async (req, res) => {
  try {
    const id = req.params.id;
    const status = 'editBanner';
    const message = req.session.message;
    req.session.message = null;
    const banner = await bannerCollection.findOne({ _id: id });
    const category = await categoryCollection.find();

    res.render('admin/editBanner', { status, message, banner, category });
  } catch (error) {
    console.error('Error in editBanner:', error);
    res.status(500).send('Internal Server Error');
  }
};





// updateBanner
const updateBanner = async (req, res) => {
  try {
    const id = req.params.id;
    const files = req.files;

    if (!files || Object.keys(files).length === 0) {
      const data = {
        name: req.body.bannername,
        description: req.body.description,
        category: req.body.category,
      };

      await bannerCollection.updateOne({ _id: id }, { $set: data });

      req.session.message = {
        message: 'Banner Editted',
        type: 'success',
      };
      res.redirect('/admin/bannerList');
    } else {
      const data = {
        name: req.body.bannername,
        description: req.body.description,
        images: req.files.map((file) => file.filename),
      };

      const processedImages = await Promise.all(
        files.map(async (file) => {
          const processedImageBuffer = await sharp(file.buffer)
            .resize(1900, 700)
            .toBuffer();

          const imageName = `${Date.now()}_${file.originalname}`;
          const imagePath = path.join('public', 'img', imageName);
          await sharp(processedImageBuffer).toFile(imagePath);

          return imageName;
        })
      );

      data.images = processedImages;

      await bannerCollection.updateOne({ _id: id }, { $set: data });

      res.redirect('/admin/bannerList');
    }
  } catch (error) {
    console.error('Error in updateBanner:', error);
    res.status(500).send('Internal Server Error');
  }
};





// deleteBanner
const deleteBanner = async (req, res) => {
  try {
    const id = req.params.id;
    await bannerCollection.findOneAndDelete({ _id: id });

    req.session.message = {
      message: 'Banner Deleted',
      type: 'success',
    };

    res.redirect('/admin/bannerList');
  } catch (error) {
    console.error('Error in deleteBanner:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  addBanner,
  postAddBanner,
  bannerList,
  editBanner,
  updateBanner,
  deleteBanner,
};
