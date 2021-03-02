import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server-micro';
import postgres from 'postgres';
require('dotenv').config();

const sql = postgres();

const typeDefs = gql`
  type Query {
    users: [User!]!
    user(username: String): User
    todos(filterChecked: Boolean): [Todo!]!
    todo(id: Int!): Todo
  }

  type Mutation {
    createTodo(title: String!, checked: Boolean): Todo
  }

  type User {
    name: String
    username: String
  }

  type Todo {
    id: Int!
    title: String!
    checked: Boolean!
  }
`;
const users = [
  { name: 'Leroy Jenkins', username: 'leroy' },
  { name: 'Foo Bar', username: 'foobar' },
];

async function getTodos() {
  return await sql`SELECT * FROM todos;`;
}

async function getFilteredTodos(checked) {
  return await sql`SELECT * FROM todos WHERE checked = ${checked};`;
}

async function getTodo(id) {
  const result = await sql`SELECT * FROM todos WHERE id = ${id};`;
  return result[0];
}

async function createTodo(title, checked) {
  const result = await sql`INSERT INTO todos (title, checked)
  VALUES (${title}, ${checked}) RETURNING id, title, checked;`;

  console.log(result[0]);
  return result[0];
}

const resolvers = {
  Query: {
    todos(parent, { filterChecked = null }) {
      if (filterChecked === null) {
        return getTodos();
      }

      return getFilteredTodos(filterChecked);
    },

    todo(parent, { id }) {
      return getTodo(id);
    },

    users() {
      return users;
    },
    user(parent, { username }) {
      return users.find((user) => user.username === username);
    },
  },

  Mutation: {
    createTodo(parent, { title, checked = false }) {
      return createTodo(title, checked);
    },
  },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default new ApolloServer({ schema }).createHandler({
  path: '/api/graphql',
});
