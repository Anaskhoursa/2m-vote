const mongoose = require('mongoose');

const connectDb1 = mongoose.createConnection("mongodb+srv://anasskhoursa:Anas2004@cluster0.wofqw5z.mongodb.net/Login_tut?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

connectDb1.on('connected', () => {
  console.log("db1 connected");
});

connectDb1.on('error', (err) => {
  console.log("db1 connection error", err);
});

const Loginschema = new mongoose.Schema({
  name: {
    type: String,
    
  },
  password: {
    type: String,
    required: true
  },
  BadgeNumber: {
    type: Number,
    required: true
  },
  email:{
    type: String,
    
  },
  phone:{
    type:String,
    
  },
  picture:{
    type: String
  },
  ville:{
    type: String
  },
  secteur:{
    type: String
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isConnected: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const users = connectDb1.model('users', Loginschema);

module.exports = { connectDb1, users };
