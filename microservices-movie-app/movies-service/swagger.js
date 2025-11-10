const swaggerAutogen = require("swagger-autogen")(); 
const doc = { 
    info: { 
        title: "My API", 
        description: "Swagger documentation", 
    }, 
    host: "localhost:3001", 
    schemes: ["http"], 
    tags: [ // the sections that will be presented in swagger page 
        { name: "Movies", description: "Movies related endpoints" }, 
    ], 
    definitions: { // the objects used in the request and response bodies 
        GetMovie: { // GET response bodies come with id 
            id: 123, 
            title: "Example Title", 
            year: 2025
        }, 
        CreateMovie: { // POST/PUT request bodies are sent without id 
            title: "Example Title", 
            year: 2025
        } 
    } 
}; 
 
const outputFile = "./swagger-output.json"; 
const endpointsFiles = ["./app.js"]; 
 
swaggerAutogen(outputFile, endpointsFiles, doc);