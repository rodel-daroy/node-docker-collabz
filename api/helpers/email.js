const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const _ = require('lodash');

const Email = require('../models/email');
const Errors = require('../helpers/errors');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Unsubscribe groups config: https://app.sendgrid.com/suppressions/advanced_suppression_manager
const SendgridUnsubscribeGroups = JSON.parse(process.env.SENDGRID_UNSUBSCRIBE_GROUPS || '{"ACCOUNT": 155958, "SECURITY": 155959}');

const emailDefaultTemplate = fs.readFileSync('./api/emails/defaultTemplate.html', 'utf8');

async function sendEmail(emailOptions, asmGroupId) {
  if (asmGroupId) {
    emailOptions.asm = {
      groupId: asmGroupId
    };
  }
  let createdEmail = null;
  try {
    const newEmail = new Email(emailOptions);
    createdEmail = await newEmail.save();
  } catch(err) {
    throw Errors.EMAIL_FAILURE;
  }

  // emailOptions.to = 'dave.idell@collabzapp.com';
  if (process.env.NODE_ENV != 'production') {
    let displayEmailOptions = _.cloneDeep(emailOptions);
    delete displayEmailOptions.html;
    console.log(`[Mail Service] - [TESTING MODE]: No email has been sent to ${emailOptions.to}:\n`, displayEmailOptions);
    return;
  }

  try {
    const response = await sgMail.send(emailOptions);
    createdEmail.sendSuccess = true;
    createdEmail.response = response;
    createdEmail.save();
  } catch(err) {
    let displayEmailOptions = _.cloneDeep(emailOptions);
    delete displayEmailOptions.html;
    console.log(err.response.body.errors);
    console.error(`[Mail Service] - Unable to send email to ${emailOptions.to} \n`, displayEmailOptions);
    createdEmail.sendSuccess = false;
    createdEmail.error = err;
    createdEmail.save();
  }

}

exports.sendReportUser = async (userId, userFullName, userUsername, userEmail, userComment, reportedByUserId, reportedByUsername) => {
  await sendEmail({
    from: `Collabz <support@collabzapp.com>`,
    to: `Collabz <support@collabzapp.com>`,
    subject: `Reported User: @${userUsername}`,
    text: `
      Reported User Info:\n\n
      id: ${userId}\n
      name: ${userFullName}\n
      username: ${userUsername}\n
      email: ${userEmail}\n\n
      comment: ${userComment}\n\n
      reported by: @${reportedByUsername} (${reportedByUserId})\n\n`,
    html: `
      Reported User Info:<br><br>
      id: ${userId}<br>
      name: ${userFullName}<br>
      username: ${userUsername}<br>
      email: ${userEmail}<br><br>
      comment: ${userComment}<br><br>
      reported by: @${reportedByUsername} (${reportedByUserId})<br><br>`
  }, SendgridUnsubscribeGroups.ACCOUNT);
};

function replaceSubs(text, subs) {
  Object.keys(subs).forEach(key => {
    text = text.replace(new RegExp(key, 'g'), subs[key]);
  });
  return text;
}

function useDefaultTemplate(body) {
  let subs = {
    '%%body%%': body
  };
  return replaceSubs(emailDefaultTemplate, subs);
}
