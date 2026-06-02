# 🍴 Restaurant Picker Wheel

A beautiful, interactive restaurant picker app with a spinning wheel interface!

## Features

✅ **Spinning Wheel Animation** - Smooth, engaging wheel spin with easing  
✅ **20+ Cuisine Types** - Organized dropdown with Asian, European, American & more  
✅ **Fireworks Celebration** - Animated fireworks when winner is revealed!  
✅ **Animated Welcome Screen** - Beautiful gradient canvas with rotating elements  
✅ **Real Restaurant Data** - Uses free OpenStreetMap Overpass API  
✅ **Custom Location** - Enter any US zip code to search  
✅ **Adjustable Search Radius** - 1-25 miles from your location  
✅ **Delete Restaurants** - Remove options you don't want  
✅ **Beautiful UI** - Purple gradient theme with smooth animations  
✅ **Responsive Design** - Works on desktop and mobile  
✅ **No API Key Required** - Works out of the box!

## How to Use

1. Open `index.html` in your browser
2. **Choose a cuisine type** from the dropdown (20+ options!)
3. **Enter a zip code** (e.g., 78613, 90210, 10001) or leave blank for Cedar Park, TX
4. Adjust the search radius slider (1-25 miles)
5. Click "Find Restaurants" to fetch real restaurants matching your criteria
6. Delete any restaurants you don't want
7. Click "SPIN THE WHEEL!" to randomly select
8. Enjoy the fireworks and your restaurant choice! 🎉🎆

## Cuisine Options (20+ Types!)

### Asian

🥡 Chinese • 🍱 Japanese • 🍜 Thai • 🍛 Korean • 🍲 Vietnamese • 🍛 Indian • 🍜 Ramen • 🍣 Sushi

### European

🍝 Italian • 🥐 French • 🥙 Greek • 🥘 Spanish • 🥙 Turkish

### American

🍔 American • 🌮 Mexican • 🍕 Pizza • 🍔 Burger • 🍖 BBQ • 🥩 Steakhouse

### Other

🥙 Mediterranean • 🦞 Seafood • 🥩 Brazilian • 🍛 Ethiopian • 🥙 Middle Eastern • 🥗 Vegan

**🎲 Surprise Me!** - Shows all cuisines (default)

## How It Works

The app uses **two free APIs**:

- **Nominatim (OSM)** - Converts zip codes to coordinates (geocoding)
- **Overpass API (OSM)** - Fetches real restaurant data near those coordinates by cuisine type

Both are:

- ✅ **Completely free** - No API key required
- ✅ **No credit card** - No payment setup needed
- ✅ **Real data** - Actual restaurants from OpenStreetMap
- ✅ **Works immediately** - Just open and use!

The search fetches restaurants matching your cuisine preference within your selected radius!

### 📍 Zip Code Examples

Try these popular zip codes:

- **78613** - Cedar Park, TX (default)
- **90210** - Beverly Hills, CA
- **10001** - New York City, NY
- **60601** - Chicago, IL
- **33139** - Miami Beach, FL
- **94102** - San Francisco, CA

Leave the zip code field empty to use Cedar Park, TX as the default location.

## Alternative APIs (Optional)

If you want to use a different data source, here are alternatives:

### Google Places API

Requires API key and billing account, but offers excellent data quality:

1. Get a Google Places API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Open `script.js` and replace the Overpass API fetch code with Google Places API calls
3. Add your API key to the request

**Note:** Requires billing setup but has a $200 monthly free credit.

### Yelp Fusion API

```javascript
const apiKey = "YOUR_YELP_API_KEY";
const url = `https://api.yelp.com/v3/businesses/search?latitude=${CEDAR_PARK_LAT}&longitude=${CEDAR_PARK_LNG}&radius=${distance * 1609}&categories=restaurants`;

const response = await fetch(url, {
  headers: {
    Authorization: `Bearer ${apiKey}`,
  },
});

const data = await response.json();
restaurants = data.businesses.map((business) => business.name);
```

## Color Scheme

- **Primary Purple:** #667eea
- **Secondary Purple:** #764ba2
- **Accent Pink:** #f5576c
- **Accent Gradient:** #f093fb → #f5576c

## Technologies Used

- Pure HTML5
- CSS3 (Gradients, Animations, Flexbox)
- Vanilla JavaScript
- Canvas API for wheel drawing
- OpenStreetMap Nominatim API for geocoding (zip → coordinates)
- OpenStreetMap Overpass API for restaurant data

## Browser Compatibility

Works in all modern browsers:

- Chrome/Edge ✅
- Firefox ✅
- Safari ✅
- Mobile browsers ✅

## Future Enhancements

- Save favorite restaurants to localStorage
- Add custom restaurants manually (text input)
- Combine multiple cuisine filters (e.g., Italian + Vegan)
- Share results on social media
- Show restaurant details (address, rating, hours)
- Support for city names and full addresses (not just zip codes)
- Recent searches history

Enjoy finding your next meal! 🍕🍔🌮
