export const ACTION_TYPES = {
    ADD_CLIENTS_TO_GROUP: "ADD_CLIENTS_TO_GROUP",
    REMOVE_CLIENTS_FROM_GROUP: "REMOVE_CLIENTS_FROM_GROUP"
}

export const EventRequestModel = {
    PageView: {
        eventName: "PAGE_VIEW"
    }
};
export class SiteTrackingModel {
    constructor(eventName, domain, actionType, metadata) {
        this.eventName = eventName || EventRequestModel.PageView.eventName;
        this.domain = domain || '';
        this.actionType = actionType || ACTION_TYPES.ADD_CLIENTS_TO_GROUP;
        this.metadata = {
            operatorKey: (metadata && metadata.OperatorKey) || 'CONTAINS',
            operatorValue: (metadata && metadata.OperatorValue) || '',
            groupIds: (metadata && metadata.GroupIds) || []
        };
    }
};

export class ScriptModel {
    constructor(source) {
        this.source = source
    }
}


