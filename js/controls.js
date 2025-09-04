// User controls for adjusting country values
class Controls {
    constructor(containerElement) {
        this.container = containerElement;
        this.countryInputs = new Map();
        
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        // Clear existing controls
        this.container.innerHTML = '';
        
        // Get all countries from data store
        const countries = dataStore.getAllCountries();
        
        // Sort countries alphabetically by code
        countries.sort((a, b) => a[0].localeCompare(b[0]));
        
        // Create control for each country
        countries.forEach(([code, value]) => {
            const control = this.createCountryControl(code, value);
            this.container.appendChild(control);
        });
    }

    createCountryControl(countryCode, initialValue) {
        const controlDiv = document.createElement('div');
        controlDiv.className = 'country-control';
        controlDiv.dataset.country = countryCode;
        
        // Create label
        const label = document.createElement('label');
        label.textContent = this.getCountryName(countryCode);
        controlDiv.appendChild(label);
        
        // Create control row
        const controlRow = document.createElement('div');
        controlRow.className = 'control-row';
        
        // Create range input
        const rangeInput = document.createElement('input');
        rangeInput.type = 'range';
        rangeInput.min = '0';
        rangeInput.max = '100';
        rangeInput.value = initialValue;
        rangeInput.dataset.country = countryCode;
        
        // Create value display
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'value-display';
        valueDisplay.textContent = initialValue;
        
        // Add event listener
        rangeInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            valueDisplay.textContent = value;
            
            // Update color preview
            const color = dataStore.getCountryColor(countryCode);
            if (color) {
                rangeInput.style.background = `linear-gradient(90deg, rgba(255,255,255,0.1) 0%, ${color} ${value}%, rgba(255,255,255,0.1) ${value}%)`;
            }
            
            // Update data store
            dataStore.setCountryValue(countryCode, value);
        });
        
        // Set initial color
        const color = dataStore.getCountryColor(countryCode);
        if (color) {
            rangeInput.style.background = `linear-gradient(90deg, rgba(255,255,255,0.1) 0%, ${color} ${initialValue}%, rgba(255,255,255,0.1) ${initialValue}%)`;
        }
        
        controlRow.appendChild(rangeInput);
        controlRow.appendChild(valueDisplay);
        controlDiv.appendChild(controlRow);
        
        // Store reference
        this.countryInputs.set(countryCode, rangeInput);
        
        return controlDiv;
    }

    getCountryName(code) {
        // Country name mapping
        const names = {
            'USA': 'United States',
            'CHN': 'China',
            'IND': 'India',
            'BRA': 'Brazil',
            'RUS': 'Russia',
            'JPN': 'Japan',
            'DEU': 'Germany',
            'GBR': 'United Kingdom',
            'FRA': 'France',
            'ITA': 'Italy',
            'CAN': 'Canada',
            'AUS': 'Australia',
            'MEX': 'Mexico',
            'IDN': 'Indonesia',
            'TUR': 'Turkey',
            'SAU': 'Saudi Arabia',
            'ARG': 'Argentina',
            'EGY': 'Egypt',
            'NGA': 'Nigeria',
            'ZAF': 'South Africa'
        };
        
        return names[code] || code;
    }

    updateValue(countryCode, value) {
        const input = this.countryInputs.get(countryCode);
        if (input) {
            input.value = value;
            const valueDisplay = input.nextElementSibling;
            if (valueDisplay) {
                valueDisplay.textContent = value;
            }
        }
    }
}