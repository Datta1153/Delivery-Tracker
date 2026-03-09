const bwipjs = require('bwip-js');

// Generate a random tracking ID: TRK-YYYYMMDD-XXXX
const generateTrackingId = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // 4 random uppercase hex characters
    const randomStr = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');

    return `TRK-${year}${month}${day}-${randomStr}`;
};

// Generate barcode image as base64
const generateBarcode = async (text) => {
    try {
        const pngBuffer = await bwipjs.toBuffer({
            bcid: 'code128',       // Barcode type
            text: text,            // Text to encode
            scale: 3,              // 3x scaling factor
            height: 10,            // Bar height, in millimeters
            includetext: true,     // Show human-readable text
            textxalign: 'center',  // Always good to set this
        });
        return `data:image/png;base64,${pngBuffer.toString('base64')}`;
    } catch (err) {
        console.error(err);
        throw new Error('Barcode generation failed');
    }
};

module.exports = {
    generateTrackingId,
    generateBarcode
};
