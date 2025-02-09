---
path: '/u/admin/users'
---

## Admin: Users
This page is used to manage users in the system.   
You can inspect, edit, verify, and delete users from this page.

### Conflicts
The User page has a built-in conflict detection system.  
If there are any conflicts, a red badge will appear.

Conflicts often need to be investigated before action should be taken.  
Consult with the other admins before taking action.

*Types of conflicts:*
- **Apartment Conflict**: Multiple users are associated with the same apartment.
    - *This is a problem because the system is designed to have one user per apartment.*
    - *Cause:* **User has moved out, and a new user has moved in.**
        - The old user should be deleted.
    - *Cause:* **2 people are living in the same apartment, and both have an account.**
        - The 2 people should share an account.
        - Possibly contact old account to verify.
        - The new user should be deleted.
    - *Cause:* **Someone tries to impersonate another user.**
        - Compare the users, and possibly contact the users to verify.
        - Often the new user should be deleted.
- **Person Conflict**: Multiple users have the same person.
    - *This is a problem because this might be someone trying to impersonate another user.*
    - *Cause:* **Someone tries to impersonate another user.**
        - Compare the users, and possibly contact the users to verify.
        - Often the new user should be deleted.

### User List
The user list is a table that displays all users in the system.

#### Columns
- **ID**: The unique identifier for the user.
- **Apartment**: The apartment the user is associated with.
- **isAdmin**: Whether the user is an admin or not.
- **Verified**: Whether the user has been verified by an admin.
- **Sessions**: The number of sessions the user has had.
- **Logins**: The number of logins the user has.
- **Personer**: The number of persons the user has. Between 1 and 2.
- **Oprettet**: The date the user was created.
- **Opdateret**: The date the user was last updated.

These columns can be sorted by clicking on the column header.

#### Actions
Clicking on a UserId will open the `UserDetails`*Slideout*.  

##### `UserDetails`*Slideout*
This slideout allows you to view and edit the user.
It's here that you can verify the user, and delete the user.

You shouldn't worry about clicking on any buttons, as all buttons will ask for confirmation before performing any action.

#### Deleted Users
Deleted users is hidden, and can only be viewed by an system administator in the database.

#### Giving Admin Rights
Giving admin rights is done by an system administator in the database.

