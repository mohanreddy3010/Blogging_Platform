import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Button, Container, Divider, Menu, MenuItem, TextField, Select, Card, CardContent, FormGroup, FormControlLabel, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';
import { useLocation } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RFU from './rfu';

const sections = [
  { title: 'Academic Resources', url: '/academic-resources' },
  { title: 'Career Services', url: '/career-services' },
  { title: 'Campus', url: '/campus' },
  { title: 'Culture', url: '/culture' },
  { title: 'Local Community Resources', url: '/local-community-resources' },
  { title: 'Social', url: '/social' },
  { title: 'Sports', url: '/sports' },
  { title: 'Health and Wellness', url: '/health-and-wellness' },
  { title: 'Technology', url: '/technology' },
  { title: 'Travel', url: '/travel' },
  { title: 'Alumni', url: '/alumni' },
];

function Dashboard() {
  const location = useLocation();
  const [selectedSection, setSelectedSection] = useState(sections[0]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [createPostMode, setCreatePostMode] = useState(false);
  const [subscribeMode, setSubscribeMode] = useState(false);
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    category: '',
    email: '', // New field for email
  });
  const [userName, setUserName] = useState('');
  const [posts, setPosts] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRecommendedPopup, setShowRecommendedPopup] = useState(false); // Define state for Recommended popup

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    setUserName(storedUserName);

    fetchPosts(selectedSection.title);
    fetchUserSubscriptions();
    fetchNotifications();
  }, []);

  const fetchPosts = async (category) => {
    try {
      const response = await fetch(`http://localhost:5001/api/posts/${category}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      } else {
        console.error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchUserSubscriptions = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch(`http://localhost:5001/api/user/subscriptions?email=${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        setUserSubscriptions(data.subscriptions);
      } else {
        console.error('Failed to fetch user subscriptions');
      }
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch(`http://localhost:5001/api/notifications?email=${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      } else {
        console.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSectionClick = (section) => {
    setSelectedSection(section);
    setCreatePostMode(false);
    setSubscribeMode(false);
    fetchPosts(section.title);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLogout = () => {
    window.localStorage.removeItem('userName');
    window.location.href = '/login';
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCreatePostClick = () => {
    setCreatePostMode(true);
    setSubscribeMode(false);
  };

  const handleSubscribeClick = () => {
    setSubscribeMode(true);
    setCreatePostMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostData({
      ...postData,
      [name]: value,
    });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch('http://localhost:5001/api/create-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...postData,
          email: userEmail,
        }),
      });
      if (response.ok) {
        console.log('Post created successfully');
      } else {
        console.error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedComponents((prevSelected) => [...prevSelected, value]);
    } else {
      setSelectedComponents((prevSelected) =>
        prevSelected.filter((component) => component !== value)
      );
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch('http://localhost:5001/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          subscriptions: selectedComponents,
        }),
      });

      if (response.ok) {
        console.log('Subscription updated successfully');
        fetchUserSubscriptions();
      } else {
        console.error('Failed to update subscription');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const handleNotificationsClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClose = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchNotifications();
        console.log('Notification removed successfully');
      } else {
        console.error('Failed to remove notification');
      }
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  const handleRecommendedClick = () => {
    // When "Recommended for you" button is clicked, show popup window
    setShowRecommendedPopup(true);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Blog
          </Typography>
          {/* "Recommended for you" button */}
      <Button color="inherit" onClick={handleRecommendedClick}>Recommended for you</Button>

<Dialog open={showRecommendedPopup} onClose={() => setShowRecommendedPopup(false)}>
  <DialogTitle>Recommended for You</DialogTitle>
  <DialogContent>
    {/* Render the content of RFU component */}
    <RFU />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setShowRecommendedPopup(false)} color="primary">
      Close
    </Button>
  </DialogActions>
</Dialog>
          <IconButton color="inherit" onClick={handleNotificationsClick}>
            <NotificationsIcon />
          </IconButton>
          <Button color="inherit" onClick={handleSubscribeClick}>Subscribe</Button>
          <Button color="inherit" onClick={handleCreatePostClick}>Create Post</Button>
          <IconButton edge="end" color="inherit" aria-label="user" onClick={handleMenuClick}>
            <AccountCircleIcon />
          </IconButton>
          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
          <Typography variant="subtitle1" component="div">
            {userName ? `Welcome, ${userName}` : 'Welcome'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Toolbar>
          {sections.map((section, index) => (
            <Button
              key={index}
              color="inherit"
              onClick={() => handleSectionClick(section)}
              sx={{ textTransform: 'none', minWidth: '30px', marginLeft: '5px' }}
              variant={selectedSection === section ? 'contained' : 'text'}
            >
              {section.title}
            </Button>
          ))}
        </Toolbar>
        <Divider />

        <div>
          {createPostMode ? (
            <div>
              <Typography variant="h4" component="h2">
                Create Post
              </Typography>
              <form onSubmit={handleCreatePost}>
                <TextField
                  id="post-title"
                  name="title"
                  label="Title"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={postData.title}
                  onChange={handleInputChange}
                />
                <TextField
                  id="post-content"
                  name="content"
                  label="Content"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                  value={postData.content}
                  onChange={handleInputChange}
                />
                <Select
                  labelId="category-select-label"
                  id="category-select"
                  name="category"
                  value={postData.category}
                  onChange={handleInputChange}
                  fullWidth
                  label="Category"
                  margin="normal"
                >
                  {sections.map((section, index) => (
                    <MenuItem key={index} value={section.title}>{section.title}</MenuItem>
                  ))}
                </Select>
                <Button variant="contained" color="primary" type="submit">
                  Create
                </Button>
              </form>
            </div>
          ) : null}

          {subscribeMode ? (
            <div>
              <Typography variant="h4" component="h2">
                Subscribe
              </Typography>
              {userSubscriptions.length > 0 && (
                <Typography variant="body1" component="div" style={{ marginBottom: '10px' }}>
                  Your Subscriptions: {userSubscriptions.join(', ')}
                </Typography>
              )}
              <form onSubmit={handleSubscribe}>
                <FormGroup>
                  {sections.map((section, index) => (
                    <FormControlLabel
                      key={index}
                      control={<Checkbox onChange={handleCheckboxChange} value={section.title} />}
                      label={section.title}
                    />
                  ))}
                </FormGroup>
                <Button variant="contained" color="primary" type="submit">
                  Subscribe
                </Button>
              </form>
            </div>
          ) : null}

          {!createPostMode && !subscribeMode ? (
            <div>
              <Typography variant="h4" component="h2">
                {selectedSection.title}
              </Typography>
              <div>
                {posts.map((post, index) => (
                  <Card key={index} style={{ marginBottom: '10px' }}>
                    <CardContent>
                      <Typography variant="h5" component="h2">{post.title}</Typography>
                      <Typography variant="body1">{post.content}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Container>

      <Dialog open={showNotifications} onClose={handleNotificationsClick}>
        <DialogTitle>Notifications</DialogTitle>
        <DialogContent>
          {notifications.map((notification, index) => (
            <Chip
              key={index}
              label={`New post is created in ${notification.category}: ${notification.title}`}
              onDelete={() => handleNotificationClose(notification._id)}
              style={{ margin: '5px' }}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNotificationsClick} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Dashboard;
