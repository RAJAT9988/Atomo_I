const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
/*
const mqtt = require('mqtt');
*/
const HomeAssistant = require('./home-assistant');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Initialize Home Assistant
const ha = new HomeAssistant();
ha.connect();

// Set up entity update handler
ha.onEntityUpdate = (entityId, entity) => {
    // Broadcast entity update to all connected clients
    io.emit('homeAssistantUpdate', { entityId, entity });

    // Sync with your office data if needed
    syncHomeAssistantWithOffice(entityId, entity);
};

/*
// Initialize MQTT client for people count detection
const mqttClient = mqtt.connect('mqtt://localhost:1883', {
    clientId: 'office-digital-twin-server',
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
    username: 'rajat',
    password: 'asdf',
});

// MQTT event handlers
mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    // Subscribe to people count topics
    const topics = [
        'office/workstation/people_count'
    ];

    topics.forEach(topic => {
        mqttClient.subscribe(topic, (err) => {
            if (!err) {
                console.log(`Subscribed to ${topic}`);
            } else {
                console.error(`Failed to subscribe to ${topic}:`, err);
            }
        });
    });
});

// In server.js - REPLACE ONLY the mqttClient.on('message') handler:

mqttClient.on('message', (topic, message) => {
    try {
        console.log(`📥 MQTT Message Received - Topic: ${topic}, Message: ${message.toString()}`);

        let peopleCount = 0;
        const messageStr = message.toString().trim();

        // Try to parse as JSON first
        try {
            const data = JSON.parse(messageStr);
            console.log('✅ Parsed as JSON:', data);

            // Extract count from various possible field names
            if (data.count !== undefined) {
                peopleCount = parseInt(data.count);
            } else if (data.people !== undefined) {
                peopleCount = parseInt(data.people);
            } else if (data.occupancy !== undefined) {
                peopleCount = parseInt(data.occupancy);
            } else if (typeof data === 'number') {
                peopleCount = data;
            }
        } catch (jsonError) {
            // If not JSON, try to parse as plain number
            const numValue = parseInt(messageStr);
            if (!isNaN(numValue)) {
                peopleCount = numValue;
                console.log('✅ Parsed as direct number:', peopleCount);
            }
        }

        // Validate the count
        if (isNaN(peopleCount)) {
            console.error('❌ Could not extract valid people count from message');
            return;
        }

        console.log(`🔢 Final people count: ${peopleCount}`);

        // Find the OPEN WORKSPACE room (ID: 3)
        const workspaceRoom = officeData.rooms.find(room => room.id === 3);

        if (!workspaceRoom) {
            console.error('❌ Could not find OPEN WORKSPACE room');
            return;
        }

        console.log(`📍 Updating room: ${workspaceRoom.name}, Previous count: ${workspaceRoom.occupancy}, New count: ${peopleCount}`);

        // Update the room occupancy
        workspaceRoom.occupancy = Math.max(0, peopleCount);

        // Broadcast the update to ALL connected clients
        io.emit('roomUpdate', workspaceRoom);
        console.log('✅ Room update broadcasted to clients');

        // Publish the updated occupancy back to MQTT for other subscribers
        // publishMqttMessage('office/workspace/occupancy', { occupancy: peopleCount, timestamp: new Date().toISOString() });

        // Also update the file-based count for frontend display
        const timestamp = new Date().toISOString();
        const txtLine = `${timestamp}: ${peopleCount}`;

        // Write to TXT file
        try {
            fs.appendFileSync('people_count.txt', txtLine + '\n');
            console.log('✅ Updated people_count.txt with count:', peopleCount);
        } catch (error) {
            console.error('❌ Error writing to people_count.txt:', error);
        }

        // Also write to JSONL file for API endpoint
        const jsonlLine = JSON.stringify({ count: peopleCount, timestamp: timestamp });
        try {
            fs.appendFileSync('people_count.jsonl', jsonlLine + '\n');
            console.log('✅ Updated people_count.jsonl with count:', peopleCount);
        } catch (error) {
            console.error('❌ Error writing to people_count.jsonl:', error);
        }

    } catch (error) {
        console.error('❌ Error processing MQTT message:', error);
    }
});
mqttClient.on('error', (error) => {
    console.error('MQTT connection error:', error);
});

mqttClient.on('offline', () => {
    console.log('MQTT client offline');
});

mqttClient.on('reconnect', () => {
    console.log('MQTT client reconnecting...');
});
*/

