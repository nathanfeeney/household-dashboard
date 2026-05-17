import { getShoppingItems } from "@/app/actions/shopping";
import ShoppingList from "@/components/ShoppingList";

export default async function ShoppingPage() {
  const items = await getShoppingItems();
  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "1rem" }}>Shopping List</h1>
      <ShoppingList initialItems={items} />
    </div>
  );
}