import { getShoppingItems, getShoppingGroups } from "@/app/actions/shopping";
import ShoppingList from "@/components/ShoppingList";

export default async function ShoppingPage() {
  const [items, groups] = await Promise.all([getShoppingItems(), getShoppingGroups()]);
  return (
    <div className="sub-page">
      <h1 className="page-title" style={{ marginBottom: "1rem" }}>Shopping List</h1>
      <ShoppingList initialItems={items} initialGroups={groups} />
    </div>
  );
}