/*
// Helper function to publish MQTT messages
function publishMqttMessage(topic, message) {
    if (!mqttClient.connected) {
        console.error('MQTT client not connected, cannot publish message');
        return false;
    }

    try {
        const payload = typeof message === 'object' ? JSON.stringify(message) : message.toString();
        mqttClient.publish(topic, payload, { qos: 0, retain: false }, (err) => {
            if (err) {
                console.error(`Failed to publish to ${topic}:`, err);
            } else {
                console.log(`✅ Published to ${topic}: ${payload}`);
            }
        });
        return true;
    } catch (error) {
        console.error('Error publishing MQTT message:', error);
        return false;
    }
}
*/

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const officeData = {
    rooms: [
        {
            id: 1,
            name: 'RECEPTION',
            type: 'reception',
            x: 60, y: 60, width: 180, height: 120,
            temperature: 22, humidity: 45, occupancy: 2,
            lights: true,
            ac: true,
            description: 'Welcome Area',
            amenities: ['Front Desk', 'Waiting Area', 'Coffee Station'],
            haEntities: {
                lights: {
                    main: ['light.cabin_centre_1', 'light.cabin_centre_2', 'light.cabin_centre_3']
                }
            }
        },
        {
            id: 2,
            name: 'CONFERENCE ROOM',
            type: 'meeting',
            x: 280, y: 60, width: 240, height: 180,
            temperature: 23, humidity: 48, occupancy: 0,
            lights: false,
            ac: true,
            description: 'Executive Meeting Space',
            amenities: ['Video Conferencing', 'Whiteboard', 'Projector'],
            haEntities: {
                lights: {
                    main: ['light.tz3210_ksuiwy91_ts0505b_light_9', 'light.tz3210_ksuiwy91_ts0505b_light_10']
                }
            }
        },
        {
            id: 3,
            name: 'OPEN WORKSPACE',
            type: 'workspace',
            x: 60, y: 220, width: 460, height: 340,
            temperature: 24, humidity: 50, occupancy: 0, // Start with 0
            lights: true,
            ac: true,
            description: 'Collaborative Work Area',
            amenities: ['Hot Desks', 'Meeting Pods', 'Break Area'],
            haEntities: {
                lights: {
                    main: 'light.tz3210_6m066rkz_ts0502b_light',
                    entrance: 'light.tz3210_6m066rkz_ts0502b_light'
                    // light1: ['light.tz3210_ksuiwy91_ts0505b_light_6'],
                    // light2: 'light.tz3210_9rmssnf0_ts0502b_light_4',
                    // light3: 'light.tz3210_9rmssnf0_ts0502b_light_5'
                }
            },
            // Add this to identify it as the main detection area
            isDetectionArea: true
        }
    ],
    devices: [
        { id: 1, roomId: 1, type: 'sensor', name: 'Temp Sensor 1' },
        { id: 2, roomId: 3, type: 'sensor', name: 'Occupancy Sensor 1' },
        { id: 3, roomId: 2, type: 'ac', name: 'AC Unit 1' }
    ]
};

// Sync Home Assistant state with office data
function syncHomeAssistantWithOffice(entityId, entity) {
    officeData.rooms.forEach(room => {
        if (room.haEntities && room.haEntities.lights) {
            // Check if any light in the room matches the entityId
            for (const [lightKey, lightConfig] of Object.entries(room.haEntities.lights)) {
                let entityIds = [];
                let invert = false;

                if (typeof lightConfig === 'object' && lightConfig.entities) {
                    entityIds = lightConfig.entities;
                    invert = lightConfig.invert || false;
                } else {
                    entityIds = Array.isArray(lightConfig) ? lightConfig : [lightConfig];
                }

                if (entityIds.includes(entityId)) {
                    // For now, sync the overall room lights state based on any light change
                    // In a more advanced implementation, we could track individual light states
                    const wasOn = room.lights;
                    const haState = entity.state === 'on';
                    room.lights = invert ? !haState : haState;

                    // If state changed, notify clients
                    if (wasOn !== room.lights) {
                        io.emit('roomUpdate', room);
                        console.log(`Synced ${entityId} (${lightKey}) with office data: ${room.lights ? 'ON' : 'OFF'}${invert ? ' (inverted)' : ''}`);
                    }
                    break;
                }
            }
        }
    });
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'three.html'));
});

