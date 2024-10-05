import * as fax from "./faxpro.js";

const Announcements = [
    {
        String: {
            Header: "Security Notice",
            Content: "Fax Paged security is currently in supermode. If you can't access your account please send notice to any of the admins.",
            Accept: "Ok, I understand"
        },

        Functions: {
            Accept: () => {},
            Refuse: () => {},
        },

        Visible: true
    }
];

Announcements.forEach(Announcement => {
    if (!fax.Announcements) return;
    fax.MidCont(
        {
            Header: Announcement.String.Header,
            Content: Announcement.String.Content,
            Accept: Announcement.String.Accept,
            Refuse: Announcement.String.Refuse
        },
        Announcement.Functions.Accept,
        Announcement.Functions.Refuse,
        Announcement.Visible
    );
});