require('dotenv').config();

const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch-commonjs');                                    // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require('util');                   // node only; native TextEncoder/Decoder
const { Asset } = require('@greymass/eosio');

const rpc = new JsonRpc('http://wax.cryptolions.io', { fetch });

const defaultPrivateKey = process.env.ACCOUNT_PRIVATE_KEY;
const signatureProvider = new JsSignatureProvider([defaultPrivateKey]);

const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

const getPriceOracle = async () => {
    let request = {
        json: true,                       // Get the response as json
        code: 'delphioracle',             // Contract that we target
        scope: 'waxpusd',                 // Account that owns the data
        table: 'datapoints',              // Table name
        limit: 10,                     // Maximum number of rows that we want to get PER REQUEST PAGE
        reverse: false,                   // Optional: Get reversed data
        show_payer: false                 // Optional: Show ram payer
    };

    let res = await rpc.get_table_rows(request);

    return res.rows[0].median;
}

const calcDropFee = async () => {
    let basePriceUSD = process.env.USD_PRICE;
    let usdPerWax = await getPriceOracle(); // Oracle quote is X 10^4

    // Assets have value and symbol
    const asset = Asset.from('0.00000000 WAX');
    asset.value = basePriceUSD * Math.pow(10,4) / usdPerWax;

    return asset.toString();
}


const update = async () => {

    const code = process.env.CONTRACT_CODE

    const fee = await calcDropFee();

    console.log('fee is...');
    console.log(fee);


    const txn = {
        actions: [
            {
                account: code,
                name: 'setfee',
                authorization: [
                    {
                        actor: process.env.ACCOUNT_NAME,
                        permission: process.env.ACCOUNT_AUTH,
                    }
                ],
                data: {
                    drop_id: process.env.DROP_ID,
                    fee: fee,
                },
            },
        ]
    };

    let result;

    console.log(txn.actions[0].data);

    try {
        result = await api.transact(txn,
            {
                blocksBehind: 3,
                expireSeconds: 30
            }
        );
    } catch (e) {
        console.log(e);
        // If you want display the message to the user, remove the 'assertion failure' part of the error message:
        // message.textContent = e.message.replace('assertion failure with message:','');
        // Then display the message where you like
    }
};


(async () => {
    console.log('Oracle says price is: ');
    console.log(await getPriceOracle());
    console.log('Drop fee calculated as: ');
    console.log(await calcDropFee());

    console.log('Updating fee on drop contract...');
    await update();
})();
