const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const rateLimiter = require("express-rate-limit") 
const axios = require('axios')
const app = express();

app.use(morgan('combined'))
// app.use(rateLimiter({
//   windowMs: 2*60*1000,
//   max: 5
// }))
app.use('/userService', async (req, res, next) => {
  try {
    
    const response = await axios.get(
      'http://localhost:3001/authService/api/v1/users/status/isAuthenticated',
      {
        withCredentials: true,
        headers: { Cookie: req.headers.cookie },                                                                                    
      }
    );

    if (response.data.success) {      
     
      next(); 
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (error) {
    console.log(error)
    res.status(500).send("Authentication failed");
  }
});
app.use("/authService", createProxyMiddleware({
  target: "http://localhost:3001/authService",
  changeOrigin: true
}));

app.use("/userService", createProxyMiddleware({
  target: "http://localhost:3002/userService",
  changeOrigin: true
}));
const PORT = 3010;
app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}...`);
});
