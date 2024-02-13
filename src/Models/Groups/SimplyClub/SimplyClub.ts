import { LoginDetails } from '../../Login/LoginDetails'

export interface SimplyClubClientRequest extends LoginDetails {
    GroupIds: number[];
}