app.get('/api/office-data', (req, res) => {
    res.json(officeData);
});

// Updated toggle lights to use Home Assistant - supports multiple lights per room
app.post('/api/room/:id/toggle-lights', async (req, res) => {
    const roomId = parseInt(req.params.id);
    const { lightKey } = req.body; // Optional: specify which light to toggle (e.g., 'main', 'entrance')
    const room = officeData.rooms.find(r => r.id === roomId);

    if (!room) {
        return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.haEntities && room.haEntities.lights) {
        let entityIds;
        let targetLightKey;

        if (lightKey && room.haEntities.lights[lightKey]) {
            // Toggle specific light(s)
            const lightConfig = room.haEntities.lights[lightKey];
            entityIds = Array.isArray(lightConfig) ? lightConfig : [lightConfig];
            targetLightKey = lightKey;
        } else {
            // Default to main light or first available light
            targetLightKey = 'main';
            const lightConfig = room.haEntities.lights[targetLightKey] || Object.values(room.haEntities.lights)[0];
            entityIds = Array.isArray(lightConfig) ? lightConfig : [lightConfig];
        }

        let success = true;
        entityIds.forEach(entityId => {
            if (!ha.toggleLight(entityId)) {
                success = false;
            }
        });

        if (success) {
            // Optimistically update local state - consider inversion
            const lightConfig = room.haEntities.lights[targetLightKey];
            const invert = typeof lightConfig === 'object' && lightConfig.invert;
            room.lights = invert ? room.lights : !room.lights; // For inverted lights, don't flip the state
            io.emit('roomUpdate', room);
            res.json({
                success: true,
                room,
                haControlled: true,
                lightKey: targetLightKey,
                entityIds: entityIds
            });
        } else {
            res.status(500).json({ success: false, message: 'Home Assistant not available' });
        }
    } else {
        // Fallback to original behavior if no HA entity mapped
        room.lights = !room.lights;
        io.emit('roomUpdate', room);
        res.json({ success: true, room, haControlled: false });
    }
});

// Set light brightness via Home Assistant
app.post('/api/room/:id/set-brightness', async (req, res) => {
    const roomId = parseInt(req.params.id);
    const { brightness } = req.body;
    const room = officeData.rooms.find(r => r.id === roomId);

    if (room && room.haEntities && room.haEntities.light) {
        if (brightness >= 0 && brightness <= 255) {
            const success = ha.setLightBrightness(room.haEntities.light, brightness);

            if (success) {
                res.json({ success: true, brightness });
            } else {
                res.status(500).json({ success: false, message: 'Home Assistant not available' });
            }
        } else {
            res.status(400).json({ success: false, message: 'Brightness must be between 0-255' });
        }
    } else {
        res.status(404).json({ success: false, message: 'Room or light entity not found' });
    }
});

app.post('/api/room/:id/set-temperature', (req, res) => {
    const roomId = parseInt(req.params.id);
    const { temperature } = req.body;
    const room = officeData.rooms.find(r => r.id === roomId);

    if (room && temperature >= 16 && temperature <= 30) {
        room.temperature = temperature;
        io.emit('roomUpdate', room);
        res.json({ success: true, room });
    } else {
        res.status(400).json({ success: false, message: 'Invalid temperature or room not found' });
    }
});

