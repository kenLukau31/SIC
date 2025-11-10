const express = require("express");
const axios = require("axios"); // we'll use this to call the review service
const app = express();
const { ApolloServer, gql } = require("apollo-server");
// const logger = pino({
//   transport: {
//     target: 'pino-pretty',
//     options: { colorize: true }
//   }
// });

app.use(express.json());

// our "database" data
let movies = [
  { id: 1, title: "Treasure Planet", year: 2002 },
  { id: 2, title: "The Matrix", year: 1999 }
];
// cortis 

// GraphQL schema
const typeDefs = gql`
type Movie {
  id: ID!
  title: String!
  year: Int!
  reviews: [Review!]!
}


type Review {
  id: ID!
  movieId: ID!
  userId: ID!
  text: String!
}

type Query {
  movies: [Movie!]!
  movie(id: ID!): Movie
}

type Mutation {
  addMovie(title: String!, year: Int!): Movie!
  updateMovie(id: ID!, title: String, year: Int): Movie!
  deleteMovie(id: ID!): Movie!
}
`;


// Resolvers
const resolvers = {
  Query: {
    movies: () => movies,
    movie: (_, { id }) => {
      console.log(movies,id);
      
      const movie = movies.find(m => m.id === parseInt(id));
      console.log(movie);
      if (!movie) throw new Error("Movie not found");
      return movie;
    }

  },
  Movie: {
    reviews: async (movie) => {
      const response = await axios.get(
        `http://localhost:3002/reviews?movieId=${movie.id}`
      );
      return response.data;
    }
  },
  Mutation: {
    addMovie: (_, { title, year }) => {
      const newMovie = { id: movies.length + 1, title, year };
      movies.push(newMovie);
      return newMovie;
    },
    updateMovie: (_, { id, title, year }) => {
      const movie = movies.find(movie => movie.id === id);
      if (!movie) throw new Error("Movie not found");
      movies.forEach(movie => {
        if (title) {
          movie.title = title
        }

        if (year) {
          movie.year = year
        }
      })

    },
    deleteMovie: (_, { id }) => {
      const movie = movies.find(movie => movie.id === id);
      if (!movie) throw new Error("Movie not found");
      movies.filter(movie => movie.id !== id);
      return movies
    }
  },
};

app.listen(3001, () => console.log("Movies service running on port 3001"));


// Create Apollo Server


const server = new ApolloServer({
  typeDefs,
  resolvers,

  formatError: (err) => {
    return {
      message: err.message,
    }
  }

});
// Start the server
server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`GrahpQL Movies Service server running in ${url}`);
});
