const express = require("express");
const app = express();
app.use(express.json());
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "secret"; //secret to encode and decode the jwt token

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

let users = [
  { id: 1, email: "alice-maravilhas@gmail.com", name: "Alice", password: "alice123", role: "ADMIN" },
  { id: 2, email: "bob-construtor@gmail.com", name: "Bob", password: "bob123", role: "USER" }
];

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

// function that will make the request fail with 403 if role is not permitted
function authorizeRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ error: "Access forbidden: insufficientprivileges." });
        }
        next();
    };
}

// Get all users
app.get("/users",authenticateToken, authorizeRole("ADMIN"), (req, res) => {
  /*  
  #swagger.tags = ['Users'] 
  #swagger.responses[200] = { description: 'Users found successfully', schema: { 
  $ref: '#/definitions/GetUser'} } 
  #swagger.responses[404] = { description: 'Users not found' } 
  */
  const usersWithoutPassword = users.map(({ password, ...rest }) => rest);
  res.json(usersWithoutPassword);
  users.length === 0 ? res.status(404).json({ error: "Users not Found" }) : res.json(users)
});

// Get an user by ID
app.get("/users/:id", (req, res) => {
  /*  
  #swagger.tags = ['Users'] 
  #swagger.responses[200] = { description: 'User found successfully', schema: { $ref: '#/definitions/GetUser'} } 
  #swagger.responses[404] = { description: 'User not found' } 
  */

  const user = users.find(u => u.id === parseInt(req.params.id));
  user ? res.json(user) : res.status(404).json({ error: "User not found" });
});

// Create a new user
app.post('/register', (req, res) => {
  /*  
  #swagger.tags = ['Users'] 
  #swagger.parameters['body'] = { 
  in: 'body', 
  description: 'New user object', 
  required: true, 
  schema: { $ref: '#/definitions/CreateUser' } 
  } 
  #swagger.responses[201] = { description: 'User created successfully', schema: { $ref: '#/definitions/GetUser'} } 
  #swagger.responses[409] = { description: 'Email already exists' } 
  */

  const { email, name, password } = req.body;

  if (!email, !name, !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  users.forEach(user => {
    if (user.email === req.body.email) {
      return res.status(409).json({ error: "Email already being used" });
    }
  });

  const new_user = { id: users.length + 1, email: req.body.email, name: req.body.name, password: req.body.password };
  users.push(new_user)
  return res.status(201).json({ msg: "User successfully created" })
})

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({
    id: user.id,
    email: user.email,
    role: user.role
  }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});


// Update an user
app.put('/users/:id', (req, res) => {
  /*  
  #swagger.tags = ['Users'] 
  #swagger.parameters['body'] = { 
  in: 'body', 
  description: 'Update an user', 
  required: true, 
  schema: { $ref: '#/definitions/CreateUser' } 
  } 
  #swagger.responses[200] = { description: 'Users updated successfully', schema: { 
  $ref: '#/definitions/GetUser'} } 
  #swagger.responses[404] = { description: 'Users not found' } 
  */

  const user = users.find(u => u.id === parseInt(req.params.id));

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  users.forEach(user => {
    if (req.body.email) {
      user.email = req.body.email
    }

    if (req.body.name) {
      user.name = req.body.name
    }
  });

  return res.status(204).json({ msg: "Info updated" })

})

// Delete an user
app.delete('/users/:id', (req, res) => {
  /*  
    #swagger.tags = ['Users'] 
    #swagger.responses[204] = { description: 'User deleted successfully'} 
    #swagger.responses[404] = { description: 'User not found' } 
  */

  const user = users.find(user => user.id === parseInt(req.params.id));

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  users.splice(user.id, 1);

  return res.status(204).json({ msg: "User successfully removed" })

})

app.listen(3003, () => console.log("Users service running on port 3003"));
