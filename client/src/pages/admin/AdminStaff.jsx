import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Users, Search, Loader2, X, ShieldAlert, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminStaff = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [searchKw, setSearchKw] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'STAFF'
    });
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await api.get('/auth/staff');
            setStaffList(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setError(null);
        try {
            await api.post('/auth/register', formData);
            setFormData({ name: '', email: '', password: '', role: 'STAFF' });
            setIsModalOpen(false);
            fetchStaff(); // Refresh list
        } catch (err) {
            console.error('Add Staff Error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to create staff');
        } finally {
            setFormLoading(false);
        }
    };

    const filteredStaff = staffList.filter(staff =>
        staff.name.toLowerCase().includes(searchKw.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchKw.toLowerCase())
    );

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await api.delete(`/auth/staff/${deleteConfirmId}`);
            setStaffList(staffList.filter(s => s._id !== deleteConfirmId));
            setDeleteConfirmId(null);
            // Optionally add a success toast here
        } catch (err) {
            console.error('Delete Staff Error:', err.response || err);
            alert(`Failed to delete staff: ${err.response?.data?.message || err.message}`);
            setDeleteConfirmId(null);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">Staff Management</h1>
                    <p className="text-sm text-secondary-500 mt-1">Manage delivery personnel and system access</p>
                </div>
                <button
                    onClick={() => { setError(null); setIsModalOpen(true); }}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-sm"
                >
                    <Plus size={18} />
                    <span>Add Staff</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div className="max-w-md relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-secondary-400" />
                        </div>
                        <input
                            type="text"
                            value={searchKw}
                            onChange={(e) => setSearchKw(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 outline-none"
                            placeholder="Search staff by name or email..."
                        />
                    </div>
                    <div className="hidden sm:flex items-center text-sm text-secondary-500">
                        <Users size={16} className="mr-2" />
                        <span>Total: {staffList.length}</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Joined Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {filteredStaff.map((staff) => (
                                <tr key={staff._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold uppercase">
                                                {staff.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-secondary-900">{staff.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                                        {staff.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                                            {staff.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                                        {format(new Date(staff.createdAt), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => setDeleteConfirmId(staff._id)} className="text-red-600 hover:text-red-900 transition-colors cursor-pointer" title="Delete Staff Member">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredStaff.length === 0 && (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-secondary-500">No staff accounts found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-900/75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xl leading-6 font-bold text-secondary-900" id="modal-title">Register New Staff</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500 focus:outline-none"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 bg-slate-50 space-y-4">
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium flex items-center">
                                        <ShieldAlert size={16} className="mr-2" /> {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Full Name</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2.5 border outline-none" placeholder="John Doe" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Email Address</label>
                                    <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2.5 border outline-none" placeholder="john@logistiq.com" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Temporary Password</label>
                                    <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2.5 border outline-none" placeholder="••••••••" />
                                </div>

                                <div className="mt-8 border-t border-slate-200 pt-5 flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white py-2.5 px-6 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-secondary-700 hover:bg-slate-50 focus:outline-none transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={formLoading} className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none disabled:opacity-70 transition-colors">
                                        {formLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Create Account'}
                                    </button>
                                </div>
                            </form>
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
                                        <h3 className="text-lg leading-6 font-medium text-secondary-900" id="modal-title">Delete Staff Account</h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-secondary-500">Are you sure you want to delete this staff member? This action will instantly revoke their access to the Logistiq Tracker and cannot be undone.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-100">
                                <button type="button" onClick={confirmDelete} className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                                    Delete Account
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

export default AdminStaff;
