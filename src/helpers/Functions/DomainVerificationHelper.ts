import { SharedEmailDomain } from "../../config";
const IsSharedDomain = (emailAddress: String) => {
    if (emailAddress !== '') {
        const domainAddress = emailAddress?.split('@');
        if (domainAddress?.length > 0) {
            return domainAddress[1]?.toLowerCase() === SharedEmailDomain?.toLowerCase()
        }
    }
    return false;
}
export { IsSharedDomain };