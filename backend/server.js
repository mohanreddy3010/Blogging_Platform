// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS middleware

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// Define schema for subscription collection
const subscriptionSchema = new mongoose.Schema({
  email: String,
  subscriptions: [String],
});

// Create Subscription model
const Subscription = mongoose.model('Subscription', subscriptionSchema);

// API endpoint to fetch user subscriptions
app.get('/api/user/subscriptions', async (req, res) => {
  try {
    const userEmail = req.query.email; // Get email from query parameter

    // Find subscription by email
    const subscription = await Subscription.findOne({ email: userEmail });
    if (!subscription) {
      return res.status(404).json({ message: 'Subscriptions not found for the user' });
    }

    // Send user's subscriptions in the response
    res.json({ subscriptions: subscription.subscriptions });
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// API endpoint to handle subscription updates
app.post('/api/subscribe', async (req, res) => {
  const { email, subscriptions } = req.body;

  try {
    // Check if there's already a subscription document for the email
    let subscription = await Subscription.findOne({ email });

    if (!subscription) {
      // If no subscription document exists, create a new one
      subscription = new Subscription({
        email,
        subscriptions,
      });
    } else {
      // If a subscription document exists, update it
      subscription.subscriptions = subscriptions;
    }

    // Save the subscription document
    await subscription.save();

    res.status(200).send('Subscription updated successfully');
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).send('Internal server error');
  }
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myblog', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Define User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
});

const User = mongoose.model('User', userSchema);

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  email: String // Adding email field to store user's email
});

const Post = mongoose.model('Post', postSchema);

const notificationSchema = new mongoose.Schema({
  title: String,
  category: String,
  emails: [String]
});

const Notification = mongoose.model('Notification', notificationSchema);


// Example of a default route handler
app.get('/', (req, res) => {
  res.send('Welcome to the backend server');
});

// Signup route
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // Validate input (you can use a library like Joi for validation)
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Check if user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    // Create a new user
    const newUser = new User({ name, email, password, role });
    await newUser.save();
    res.status(201).json({ message: 'User signed up successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    // Check if password matches
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    // If email and password are correct, return success message
    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/create-post', async (req, res) => {
  try {
    const { email, title, content, category } = req.body;

    // Check if user with provided email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Create post data
    const post = new Post({
      email,
      title,
      content,
      category
    });

    // Save post data to the database
    await post.save();

    // Find all subscriptions where category matches the category of the post
    const subscriptions = await Subscription.find({ subscriptions: category });

    // Extract emails from subscriptions
    const emails = subscriptions.map(subscription => subscription.email);

    // Create notifications data
    const notificationsData = {
      title,
      category,
      emails
    };

    // Save notifications data to the notifications collection
    const notification = new Notification(notificationsData);
    await notification.save();

    res.status(201).json({ message: 'Post created successfully' });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




app.get('/api/user/:email', async (req, res) => {
  try {
      const email = req.params.email;
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.json({ name: user.name, email: user.email }); // Send user's name and email in the response
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/posts/:category', async (req, res) => {
  try {
    const category = req.params.category;
    // Find posts by category
    const posts = await Post.find({ category });
    res.json({ posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// API endpoint to fetch notifications for a specific user
app.get('/api/notifications', async (req, res) => {
  try {
    const userEmail = req.query.email; // Get email from query parameter

    // Find notifications by user's email
    const notifications = await Notification.find({ emails: userEmail });
    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API endpoint to delete a notification
app.delete('/api/notifications/:id', async (req, res) => {
  try {
    const notificationId = req.params.id;

    // Delete notification by ID
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).send('Notification deleted successfully');
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
