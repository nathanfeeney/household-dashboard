import { getTodoItems } from "@/app/actions/todo";
import TodoList from "@/components/TodoList";

export default async function TodoPage() {
  const items = await getTodoItems();
  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "1rem" }}>To-do List</h1>
      <TodoList initialItems={items} />
    </div>
  );
}