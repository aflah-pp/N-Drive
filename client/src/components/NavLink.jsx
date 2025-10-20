import { Link } from "react-router";

function NavLink({ to, label, icon: Icon }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-5 py-3 rounded-full text-base font-semibold text-gray-800 hover:bg-gray-100 transition-all duration-300"
    >
      {Icon && <Icon className="w-5 h-5" />}
      {label}
    </Link>
  );
}

export default NavLink;
