const {
    HDFC_STORE_NAME,
    HDFC_MERCHANT_VIRTUAL_ADDRESS,
    HDFC_PG_MERCHANT_ID,
    HDFC_MERCHANT_KEY,
    HDFC_MERCHANT_KEY_ID,
    HDFC_MERCHANT_CODE,
    HDFC_BASE_URL,
} = process.env;

module.exports = {
    storeName     : HDFC_STORE_NAME,
    merchantVPA   : HDFC_MERCHANT_VIRTUAL_ADDRESS,
    merchantId    : HDFC_PG_MERCHANT_ID,
    merchantKey   : HDFC_MERCHANT_KEY,
    merchantKeyId : HDFC_MERCHANT_KEY_ID,
    merchantCode  : HDFC_MERCHANT_CODE,
    baseURL       : HDFC_BASE_URL,
};