/*
Copyright AtlanticBT.
*/

namespace AtlanticBTApp {
    export class ChromeStorageModel {
        public Key: string;
        public Value: any;
    }
    export class SforcePhotoModel {
        public picture: string;
        public thumbnail: string;
    }
    export class SforceUserModel {
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
    }

    export class SforceErrorModel {
        public errorCode: string;
        public name: string;
        public message: string;
        public stack: string;
    }
}

export = AtlanticBTApp;

const demoUserObject = {
    id: "https://login.salesforce.com/id/00D46000000oa0LEAQ/00546000000ZIS8AAO",
    asserted_user: true,
    user_id: "00546000000ZIS8AAO",
    organization_id: "00D46000000oa0LEAQ",
    username: "edwin.beltran@atlanticbt.com",
    nick_name: "edwin.beltran",
    display_name: "Edwin Beltran",
    email: "edwin.beltran@atlanticbt.com",
    email_verified: true,
    first_name: "Edwin",
    last_name: "Beltran",
    timezone: "America/New_York",
    photos: {
        picture: "https://c.na40.content.force.com/profilephoto/005/F",
        thumbnail: "https://c.na40.content.force.com/profilephoto/005/T"
    },
    addr_street: "4509 Creedmoor Rd\r\n3rd Floor",
    addr_city: "Raleigh",
    addr_state: "North Carolina",
    addr_country: "United States",
    addr_zip: "27612",
    mobile_phone: "+1 9198679733",
    mobile_phone_verified: true,
    status: {
        created_date: null,
        body: null
    },
    urls: {
        enterprise: "https://na40.salesforce.com/services/Soap/c/{version}/00D46000000oa0L",
        metadata: "https://na40.salesforce.com/services/Soap/m/{version}/00D46000000oa0L",
        partner: "https://na40.salesforce.com/services/Soap/u/{version}/00D46000000oa0L",
        rest: "https://na40.salesforce.com/services/data/v{version}/",
        sobjects: "https://na40.salesforce.com/services/data/v{version}/sobjects/",
        search: "https://na40.salesforce.com/services/data/v{version}/search/",
        query: "https://na40.salesforce.com/services/data/v{version}/query/",
        recent: "https://na40.salesforce.com/services/data/v{version}/recent/",
        profile: "https://na40.salesforce.com/00546000000ZIS8AAO",
        feeds: "https://na40.salesforce.com/services/data/v{version}/chatter/feeds",
        groups: "https://na40.salesforce.com/services/data/v{version}/chatter/groups",
        users: "https://na40.salesforce.com/services/data/v{version}/chatter/users",
        feed_items: "https://na40.salesforce.com/services/data/v{version}/chatter/feed-items",
        feed_elements: "https://na40.salesforce.com/services/data/v{version}/chatter/feed-elements"
    },
    active: true,
    user_type: "STANDARD",
    language: "en_US",
    locale: "en_US",
    utcOffset: -18000000,
    last_modified_date: "2017-03-15T13:51:52.000+0000",
    is_app_installed: true
};
