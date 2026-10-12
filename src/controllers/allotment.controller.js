import { errorResponseBody, successResponseBody } from "../utils/responseBody.js";
import { createAllotmentService } from "../services/allotment.service.js";
import { status_code } from "../utils/constants.js";

export const createAllotment = async (req, res) => {
    try {
        const response = await createAllotmentService(req.body);

        successResponseBody.message = 'Allotment is done to the member';
        successResponseBody.data = response;
        return res.status(status_code.CREATED).json(successResponseBody);

    } catch (error) {
        if (error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }

        errorResponseBody.err = error;
        return res.status(status_code.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}