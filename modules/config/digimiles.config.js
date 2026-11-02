const {
    DIGIMILES_USERNAME,
    DIGIMILES_PASSWORD,
    DIGIMILES_TYPE,
    DIGIMILES_DLR,
    DIGIMILES_SOURCE,
    DIGIMILES_ENTITY_ID,
    DIGIMILES_TEMPLATE_ID,
    DIGIMILES_TM_ID,
} = process.env;

module.exports = {
    userName   : DIGIMILES_USERNAME,
    password   : DIGIMILES_PASSWORD,
    type       : DIGIMILES_TYPE,
    dlr        : DIGIMILES_DLR,
    source     : DIGIMILES_SOURCE,
    entityId   : DIGIMILES_ENTITY_ID,
    templateId : DIGIMILES_TEMPLATE_ID,
    tmid       : DIGIMILES_TM_ID,
};