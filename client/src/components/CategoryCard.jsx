import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

function CategoryCard({ category }) {
  return (
    <Link
      to={`/category/${encodeURIComponent(category.name)}`}
      className="category-card"
    >
      <span className="category-icon">
        {category.icon}
      </span>

      <div>
        <h3>{category.name}</h3>

        <p>
          {category.description}
        </p>
      </div>

      <ArrowUpRight
        className="category-arrow"
        size={18}
      />
    </Link>
  );
}

export default CategoryCard;