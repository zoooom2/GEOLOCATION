const CC = require('currency-converter-lt');

let currencyConverter = new CC();

const ratesCacheOptions = {
  isRatesCaching: true,
  ratesCacheDuration: 3600,
};

currencyConverter = currencyConverter.setupRatesCache(ratesCacheOptions);

const convert = async (from, to, amount) =>
  await currencyConverter.from(from).to(to).amount(amount).convert();

module.exports = convert;
