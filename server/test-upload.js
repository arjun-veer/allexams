const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

// Test the upload endpoint
async function testUpload() {
  try {
    // First, login to get a token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.success) {
      console.error('Login failed:', loginData.message);
      return;
    }

    const token = loginData.data.accessToken;

    // Create a test file
    const testContent = 'This is a test PDF content';
    fs.writeFileSync('test.txt', testContent);

    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream('test.txt'));
    form.append('category', 'Uncategorized');

    // Test upload
    const uploadResponse = await fetch('http://localhost:5000/api/documents/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form
    });

    const uploadData = await uploadResponse.text();
    console.log('Upload response status:', uploadResponse.status);
    console.log('Upload response:', uploadData);

    // Clean up
    fs.unlinkSync('test.txt');

  } catch (error) {
    console.error('Test error:', error);
  }
}

testUpload();