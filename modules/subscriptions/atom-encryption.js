'use strict';

const NDPSConfig = require('../config/nttdata.config');
const crypto = require('crypto');

class AtomEncryption {

    #pswdIterations = 65536;

    #digest = "sha512";

    #keylen = 32;

    #ivBytes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

    #algorithm = "aes-256-cbc";

    #encryptedTextEncoding = "hex";

    #defaultTextEncoding = "utf8";

    #reqPass;

    #reqSalt;

    #resPass;

    #resSalt;

    #getIVBuffer = () => Buffer.from(this.#ivBytes, this.#defaultTextEncoding);

    #generateReqCred() {
        const key = NDPSConfig.encryptReqKey;
        const salt = NDPSConfig.encryptReqIV;
        this.#reqPass = Buffer.from(key, this.#defaultTextEncoding);
        this.#reqSalt = Buffer.from(salt, this.#defaultTextEncoding);
    }

    #generateResCred() {
        const key = NDPSConfig.encryptResKey;
        const salt = NDPSConfig.encryptResIV;
        this.#resPass = Buffer.from(key, this.#defaultTextEncoding);
        this.#resSalt = Buffer.from(salt, this.#defaultTextEncoding);
    }

    /**
     * 
     * @param {string} text 
     * @returns {string} encryptedText
     */
    encrypt(text) {
        this.#generateReqCred();
        const derivedKey = crypto.pbkdf2Sync(
            this.#reqPass,
            this.#reqSalt,
            this.#pswdIterations,
            this.#keylen,
            this.#digest
            );
        const cipher = crypto.createCipheriv(this.#algorithm, derivedKey, this.#getIVBuffer());
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return `${encrypted.toString('hex')}`;
    }

    decrypt(text) {
        this.#generateResCred();
        const encryptedText = Buffer.from(text, this.#encryptedTextEncoding);
        var derivedKey = crypto.pbkdf2Sync(
            this.#resPass,
            this.#resSalt,
            this.#pswdIterations,
            this.#keylen,
            this.#digest
            );
        const decipher = crypto.createDecipheriv(this.#algorithm, derivedKey, this.#getIVBuffer());
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
}

module.exports = AtomEncryption;