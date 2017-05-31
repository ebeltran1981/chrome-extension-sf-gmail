/*
Copyright AtlanticBT.
*/

namespace AtlanticBTApp {
    export class SforcePhotoModel {
        public picture: string;
        public thumbnail: string;
    }
    export interface ISforceUserModel {
        id: string;
        asserted_user: boolean;
        user_id: string;
        organization_id: string;
        username: string;
        nick_name: string;
        display_name: string;
        email: string;
        email_verified: boolean;
        first_name: string;
        last_name: string;
        photos: SforcePhotoModel;
        active: boolean;
        user_type: string;
    }
    export class SforceUserModel implements ISforceUserModel {
        public id: string;
        public asserted_user: boolean;
        public user_id: string;
        public organization_id: string;
        public username: string;
        public nick_name: string;
        public display_name: string;
        public email: string;
        public email_verified: boolean;
        public first_name: string;
        public last_name: string;
        public photos: SforcePhotoModel;
        public active: boolean;
        public user_type: string;

        constructor(user: ISforceUserModel) {
            this.id = user.id;
            this.asserted_user = user.asserted_user;
            this.user_id = user.user_id;
            this.organization_id = user.organization_id;
            this.username = user.username;
            this.nick_name = user.nick_name;
            this.display_name = user.display_name;
            this.email = user.email;
            this.email_verified = user.email_verified;
            this.first_name = user.first_name;
            this.last_name = user.last_name;
            this.photos = user.photos;
            this.active = user.active;
            this.user_type = user.user_type;
        }

        public get availableName() {
            if (this.first_name) {
                return this.first_name;
            } else if (this.nick_name) {
                return this.nick_name;
            } else {
                return this.email.split("@")[0];
            }
        }
    }

    export class SforceErrorModel {
        public errorCode: string;
        public name: string;
        public message: string;
        public stack: string;
    }
}

export = AtlanticBTApp;
