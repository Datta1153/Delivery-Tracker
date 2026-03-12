import { useState, useEffect, lazy, Suspense } from 'react';
import api from '../../services/api';
import { Package, Truck, CheckCircle2, MapPin, UploadCloud, Loader2, Scan } from 'lucide-react';

const QRScanner = lazy(() => import('../../components/QRScanner'));

const SHIPMENT_STATUSES = [
    'Pending',
    'Dispatched',
    'In Transit',
    'Out for Delivery',
    'Delivered'
];

const StaffDashboard = () => {
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedShipment, setSelectedShipment] = useState(null);
    const [statusUpdate, setStatusUpdate] = useState('');
    const [location, setLocation] = useState('');
    const [proofFile, setProofFile] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [scanMessage, setScanMessage] = useState(null);

    useEffect(() => {
        fetchShipments();
    }, []);

    const fetchShipments = async () => {
        setLoading(true);
        try {
            // API implicitly filters for the mapped staff due to the token
            const res = await api.get('/shipments');
            setShipments(res.data.shipments);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!selectedShipment || !statusUpdate) return;
        setUpdateLoading(true);

        try {
            let proofUrl = '';
            if (proofFile && statusUpdate === 'Delivered') {
                const formData = new FormData();
                formData.append('image', proofFile);
                const uploadRes = await api.post('/upload', formData);
                proofUrl = uploadRes.data;
            }

            await api.put('/shipments/status', {
                trackingId: selectedShipment.trackingId,
                status: statusUpdate,
                location,
                proofOfDelivery: proofUrl || undefined
            });

            alert('Status updated successfully!');
            setSelectedShipment(null);
            setProofFile(null);
            setLocation('');
            fetchShipments();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to update status. Double check workflow rules.');
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleScanSuccess = (scannedText) => {
        const trimmed = scannedText.trim();
        const found = shipments.find(s => s.trackingId === trimmed);
        if (found) {
            setSelectedShipment(found);
            setStatusUpdate(found.status);
            setScanMessage({ type: 'success', text: `Package ${trimmed} selected!` });
        } else {
            setScanMessage({ type: 'error', text: `No active package found for "${trimmed}"` });
        }
        setShowScanner(false);
        // Auto-clear message after 4 seconds
        setTimeout(() => setScanMessage(null), 4000);
    };

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">System Deliveries</h1>
                    <p className="text-secondary-500 mt-1">Manage your route and update package statuses</p>
                </div>
                <button
                    onClick={() => setShowScanner(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-sm self-start"
                >
                    <Scan size={18} />
                    Scan to Update
                </button>
            </div>

            {/* Scan result message */}
            {scanMessage && (
                <div className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${scanMessage.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                    {scanMessage.type === 'success' ? <CheckCircle2 size={16} /> : <Package size={16} />}
                    {scanMessage.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Active Route List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-secondary-900 border-b pb-2">Active Packages</h2>
                    {shipments.filter(s => s.status !== 'Delivered').map(shipment => (
                        <div
                            key={shipment._id}
                            onClick={() => {
                                setSelectedShipment(shipment);
                                setStatusUpdate(shipment.status);
                            }}
                            className={`bg-white p-5 rounded-xl border ${selectedShipment?._id === shipment._id ? 'border-primary-500 shadow-md ring-1 ring-primary-500' : 'border-slate-200 shadow-sm'} cursor-pointer hover:border-primary-300 transition-all flex justify-between items-center group`}
                        >
                            <div>
                                <span className="text-xs font-bold font-mono text-primary-600 bg-primary-50 px-2 py-1 rounded inline-block mb-2">
                                    {shipment.trackingId}
                                </span>
                                <p className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">{shipment.receiverName}</p>
                                <div className="flex items-center text-sm text-secondary-500 mt-1">
                                    <MapPin size={14} className="mr-1 inline text-secondary-400" />
                                    <span className="truncate max-w-[200px]">{shipment.destinationAddress}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-medium text-secondary-500 uppercase tracking-wider block mb-1">Status</span>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium 
                  ${shipment.status === 'Out for Delivery' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {shipment.status}
                                </span>
                            </div>
                        </div>
                    ))}
                    {shipments.filter(s => s.status !== 'Delivered').length === 0 && (
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center text-secondary-500">
                            <CheckCircle2 className="mx-auto text-green-500 mb-3" size={32} />
                            <p>You have no active deliveries! Great job.</p>
                        </div>
                    )}
                </div>

                {/* Status Update Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-6 self-start">
                    <div className="bg-slate-900 p-5 text-white">
                        <h2 className="text-lg font-semibold flex items-center">
                            <Truck size={20} className="mr-2 text-primary-400" />
                            Update Shipment Status
                        </h2>
                    </div>

                    <div className="p-6">
                        {!selectedShipment ? (
                            <div className="text-center py-12 text-secondary-400">
                                <Package size={48} className="mx-auto text-slate-200 mb-4" />
                                <p>Select a package from your list to update its status or upload proof of delivery.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div>
                                    <p className="text-xs text-secondary-500 uppercase font-semibold tracking-wider mb-1">Selected Package</p>
                                    <p className="text-xl font-mono font-bold text-secondary-900 border-b pb-3">{selectedShipment.trackingId}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">New Status transition</label>
                                    <select
                                        value={statusUpdate}
                                        onChange={e => setStatusUpdate(e.target.value)}
                                        className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-3 border outline-none bg-slate-50"
                                    >
                                        {SHIPMENT_STATUSES.map(s => {
                                            const currentIndex = SHIPMENT_STATUSES.indexOf(selectedShipment.status);
                                            const optionIndex = SHIPMENT_STATUSES.indexOf(s);
                                            const isDisabled = optionIndex !== currentIndex && optionIndex !== currentIndex + 1;
                                            return (
                                                <option key={s} value={s} disabled={isDisabled}>
                                                    {s} {isDisabled ? '(Locked)' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">Current Location (Optional)</label>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={e => setLocation(e.target.value)}
                                        placeholder="e.g. Warehouse A, Client Door"
                                        className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-3 border outline-none"
                                    />
                                </div>

                                {statusUpdate === 'Delivered' && (
                                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50 transition-colors hover:bg-slate-100">
                                        <input
                                            type="file"
                                            id="proof"
                                            className="hidden"
                                            accept="image/*,.pdf"
                                            onChange={e => setProofFile(e.target.files[0])}
                                        />
                                        <label htmlFor="proof" className="cursor-pointer flex flex-col items-center">
                                            <UploadCloud size={32} className="text-primary-500 mb-2" />
                                            <span className="text-sm font-medium text-secondary-900 block mb-1">Upload Proof of Delivery</span>
                                            <span className="text-xs text-secondary-500">
                                                {proofFile ? <span className="text-primary-600 font-semibold">{proofFile.name}</span> : 'Image or Signature (JPG, PNG, PDF)'}
                                            </span>
                                        </label>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={updateLoading || selectedShipment.status === statusUpdate}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
                                >
                                    {updateLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : 'Confirm Status Update'}
                                </button>

                                {selectedShipment.status === 'Delivered' && selectedShipment.proofOfDelivery && (
                                    <div className="mt-6 border-t pt-6">
                                        <h4 className="flex items-center text-sm font-medium text-secondary-900 mb-3">
                                            <CheckCircle2 size={16} className="text-green-500 mr-2" />
                                            Proof of Delivery Attached
                                        </h4>
                                        <a href={`http://localhost:5000${selectedShipment.proofOfDelivery}`} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={`http://localhost:5000${selectedShipment.proofOfDelivery}`}
                                                alt="Proof of Delivery"
                                                className="w-full h-48 object-cover rounded-xl border border-slate-200 shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                                            />
                                        </a>
                                        <p className="text-xs text-secondary-500 mt-2 text-center">Click image to enlarge</p>
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Scanner Modal */}
            {showScanner && (
                <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"><div className="text-white">Loading scanner...</div></div>}>
                    <QRScanner
                        onScanSuccess={handleScanSuccess}
                        onClose={() => setShowScanner(false)}
                    />
                </Suspense>
            )}
        </div>
    );
};

export default StaffDashboard;
