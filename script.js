const themeToggle = document.querySelector("#themeToggle");
const themeIcon = document.querySelector(".theme-icon");
const ratesGrid = document.querySelector("#ratesGrid");
const converterAmount = document.querySelector("#converterAmount");
const converterFrom = document.querySelector("#converterFrom");
const converterTo = document.querySelector("#converterTo");
const converterResult = document.querySelector("#converterResult");
const swapBtn = document.querySelector("#swapBtn");
const chartFrom = document.querySelector("#chartFrom");
const chartTo = document.querySelector("#chartTo");
const periodBtns = document.querySelectorAll(".period-btn");
const favouritesList = document.querySelector("#favouritesList");
const baseSelect = document.querySelector("#baseSelect");

let currentRates = {};
let chartInstance = null;

themeToggle.addEventListener("click", function () {
  const current = document.documentElement.getAttribute("data-theme");
  const newTheme = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  themeIcon.textContent = newTheme === "dark" ? "☀" : "☾";
  localStorage.setItem("theme", newTheme);
});

const getTheme = localStorage.getItem("theme");

if (getTheme) {
  document.documentElement.setAttribute("data-theme", getTheme);
  themeIcon.textContent = getTheme === "dark" ? "☀" : "☾";
}

const renderRates = function (rates) {
  const favourites = JSON.parse(localStorage.getItem("favourites")) || [];
  const CURRENCIES = ["EUR", "GBP", "BGN", "USD", "CHF", "CAD"];
  let html = "";
  CURRENCIES.forEach((currency) => {
    const isFavourite = favourites.includes(currency);
    const value = rates[currency];
    html += `
        <div class="rate-card ${isFavourite ? "favourite" : ""}" data-currency="${currency}">
            <div class="rate-currency">
                ${currency}<span class="rate-star">★</span>
            </div>
            <div class="rate-value">${value}</div>
        </div>
        `;
  });

  ratesGrid.innerHTML = html;
};

ratesGrid.addEventListener("click", function (e) {
  if (e.target.classList.contains("rate-star")) {
    const card = e.target.closest(".rate-card");
    const currency = card.getAttribute("data-currency");
    let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
    if (favourites.includes(currency)) {
      favourites = favourites.filter((f) => f !== currency);
    } else {
      favourites.push(currency);
    }
    localStorage.setItem("favourites", JSON.stringify(favourites));
    card.classList.toggle("favourite", favourites.includes(currency));
    renderFavourites();
  }
});

const convertCurrency = function () {
  const amount = Number(converterAmount.value);
  const from = converterFrom.value;
  const to = converterTo.value;

  const result = amount * (currentRates[to] / currentRates[from]);

  converterResult.textContent = result.toFixed(4);
};

converterAmount.addEventListener("input", convertCurrency);
converterFrom.addEventListener("input", convertCurrency);
converterTo.addEventListener("input", convertCurrency);

swapBtn.addEventListener("click", function () {
  const temp = converterFrom.value;
  converterFrom.value = converterTo.value;
  converterTo.value = temp;
  convertCurrency();
});

chartFrom.addEventListener("input", function () {
  fetchChart(chartFrom.value, chartTo.value, 30);
});
chartTo.addEventListener("input", function () {
  fetchChart(chartFrom.value, chartTo.value, 30);
});

periodBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    periodBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const days = Number(btn.getAttribute("data-days"));
    fetchChart(chartFrom.value, chartTo.value, days);
  });
});

baseSelect.addEventListener("input", function () {
  fetchData(baseSelect.value);
});

const renderFavourites = function () {
  const favourites = JSON.parse(localStorage.getItem("favourites")) || [];
  let html = "";

  if (favourites.length === 0) {
    favouritesList.innerHTML = "";
    return;
  }

  favourites.forEach((currency) => {
    const rate = currentRates[currency]?.toFixed(4) ?? "—";

    html += `
        <div class="fav-row">
            <span class="fav-pair">${baseSelect.value} → ${currency}</span>
            <span class="fav-rate">${rate}</span>
            <button class="fav-remove" data-currency="${currency}">✕</button>
        </div>
        `;
  });

  favouritesList.innerHTML = html;
};

favouritesList.addEventListener("click", function (e) {
  if (e.target.classList.contains("fav-remove")) {
    const currency = e.target.getAttribute("data-currency");
    let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
    favourites = favourites.filter((f) => f !== currency);
    localStorage.setItem("favourites", JSON.stringify(favourites));
    renderFavourites();
    renderRates(currentRates);
  }
});

const renderChart = function (labels, values) {
  if (chartInstance) chartInstance.destroy();
  const ctx = document.querySelector("#rateChart").getContext("2d");
  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          data: values,
          borderColor: "#00d4aa",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          fill: true,
          backgroundColor: "rgba(0, 212, 170, 0.05)",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#7c7ca0" } },
        y: {
          grid: { color: "rgba(255,255,255,0.05)" },
          ticks: { color: "#7c7ca0" },
        },
      },
    },
  });
};

const fetchChart = async function (from, to, days) {
  try {
    const dates = [];
    for (let i = days; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }

    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();

    const promises = dates.map((date) =>
      fetch(
        `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/${fromLower}.json`,
      )
        .then((res) => res.json())
        .then((data) => data[fromLower][toLower]),
    );

    const values = await Promise.all(promises);
    const labels = dates;
    renderChart(labels, values);
  } catch (err) {
    console.error(err);
  }
};

const fetchData = async function (base = "USD") {
  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${base}`,
    );
    const data = await res.json();
    renderRates(data.conversion_rates);
    currentRates = data.conversion_rates;
    convertCurrency();
    renderFavourites();
  } catch (err) {
    console.error(err);
  }
};

fetchData();
fetchChart("USD", "EUR", 30);
