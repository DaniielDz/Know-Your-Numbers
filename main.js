// Get relevant elements
const d8Input = document.querySelector('#d8');
const d9Input = document.querySelector('#d9');
const d10Input = document.querySelector('#d10');
const d11Input = document.querySelector('#d11');
const d7Input = document.querySelector('#d7');
const resultCD = document.querySelectorAll('.resultCD');

// Function to perform operations and update the content of .resultCD
function updateResultCD() {
  const sumResult = parseInt(d8Input.value) + parseInt(d9Input.value) + parseInt(d10Input.value) + parseInt(d11Input.value);
  const subtractionResult = parseInt(d7Input.value) - sumResult;

  resultCD[0].textContent = sumResult; // Show only the sum result
  resultCD[1].textContent = subtractionResult; // Show only the subtraction result
}

// Add events to listen for changes in relevant inputs
[d8Input, d9Input, d10Input, d11Input, d7Input].forEach(input => {
  input.addEventListener('input', function () {
    updateResultCD();
    updateResults(targetCurrency); // Also update general results when these inputs change
  });
});

// Call updateResultCD() after the page is loaded
document.addEventListener('DOMContentLoaded', function () {
  updateResultCD();
  updateResults(targetCurrency);
});

let targetCurrency = "ZAR"; // Declare a global variable to store the selected value
// Function to get values of the DAYS columns
function getColumnValues(ids) {
  return ids.reduce((values, id) => {
    values[id] = document.querySelector(id).value;
    return values;
  }, {});
}

// Function to calculate the LOCAL FIAT column
function calculateLocalFiat(f6, ...daysValues) {
  const f7 = f6 * 13;
  const f14 = f7 / daysValues[0];
  const f8 = f14 * daysValues[1];
  const f9 = f14 * daysValues[2];
  const f10 = f14 * daysValues[3];
  const f11 = f14 * daysValues[4];
  const f12 = f8 + f9 + f10 + f11;
  const f13 = f7 - f12;
  const f15 = f14 / daysValues[5];
  const f16 = f14 / daysValues[6];
  const f17 = f14 / daysValues[7];

  return {
    f7: Math.round(f7),
    f8: Math.round(f8),
    f9: Math.round(f9),
    f10: Math.round(f10),
    f11: Math.round(f11),
    f12: Math.round(f12),
    f13: Math.round(f13),
    f14: Math.round(f14),
    f15: Math.round(f15),
    f16: Math.round(f16),
    f17: Math.round(f17),
  };
}

// Function to calculate USD and update results
function calculateAndDisplayUSD(apiResponse, f6, fiatValues, daysValues, f22) {
  const resultUSD = document.querySelectorAll('.resultUSD');

  const values = [f6, ...Object.values(fiatValues).slice(0, 5)];
  values.forEach((value, index) => {
    resultUSD[index].textContent = Math.round(value / apiResponse);
  });

  const accumulatedResult = values.slice(2).reduce((sum, value) => sum + Math.round(value / apiResponse), 0);

  resultUSD[6].textContent = accumulatedResult;
  resultUSD[7].textContent = accumulatedResult * 2;
  resultUSD[8].textContent = Math.round(fiatValues['f14'] / apiResponse);
  resultUSD[9].textContent = Math.round((fiatValues['f14'] / apiResponse) / daysValues['#d15']);
  resultUSD[10].textContent = Math.round((fiatValues['f14'] / apiResponse) / daysValues['#d16']);
  resultUSD[11].textContent = Math.round((fiatValues['f14'] / apiResponse) / daysValues['#d17']);
  
  resultUSD[12].textContent = (f22 / apiResponse).toFixed(2);

  return [...resultUSD].map(element => element.textContent);
}

// Function to calculate SATS and update results
function calculateAndDisplaySATS(dollarValue, usdColumn) {
  fetch('https://api.exchangeratesapi.io/v1/latest?access_key=50936a750386a58928366d95cd197694&base=BTC&symbol&format=1')
    .then(response => response.json())
    .then(data => {
      let btcValue = data.rates['USD'];
      const SATS = (dollarValue / btcValue) * 100000000;

      let resultArray = usdColumn.map(value => Math.round((value / btcValue) * 100000000));

      const resultSATS = document.querySelectorAll('.resultSATS');
      resultSATS.forEach((element, index) => {
        if (index < resultArray.length) {
          element.textContent = resultArray[index].toString();
        }
      });
    });
}

// Get values of the DAYS columns
const daysIds = ['#d7', '#d8', '#d9', '#d10', '#d11', '#d15', '#d16', '#d17'];

// Get value of the LOCAL FIAT column and f22
let f6 = parseInt(document.querySelector('#f6').value);
let f22 = parseInt(document.querySelector('#f22').value);

// Add events to update f6 and f22 when inputs change
document.querySelector('#f6').addEventListener('input', function () {
  f6 = parseInt(this.value);
  updateResults(targetCurrency);
});

document.querySelector('#f22').addEventListener('input', function () {
  f22 = parseInt(this.value);
  updateResults(targetCurrency);
});

// Add events to update values of the DAYS columns
const daysValues = getColumnValues(daysIds);
daysIds.forEach(id => {
  document.querySelector(id).addEventListener('input', function () {
    daysValues[id] = this.value;
    updateResults(targetCurrency);
  });
});

// Calculate the LOCAL FIAT column
const localFiatValues = calculateLocalFiat(f6, ...Object.values(daysValues));

// Update elements with LOCAL FIAT results
const result = document.querySelectorAll('.result');
Object.values(localFiatValues).forEach((value, index) => {
  result[index].textContent = value;
});

// Update elements with USD and SATS results
fetch('https://api.exchangeratesapi.io/v1/latest?access_key=50936a750386a58928366d95cd197694&base=USD&symbols&format=1')
  .then(response => response.json())
  .then(data => {
    let targetCurrency = "ZAR";
    let currentCurrencyValue = data.rates[targetCurrency];
    let dollarValue = f6 / currentCurrencyValue;

    const usdColumn = calculateAndDisplayUSD(currentCurrencyValue, f6, localFiatValues, daysValues, f22);
    calculateAndDisplaySATS(dollarValue, usdColumn);
  });

function updateFiat(value) {
    targetCurrency = value;
    updateResults(targetCurrency)
}
// Function to update results when inputs change
function updateResults(currencyValue) {
  const localFiatValues = calculateLocalFiat(f6, ...Object.values(daysValues));

  const result = document.querySelectorAll('.result');
  Object.values(localFiatValues).forEach((value, index) => {
    result[index].textContent = value;
  });

  fetch('https://api.exchangeratesapi.io/v1/latest?access_key=50936a750386a58928366d95cd197694&base=USD&symbols&format=1')
    .then(response => response.json())
    .then(data => {
      let currentCurrencyValue = data.rates[currencyValue];
      let dollarValue = f6 / currentCurrencyValue;

      const usdColumn = calculateAndDisplayUSD(currentCurrencyValue, f6, localFiatValues, daysValues, f22);
      calculateAndDisplaySATS(dollarValue, usdColumn);
    });
}
