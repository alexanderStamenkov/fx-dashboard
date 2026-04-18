# FX Dashboard

A responsive currency exchange dashboard built with vanilla JavaScript.

## Features

- 💱 Live exchange rates powered by [ExchangeRate-API](https://exchangerate-api.com)
- 🔄 Currency converter with swap functionality
- 📈 Historical rate chart (7, 30, 90 days) powered by [currency-api](https://github.com/fawazahmed0/exchange-api)
- ⭐ Favourite currency pairs with localStorage persistence
- 🌙 Dark / light theme with localStorage persistence
- 📱 Fully responsive design

## Tech Stack

- Vanilla JavaScript (ES6+)
- Chart.js
- CSS Variables & Grid
- LocalStorage API
- Fetch API / async-await

## Setup

1. Clone the repo

```bash
   git clone https://github.com/alexanderStamenkov/fx-dashboard.git
```

2. Get a free API key from [exchangerate-api.com](https://exchangerate-api.com)

3. Create a `config.js` file in the root folder:

```js
const API_KEY = "your_api_key_here";
```

4. Open `index.html` with [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) or any local server

## Project Structure

```
fx-dashboard/
├── index.html
├── style.css
├── script.js
├── config.js        # not tracked by git
├── .gitignore
└── README.md
```

## License

MIT
