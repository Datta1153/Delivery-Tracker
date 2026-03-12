import { useState, useEffect } from 'react';
import { Search, Package, MapPin, Calendar, Clock, CheckCircle2, Circle, Truck, Building, Loader2, Phone, Mail, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import api from '../services/api';
import { format } from 'date-fns';

const SHIPMENT_STATUSES = [
    'Pending',
    'Dispatched',
    'In Transit',
    'Out for Delivery',
    'Delivered'
];

const getStatusIcon = (status, isActive, isCompleted) => {
    if (isCompleted) return <CheckCircle2 className="text-primary-600 bg-white" size={24} />;
    if (isActive) {
        if (status === 'In Transit' || status === 'Out for Delivery') return <Truck className="text-primary-600 bg-white" size={24} />;
        if (status.includes('Facility')) return <Building className="text-primary-600 bg-white" size={24} />;
        return <Circle className="text-primary-600 fill-primary-100 bg-white" size={24} />;
    }
    return <Circle className="text-slate-300 bg-white" size={24} />;
};

const TrackingPortal = () => {
    const [trackingId, setTrackingId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const { user, logout } = useAuth();
    const [myShipments, setMyShipments] = useState([]);
    const [loadingMyShipments, setLoadingMyShipments] = useState(false);

    useEffect(() => {
        if (user && user.role === 'CUSTOMER') {
            fetchMyShipments();
        }
    }, [user]);

    const fetchMyShipments = async () => {
        setLoadingMyShipments(true);
        try {
            const { data } = await api.get('/shipments');
            setMyShipments(data.shipments || []);
        } catch (err) {
            console.error('Error fetching my shipments:', err);
        } finally {
            setLoadingMyShipments(false);
        }
    };

    useEffect(() => {
        if (!data?.shipment?.trackingId) return;

        // Connect to websocket
        const socket = io('http://localhost:5000');

        socket.emit('join_tracking', data.shipment.trackingId);

        socket.on('status_update', (update) => {
            setData((prev) => ({
                shipment: update.shipment,
                events: [...prev.events, update.event]
            }));
        });

        return () => socket.disconnect();
    }, [data?.shipment?.trackingId]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);
        setData(null);
        setTrackingId(searchQuery.trim());

        try {
            const response = await api.get(`/shipments/${searchQuery.trim()}`);
            setData(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Shipment not found. Please check your tracking ID.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Package className="text-primary-600" size={28} />
                        <span className="text-xl font-bold text-secondary-900 tracking-tight">LOGISTIQ</span>
                    </div>
                    <div className="hidden sm:flex space-x-8">
                        <a href="#" className="text-secondary-600 hover:text-primary-600 font-medium transition-colors">Track</a>
                        <button onClick={() => setIsSupportModalOpen(true)} className="text-secondary-600 hover:text-primary-600 font-medium transition-colors">Support</button>
                    </div>
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                {user.role === 'ADMIN' && (
                                    <a href="/admin" className="text-sm font-medium text-primary-600 hover:text-primary-700 hidden sm:block">Admin Panel</a>
                                )}
                                {user.role === 'STAFF' && (
                                    <a href="/staff" className="text-sm font-medium text-primary-600 hover:text-primary-700 hidden sm:block">Staff Panel</a>
                                )}
                                <span className="text-sm font-medium text-secondary-600 hidden sm:block">Hi, {user.name}</span>
                                <button onClick={logout} className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 px-4 py-2 rounded-lg transition-colors">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <a href="/login" className="text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-lg transition-colors">
                                Login
                            </a>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-secondary-900 text-white overflow-hidden relative">
                <div className="absolute inset-0 opacity-10 md:opacity-20 bg-[url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
                <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center relative z-10">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
                        Track Your Delivery
                    </h1>
                    <p className="text-lg text-secondary-300 mb-8 max-w-2xl mx-auto">
                        Enter your tracking number below to get real-time status updates for your parcel.
                    </p>

                    <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
                        <div className="flex flex-col sm:flex-row shadow-xl rounded-xl overflow-hidden bg-white p-1">
                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-secondary-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full pl-11 pr-3 py-4 text-base text-secondary-900 placeholder-secondary-400 border-none outline-none focus:ring-0 bg-transparent"
                                    placeholder="e.g. TRK-20230510-A1B2"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 font-medium transition-colors flex items-center justify-center sm:rounded-lg disabled:opacity-70 mt-1 sm:mt-0"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Track Parcel'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 py-12">
                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center border border-red-100 shadow-sm max-w-2xl mx-auto">
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {data && data.shipment && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in">
                        {/* Left Column: Shipment Details */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                <div className="mb-6">
                                    <p className="text-sm text-secondary-500 font-medium mb-1">Tracking Number</p>
                                    <p className="text-2xl font-bold tracking-tight text-secondary-900">{data.shipment.trackingId}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <MapPin className="text-secondary-400 mt-1" size={18} />
                                        <div>
                                            <p className="text-xs text-secondary-500 font-medium uppercase tracking-wider">From</p>
                                            <p className="text-sm font-medium text-secondary-900">{data.shipment.senderName}</p>
                                            <p className="text-sm text-secondary-600 leading-relaxed">{data.shipment.originAddress}</p>
                                        </div>
                                    </div>

                                    <div className="ml-2 pl-4 py-1 border-l-2 border-dashed border-slate-200">
                                        <Truck className="text-slate-300" size={14} />
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <MapPin className="text-primary-500 mt-1" size={18} />
                                        <div>
                                            <p className="text-xs text-secondary-500 font-medium uppercase tracking-wider">To</p>
                                            <p className="text-sm font-medium text-secondary-900">{data.shipment.receiverName}</p>
                                            <p className="text-sm text-secondary-600 leading-relaxed">{data.shipment.destinationAddress}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-secondary-500 font-medium">Weight</p>
                                        <p className="text-sm font-medium text-secondary-900">{data.shipment.packageWeight} kg</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-secondary-500 font-medium">Created</p>
                                        <p className="text-sm font-medium text-secondary-900">
                                            {format(new Date(data.shipment.createdAt), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>

                                {data.shipment.proofOfDelivery && (
                                    <div className="mt-6">
                                        <a
                                            href={`http://localhost:5000${data.shipment.proofOfDelivery}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full flex justify-center items-center py-2 px-4 border border-secondary-300 rounded-lg shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-slate-50 transition-colors"
                                        >
                                            View Proof of Delivery
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Timeline */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold text-secondary-900">Delivery Status</h2>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700">
                                        <span className="w-2 h-2 mr-2 bg-primary-500 rounded-full animate-pulse"></span>
                                        {data.shipment.status}
                                    </span>
                                </div>

                                <div className="relative pl-4 sm:pl-8">
                                    <div className="absolute top-4 bottom-4 left-[27px] sm:left-[43px] w-0.5 bg-slate-100"></div>

                                    <div className="space-y-8 relative">
                                        {SHIPMENT_STATUSES.map((status, index) => {
                                            const currentStatusIndex = SHIPMENT_STATUSES.indexOf(data.shipment.status);
                                            const isCompleted = index < currentStatusIndex || data.shipment.status === 'Delivered';
                                            const isActive = index === currentStatusIndex;
                                            const isPending = index > currentStatusIndex;

                                            const event = data.events.slice().reverse().find(e => e.status === status);

                                            return (
                                                <div key={status} className={`flex items-start relative ${isPending ? 'opacity-50' : ''}`}>
                                                    <div className="flex-shrink-0 z-10 translate-y-1 bg-white">
                                                        {getStatusIcon(status, isActive, isCompleted)}
                                                    </div>

                                                    <div className="ml-4 sm:ml-6 flex-1 bg-white">
                                                        <h3 className={`text-base font-semibold ${isActive ? 'text-primary-700' : 'text-secondary-900'}`}>
                                                            {status}
                                                        </h3>

                                                        {event ? (
                                                            <div className="mt-1 text-sm text-secondary-600">
                                                                <p className="mb-2">{event.description}</p>
                                                                <div className="flex flex-wrap gap-3 text-xs text-secondary-500 font-medium">
                                                                    {event.location && (
                                                                        <span className="flex items-center">
                                                                            <MapPin size={12} className="mr-1" />
                                                                            {event.location}
                                                                        </span>
                                                                    )}
                                                                    <span className="flex items-center">
                                                                        <Clock size={12} className="mr-1" />
                                                                        {format(new Date(event.createdAt), 'MMM d, h:mm a')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="mt-1 text-sm text-secondary-400 italic">Pending</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Support Modal */}
            {isSupportModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-900/75 transition-opacity" aria-hidden="true" onClick={() => setIsSupportModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="relative z-50 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xl leading-6 font-bold text-secondary-900" id="modal-title">Contact Support</h3>
                                <button onClick={() => setIsSupportModalOpen(false)} className="text-slate-400 hover:text-slate-500 focus:outline-none"><X size={24} /></button>
                            </div>

                            <div className="px-4 py-5 sm:p-6 bg-slate-50 space-y-6">
                                <p className="text-sm text-secondary-600">If you need immediate assistance with your delivery, our support team is ready to help via phone or email.</p>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                                        <div className="bg-primary-50 p-3 rounded-full">
                                            <Phone className="text-primary-600" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-secondary-500 font-semibold uppercase tracking-wider mb-1">Call Us Now</p>
                                            <a href="tel:+917481111890" className="text-lg font-bold text-secondary-900 hover:text-primary-600 transition-colors cursor-pointer">+91 7481111890</a>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                                        <div className="bg-primary-50 p-3 rounded-full">
                                            <Mail className="text-primary-600" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-secondary-500 font-semibold uppercase tracking-wider mb-1">Email Administrator</p>
                                            <a href="mailto:admin@logistiq.com" className="text-lg font-bold text-secondary-900 hover:text-primary-600 transition-colors cursor-pointer">admin@logistiq.com</a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-100">
                                <button type="button" onClick={() => setIsSupportModalOpen(false)} className="w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-secondary-700 hover:bg-slate-50 focus:outline-none sm:w-auto sm:text-sm transition-colors">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* My Shipments Dashboard (Only for logged-in CUSTOMERS) */}
            {user && user.role === 'CUSTOMER' && !data && (
                <div className="max-w-5xl mx-auto px-4 py-12">
                    <h2 className="text-2xl font-bold text-secondary-900 mb-6 flex items-center">
                        <Package className="mr-3 text-primary-600" /> My Recent Deliveries
                    </h2>

                    {loadingMyShipments ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin text-primary-600 w-8 h-8" />
                        </div>
                    ) : myShipments.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
                            <Package className="mx-auto text-slate-300 mb-3 w-12 h-12" />
                            <p className="text-secondary-600 font-medium text-lg">No deliveries found.</p>
                            <p className="text-secondary-400 text-sm mt-1">When you place an order, it will appear here automatically.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myShipments.map((shipment) => (
                                <div
                                    key={shipment._id}
                                    onClick={() => {
                                        setSearchQuery(shipment.trackingId);
                                        handleSearch({ preventDefault: () => { } });
                                        window.scrollTo(0, 0);
                                    }}
                                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-xs text-secondary-500 font-bold uppercase tracking-wider mb-1">Tracking ID</p>
                                            <p className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">{shipment.trackingId}</p>
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                                            {shipment.status}
                                        </span>
                                    </div>
                                    <div className="space-y-3 pt-4 border-t border-slate-100">
                                        <div className="flex items-start space-x-2">
                                            <MapPin className="text-secondary-400 mt-0.5" size={14} />
                                            <div>
                                                <p className="text-xs text-secondary-500 font-medium">From</p>
                                                <p className="text-sm text-secondary-900 truncate max-w-[200px]">{shipment.senderName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <MapPin className="text-primary-500 mt-0.5" size={14} />
                                            <div>
                                                <p className="text-xs text-secondary-500 font-medium">To</p>
                                                <p className="text-sm text-secondary-900 truncate max-w-[200px]">{shipment.receiverName}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        .fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
        </div>
    );
};

export default TrackingPortal;
