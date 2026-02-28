// utility to create unique tracking identifiers
// simple format: random alphanumeric string (8 chars) prefixed by 'DEL'
// in real system you could use a sequence or UUID

import crypto from 'crypto';
import Package from '../models/Package.js';

export const generateTrackingNumber = async () => {
  let valid = false;
  let tn = '';
  while (!valid) {
    tn = 'DEL-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const exists = await Package.findOne({ trackingNumber: tn });
    if (!exists) valid = true;
  }
  return tn;
};
