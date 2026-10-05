#!/usr/bin/env node
/**
 * MongoDB Atlas Connection Diagnostic Tool
 * This script tests your MongoDB connection and provides detailed feedback
 */

const mongoose = require('mongoose');
const dns = require('dns').promises;

// Your MongoDB connection string
const MONGODB_URI = 'mongodb+srv://Neba:Neba1994@cluster0.fojrp1c.mongodb.net/ai-job-platform?retryWrites=true&w=majority&appName=Cluster0';

console.log('🔍 MongoDB Atlas Connection Diagnostics\n');
console.log('=' .repeat(60));

async function runDiagnostics() {
  // Step 1: Parse connection string
  console.log('\n✓ Step 1: Parsing connection string...');
  const masked = MONGODB_URI.replace(/:[^:@]+@/, ':***@');
  console.log(`  Connection: ${masked}`);
  
  const urlMatch = MONGODB_URI.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)/);
  if (urlMatch) {
    const [, username, password, host] = urlMatch;
    console.log(`  Username: ${username}`);
    console.log(`  Password: ${'*'.repeat(password.length)}`);
    console.log(`  Host: ${host}`);
  }

  // Step 2: DNS Resolution
  console.log('\n✓ Step 2: Testing DNS resolution...');
  try {
    const records = await dns.resolveSrv('_mongodb._tcp.cluster0.fojrp1c.mongodb.net');
    console.log(`  ✅ DNS resolved: Found ${records.length} servers`);
    records.forEach((r, i) => {
      console.log(`     Server ${i + 1}: ${r.name}:${r.port}`);
    });
  } catch (err) {
    console.log(`  ❌ DNS resolution failed: ${err.message}`);
    console.log('  → This might indicate network issues or incorrect cluster name');
  }

  // Step 3: Check public IP
  console.log('\n✓ Step 3: Checking your public IP address...');
  try {
    const https = require('https');
    const ip = await new Promise((resolve, reject) => {
      https.get('https://api.ipify.org?format=json', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve(JSON.parse(data).ip));
      }).on('error', reject);
    });
    console.log(`  Your public IP: ${ip}`);
    console.log(`  → Make sure this IP is whitelisted in MongoDB Atlas`);
    console.log(`  → Or use 0.0.0.0/0 to allow all IPs (testing only)`);
  } catch (err) {
    console.log(`  ⚠️  Could not determine public IP: ${err.message}`);
  }

  // Step 4: Attempt connection with different timeouts
  console.log('\n✓ Step 4: Testing MongoDB connection...');
  console.log('  Attempting connection (timeout: 10 seconds)...\n');

  const startTime = Date.now();
  
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`  ✅ SUCCESS! Connected to MongoDB in ${elapsed}s`);
    console.log(`  Database: ${mongoose.connection.name}`);
    console.log(`  Host: ${mongoose.connection.host}`);
    
    await mongoose.connection.close();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 MongoDB connection is working correctly!');
    console.log('   Your backend should be able to connect now.');
    console.log('='.repeat(60));
    process.exit(0);
    
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`  ❌ FAILED after ${elapsed}s\n`);
    
    console.log('Error Details:');
    console.log(`  Type: ${err.name}`);
    console.log(`  Message: ${err.message}\n`);
    
    console.log('=' .repeat(60));
    console.log('🔧 Troubleshooting Steps:\n');
    
    if (err.message.includes('IP') || err.message.includes('whitelist')) {
      console.log('Issue: IP Address Not Whitelisted');
      console.log('Solution:');
      console.log('  1. Go to https://cloud.mongodb.com');
      console.log('  2. Select your project and cluster');
      console.log('  3. Click "Network Access" in left sidebar');
      console.log('  4. Click "Add IP Address"');
      console.log('  5. Either:');
      console.log('     - Click "Add Current IP Address", OR');
      console.log('     - Click "Allow Access from Anywhere" (0.0.0.0/0)');
      console.log('  6. Wait 2-3 minutes for changes to propagate');
    } else if (err.message.includes('authentication') || err.message.includes('credentials')) {
      console.log('Issue: Authentication Failed');
      console.log('Solution:');
      console.log('  1. Go to https://cloud.mongodb.com');
      console.log('  2. Click "Database Access" in left sidebar');
      console.log('  3. Verify user "Neba" exists');
      console.log('  4. Check password is correct');
      console.log('  5. Ensure user has "readWriteAnyDatabase" role');
      console.log('  6. If unsure, create a new database user');
    } else if (err.message.includes('timeout') || err.message.includes('ENOTFOUND')) {
      console.log('Issue: Network/DNS Problem');
      console.log('Solution:');
      console.log('  1. Check your internet connection');
      console.log('  2. Try accessing https://cloud.mongodb.com in browser');
      console.log('  3. Check if firewall is blocking outbound connections');
      console.log('  4. Try disabling VPN if you have one active');
    } else {
      console.log('Issue: Unknown Error');
      console.log('Solution:');
      console.log('  1. Copy the error message above');
      console.log('  2. Go to MongoDB Atlas and get a fresh connection string:');
      console.log('     - Click "Connect" on your cluster');
      console.log('     - Choose "Connect your application"');
      console.log('     - Copy the connection string');
      console.log('  3. Update backend/.env with the new string');
    }
    
    console.log('\n' + '='.repeat(60));
    process.exit(1);
  }
}

runDiagnostics().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
