import { Terminal, Package, Users, BarChart2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    if (!user) return null; // Don't show sidebar for public routes

    const adminLinks = [
        { name: 'Dashboard', path: '/admin', icon: <BarChart2 size={20} /> },
        { name: 'Shipments', path: '/admin/shipments', icon: <Package size={20} /> },
        { name: 'Staff', path: '/admin/staff', icon: <Users size={20} /> },
    ];

    const staffLinks = [
        { name: 'My Deliveries', path: '/staff', icon: <Package size={20} /> },
    ];

    const customerLinks = [
        { name: 'Track Package', path: '/', icon: <Package size={20} /> },
    ];

    let links = [];
    if (user.role === 'ADMIN') links = adminLinks;
    else if (user.role === 'STAFF') links = staffLinks;
    else if (user.role === 'CUSTOMER') links = customerLinks;

    return (
        <div className="w-64 bg-secondary-900 text-white flex flex-col min-h-screen sticky top-0">
            <div className="p-6 flex items-center space-x-3 border-b border-secondary-800">
                <Terminal className="text-primary-500" size={28} />
                <span className="text-xl font-bold tracking-wider">LOGISTIQ</span>
            </div>

            <div className="p-4 flex-1">
                <p className="text-xs text-secondary-400 uppercase tracking-wider mb-4 px-2">Menu</p>
                <ul className="space-y-2">
                    {links.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <li key={link.name}>
                                <Link
                                    to={link.path}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary-600 text-white'
                                        : 'text-secondary-300 hover:bg-secondary-800 hover:text-white'
                                        }`}
                                >
                                    {link.icon}
                                    <span>{link.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="p-4 border-t border-secondary-800">
                <div className="px-4 py-2 mb-2">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-secondary-400 truncate">{user.role}</p>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-4 py-2 w-full text-secondary-300 hover:text-white hover:bg-secondary-800 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
