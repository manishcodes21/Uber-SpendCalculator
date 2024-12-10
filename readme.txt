File Structure:
1. background.js
    Handles background logic for fetching trip data from Uber's GraphQL API.

    Key Functions:
    fetchAllTrips():
    Fetches all past trips using paginated GraphQL queries.
    Calls fetchTripDetails() for each trip to get detailed information.
    Returns a consolidated list of trip details.
    fetchTripDetails(csrfToken, tripUUID):
    Fetches detailed trip data (e.g., fare, waypoints, distance, duration) for a given trip UUID.
    Chrome message listener:
    Listens for the "sendTripData" action from the popup script and responds with fetched trip data.
2. manifest.json
    Defines the extension's metadata and permissions.

    Key Properties:
    manifest_version: Specifies the Chrome extension version (v3).
    permissions: Includes access to cookies, storage, active tabs, and Uber's website.
    host_permissions: Grants access to Uber-related URLs.
    background.service_worker: Points to background.js for background logic.
    action.default_popup: Links to popup.html for the UI.
3. popup.js
    Handles the UI logic for the extension popup.

    Key Functions:
    Listens for user clicks on the "Fetch Trips" button.
    Sends a message to the background script to retrieve trip data.
    Parses the response and dynamically updates the UI:
    Displays a summary of total trips and total fare.
    Lists detailed trip information in an HTML list.
4. popup.html
    The HTML structure for the extension's popup UI.

    Key Elements:
    A button (fetch-trips) to fetch trips.
    A summary section (summary) to show total trips and fare.
    A list (trip-list) to display detailed trip information.

Note: Nothing to do with content-script 

How It Works:
    User Interaction:

    The user opens the extension's popup and clicks "Fetch Trips."
    Message Flow:

    popup.js sends a message to background.js with the action "sendTripData".
    Fetching Data:

    background.js calls Uber’s GraphQL API to fetch all past trips using fetchAllTrips().
    For each trip, fetchTripDetails() retrieves detailed information.
    Consolidated trip data is returned to the popup.
    Displaying Data:

    popup.js receives the data and:
    Calculates the total number of trips and the total fare.
    Populates the UI with trip details.
