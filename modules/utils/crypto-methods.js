const crypto = require('crypto');

function generateKeyHash(key) {
    return crypto
  .createHash('sha512')
  .update(key)
  .digest('hex')
  .substring(0, 32)
}

function generateIVHash(iv) {
    return crypto
      .createHash('sha512')
      .update(iv)
      .digest('hex')
      .substring(0, 16)
}

function encrypt(key, iv, data, algorithm) {
    key = generateKeyHash(key);
    iv = generateIVHash(iv);
    console.log({type: 'encrypt', key, iv, data, algorithm});
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    return Buffer.from(
        cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
    ).toString('base64');
}

function decrypt(key, iv, data, algorithm) {
    key = generateKeyHash(key);
    iv = generateIVHash(iv);
    console.log({type: 'decrypt', key, iv, data, algorithm});
    const buff = Buffer.from(data, 'base64');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    return (
        decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
        decipher.final('utf8')
    );
}

module.exports = {
    encrypt,
    decrypt,
};