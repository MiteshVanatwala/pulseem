export const ACTION_TYPES = {
    ADD_CLIENTS_TO_GROUP: "ADD_CLIENTS_TO_GROUP",
    REMOVE_CLIENTS_FROM_GROUP: "REMOVE_CLIENTS_FROM_GROUP"
}

export class SiteTrackingModel {
    constructor(eventName, pageURL, actionType, metadata) {
        this.eventName = eventName || "PageView";
        this.pageURL = pageURL || '';
        this.actionType = actionType || ACTION_TYPES.ADD_CLIENTS_TO_GROUP;
        this.metadata = {
            OperatorKey: metadata && metadata.OperatorKey || '',
            OperatorValue: metadata && metadata.OperatorValue || '',
            GroupIds: metadata && metadata.GroupIds || []
        };
    }
};

export const EventRequestModel = {
    PageView: {
        eventName: "PageView"
    }
};
