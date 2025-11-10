const express = require("express");
const app = express();
app.use(express.json());
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "secret"; //secret to encode and decode the jwt token



app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

let reviews = [
  { id: 1, movieId: 1, userId: 2, text: "Very underrated movie!" },
  { id: 2, movieId: 1, userId: 1, text: "Best animated movie ever." },
  { id: 3, movieId: 2, userId: 1, text: "Classic sci-fi." }
];

// function that will make the request fail if token is wrong or has expired
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({
    error: "Access denied. Token missing."
  });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token." });
    req.user = user;
    next();
  });
}


// Get all reviews, optionally filtered by movieId
app.get("/reviews", (req, res) => {
  /*  
  #swagger.tags = ['Reviews'] 
  #swagger.responses[200] = { description: 'Reviews found successfully', schema: { 
  $ref: '#/definitions/GetReview'} } 
  #swagger.responses[404] = { description: 'Reviews not found' } 
  */

  const { movieId } = req.query;
  if (movieId) {
    const filteredReviews = reviews.filter(r => r.movieId === parseInt(movieId));
    return res.json(filteredReviews);
  }
  res.json(reviews);
});


// Get a review by ID
app.get("/reviews/:id", (req, res) => {
  /*  
 #swagger.tags = ['Reviews'] 
 #swagger.responses[200] = { description: 'Review found successfully', schema: { $ref: '#/definitions/GetReview'} } 
 #swagger.responses[404] = { description: 'Review not found' } 
 */

  const review = reviews.find(r => r.id === parseInt(req.params.id));
  review ? res.json(review) : res.status(404).json({ error: "Review not found" });
});


// Create a new review
app.post("/reviews", authenticateToken, (req, res) => {
  /*  
  #swagger.tags = ['Reviews'] 
  #swagger.parameters['body'] = { 
  in: 'body', 
  description: 'New Review object', 
  required: true, 
  schema: { $ref: '#/definitions/CreateReview' } 
  } 
  #swagger.responses[201] = { description: 'Review created successfully', schema: { $ref: '#/definitions/GetReview'} } 
  */

  const new_review = { id: reviews.length + 1, movieId: req.body.movieId, userId: req.user.id, text: req.body.text };
  reviews.push(new_review)
  return res.status(201).json(new_review)
});


// Update a new review
app.put('/reviews/:id', (req, res) => {
  /*  
    #swagger.tags = ['Reviews'] 
    #swagger.parameters['body'] = { 
    in: 'body', 
    description: 'Update a Review', 
    required: true, 
    schema: { $ref: '#/definitions/CreateReview' } 
    } 
    #swagger.responses[200] = { description: 'Reviews updated successfully', schema: { 
    $ref: '#/definitions/GetReview'} } 
    #swagger.responses[404] = { description: 'Reviews not found' } 
    */

  const review = reviews.find(review => review.id === parseInt(req.params.id));

  if (!review) {
    return res.status(404).json({ error: "Review not found" });
  }

  reviews.forEach(review => {
    if (req.body.movieId) {
      review.movieId = req.body.movieId
    }

    if (req.body.userId) {
      review.userId = req.body.userId
    }

    if (req.body.text) {
      review.text = req.body.text
    }
  })

  return res.status(200).json(review)
})


// Delete a review
app.delete('/reviews/:id', (req, res) => {
  /*  
    #swagger.tags = ['Reviews'] 
    #swagger.responses[204] = { description: 'Review deleted successfully'} 
    #swagger.responses[404] = { description: 'Review not found' } 
  */

  const review = reviews.find(review => review.id === parseInt(req.params.id));

  if (!review) {
    return res.status(404).json({ error: "Review not found!" });
  }

  reviews.splice(review.id, 1);

  return res.status(204).json({ msg: "User successfully removed!" });
})


app.listen(3002, () => console.log("Reviews service running on port 3002"));