// Get Home Assistant entities
app.get('/api/home-assistant/entities', (req, res) => {
    const entities = Array.from(ha.entities.entries()).map(([entityId, entity]) => ({
        entityId,
        ...entity
    }));
    res.json({ entities, connected: ha.isConnected });
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send initial data
    socket.emit('initialData', officeData);

    // Send Home Assistant connection status
    socket.emit('haStatus', { connected: ha.isConnected });

    // Send Home Assistant entities if any
    if (ha.entities.size > 0) {
        const entities = Array.from(ha.entities.entries()).map(([entityId, entity]) => ({
            entityId,
            ...entity
        }));
        socket.emit('haEntities', entities);
    }

    // Simulate real-time sensor updates
    const interval = setInterval(() => {
        officeData.rooms.forEach(room => {
            if (room.occupancy > 0) {
                // Small random fluctuations in temperature
                room.temperature += (Math.random() - 0.5) * 0.5;
                room.temperature = Math.round(room.temperature * 10) / 10;

                // Occasionally change occupancy
                if (Math.random() < 0.1) {
                    room.occupancy += Math.random() < 0.5 ? 1 : -1;
                    room.occupancy = Math.max(0, room.occupancy);
                }
            }
        });

        socket.emit('sensorUpdate', officeData.rooms);
    }, 5000);

    // Home Assistant events
    socket.on('getHaEntities', () => {
        const entities = Array.from(ha.entities.entries()).map(([entityId, entity]) => ({
            entityId,
            ...entity
        }));
        socket.emit('haEntities', entities);
    });

    socket.on('toggleHaLight', (entityId) => {
        ha.toggleLight(entityId);
    });

    socket.on('toggleRoomLight', (data) => {
        // data should contain { roomId, lightKey }
        const { roomId, lightKey } = data;
        const room = officeData.rooms.find(r => r.id === roomId);

        if (room && room.haEntities && room.haEntities.lights) {
            const lightConfig = room.haEntities.lights[lightKey];
            const entityIds = Array.isArray(lightConfig) ? lightConfig : [lightConfig];
            entityIds.forEach(entityId => {
                if (entityId) {
                    ha.toggleLight(entityId);
                }
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        clearInterval(interval);
    });
});

// Debug endpoint to manually trigger people count updates
app.post('/api/debug/set-people-count', (req, res) => {
    const { count, roomId = 3 } = req.body;
    const room = officeData.rooms.find(r => r.id === roomId);

    if (room) {
        const previousCount = room.occupancy;
        room.occupancy = parseInt(count) || 0;
        io.emit('roomUpdate', room);
        // Publish the updated occupancy to MQTT
        // publishMqttMessage('office/workspace/occupancy', { occupancy: room.occupancy, timestamp: new Date().toISOString() });
        res.json({
            success: true,
            message: `Updated ${room.name} occupancy: ${previousCount} → ${room.occupancy}`
        });
    } else {
        res.status(404).json({ success: false, message: 'Room not found' });
    }
});

// New API endpoint for manual MQTT publishing
app.post('/api/publish-mqtt', (req, res) => {
    const { topic, message } = req.body;

    if (!topic || !message) {
        return res.status(400).json({ success: false, message: 'Topic and message are required' });
    }

    // const success = publishMqttMessage(topic, message);
    const success = false; // MQTT disabled

    if (success) {
        res.json({ success: true, message: `Published to ${topic}` });
    } else {
        res.status(500).json({ success: false, message: 'MQTT disabled' });
    }
});

// API endpoint to get people count from files
app.get('/api/people-count', (req, res) => {
    try {
        let peopleCount = 0;
        let lastTimestamp = null;

        // Read from JSONL file first (primary source for MQTT updates)
        if (fs.existsSync('people_count.jsonl')) {
            const jsonlData = fs.readFileSync('people_count.jsonl', 'utf8');
            const lines = jsonlData.trim().split('\n').filter(line => line.trim());
            const data = lines.map(line => JSON.parse(line));
            res.json(data);
        } else {
            res.status(404).json({ error: "JSONL file not found" });
        }
    } catch (error) {
        console.error("Error reading JSONL file:", error);
        res.status(500).json({ error: "Failed to read JSONL data" });
    }
});

// Start the server on port 3005
const PORT = 3005;
console.log('Starting server...');
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
