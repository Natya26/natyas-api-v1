function parseWriteResponse(response) {
    if (response && response.length > 0) {
        if (response.length == 1)
            response = response[0];
        return response
    }
}

module.exports = {
    parseWriteResponse
}