export const ACTION_TYPES = {
    ADD_CLIENTS_TO_GROUP: "ADD_CLIENTS_TO_GROUP",
    REMOVE_CLIENTS_FROM_GROUP: "REMOVE_CLIENTS_FROM_GROUP"
}

export const EventRequestModel = {
    PageView: {
        eventName: "PageView"
    }
};
export class SiteTrackingModel {
    constructor(eventName, domain, actionType, metadata) {
        this.eventName = eventName || EventRequestModel.PageView.eventName;
        this.domain = domain || '';
        this.actionType = actionType || ACTION_TYPES.ADD_CLIENTS_TO_GROUP;
        this.metadata = {
            OperatorKey: metadata && metadata.OperatorKey || '',
            OperatorValue: metadata && metadata.OperatorValue || '',
            GroupIds: metadata && metadata.GroupIds || []
        };
    }
};

export class ScriptModel {
    constructor(source) {
        this.source = source
    }
}


