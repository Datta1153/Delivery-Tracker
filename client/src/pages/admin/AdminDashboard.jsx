import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Truck, PackageCheck, AlertCircle, Package, Trash2 } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/analytics');
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await api.delete(`/shipments/${deleteConfirmId}`);
            fetchAnalytics();
            setDeleteConfirmId(null);
        } catch (err) {
            console.error('Delete Error:', err.response || err);
            alert(`Failed to delete shipment: ${err.response?.data?.message || err.message}`);
            setDeleteConfirmId(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full">Loading dashboard...</div>;
    }

    // Fallback if no chart data
    const hasChartData = data?.chartData?.labels?.length > 0;

    const chartInfo = hasChartData ? {
        labels: data.chartData.labels,
        datasets: [
            {
                label: 'Shipments by Status',
                data: data.chartData.data,
                backgroundColor: [
                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'
                ],
                borderWidth: 0,
                borderRadius: 4,
            },
        ],
    } : null;

    const doughnutInfo = hasChartData ? {
        labels: ['Delivered', 'In Transit', 'Others'],
        datasets: [{
            data: [
                data.deliveredShipments,
                data.inTransitShipments,
                data.totalShipments - data.deliveredShipments - data.inTransitShipments
            ],
            backgroundColor: ['#10b981', '#3b82f6', '#e2e8f0'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    } : null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-secondary-500 mt-1">Real-time system statistics</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-secondary-500">Total Shipments</p>
                            <h3 className="text-3xl font-bold text-secondary-900 mt-2">{data?.totalShipments || 0}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Package size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-secondary-500">In Transit</p>
                            <h3 className="text-3xl font-bold text-secondary-900 mt-2">{data?.inTransitShipments || 0}</h3>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                            <Truck size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-secondary-500">Delivered</p>
                            <h3 className="text-3xl font-bold text-secondary-900 mt-2">{data?.deliveredShipments || 0}</h3>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <PackageCheck size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-secondary-500">Failed / Exception</p>
                            <h3 className="text-3xl font-bold text-secondary-900 mt-2">0</h3>
                        </div>
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                            <AlertCircle size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {hasChartData && (
                    <>
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <h3 className="text-lg font-bold text-secondary-900 mb-4">Shipments by Status</h3>
                            <div className="h-72 w-full">
                                <Bar
                                    data={chartInfo}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <h3 className="text-lg font-bold text-secondary-900 mb-4">Delivery Rate</h3>
                            <div className="h-64 w-full flex justify-center mt-4">
                                <Doughnut
                                    data={doughnutInfo}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        cutout: '75%',
                                        plugins: { legend: { position: 'bottom' } }
                                    }}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-secondary-900">Recent Shipments</h3>
                    <Link to="/admin/shipments" className="text-sm font-medium text-primary-600 hover:text-primary-700">View All</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Tracking ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">To</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {data?.recentShipments?.map((shipment) => (
                                <tr key={shipment._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                                        {shipment.trackingId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                                        {shipment.receiverName} • {shipment.destinationAddress}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            {shipment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                                        {format(new Date(shipment.createdAt), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => setDeleteConfirmId(shipment._id)} className="text-red-600 hover:text-red-900 transition-colors cursor-pointer" title="Delete Package">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {(!data?.recentShipments || data.recentShipments.length === 0) && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-secondary-500">No shipments found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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

export default AdminDashboard;
