const express = require('express');
const router = express.Router();
const multer = require('multer');
const multerLimits = { fileSize: 1024 * 1024 * 8 }; // 8 mb max file size
const upload = multer({ limits: multerLimits });
const { authorized } = require('../middleware/auth');
const ctrl = require('../controllers/files');


router.get('/signedUrl', authorized, ctrl.createS3SignedUrl);
router.get('/mimeType/:extension/extension', ctrl.getMimeTypeFromExtension);


module.exports = router;
