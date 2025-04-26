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

const crypto = require('crypto');
global.crypto = crypto;

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
app.use(cors({origin: "*"}))
app.use('/', isAuthenticated);
app.use("/authService", createProxyMiddleware({
  target: "http://localhost:3001/authService",
  changeOrigin: true
}));

app.use("/userService", createProxyMiddleware({
  target: "http://localhost:3002/userService",
  changeOrigin: true
}));
app.get('/', (req, res) => {
  console.log(req.headers)
  res.status(200).json({
    data: "Hello wprld",
    response: req.auth,
    more: req.auth.user
  })
})
const PORT = 3010;
app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}...`);
});
