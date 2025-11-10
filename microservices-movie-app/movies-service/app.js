const express = require("express");
const axios = require("axios"); // we'll use this to call the review service
const app = express();
const swaggerUi = require("swagger-ui-express"); 
const swaggerFile = require("./swagger-output.json"); 
const pino = require("pino")
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {colorize: true}
  }
})
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use(express.json());

// our "database" data
let movies = [
  { id: 1, title: "Treasure Planet", year: 2002 },
  { id: 2, title: "The Matrix", year: 1999 }
];

// GET all movies
app.get("/movies", (req, res) => {
  /*  
  #swagger.tags = ['Movies'] 
  #swagger.responses[200] = { description: 'Movies found successfully', schema: { 
  $ref: '#/definitions/GetMovie'} } 
  #swagger.responses[404] = { description: 'Movies not found' } 
  */

  res.json(movies)});

// GET a movie by ID (and fetch its reviews from the Review Service)
app.get("/movies/:id", async (req, res) => {

  logger.info(`Request: GET /movies/${req.params.id} recived`)
  /*  
  #swagger.tags = ['Movies'] 
  #swagger.responses[200] = { description: 'Movie found successfully', schema: { $ref: '#/definitions/GetMovie'} } 
  #swagger.responses[404] = { description: 'Movie not found' } 
  #swagger.responses[500] = { description: 'Failed to fetch reviews'} 
  */

  const movie = movies.find(m => m.id === parseInt(req.params.id));
  if (!movie) {
    logger.warn(`Movie with id ${req.params.id} not found`)

    return res.status(404).json({ error: "Movie not found" });
  }

  try {
    logger.info(`Calling Review Service: GET /review?movieId=${movie.id}`)
    // call the review service
    const response = await axios.get(`http://localhost:3002/reviews?movieId=${movie.id}`);
    const movieReviews = response.data;

    res.json({
      id: movie.id,
      title: movie.title,
      year: movie.year,
      reviews: movieReviews
    });

    logger.info(`Movie with id ${req.params.id} with ${movieReviews.length} reviews return successfully`)
  } catch (error) {
    logger.error(`Error fetching reviews: ${error.message}`)
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Create a new movie
app.post("/movies", (req, res) => {
  /*  
  #swagger.tags = ['Movies'] 
  #swagger.parameters['body'] = { 
  in: 'body', 
  description: 'New movie object', 
  required: true, 
  schema: { $ref: '#/definitions/CreateMovie' } 
  } 
  #swagger.responses[201] = { description: 'Movie created successfully', schema: { $ref: '#/definitions/GetMovie'} } 
  */

  const new_movie = {id: movies.length + 1, title: req.body.title, year: req.body.year};
  movies.push(new_movie);

  return res.status(201).json(new_movie)

})

app.put('/movies/:id', (req, res) => {
   /*  
    #swagger.tags = ['Movies'] 
    #swagger.parameters['body'] = { 
    in: 'body', 
    description: 'Update a movie', 
    required: true, 
    schema: { $ref: '#/definitions/CreateMovie' } 
    } 
    #swagger.responses[200] = { description: 'Movies updated successfully', schema: { 
    $ref: '#/definitions/GetMovie'} } 
    #swagger.responses[404] = { description: 'Movies not found' } 
    */

  const movie = movies.find(movie => movie.id === parseInt(req.params.id));

  if (!movie) {
    return res.status(404).json({error: "Movie not found"})
  }

  movies.forEach(movie => {
    if (req.body.title) {
      movie.title = req.body.title
    }

    if (req.body.year) {
      movie.year = req.body.year
    }
  })

  return res.status(200).json({msg: "Info updated"})
})

app.delete('/movies/:id', (req, res) => {
  /*  
    #swagger.tags = ['Movies'] 
    #swagger.responses[204] = { description: 'Movie deleted successfully'} 
    #swagger.responses[404] = { description: 'Movie not found' } 
  */

  const movie = movies.find(movie => movie.id === parseInt(req.params.id));

  if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
  }

  movies.splice(movie.id, 1);

  return res.status(204).json({msg: "Movie successfully removed"})

})

app.listen(3001, () => console.log("Movies service running on port 3001"));
