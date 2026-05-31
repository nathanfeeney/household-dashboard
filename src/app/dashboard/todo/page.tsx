import { getTodoItems } from "@/app/actions/todo";
import TodoList from "@/components/TodoList";

export default async function TodoPage() {
  const items = await getTodoItems();
  return (
    <div className="sub-page">
      <h1 className="page-title" style={{ marginBottom: "1rem" }}>To-do List</h1>
      <TodoList initialItems={items} />
    </div>
  );
}