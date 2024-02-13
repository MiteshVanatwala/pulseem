
    export interface ResponseData {
        status: string;
        message: string;
        statusCode: number;
    }

    export interface error {
        code: number;
        message: string;
    }

    export interface ResponseDataWithDataTable {
        status: string;
        message: string;
        //data: DataTable;
        statusCode: number;
    }

    // For future use - Integromat full error type list
    export enum ErrorType {
        UnknownError = 1,
        RuntimeError,
        DataError,
        InconsistencyError,
        RateLimitError,
        OutOfSpaceError,
        ConnectionError,
        InvalidConfigurationError,
        InvalidAccessTokenError,
        UnexpectedError,
        MaxResultsExceededError,
        MaxFileSizeExceededError,
        IncompleteDataError,
        DuplicateDataError,
        ModuleTimeoutError,
        ScenarioTimeoutError,
        OperationsLimitExceededError,
        DataSizeLimitExceededError,
        ExecutionInterruptedError,
        ValidationError,
        ScenarioValidationError,
        AccountValidationError,
        BundleValidationError
    }
