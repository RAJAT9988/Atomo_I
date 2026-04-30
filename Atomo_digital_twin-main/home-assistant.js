const WebSocket = require('ws');

class HomeAssistant {
    constructor() {
        this.socket = null;
        this.entities = new Map();
        this.url = 'ws://192.168.1.2:8123/api/websocket';
        this.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhYmExODJmZjhjNmM0YmI4YmNmN2VjYTliMzdhYjNlZiIsImlhdCI6MTc2MzUzMDY5NiwiZXhwIjoyMDc4ODkwNjk2fQ.UivcnQsYSkYqJMFPe5QG0xPp6JR8UgXWm7aYkDSPTsM';
        this.isConnected = false;
    }

    connect() {
        this.socket = new WebSocket(this.url);

        this.socket.on('open', () => {
            console.log('Home Assistant WebSocket connected, authenticating...');
            this.socket.send(JSON.stringify({ type: 'auth', access_token: this.token }));
        });

        this.socket.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handleMessage(message);
            } catch (error) {
                console.error('Error parsing Home Assistant message:', error);
            }
        });

        this.socket.on('close', () => {
            console.log('Home Assistant WebSocket disconnected');
            this.isConnected = false;
            // Attempt reconnect after 5 seconds
            setTimeout(() => this.connect(), 5000);
        });

        this.socket.on('error', (error) => {
            console.error('Home Assistant WebSocket error:', error);
        });
    }

    handleMessage(message) {
        if (message.type === 'auth_ok') {
            console.log('Home Assistant authenticated successfully');
            this.isConnected = true;

            // Get initial states
            this.socket.send(JSON.stringify({ id: 1, type: 'get_states' }));

            // Subscribe to state changes
            this.socket.send(JSON.stringify({
                id: 2,
                type: 'subscribe_events',
                event_type: 'state_changed'
            }));
            console.log('Subscribed to Home Assistant state changes');
        }
        else if (message.type === 'result' && message.id === 1) {
            // Initial states received
            message.result.forEach(entity => {
                this.entities.set(entity.entity_id, entity);
            });
            console.log(`Loaded ${this.entities.size} entities from Home Assistant`);

            // Initial sync: trigger update for all entities to sync with office data
            this.entities.forEach((entity, entityId) => {
                if (this.onEntityUpdate) {
                    this.onEntityUpdate(entityId, entity);
                }
            });
        }
        else if (message.event && message.event.event_type === 'state_changed') {
            // Entity state changed
            const entityId = message.event.data.entity_id;
            const newState = message.event.data.new_state;

            this.entities.set(entityId, newState);
            console.log(`Home Assistant entity updated: ${entityId} -> ${newState.state}`);

            // Emit event for your main app
            if (typeof this.onEntityUpdate === 'function') {
                this.onEntityUpdate(entityId, newState);
            }
        }
    }

    // Method to control entities
    callService(domain, service, entityId, serviceData = {}) {
        if (!this.isConnected) {
            console.error('Home Assistant not connected');
            return false;
        }

        const message = {
            id: new Date().getTime(),
            type: 'call_service',
            domain: domain,
            service: service,
            service_data: {
                entity_id: entityId,
                ...serviceData
            }
        };

        this.socket.send(JSON.stringify(message));
        console.log(`Home Assistant service call: ${domain}.${service} on ${entityId}`);
        return true;
    }

    // Toggle light/switch on/off
    toggleLight(entityId) {
    // Toggle light on/off
        if (!entity) {
            console.error(`Entity ${entityId} not found`);
            return false;
        }

        const domain = entityId.startsWith('switch.') ? 'switch' : 'light';
        const newState = entity.state === 'on' ? 'off' : 'on';
        return this.callService(domain, `turn_${newState}`, entityId);
    }
    toggleLight(entityId) {
        const entity = this.entities.get(entityId);
        if (!entity) {
            console.error(`Entity ${entityId} not found`);
            return false;
        }

        const newState = entity.state === 'on' ? 'off' : 'on';
        return this.callService('light', `turn_${newState}`, entityId);
    }

    // Set light brightness
    setLightBrightness(entityId, brightness) {
        return this.callService('light', 'turn_on', entityId, { brightness: brightness });
    }

    // Get entity by friendly name
    getEntityByFriendlyName(friendlyName) {
        for (let [entityId, entity] of this.entities) {
            if (entity.attributes.friendly_name === friendlyName) {
                return { entityId, entity };
            }
        }
        return null;
    }

    // Get all lights
    getLights() {
        const lights = [];
        for (let [entityId, entity] of this.entities) {
            if (entityId.startsWith('light.')) {
                lights.push({ entityId, ...entity });
            }
        }
        return lights;
    }
}

module.exports = HomeAssistant;
