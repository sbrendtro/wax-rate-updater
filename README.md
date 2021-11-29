# WAX Drop Rate Updater
Simple rate updater script that checks for current price oracle, calculates the price (in WAX)
based on a target price in USD, then updates the contract with that fee.

Author: Steven Brendtro
https://github.com/sbrendtro/

License: GPLv3

## Installation
```
git clone https://github.com/sbrendtro/wax-rate-updater.git
cd wax-rate-updater
npm install
```

## Configuration
Edit the `.env` file with the appropriate information.
```
cp .env-dist .env
```

## Usage
```
node index.js
```

Run this as often as you want the rate updated.
