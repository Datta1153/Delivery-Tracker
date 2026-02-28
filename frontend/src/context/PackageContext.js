import React, { createContext, useState, useCallback, useEffect } from 'react';
import { packageAPI } from '../services/api';
import { onPackageUpdated } from '../services/socket';

export const PackageContext = createContext();

export const PackageProvider = ({ children }) => {
  const [packages, setPackages] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageInfo, setPageInfo] = useState({ page: 1, limit: 20 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Listen for real-time package updates
  useEffect(() => {
    onPackageUpdated((data) => {
      setPackages((prevPackages) =>
        prevPackages.map((pkg) =>
          pkg._id === data.packageId
            ? {
                ...pkg,
                status: data.status,
                currentLocation: data.location,
                updatedAt: data.timestamp,
              }
            : pkg
        )
      );
    });
  }, []);

  const fetchPackages = useCallback(async (options = {}) => {
    // options: { page, limit, status, q, sort }
    setLoading(true);
    setError(null);
    try {
      const response = await packageAPI.getPackages(options);
      setPackages(response.data.packages || []);
      if (response.data.total != null) setTotal(response.data.total);
      setPageInfo({ page: response.data.page || 1, limit: response.data.limit || 20 });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch packages';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPackage = useCallback(async (packageData) => {
    setError(null);
    try {
      const response = await packageAPI.createPackage(packageData);
      setPackages((prev) => [response.data.package, ...prev]);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create package';
      setError(errorMsg);
      throw err;
    }
  }, []);

  const updatePackageStatus = useCallback(async (id, statusData) => {
    setError(null);
    try {
      const response = await packageAPI.updatePackageStatus(id, statusData);
      setPackages((prev) =>
        prev.map((pkg) => (pkg._id === id ? response.data.package : pkg))
      );
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update package';
      setError(errorMsg);
      throw err;
    }
  }, []);

  const deletePackage = useCallback(async (id) => {
    setError(null);
    try {
      await packageAPI.deletePackage(id);
      setPackages((prev) => prev.filter((pkg) => pkg._id !== id));
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete package';
      setError(errorMsg);
      throw err;
    }
  }, []);

  return (
    <PackageContext.Provider
      value={{
        packages,
        total,
        pageInfo,
        loading,
        error,
        fetchPackages,
        createPackage,
        updatePackageStatus,
        deletePackage,
      }}
    >
      {children}
    </PackageContext.Provider>
  );
};

export const usePackages = () => {
  const context = React.useContext(PackageContext);
  if (!context) {
    throw new Error('usePackages must be used within PackageProvider');
  }
  return context;
};
