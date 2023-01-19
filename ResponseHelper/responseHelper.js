// This file is Helper to generate and return response

// Function to generate and return response
function baseResponse(isSuccess, respData, errorCode, errorMessage, res) {
    let status = ''
    if (isSuccess) {
        status = 'true'
    } else {
        status = 'false'
    }
    const response = {
        response: {
            status: status,
            data: {
                value: respData
            },
            error: {
                errorCode: errorCode,
                errorMessage: errorMessage
            }
        }
    }

    if (isSuccess) {
        res.status(200).send(response);
    } else {
        res.status(errorCode).send(response);
    }
}

// Export
module.exports.baseResponse = baseResponse