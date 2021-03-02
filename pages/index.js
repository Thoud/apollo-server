import queryGraphql from '../shared/query-graphql';

export default function TodoList({ todos }) {
  return (
    <div>
      <h1>Your todos</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <label htmlFor={`todo-${todo.id}`}>
              <input
                id={`todo-${todo.id}`}
                type="checkbox"
                checked={todo.checked}
                readOnly
              />
              {todo.title}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function getStaticProps() {
  const { todos } = await queryGraphql(`
    query {
      todos {
        id
        title
        checked
      }
    }
  `);
  return { props: { todos } };
}
