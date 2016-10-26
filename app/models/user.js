require('./index');
var mongoose = require('mongoose'),
    bcrypt = require('bcryptjs');
//var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var abstract = require('./abstract'),
    Constants = require('../core/constants'),
    //Messages = require('../core/messages'),
    ValidationHandler = require('../handlers/validation-handler');
var autoIncrement = require('mongoose-auto-increment');

const Sex = Constants.Sex;
const ProofType = Constants.ProofType;

const EmergencyContact = {
    contactName: {type: String, required: false},
    contactNumber: {type: String, required: false}
};

const Document = {
    documentType: {type: ProofType, required: false},
    documentNumber: {type: String, required: false},
    documentCopy: {type: String, required: false},
    documentName: {type: String, required: false},
    description: {type: String, required: false}
};


var UserSchema = mongoose.Schema({
    UserID : Number,
    Name: {type: String, required: false},
    lastName: {type: String, required: false},
    fatherName: {type: String, required: false},
    email: {type: String, required: false, unique: true, validate: [ValidationHandler.validateEmail, 'Invalid email']},
    emailVerified: {type: Boolean, required: false, default: true},
    password: {type: String, required: false,default:'member@123'},
    phoneNumber: {type: String, required: false, unique: true},
    age: {type: Number, required: false, min: 5, max: 100},
    sex: {type: Sex, required: false},
    address: {type: String, required: false},
    city: {type: String, required: false},
    state: {type: String, required: false},
    country: {type: String, required: false},
    countryCode:{type: String, required: false},
    pinCode: {type: String, required: false},
    education: {type: String, required: false},
    occupation: {type: String, required: false},
    profilePic: {type: String, required: false, default: ''},
    cardNum:{type: Number, required: false},
    smartCardNumber: {type: String, required: false},
    emergencyContact: {type: EmergencyContact, required: false},
    assignedUser: {type: Schema.ObjectId, required: false},
    documents: {type: [Document], required: false}



}, { collection : 'users', discriminatorKey : '_type' });


var User = mongoose.model('user', UserSchema);

UserSchema.plugin(abstract);

UserSchema.plugin(autoIncrement.plugin,{model:User,field:'UserID',startAt: 1, incrementBy: 1});

User.schema.pre('save', function (next) {

    var user = this;

    if (this.isModified('password') || this.isNew) {

        bcrypt.genSalt(10, function (err, salt) {

            if (err) {

                return next(err);

            }

            bcrypt.hash(user.password, salt, function (err, hash) {

                if (err) {

                    return next(err);

                }

                user.password = hash;
                next();

            });

        });

    } else {

        return next();

    }

});

// Model Methods
User.schema.methods.comparePassword = function (passw, cb) {

    bcrypt.compare(passw, this.password, function (err, isMatch) {

        if (err) {

            return cb(err);

        }
        cb(null, isMatch);
    });
};


module.exports = User;


/*
// Third Party Dependencies
var mongoose = require('mongoose');
//var db = mongoose.connect('mongodb://127.0.0.1:27017/test');
var uuid = require('node-uuid'),
    bcrypt = require('bcryptjs'),

    _ = require('underscore');

// Application Level Dependencies
var abstract = require('./abstract');
var Constants = require('../core/constants'),
    ValidationHandler = require('../handlers/validation-handler'),
    Messages = require('../core/messages'),
    config = require('config');


// Mongoose Schema
var Schema = mongoose.Schema;

const Sex = Constants.Sex;
const ProofType = Constants.ProofType;
const MemberStatus = Constants.MemberStatus;


const Document = {
    documentType: {type: ProofType, required: true},
    documentNumber: {type: String, required: true},
    documentCopy: {type: String, required: false},
    documentName: {type: String, required: false},
    description: {type: String, required: false}
};

var schema = {
    email: {type: String, required: false, unique: true, validate: [ValidationHandler.validateEmail, 'Invalid email']},
    password: {type: String, required: true},
    phoneNumber: {type: String, required: true, unique: true},
    role: {type: String, required: true, default: 'user'},

    name: {type: String, required: true},
    lastName: {type: String, required: true},

    age: {type: Number, required: false, min: 5, max: 100},
    sex: {type: Sex, required: true},
    assignedUser: {type: Schema.ObjectId, required: false},

    address: {type: String, required: false},
    city: {type: String, required: false},
    state: {type: String, required: false},
    country: {type: String, required: false},
    pinCode: {type: String, required: false},

    picture: {type: String, required: false, default: ''},

    education: {type: String, required: false},
    occupation: {type: String, required: false},
    fatherName: {type: String, required: false},
    //smartCardId: {type: Schema.ObjectId, required: false, ref: 'Card'},
    smartCardNumber: {type: String, required: false},
    validity: {type: Date, required: false},

    creditBalance: {type: Number, required: false, default: 0},
    securityDeposit:{type:Number,required:false},

    documents: {type: [Document], required: false},
    keyUser:{type: String, required: false},
    membershipId: {type: Schema.ObjectId, required: false, ref: 'Membership'},
    status: {type: MemberStatus, required: true, default: MemberStatus.PROSPECTIVE}

};

var model = new Schema(schema);

// Plugins
model.plugin(abstract);

model.pre('save', function (next) {

    var user = this;

    if (this.isModified('password') || this.isNew) {

        bcrypt.genSalt(10, function (err, salt) {

            if (err) {

                return next(err);

            }

            bcrypt.hash(user.password, salt, function (err, hash) {

                if (err) {

                    return next(err);

                }

                user.password = hash;
                next();

            });

        });

    } else {

        return next();

    }

});

// Model Methods
model.methods.comparePassword = function (passw, cb) {

    bcrypt.compare(passw, this.password, function (err, isMatch) {

        if (err) {

            return cb(err);

        }
        cb(null, isMatch);
    });
};


// Mongoose Model
var User = mongoose.model('User', model, 'user');

User.count({email: "admin@mytrintrin.com"}, function (err, count) {

    if (err) {
        throw new Error(Messages.COULD_NOT_SANITIZE_THE_USER_COLLECTION + err);
    }

    if (count < 1) {

        var defaults = {
           // profileName: "My Trin Trin Admin",
            //username: "admin@mytrintrin.com",
            email: "admin@mytrintrin.com",
            password: "MttAdmin@123",
            name:"Mahesha",
            lastName:"siddegowda",
            smartCardNumber:"2DR35A6B00000000",
            emailVerified: "true",
            role: "admin",
            phoneNumber:"91-80508-09988",
            sex:"Male",
            status:1
        };

        User.create(defaults, function (err) {

            if (err) {
                throw new Error(Messages.COULD_NOT_INITIALIZE_THE_USER_COLLECTION + err);
            }

        });

    }

});

module.exports = User;*/
