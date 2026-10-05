const mongoose = require('mongoose');

const uri = 'mongodb+srv://Neba:Neba1994@cluster0.fojrp1c.mongodb.net/ai-job-platform?retryWrites=true&w=majority&appName=Cluster0';

console.log('Testing MongoDB connection...');
console.log('URI:', uri.replace('Neba1994', '***'));

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 5000,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully!');
  process.exit(0);
})
.catch((err) => {
  console.error('❌ MongoDB Connection Failed:');
  console.error(err.message);
  process.exit(1);
});
