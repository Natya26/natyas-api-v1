const {
    AIRPAY_MERCHANT_ID,
    AIRPAY_USERNAME,
    AIRPAY_PASSWORD,
    AIRPAY_SECRET,
} = process.env;
module.exports = {
    mid:      AIRPAY_MERCHANT_ID,
    userName: AIRPAY_USERNAME,
    password: AIRPAY_PASSWORD,
    secret:   AIRPAY_SECRET,
};