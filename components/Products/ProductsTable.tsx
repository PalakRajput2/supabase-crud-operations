"use client";

import { Product } from "@/lib/api/productApi";
import { BiArrowFromBottom, BiArrowFromTop } from "react-icons/bi";

type ProductsTableProps = {
  products: Product[];
  handleEdit: (product: Product) => void;
  handleDelete: (id: string) => void;
  sortOrder: "asc" | "desc" | null;
  onSortToggle: () => void; // 🔹 just toggle instead of separate asc/desc
};

export default function ProductsTable({
  products,
  handleEdit,
  handleDelete,
  sortOrder,
  onSortToggle,
}: ProductsTableProps) {
  // Decide arrow symbol based on sortOrder
  const getArrow = () => {
    if (sortOrder === "asc") return <BiArrowFromBottom/>;
    if (sortOrder === "desc") return  <BiArrowFromTop/>;
    return "↕"; 
  };

  return (
    <div className="card p-3 shadow-sm text-center">
      <table className="table table-striped table-hover ">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Content</th>
            <th style={{ cursor: "pointer" }} onClick={onSortToggle}>
              Cost <span className="ms-1"> {getArrow()}</span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.banner_image && (
                    <img
                      src={p.banner_image}
                      alt={p.title}
                      style={{ width: "70px", height: "50px", objectFit: "cover" }}
                      className="rounded"
                    />
                  )}
                </td>
                <td>{p.title}</td>
                <td>{p.content}</td>
                <td>₹{p.cost}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(p.id!)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center">
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
