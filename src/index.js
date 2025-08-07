require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const rateLimiter = require("express-rate-limit")
const isAuthenticated  = require("./middleware/index")
const { clerkMiddleware } = require('@clerk/express')
const axios = require('axios')
const app = express();
const https = require('https');
const fs = require('fs');

const crypto = require('crypto');
global.crypto = crypto;

// const privateKey = fs.readFileSync('/etc/ssl/private/selfsigned.key', 'utf8');
// const certificate = fs.readFileSync('/etc/ssl/certs/selfsigned.crt', 'utf8');
// const credentials = { key: privateKey, cert: certificate };

app.use(
  clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,  // Make sure this is defined in .env
  })
);

app.use(morgan('combined'))
// app.use(rateLimiter({
//   windowMs: 2*60*1000,
//   max: 5
// }))
app.use(cors({
  origin: ['https://sensa.vercel.app', 'http://localhost:3000'],  // frontend URL
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-email'],
  credentials: true // if you are using cookies or auth headers
}));
app.use('/userService', isAuthenticated);
app.use("/authService", createProxyMiddleware({
  target: "http://43.204.116.75:3001/authService",
  changeOrigin: true
}));

app.use("/userService", createProxyMiddleware({
  target: "http://43.204.116.75:3002/userService",
  changeOrigin: true
}));
app.use("/chatService", createProxyMiddleware({
  target: "http://43.204.116.75:3005/chatService",
  changeOrigin: true
}));
app.use("/notificationService", createProxyMiddleware({
  target: "http://43.204.116.75:3007/notificationService",
  changeOrigin: true
}));
app.get('/', (req, res) => {
  console.log(req.headers)
  res.status(200).json({
    data: "You are hitting the API Gateway.",
    response: req.auth,
    more: req.auth.user
  })
})
//const httpsServer = https.createServer(credentials, app);
const PORT = 3010;
// httpsServer.listen(PORT, () => {
//   console.log('API Gateway');
// });
app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}...`);
});