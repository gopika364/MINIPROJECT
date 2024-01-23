const multer = require('multer');

// Configure Multer
const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage: storage });

module.exports = uploadMiddleware;




// const multer = require('multer');
// const sharp = require('sharp');

// // Configure Multer
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// module.exports = upload.array('productimage', 2);



// const multer=require('multer')

// // Configure Multer
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './public/img');
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname);
//     },
// });

// const upload = multer({ storage: storage });

// module.exports = upload;