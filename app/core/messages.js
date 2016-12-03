module.exports = {


    FLEET_FULL:"Fleet is full",
    RECORD_EXISTS:"Record already exists",
    // User facing messages
    OBTAINING_COUNT_SUCCESSFUL: "Obtaining count successful",
    RECORD_FOR_THIS_ID_DOES_NOT_EXIST: "Record for this ID does not exist",
    FETCHING_RECORDS_SUCCESSFUL: "Fetching records successful",
    FETCHING_RECORD_SUCCESSFUL: "Fetching record successful",
    NO_SUCH_RECORD_EXISTS_IN_THE_DATABASE: "No such record exists in the database",
    CREATING_RECORD_SUCCESSFUL: "Creating record successful",
    UPDATING_RECORD_SUCCESSFUL: "Updating record successful",
    DELETING_RECORD_SUCCESSFUL: "Deleting record successful",
    RECORD_FOR_THIS_ID_EXISTS: "Record for this ID exists",
    INVALID_USERNAME_OR_PASSWORD: "Invalid username or password",
    CANCELLING_OR_DELETING_RECORD_SUCCESSFUL: "Cancelling / deleting record successful",
    FETCHING_STATUS_COUNT_SUCCESSFUL: "Fetching status count successful",
    UPDATING_COMMENTS_RECORD_SUCCESSFUL: "Updating comments record successful",
    RECORD_CREATED_SUCCESSFULLY: "Record created successfully",
    RECORD_UPDATED_SUCCESSFULLY: "Record updated successfully",
    RECORD_DELETED_SUCCESSFULLY: "Record deleted successfully",
    PASSWORD_CANNOT_BE_EMPTY: "Password cannot be empty",
    NO_SUCH_USER_FOUND: "No such user found!",
    PLEASE_ENTER_THE_CORRECT_CURRENT_PASSWORD: "Please enter the correct current password",
    ERROR_UPDATING_PASSWORD: "Error updating password !",
    PASSWORD_UPDATED_SUCCESSFULLY: 'Password updated successfully!',
    SUCCESSFULLY_INITIALIZED_THE_ACL_DATA: "Successfully initialized the ACL data! ",
    VALIDATION_ERRORS_FOUND: "Validation errors found",

    // Error log Messages
    COULD_NOT_SANITISE_THE_ACL_COLLECTION: "Couldn't sanitise the ACL collection! ",
    COULD_NOT_SANITISE_THE_ROLE_COLLECTION: "Couldn't sanitise the Role collection! ",
    COULD_NOT_INITIALIZE_ACL_DATA: "Couldn't initialize ACL data! ",
    COULD_NOT_INITIALIZE_ROLE_DATA: "Couldn't initialize Role data! ",
    COULD_NOT_SANITIZE_THE_USER_COLLECTION: "Could not sanitize the user collection!",
    COULD_NOT_INITIALIZE_THE_USER_COLLECTION: "Could not initialize the user collection!",
    VALUE_AVAILABLE: "Value available",
    COULD_NOT_REMOVE_CONTACT: "Could not remove contact! ",
    SUCCESSFULLY_REMOVED_THE_CONTACT: "Successfully removed the contact",
    COULD_NOT_UPDATE_CONTACT: "Could not update contact! ",
    SUCCESSFULLY_UPDATED_THE_CONTACT: "Successfully updated the contact",
    NOT_ABLE_TO_UPDATE_CONTACT_DETAILS_FOR_A_CUSTOMER: "Not able to update contact details for a customer!",
    NOT_ABLE_TO_UPDATE_CONTACT_DETAILS_FOR_AN_EMPLOYEE: "Not able to update contact details for an employee!",
    COULD_NOT_REMOVE_USER: "Could not remove user! ",
    SUCCESSFULLY_REMOVED_THE_USER: "Successfully removed the user",
    COULD_NOT_UPDATE_USER: "Could not update user! ",

    //Models Messages
    MONGOOSE_UNIQUE_VALIDATOR: "Looks like there is a record for the attribute '{PATH}' in the database for the same value '{VALUE}'. You might want to search for it rather than trying to create a new record with the same value!",

    // System Messages
    LOGIN_SUCCESSFUL: "You have successfully logged in",

    //LocalBridge
    SENDING_PACKET_SUCCESSFUL: "Sending packet successful",

    // Member Messages
    CHECK_IN_SUCCESSFUL: "Check in successful",
    MEMBER_HAS_BEEN_UPDATED: "Member has been updated",
    MEMBER_HAS_BEEN_CREATED: "Member has been created",
    MEMBER_WITH_THE_RFID_HAS_CHECKED_IN: "Member with the smart card %s has checked in",
    MEMBER_BALANCE_UPDATED_SUCCESSFULLY: "Member balance updated successfully",
    ERROR_CHECKING_IN_MEMBER: "Error checking in member",
    MEMBER_WITH_THE_SMART_CARD_HAS_BEEN_CREATED: "Member with the smart card %s has been created",
    MEMBER_WITH_THE_SMART_CARD_HAS_BEEN_UPDATED: "Member with the smart card %s has been updated",

    // Docking Station Messages
    DOCKING_STATION_HAS_BEEN_UPDATED: "Docking station has been updated",
    DOCKING_STATION_HAS_BEEN_CREATED: "Docking station has been created",

    // Docking Unit Messages
    DOCKING_UNIT_HAS_BEEN_UPDATED: "Docking unit has been updated",
    DOCKING_UNIT_HAS_BEEN_CREATED: "Docking unit has been created",

    // Docking Port Messages
    DOCKING_PORT_HAS_BEEN_UPDATED: "Docking port has been updated",
    DOCKING_PORT_HAS_BEEN_CREATED: "Docking port has been created",

    // Bicycle Messages
    BICYCLE_HAS_BEEN_UPDATED: "Bicycle has been updated",
    BICYCLE_HAS_BEEN_CREATED: "Bicycle has been created",

    /**
     * Event Logger Messages
     * **/

    // Checkout Authentication
    CHECKOUT_AUTHENTICATION_SUCCESSFUL: "Checkout authentication successful",

    // Checkout Communication
    CHECKOUT_SUCCESSFUL: "Checkout successful",
    SORRY_IT_LOOKS_LIKE_YOU_TAPPED_ON_AN_OPEN_PORT: "Sorry! It looks like you tapped on an open port",
    CHECKOUT_VERIFICATION_INITIATED: "Checkout verification initiated for FPGA: ",

    // CheckIn Communication
    BICYCLE_WITH_THE_RFID_HAS_BEEN_CHECKED_IN: "Bicycle with the RFID has been checked in",

    // Bicycle Error Messages
    BICYCLE_WITH_THAT_RFID_DOES_NOT_EXIST_OR_IS_NOT_AVAILABLE_CONTACT_ADMIN_IMMEDIATELY: "Bicycle with that RFID does not exist or is not available. Contact admin immediately",

    // Member Error Messages
    MEMBER_WITH_THAT_SMART_CARD_RFID_DOES_NOT_EXIST: "Member with that Smart Card RFID does not exist.",
    IT_LOOKS_LIKE_YOUR_VALIDITY_HAS_EXPIRED_OR_YOU_DONT_HAVE_SUFFICIENT_BALANCE: "It looks like your validity has expired or you don't have sufficient balance",
    YOU_DONT_HAVE_SUFFICIENT_BALANCE: "You don't have sufficient balance",
    YOUR_PREVIOUS_TRANSACTION_IS_NOT_COMPLETE: "Your previous transaction is not complete",
    BALANCE_UPDATION_IN_PROGRESS: "Balance updation in progress",
    BALANCE_UPDATED_SUCCESSFULLY: "Balance updated successfully ",

    // Data Packet Error Messages
    LOCAL_BRIDGE_RECEIVED: "Local Bridge received",
    SENDING_DATA_PACKET: "Sending data packet ",
    SENDING_RESPONSE_DATA_PACKET: "Sending response Data Packet :",
    IT_LOOKS_LIKE_THAT_AN_INVALID_DATA_PACKET_UNIDENTIFIED_STEP_NUMBER_FOUND_IN_THE_PACKET: "It looks like that's an invalid data packet. Unidentified step number found in the packet.",
    THIS_IS_AN_INVALID_DATA_PACKET_FOR_USER_AUTHENTICATION_EXPECTING_42_BYTES: "This is an invalid Data Packet for User Authentication. Expecting 42 bytes.",
    THIS_IS_AN_INVALID_DATA_PACKET_FOR_CHECKOUT_TRANSACTION_EXPECTING_171_BYTES: "This is an invalid Data Packet for Checkout Transaction. Expecting 171 bytes.",
    THIS_IS_AN_INVALID_DATA_PACKET_FOR_CHECKIN_TRANSACTION_EXPECTING_26_BYTES: "This is an invalid Data Packet for CheckIn Transaction. Expecting 26 bytes",
    THIS_IS_AN_INVALID_DATA_PACKET_EXPECTING_18_BYTES: "This is an invalid Data Packet. Expecting 18 bytes.",
    CHECKOUT_VERIFICATION_PACKET_RECEIVED: "Checkout verification packet received ",
    CHECKIN_VERIFICATION_PACKET_RECEIVED:"Checkin verification packet received",
    // Request Messages
    SENDING_REQUEST_TO_SERVER_BRIDGE: "Sending request to server bridge ",

    // Docking Station Messages
    NO_DOCKING_STATION_FOUND_WITH_THE_IP_ADDRESS: "No docking station found with the IP address ",
    DOCKING_STATION_IS_UNDER_MAINTENANCE: "Sorry! docking station %s is under maintenance",

    // Docking Unit Messages
    NO_DOCKING_UNIT_FOUND_WITH_THE_UNIT_NUMBER: "No docking unit found with the unit number ",
    DOCKING_UNIT_IS_UNDER_MAINTENANCE: "Sorry! docking unit %s is under maintenance",

    // Docking Port Messages
    NO_DOCKING_PORT_FOUND_WITH_THE_PORT_NUMBER: "No docking port found with the port number ",
    DOCKING_PORT_IS_UNDER_MAINTENANCE: "Sorry! docking port %s is under maintenance",
    DOCKING_PORT_IS_EMPTY:"Docking port is empty. No Bicycle found"
};

