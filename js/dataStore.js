// Data store with observer pattern for reactive updates
class DataStore {
    constructor() {
        this.countryData = new Map();
        this.observers = [];
        this.colorScale = null;
        this.initializeColorScale();
    }

    initializeColorScale() {
        // Create color scale from light to dark orange
        this.colorScale = d3.scaleSequential()
            .domain([0, 100])
            .interpolator(t => {
                // Interpolate from light orange to dark orange
                const lightOrange = d3.rgb(255, 224, 178);
                const darkOrange = d3.rgb(204, 85, 0);
                const color = d3.interpolateRgb(lightOrange, darkOrange)(t);
                return color;
            });
    }

    setCountryValue(countryCode, value) {
        const oldValue = this.countryData.get(countryCode);
        if (oldValue !== value) {
            this.countryData.set(countryCode, value);
            this.notifyObservers(countryCode, value);
        }
    }

    getCountryValue(countryCode) {
        return this.countryData.get(countryCode) || 0;
    }

    getCountryColor(countryCode) {
        const value = this.getCountryValue(countryCode);
        if (value === 0) return null;
        return this.colorScale(value);
    }

    getAllCountries() {
        return Array.from(this.countryData.entries());
    }

    subscribe(callback) {
        this.observers.push(callback);
    }

    notifyObservers(countryCode, value) {
        this.observers.forEach(callback => callback(countryCode, value));
    }

    // Initialize with some sample data
    initializeSampleData() {
        const sampleData = {
            'USA': 75,
            'CHN': 90,
            'IND': 60,
            'BRA': 45,
            'RUS': 55,
            'JPN': 80,
            'DEU': 70,
            'GBR': 65,
            'FRA': 62,
            'ITA': 58,
            'CAN': 72,
            'AUS': 68,
            'MEX': 40,
            'IDN': 35,
            'TUR': 42,
            'SAU': 48,
            'ARG': 38,
            'EGY': 30,
            'NGA': 25,
            'ZAF': 33
        };

        Object.entries(sampleData).forEach(([code, value]) => {
            this.countryData.set(code, value);
        });
    }
}

// Create global data store instance
const dataStore = new DataStore();