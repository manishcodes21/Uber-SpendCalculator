async function fetchAllTrips() {
  const jwtToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MzM3MzkwNjYsImRhdGEiOnsidGVuYW5jeSI6InViZXIvcHJvZHVjdGlvbiJ9LCJleHAiOjE3MzM4MjU0NjZ9.dt8JeeQjON8oTrus1EtLFt9zNNrbGhsvoz9PfuOc17A"; // JWT Token
  const csrfToken = "x"; 

  const fetchTripsQuery = {
    operationName: "Activities",
    variables: {
      includePast: true,
      includeUpcoming: false, 
      limit: 10, 
      orderTypes: ["RIDES", "TRAVEL"],
      profileType: "PERSONAL",
      nextPageToken: null, 
    },
    query: `query Activities(
    $cityID: Int,
    $endTimeMs: Float,
    $includePast: Boolean = true,
    $includeUpcoming: Boolean = true,
    $limit: Int = 5,
    $nextPageToken: String,
    $orderTypes: [RVWebCommonActivityOrderType!] = [RIDES, TRAVEL],
    $profileType: RVWebCommonActivityProfileType = PERSONAL,
    $startTimeMs: Float
  ) {
    activities(cityID: $cityID) {
      cityID
      past(
        endTimeMs: $endTimeMs
        limit: $limit
        nextPageToken: $nextPageToken
        orderTypes: $orderTypes
        profileType: $profileType
        startTimeMs: $startTimeMs
      ) @include(if: $includePast) {
        activities {
          buttons {
            isDefault
            startEnhancerIcon
            text
            url
            __typename
          }
          cardURL
          description
          imageURL {
            light
            dark
            __typename
          }
          subtitle
          title
          uuid
          __typename
        }
        nextPageToken
        __typename
      }
      upcoming @include(if: $includeUpcoming) {
        activities {
          buttons {
            isDefault
            startEnhancerIcon
            text
            url
            __typename
          }
          cardURL
          description
          imageURL {
            light
            dark
            __typename
          }
          subtitle
          title
          uuid
          __typename
        }
        __typename
      }
      __typename
    }
  }
`,
  };

  try {
    let allTrips = [];
    let nextPageToken = null;

    do {
      fetchTripsQuery.variables.nextPageToken = nextPageToken; 

      const response = await fetch("https://riders.uber.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
          "X-CSRF-Token": csrfToken,
          Accept: "*/*",
        },
        body: JSON.stringify(fetchTripsQuery),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch trips: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const trips = data?.data?.activities?.past?.activities || [];
      nextPageToken = data?.data?.activities?.past?.nextPageToken || null;

      console.log("Fetched Trips Batch:", trips);
      allTrips = [...allTrips, ...trips];
    } while (nextPageToken);

    const tripDetailsPromises = allTrips.map((trip) =>
      fetchTripDetails(jwtToken, csrfToken, trip.uuid)
    );
    const allTripDetails = await Promise.all(tripDetailsPromises);

    console.log("All Trip Details:", allTripDetails);
    const tripDetails={
        trips: allTripDetails,
    };

    return tripDetails;
  } catch (error) {
    console.error("Error fetching all trips:", error);
  }
}

async function fetchTripDetails(jwtToken, csrfToken, tripUUID) {
  const tripDetailsQuery = {
    operationName: "GetTrip",
    variables: {
      tripUUID,
    },
    query: `query GetTrip($tripUUID: String!) {
      getTrip(tripUUID: $tripUUID) {
        trip {
          beginTripTime
          cityID
          countryID
          disableCanceling
          disableRating
          disableResendReceipt
          driver
          dropoffTime
          fare
          guest
          isRidepoolTrip
          isScheduledRide
          isSurgeTrip
          isUberReserve
          jobUUID
          marketplace
          paymentProfileUUID
          showRating
          status
          uuid
          vehicleDisplayName
          vehicleViewID
          waypoints
          __typename
        }
        mapURL
        polandTaxiLicense
        rating
        reviewer
        receipt {
          carYear
          distance
          distanceLabel
          duration
          vehicleType
          __typename
        }
        concierge {
          sourceType
          __typename
        }
        organization {
          name
          __typename
        }
        __typename
      }
    }`,
  };

  try {
    const response = await fetch("https://riders.uber.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
        "X-CSRF-Token": csrfToken,
        Accept: "*/*",
      },
      body: JSON.stringify(tripDetailsQuery),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch trip details for UUID ${tripUUID}: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
   const trip = data?.data?.getTrip?.trip;

   if (!trip) return null;

 
//    console.log(1,trip)
   const tripData = {
     tripUUID: trip.uuid, 
     beginTime: new Date(trip.beginTripTime).toUTCString(),
     dropoffTime: new Date(trip.dropoffTime).toUTCString(),
     fare: trip.fare,
     distance: data?.data?.getTrip?.receipt?.distance,
     duration: data?.data?.getTrip?.receipt?.duration,
     startingLocation: trip.waypoints[0] || "Unknown",
     dropLocation: trip.waypoints[trip.waypoints.length - 1] || "Unknown",
     cityID: trip.cityID,
   };

//    console.log(`Details for Trip ${tripUUID}:`, tripData);
   return tripData;
  } catch (error) {
    console.error("Error fetching trip details:", error);
  }
}

// Run the function
// fetchAllTrips().then((response) => {
//   console.log("Content Script - Response:", response); // Data should be visible here
//   chrome.runtime.sendMessage({
//     action: "sendTripData",
//     trips: response, // Send the trips data
//   });
// });
