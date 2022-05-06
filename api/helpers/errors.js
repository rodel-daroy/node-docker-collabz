module.exports = {

  // Server errors
  SERVER: {status: 500, code: 5000, message: 'Something unexpected happened. We\'re looking into it.'},
  DATABASE: {status: 500, code: 5010, message: 'An unexpected error has occurred. Collabz Support has been notified.'},
  AWS_FAILURE: {status: 500, code: 5020, message: 'An unexpected error has occurred. Collabz Support has been notified.'},
  EMAIL_FAILURE: {status: 500, code: 5030, message: 'An unexpected error has occurred. Collabz Support has been notified.'},
  WALLET_NOT_IMPLEMENTED: {status: 500, code: 5100, message: 'We currently do not support this type of payment method.'},
  TRANSACTION_TYPE_NOT_IMPLEMENTED: {status: 500, code: 5105, message: 'We are unable to create this type of receipt.'},
  DOWNLOAD_FAILURE: {status: 500, code: 5101, message: 'We are unable to get the remote file.'},
  UPLOAD_FAILURE: {status: 500, code: 5105, message: 'There was something wrong with your upload.'},

  // Client errors
  NOT_FOUND: {status: 404, code: 2000, message: 'An unexpected error has occurred.'},
  DEPRECATED: {status: 400, code: 2001, message: 'It seems that your app is out of date! Please update the app.'},
  USER_NOT_FOUND: {status: 404, code: 2003, message: 'We can\'t find a user with that username.'},

  // User errors
  INVALID_AUTHORIZATION: {status: 403, code: 1000, message: 'It seems you that are not allowed to do that.'},
  INVALID_CREDENTIAL: {status: 401, code: 1001, message: 'Something was wrong with your email or password. Please try again.'},
  INVALID_RECAPTCHA: {status: 401, code: 1010, message: 'Something was wrong with your recaptcha response. Please try again.'},
  NO_PRODUCT_ACCESS: {status: 400, code: 1020, message: 'You don\'t have access to this course.'},
  
  ROOM_ENDED: {status: 400, code: 1030, message: 'This room has ended.'},

  INVALID_INVITE: {status: 401, code: 1050, message: 'Something was wrong with your invite.'},
  INVALID_SIGNATURE: {status: 401, code: 1060, message: 'Invalid signature.'},

  PHONE_ALREADY_EXISTS: {status: 400, code: 1100, message: 'That phone number is already taken.'},
  USERNAME_ALREADY_EXISTS: {status: 400, code: 1105, message: 'That username is already taken.'},
  EMAIL_ALREADY_EXISTS: {status: 400, code: 1107, message: 'That email is already taken.'},
  REF_ALREADY_EXIST: {status: 400, code: 1110, message: 'That referral code is already taken.'},
  PHONE_TEXT_FAIL: {status: 400, code: 1115, message: 'There was a problem sending your text.'},
  
  INVALID_INVITE_CODE: {status: 400, code: 1211, message: 'Invalid Invite Code'},
  INVITE_EXPIRED: {status: 400, code: 1212, message: 'This invite has expired.'},
  INVALID_CONFIRMATION: {status: 400, code: 1221, message: 'Confirmation code is invalid, please try again.'},
  WAIT_TO_VERIFY: {status: 400, code: 1230, message: 'Please wait before trying again.'},
  VERIFY_CODE_INVALID: {status: 400, code: 1240, message: 'That verification code is invalid.'},

  PASSWORD_LINK_EXPIRED: {status: 400, code: 1301, message: 'Link is expired.'},
  PASSWORD_RESET_ERROR: {status: 400, code: 1303, message: 'There was a problem with your link.'},
  PASSWORD_NOT_CORRECT: {status: 400, code: 1306, message: 'Password is not correct.'},

  INVALID_WALLET: {status: 400, code: 1500, message: 'Invalid payment method, please select a different one.'},
  MISSING_WALLET: {status: 400, code: 1501, message: 'Please add a payment method in your account settings.'},

  STRIPE_TOKEN: {status: 400, code: 1509, message: 'Unable to process. Please enter a payment method.'},
  STRIPE_CUSTOMER(message) {
    return {status: 400, code: 1510, message: message + ' Please try again or use another payment method.'};
  },
  STRIPE_CHARGE(message) {
    return {status: 400, code: 1511, message: message + ' Please try again or use another payment method.'};
  },
  STRIPE_REFUND(message) {
    return {status: 400, code: 1512, message: message + ' Please try again or use another payment method.'};
  },

  BRAINTREE_TOKEN: {status: 400, code: 1520, message: 'You first need to log in to PayPal.'},
  BRAINTREE_CUSTOMER(message) {
    return {status: 400, code: 1521, message: message + '. Please try again or use another payment method.'}
  },
  BRAINTREE_CHARGE(message) {
    return {status: 400, code: 1522, message: message + '. Please try again or use another payment method.'};
  },
  BRAINTREE_REFUND(message) {
    return {status: 400, code: 1523, message: message + ' Please try again or use another payment method.'};
  },
  BRAINTREE_RECEIPT: {status: 400, code: 1524, message: 'We cannot send a PayPal receipt. You must do this from your PayPal account directly.'},

  INVOICE_REFUND: {status: 400, code: 1531, message: 'Unable to refund more than the total amount.'},
  INVOICE_RECEIPT: {status: 400, code: 1532, message: 'Please contact support to obtain an invoice.'},

  OUTSTANDING_BALANCE: {status: 400, code: 1550, message: 'You cannot see content due to an outstanding balance on your account. Please contact support for assistance.'},
  
  PROMOTION_NOT_FOUND: {status: 404, code: 1594, message: 'Not a valid promo code'},
  PROMOTION_NOT_STARTED: {status: 400, code: 1595, message: 'This promotion has not started yet.'},
  PROMOTION_EXPIRED: {status: 400, code: 1596, message: 'This promotion has expired.'},
  PROMOTION_INVALID_PRODUCT: {status: 400, code: 1597, message: 'This promotion does not match with the product selected.'},
  PROMOTION_USED: {status: 400, code: 1598, message: 'This promotion has already been redeemed.'},
  PROMOTION_EXISTING_USER: {status: 400, code: 1599, message: 'This promotion cannot be used right now.'},

  REFERRAL_INVALID: {status: 400, code: 1601, message: 'Your referral is not valid. Support has been notified!'},
  REFERRAL_USED: {status: 400, code: 1602, message: 'This referral has already been redeemed.'},

  MESSAGE_TOO_LONG: {status: 400, code: 1670, message: 'Your message is too long!'},
  TOO_MANY_MESSAGES: {status: 400, code: 1675, message: 'You\'ve sent too many messages. Please wait a minute.'},  

  INVALID_ORDER: {status: 400, code: 1700, message: 'We were unable to complete your purchase.'},
  ORDER_MULTIPLE_CURRENCY: {status: 400, code: 1701, message: 'Sorry, we can not support multiple products with different currencies.'},
  PAYPAL_INVALID_CURRENCY: {status: 400, code: 1702, message: 'Sorry, PayPal does not support this currency. Please try a credit card instead.'},
  INVALID_PRODUCT: {status: 400, code: 1705, message: 'There was something wrong with your purchase, so it was not completed. Please try again later.'},
  MISSING_CARD: {status: 400, code: 1710, message: 'It looks like you don\'t have a payment method. You can add one in your settings.'},

  FILE_TOO_LARGE: {status: 400, code: 1750, message: 'Uploads must be less than 8 MB.'},
  
  // Inbound webhook errors
  INVALID_SOURCE: {status: 400, code: 1800, message: 'Invalid source.'},
  MISSING_DATA_OBJECT: {status: 400, code: 1803, message: 'Missing data object.'},
  INVALID_EVENT_TYPE: {status: 400, code: 1806, message: 'Invalid event type.'},
  MISSING_PLAN_PRODUCT: {status: 400, code: 1809, message: 'Missing plan product.'},
  INVALID_CUSTOMER_OR_PERIOD: {status: 400, code: 1812, message: 'Invalid customer or current period end.'},
  CANNOT_FIND_PRODUCT: {status: 400, code: 1815, message: 'Cannot find product.'},
  CANNOT_FIND_USER: {status: 400, code: 1818, message: 'We can\'t find that user.'},
  STRIPE_USER_MISSING_EMAIL: {status: 400, code: 1821, message: 'Stripe user missing email.'},
  STRIPE_USER_MISSING_ID: {status: 400, code: 1824, message: 'Stripe user missing Stripe ID.'},
  CANNOT_FIND_BUNDLE: {status: 400, code: 1833, message: 'Cannot find bundle.'},
  INVALID_BUNDLE_DATA: {status: 400, code: 1836, message: 'Invalid bundle data.'},
  BUNDLE_ALREADY_EXISTS: {status: 400, code: 1839, message: 'Bundle already exists.'},

};
