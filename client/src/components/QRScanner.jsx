import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, X, Scan, Upload, ImageIcon, Keyboard } from 'lucide-react';

const QRScanner = ({ onScanSuccess, onClose }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState('');
    const [libraryLoaded, setLibraryLoaded] = useState(false);
    const [mode, setMode] = useState('manual'); // 'camera', 'upload', or 'manual'
    const [manualId, setManualId] = useState('');
    const scannerRef = useRef(null);
    const Html5QrcodeRef = useRef(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        import('html5-qrcode').then((module) => {
            if (mountedRef.current) {
                Html5QrcodeRef.current = module;
                setLibraryLoaded(true);
            }
        }).catch((err) => {
            console.error('Failed to load scanner library:', err);
        });

        return () => {
            mountedRef.current = false;
            stopScannerSilently();
        };
    }, []);

    const stopScannerSilently = useCallback(() => {
        const scanner = scannerRef.current;
        if (scanner) {
            try {
                const state = scanner.getState();
                if (state === 2 || state === 3) {
                    scanner.stop().catch(() => { });
                }
            } catch (e) {
                try { scanner.stop().catch(() => { }); } catch (e2) { /* ignore */ }
            }
            scannerRef.current = null;
        }
    }, []);

    const startScanning = async () => {
        setError('');
        const lib = Html5QrcodeRef.current;
        if (!lib) {
            setError('Scanner library not loaded yet.');
            return;
        }

        stopScannerSilently();

        try {
            const { Html5Qrcode, Html5QrcodeSupportedFormats } = lib;

            const readerEl = document.getElementById('qr-reader');
            if (readerEl) readerEl.innerHTML = '';

            const scanner = new Html5Qrcode('qr-reader', {
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.QR_CODE,
                    Html5QrcodeSupportedFormats.CODE_128,
                    Html5QrcodeSupportedFormats.CODE_39,
                    Html5QrcodeSupportedFormats.EAN_13,
                ],
                verbose: false,
            });
            scannerRef.current = scanner;

            let cameraConfig;
            try {
                const devices = await Html5Qrcode.getCameras();
                if (devices && devices.length > 0) {
                    const backCam = devices.find(d => /back|rear|environment/i.test(d.label));
                    cameraConfig = backCam ? backCam.id : devices[0].id;
                } else {
                    throw new Error('No cameras found');
                }
            } catch (camErr) {
                cameraConfig = { facingMode: 'user' };
            }

            await scanner.start(
                cameraConfig,
                { fps: 15, qrbox: { width: 280, height: 140 }, aspectRatio: 1.333, disableFlip: false },
                (decodedText) => {
                    stopScannerSilently();
                    if (mountedRef.current) {
                        setIsScanning(false);
                        onScanSuccess(decodedText);
                    }
                },
                () => { }
            );

            setTimeout(() => {
                const video = document.querySelector('#qr-reader video');
                if (video) {
                    video.style.width = '100%';
                    video.style.height = 'auto';
                    video.style.objectFit = 'cover';
                    video.style.display = 'block';
                }
            }, 500);

            if (mountedRef.current) setIsScanning(true);
        } catch (err) {
            console.error('Scanner error:', err);
            const errStr = String(err);
            if (errStr.includes('NotAllowedError') || errStr.includes('Permission')) {
                setError('Camera permission denied. Try the "Manual Entry" tab instead.');
            } else if (errStr.includes('NotFoundError') || errStr.includes('No cameras')) {
                setError('No camera found. Use the "Manual Entry" tab instead.');
            } else {
                setError(`Camera error. Use the "Manual Entry" tab instead.`);
            }
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError('');
        const lib = Html5QrcodeRef.current;
        if (!lib) { setError('Scanner library not loaded.'); return; }

        try {
            const { Html5Qrcode, Html5QrcodeSupportedFormats } = lib;
            const scanner = new Html5Qrcode('qr-reader-file', {
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.QR_CODE,
                    Html5QrcodeSupportedFormats.CODE_128,
                    Html5QrcodeSupportedFormats.CODE_39,
                    Html5QrcodeSupportedFormats.EAN_13,
                ],
                verbose: false,
            });
            const result = await scanner.scanFile(file, true);
            onScanSuccess(result);
        } catch (err) {
            setError('Could not read barcode from this image. Try the "Manual Entry" tab instead.');
        }
        e.target.value = '';
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        const trimmed = manualId.trim();
        if (!trimmed) {
            setError('Please enter a tracking ID.');
            return;
        }
        onScanSuccess(trimmed);
    };

    const stopScanning = () => {
        stopScannerSilently();
        if (mountedRef.current) setIsScanning(false);
    };

    const handleClose = () => {
        stopScanning();
        onClose();
    };

    const switchMode = (newMode) => {
        stopScanning();
        setMode(newMode);
        setError('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-900 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                        <Scan size={20} className="text-primary-400" />
                        <h3 className="font-semibold text-lg">Scan Package Barcode</h3>
                    </div>
                    <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700">
                        <X size={20} />
                    </button>
                </div>

                {/* Mode Toggle */}
                <div className="flex border-b border-slate-200">
                    {[
                        { key: 'manual', label: 'Manual Entry', icon: Keyboard },
                        { key: 'camera', label: 'Camera', icon: Camera },
                        { key: 'upload', label: 'Upload', icon: Upload },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => switchMode(key)}
                            className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${mode === key ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50' : 'text-secondary-500 hover:bg-slate-50'}`}
                        >
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>

                <div className="p-5 space-y-4">
                    {/* =========== MANUAL ENTRY MODE =========== */}
                    {mode === 'manual' && (
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div className="text-center pb-2">
                                <Keyboard size={36} className="mx-auto text-slate-300 mb-2" />
                                <p className="text-secondary-600 text-sm font-medium">Enter the Tracking ID from the package</p>
                                <p className="text-secondary-400 text-xs mt-1">Type or paste the tracking ID (e.g., TRK-20260312-A1B2)</p>
                            </div>
                            <input
                                type="text"
                                value={manualId}
                                onChange={(e) => setManualId(e.target.value.toUpperCase())}
                                placeholder="TRK-XXXXXXXX-XXXX"
                                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-3 border outline-none text-center font-mono text-lg tracking-wider"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={!manualId.trim()}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
                            >
                                <Scan size={18} />
                                Find Package
                            </button>
                        </form>
                    )}

                    {/* =========== CAMERA MODE =========== */}
                    {mode === 'camera' && (
                        <>
                            {!isScanning && !error && (
                                <div className="w-full min-h-[250px] bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300">
                                    <div className="text-center p-6">
                                        <Camera size={48} className="mx-auto text-slate-300 mb-3" />
                                        <p className="text-secondary-500 text-sm">
                                            {libraryLoaded ? 'Click Start Camera below' : 'Loading scanner...'}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div
                                id="qr-reader"
                                style={{ display: isScanning ? 'block' : 'none', width: '100%', minHeight: '250px', borderRadius: '12px', overflow: 'hidden', background: '#0f172a' }}
                            ></div>
                            <div className="flex gap-3">
                                {!isScanning ? (
                                    <button onClick={startScanning} disabled={!libraryLoaded} className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50">
                                        <Camera size={18} />
                                        {libraryLoaded ? 'Start Camera' : 'Loading...'}
                                    </button>
                                ) : (
                                    <button onClick={stopScanning} className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-sm">
                                        <CameraOff size={18} />
                                        Stop Camera
                                    </button>
                                )}
                            </div>
                        </>
                    )}

                    {/* =========== UPLOAD MODE =========== */}
                    {mode === 'upload' && (
                        <>
                            <div className="w-full min-h-[200px] bg-slate-50 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-primary-400 hover:bg-primary-50 transition-colors">
                                <label className="cursor-pointer text-center p-6 w-full h-full flex flex-col items-center justify-center">
                                    <ImageIcon size={48} className="mx-auto text-slate-300 mb-3" />
                                    <span className="text-secondary-700 font-medium text-sm block mb-1">Click to upload a barcode image</span>
                                    <span className="text-secondary-400 text-xs">Use a high-quality photo, not a screenshot</span>
                                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
                                </label>
                            </div>
                            <div id="qr-reader-file" style={{ display: 'none' }}></div>
                        </>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                            <CameraOff size={18} className="mt-0.5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QRScanner;
