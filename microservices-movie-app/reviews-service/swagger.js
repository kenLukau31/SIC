const swaggerAutogen = require("swagger-autogen")(); 
const doc = { 
    info: { 
        title: "My API", 
        description: "Swagger documentation", 
    }, 
    host: "localhost:3002", 
    schemes: ["http"], 
    tags: [ // the sections that will be presented in swagger page 
        { name: "Reviews", description: "Reviews related endpoints" }, 
    ], 
    definitions: { // the objects used in the request and response bodies 
        GetReview: { // GET response bodies come with id 
            id: 123, 
            movieId: 2, 
            userId: 3,
            text: "Example Text"
        }, 
        CreateReview: { // POST/PUT request bodies are sent without id 
            movieId: 2, 
            userId: 3,
            text: "Example Text"
        } 
    } 
}; 
 
const outputFile = "./swagger-output.json"; 
const endpointsFiles = ["./app.js"]; 
 
swaggerAutogen(outputFile, endpointsFiles, doc);