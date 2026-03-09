async function test() {
    try {
        console.log("1. Logging in as Admin...");
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@logistiq.com',
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();

        if (!loginRes.ok) {
            console.error("Login failed:", loginData);
            return;
        }

        const token = loginData.token;
        console.log("Login successful. Token acquired.");

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        console.log("\n2. Testing Create Staff...");
        const staffRes = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: 'Test Staff 3',
                email: 'teststaff3@logistiq.com',
                password: 'password123',
                role: 'STAFF'
            })
        });
        const staffData = await staffRes.json();
        if (!staffRes.ok) {
            console.error("Create Staff Error:", staffData);
        } else {
            console.log("Create Staff Success:", staffData);
        }

        console.log("\n3. Testing Create Shipment...");
        const shipmentRes = await fetch('http://localhost:5000/api/shipments', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                senderName: 'John Sender',
                receiverName: 'Jane Receiver',
                originAddress: '123 Origin St',
                destinationAddress: '456 Dest St',
                packageWeight: 2.5
            })
        });
        const shipmentData = await shipmentRes.json();

        if (!shipmentRes.ok) {
            console.error("Create Shipment Error:", shipmentData);
        } else {
            console.log("Create Shipment Success:", shipmentData.trackingId);
        }

    } catch (err) {
        console.error("Error running script:", err);
    }
}

test();
