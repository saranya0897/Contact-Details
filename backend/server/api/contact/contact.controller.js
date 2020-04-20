'use strict';

var _ = require('lodash');
var Contact = require('./contact.model');
var Nexmo = require('nexmo');
var path = require('path');
var config = require('../../config/environment');

var xl = require('excel4node');
const readXlsxFile = require('read-excel-file/node');

// send SMS to the Number
exports.sendSMS = function (req, res) {
  const nexmo = new Nexmo({
    apiKey: 'c6913d4e',
    apiSecret: '7EtkkMlJsytuViF6',
  });

  const from = 'Contact SMS';
  console.log('SMS API');
  nexmo.message.sendSms(from, req.body.toNumber, req.body.smstext, {
    type: "unicode"
  }, (err, responseData) => {
    if (err) {
      console.log(err);
    } else {
      if (responseData.messages[0]['status'] === "0") {
        console.log("Message sent successfully.");
      } else {
        console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
      }
    }
  });
}

// downloads the excel template
exports.excelDownload = function (req, res) {
  var wb = new xl.Workbook();
  //Adding a Style
  var myStyle = wb.createStyle({
    font: {
      bold: true,
      underline: true,
    },
    alignment: {
      wrapText: true,
      horizontal: 'center',
    },
  });

  // Add Worksheets to the workbook
  var ws = wb.addWorksheet('Contacts');
  ws.row(1).freeze();
  ws.cell(1, 1).string('Full Name').style(myStyle);
  ws.cell(1, 2).string('Email').style(myStyle);
  ws.cell(1, 3).string('Phone Number').style(myStyle);
  ws.cell(1, 4).string('Company Name').style(myStyle);
  ws.cell(1, 5).string('Address').style(myStyle);
  ws.cell(1, 6).string('Role').style(myStyle);
  wb.write(path.join(config.root) + '/uploads/contact-' + req.user._id + '.xlsx', function () {
    res.status(200).send({ url: req.protocol + '://' + req.headers.host + '/uploads/contact-' + req.user._id + '.xlsx' });
  })
};

const schema = {
  'Full Name': {
    prop: 'name',
    type: String,
    required: true
  },
  'Company Name': {
    prop: 'companyname',
    type: String,
    required: true
  },
  'Email': {
    prop: 'email',
    type: String,
    required: true,
  },
  'Role': {
    prop: 'role',
    type: String,
    required: true
  },
  'Phone Number': {
    prop: 'mobile',
    type: Number,
    required: true,
    parse(value) {
      if (value != null && typeof (value) != 'number') { throw new Error('mobile Number should be numeric.') }
      else { return value; }
    }
  },
  'Address': {
    prop: 'address',
    type: String,
    required: true
  }
}

// file upload
exports.excelupload = function (req, res) {
  var file = {};
  file.path = req.files.uploads.path;
  file.format = (req.files.uploads.path).split('.')[1];
  if (file.format == 'xlsx') { var filePath = path.join(config.root) + '/' + req.files.uploads.path; }
  else { return res.status(500).send({ message: 'Invalid File' }); }
  if (filePath) {
    readXlsxFile(file.path, { schema }).then(({ rows, errors }) => {
      var requiredErrorArray = [];
      _.map(rows, (data) => data.createdUserid = req.user._id);
      errors.forEach(element => {
        if (element.error == 'required') { requiredErrorArray.push(element); }
      });
      if ((rows.length == 0 && errors.length == 0)) {
        return res.status(500).json({ message: 'No Records to Insert' });
      } else if (requiredErrorArray.length > 0) {
        return res.status(500).json({ message: requiredErrorArray });
      } else {
        Contact.insertMany(rows, function (err, result) {
          if (err) return handleError(res, err);
          return res.status(200).send(result);
        })
      }
    })
  }
}

// Get list of contacts based upon search value
exports.search = function (req, res) {
  Contact.find({
    $and: [{ createdUserid: req.user._id }, {
      $or: [{ name: { $regex: req.params.searchValue, $options: "ix" } },
      { email: { $regex: req.params.searchValue, $options: "ix" } },
      { companyname: { $regex: req.params.searchValue, $options: "ix" } },
      { mobile: { $regex: req.params.searchValue, $options: "ix" } },
      { role: { $regex: req.params.searchValue, $options: "ix" } }]
    }]
  }).exec(function (err, contacts) {
    if (err) { console.log(err); return handleError(res, err); }
    return res.status(200).json(contacts);
  });
};

// Get list of contacts
exports.index = function (req, res) {
  const query = req.params.sortby;
  Contact.find({ createdUserid: req.user._id }).sort({ [query]: 1 }).exec(function (err, contacts) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(contacts);
  });
};

// Get a single contact
exports.show = function (req, res) {
  Contact.findById(req.params.id, function (err, contact) {
    if (err) { return handleError(res, err); }
    if (!contact) { return res.status(404).send('Not Found'); }
    return res.json(contact);
  });
};

// Creates a new contact in the DB.
exports.create = function (req, res) {
  req.body.createdUserid = req.user._id;
  Contact.create(req.body, function (err, contact) {
    if (err) { return handleError(res, err); }
    return res.status(201).json(contact);
  });
};

// Updates an existing contact in the DB.
exports.update = function (req, res) {
  if (req.body._id) { delete req.body._id; }
  Contact.findById(req.params.id, function (err, contact) {
    if (err) { return handleError(res, err); }
    if (!contact) { return res.status(404).send('Not Found'); }
    var updated = _.merge(contact, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(contact);
    });
  });
};

// Deletes a contact from the DB.
exports.destroy = function (req, res) {
  Contact.findById(req.params.id, function (err, contact) {
    if (err) { return handleError(res, err); }
    if (!contact) { return res.status(404).send('Not Found'); }
    contact.remove(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

exports.customizeHeader = function (req, res) {
  const header = [
    { columnname: 'basicinfo', display: true, default: true },
    { columnname: 'name', display: false, default: false },
    { columnname: 'companyname', display: true, default: true },
    { columnname: 'email', display: false, default: false },
    { columnname: 'mobile', display: false, default: false },
    { columnname: 'role', display: false, default: false }]
  return res.status(200).send(header);
}

function handleError(res, err) {
  return res.status(500).send(err);
}