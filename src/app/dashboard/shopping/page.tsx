import { getShoppingItems } from "@/app/actions/shopping";
import ShoppingList from "@/components/ShoppingList";

export default async function ShoppingPage() {
  const items = await getShoppingItems();
  return (
    <div className="sub-page">
      <h1 className="page-title" style={{ marginBottom: "1rem" }}>Shopping List</h1>
      <ShoppingList initialItems={items} />
    </div>
  );
}