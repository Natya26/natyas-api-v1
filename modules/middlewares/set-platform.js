//



const setPlatformMiddleware = async (req, res, next) => {
    
    let platform = req.header('PLATFORM');
    if (!platform) {
        platform = 'WEB';
    }
    if (!['WEB', 'APP'].includes(platform)) {
        platform = 'WEB';
    }

    req.platform = platform;

    next();
}

module.exports = setPlatformMiddleware;