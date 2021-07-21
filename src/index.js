const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const { request, json } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username );

  if(!user){
    return response.status(404).json({"error": "User do not Exist"});
  }

  request.user = user;

  return next();

}

//Create a new user
app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExist = users.some((element) => element.username === username);

  if(userAlreadyExist){
    return response.status(400).json({error: 'User Already Exist'});
  }

  const user =  {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);

});

//DEV
app.get("/users", (request, response) => {
  return response.send(users);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  request.user.todos.push(todo)
  
  return response.status(201).send(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const task = user.todos.filter((task) => task.id === id);

  if(!task.length) {
    return response.status(404).json({error: "ID not found"}); 
  }

  task[0].title = title;
  task[0].deadline = new Date(deadline);

  return response.json(task[0]);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const task = user.todos.filter((task) => task.id === id);

  if(!task.length) {
    return response.status(404).json({error: "Id not found"});
  }

  task[0].done = true;

  return response.status(201).json(task[0]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const task = user.todos.find((task) => task.id === id );

  if(!task) {
    return response.status(404).json({error: "ID not found"});
  }

  user.todos.splice(task, 1);

  return response.status(204).send();

});

module.exports = app;