export const ACTION_TYPES = {
    ADD_CLIENTS_TO_GROUP: "ADD_CLIENTS_TO_GROUP",
    REMOVE_CLIENTS_FROM_GROUP: "REMOVE_CLIENTS_FROM_GROUP"
}

export const EventRequestModel = {
    PageView: {
        eventName: "PAGE_VIEW"
    }
};
// export class SiteTrackingModel {
//     constructor(id, eventName, domain, actionType, metadata) {
//         this.id = id || '';
//         this.eventName = eventName || EventRequestModel.PageView.eventName;
//         this.domain = domain || '';
//         this.actionType = actionType || ACTION_TYPES.ADD_CLIENTS_TO_GROUP;
//         this.metadata = [{
//             operatorKey: (metadata && metadata.operatorKey) || 'CONTAINS',
//             operatorValue: (metadata && metadata.operatorValue) || '',
//             groupIds: (metadata && metadata.groupIds) || []
//         }];
//     }
// };

export class ScriptModel {
    constructor(source) {
        this.source = source
    }
}