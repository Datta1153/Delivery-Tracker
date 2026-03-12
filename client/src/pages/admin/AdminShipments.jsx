import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Search, MapPin, Loader2, X, Trash2 } from 'lucide-react';

const AdminShipments = () => {
    const [shipments, setShipments] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [searchKw, setSearchKw] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        senderName: '', receiverName: '', originAddress: '',
        destinationAddress: '', packageWeight: '',
        customerEmail: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [createdShipment, setCreatedShipment] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const shipmentsRes = await api.get('/shipments');
            setShipments(shipmentsRes.data.shipments);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const res = await api.get(`/shipments?keyword=${searchKw}`);
            setShipments(res.data.shipments);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const payload = { ...formData };
            const res = await api.post('/shipments', payload);
            setCreatedShipment(res.data);
            setFormData({
                senderName: '', receiverName: '', originAddress: '',
                destinationAddress: '', packageWeight: '',
                customerEmail: ''
            });
            fetchData(); // Refresh list
        } catch (err) {
            console.error('Add Shipment Error:', err.response?.data || err.message);
            alert('Failed to create shipment. Please check the console for details.');
        } finally {
            setFormLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await api.delete(`/shipments/${deleteConfirmId}`);
            setShipments(shipments.filter(s => s._id !== deleteConfirmId));
            setDeleteConfirmId(null);
            // Optional: you can add a toast notification here instead of alert
        } catch (err) {
            console.error('Delete Error:', err.response || err);
            alert(`Failed to delete shipment: ${err.response?.data?.message || err.message}`);
            setDeleteConfirmId(null);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCreatedShipment(null); // Reset after modal close
    };

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">Manage Shipments</h1>
                    <p className="text-sm text-secondary-500 mt-1">View and create new parcel deliveries</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-sm"
                >
                    <Plus size={18} />
                    <span>New Shipment</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <form onSubmit={handleSearch} className="max-w-md relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-secondary-400" />
                        </div>
                        <input
                            type="text"
                            value={searchKw}
                            onChange={(e) => setSearchKw(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 outline-none"
                            placeholder="Search by Tracking ID..."
                        />
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Tracking ID</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Route</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Proof</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {shipments.map((shipment) => (
                                <tr key={shipment._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-bold text-secondary-900 font-mono bg-slate-100 px-2 py-1 rounded">
                                            {shipment.trackingId}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-sm">
                                            <span className="font-medium text-secondary-900">{shipment.originAddress}</span>
                                            <span className="text-secondary-400 text-xs mt-1">to</span>
                                            <span className="text-secondary-600">{shipment.destinationAddress}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${shipment.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                shipment.status === 'Out for Delivery' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}
                                        >
                                            {shipment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                                        {shipment.status === 'Delivered' && shipment.proofOfDelivery ? (
                                            <a
                                                href={`http://localhost:5000${shipment.proofOfDelivery}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary-600 hover:text-primary-800 underline flex items-center gap-1"
                                                title="View Proof of Delivery"
                                            >
                                                View Image
                                            </a>
                                        ) : (
                                            <span className="text-slate-400">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => setDeleteConfirmId(shipment._id)} className="text-red-600 hover:text-red-900 transition-colors cursor-pointer" title="Delete Package">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {shipments.length === 0 && (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-secondary-500">No shipments found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-900/75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">

                            {createdShipment ? (
                                /* Success State inside Modal */
                                <div className="px-4 pt-5 pb-4 sm:p-8 sm:pb-6 text-center">
                                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                                        <Loader2 className="h-8 w-8 text-green-600 hidden" />
                                        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl leading-6 font-bold text-secondary-900 mb-2" id="modal-title">Shipment Created</h3>
                                    <p className="text-sm text-secondary-500 mb-8">The tracking ID and barcode have been generated.</p>

                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 inline-block text-center shadow-inner">
                                        <p className="text-xs text-secondary-500 uppercase tracking-widest font-semibold mb-2">Tracking ID</p>
                                        <p className="text-3xl font-mono font-bold text-primary-700 tracking-wider mb-6">{createdShipment.trackingId}</p>
                                        <img src={createdShipment.barcode} alt="Barcode" className="mx-auto border bg-white p-2 rounded max-h-24 mix-blend-multiply" />
                                    </div>

                                    <div className="mt-8 sm:flex sm:flex-row-reverse justify-center gap-3">
                                        <button type="button" onClick={closeModal} className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-3 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:text-sm transition-colors">
                                            Done
                                        </button>
                                        <button type="button" onClick={() => window.print()} className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-secondary-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:text-sm transition-colors">
                                            Print Label
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Creation Form */
                                <>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-slate-100 flex justify-between items-center">
                                        <h3 className="text-xl leading-6 font-bold text-secondary-900" id="modal-title">Create New Shipment</h3>
                                        <button onClick={closeModal} className="text-slate-400 hover:text-slate-500 focus:outline-none"><X size={24} /></button>
                                    </div>
                                    <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 bg-slate-50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-secondary-800 text-sm uppercase tracking-wider border-b pb-2">Sender Details</h4>
                                                <div>
                                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Sender Name</label>
                                                    <input required type="text" value={formData.senderName} onChange={e => setFormData({ ...formData, senderName: e.target.value })} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2.5 border outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Origin Address</label>
                                                    <input required type="text" value={formData.originAddress} onChange={e => setFormData({ ...formData, originAddress: e.target.value })} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2.5 border outline-none" />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-secondary-800 text-sm uppercase tracking-wider border-b pb-2">Receiver Details</h4>
                                                <div>
                                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Receiver Name</label>
                                                    <input required type="text" value={formData.receiverName} onChange={e => setFormData({ ...formData, receiverName: e.target.value })} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2.5 border outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Destination Address</label>
                                                    <input required type="text" value={formData.destinationAddress} onChange={e => setFormData({ ...formData, destinationAddress: e.target.value })} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2.5 border outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Customer Email (For Updates)</label>
                                                    <input required type="email" placeholder="customer@example.com" value={formData.customerEmail} onChange={e => setFormData({ ...formData, customerEmail: e.target.value })} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2.5 border outline-none" />
                                                </div>
                                            </div>

                                            <div className="md:col-span-2 space-y-4 pt-4 border-t">
                                                <h4 className="font-semibold text-secondary-800 text-sm uppercase tracking-wider border-b pb-2">Logistics</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-secondary-700 mb-1">Package Weight (kg)</label>
                                                        <input required type="number" step="0.1" value={formData.packageWeight} onChange={e => setFormData({ ...formData, packageWeight: e.target.value })} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2.5 border outline-none" />
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                        <div className="mt-8 border-t border-slate-200 pt-5 flex justify-end gap-3">
                                            <button type="button" onClick={closeModal} className="bg-white py-2.5 px-6 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-secondary-700 hover:bg-slate-50 focus:outline-none transition-colors">
                                                Cancel
                                            </button>
                                            <button type="submit" disabled={formLoading} className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none disabled:opacity-70 transition-colors">
                                                {formLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Create Shipment'}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-900/75 transition-opacity" aria-hidden="true" onClick={() => setDeleteConfirmId(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="relative z-[60] inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-secondary-900" id="modal-title">Delete Package</h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-secondary-500">Are you sure you want to delete this shipment? All associated tracking events will also be permanently removed. This action cannot be undone.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-100">
                                <button type="button" onClick={confirmDelete} className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                                    Delete
                                </button>
                                <button type="button" onClick={() => setDeleteConfirmId(null)} className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-secondary-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminShipments;
