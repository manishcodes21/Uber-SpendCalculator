document.addEventListener("DOMContentLoaded", () => {
  const tripList = document.getElementById("trip-list");
  const summary = document.getElementById("summary");
  const fetchButton = document.getElementById("fetch-trips");

  fetchButton.addEventListener("click", () => {
    tripList.innerHTML = "";
    summary.textContent = "Loading trips...";

    chrome.runtime.sendMessage({ action: "sendTripData" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error fetching trip data:", chrome.runtime.lastError);
        summary.textContent = "Error loading trip data.";
        return;
      }

      const trips = response?.trips?.trips || [];

      console.log("Received trips:", response, trips);

      
      const validTrips = trips.filter((trip) => trip.status !== "CANCELED");

      const totalTrips = validTrips.length;
      const totalFare = validTrips.reduce((sum, trip) => {
        const fare =
          parseFloat(trip.fare.replace("₹", "").replace(",", "")) || 0;
        return sum + fare;
      }, 0);


      summary.textContent = `Total Trips: ${totalTrips}, Total Fare: ₹${totalFare.toFixed(
        2
      )}`;

      // Display valid trips
      validTrips.forEach((trip) => {
        const listItem = document.createElement("li");
        listItem.classList.add("trip-card"); 
        listItem.innerHTML = `
          <p><strong>Trip UUID:</strong> ${trip.tripUUID}</p>
          <p><strong>Begin Time:</strong> ${trip.beginTime}</p>
          <p><strong>Dropoff Time:</strong> ${trip.dropoffTime}</p>
          <p><strong>Fare:</strong> ${trip.fare}</p>
          <p><strong>Distance:</strong> ${trip.distance}</p>
          <p><strong>Duration:</strong> ${trip.duration}</p>
          <p><strong>Starting Location:</strong> ${trip.startingLocation}</p>
          <p><strong>Drop Location:</strong> ${trip.dropLocation}</p>
          <p><strong>Status:</strong> ${trip.status}</p>
        `;
        tripList.appendChild(listItem);
      });

      
      if (validTrips.length === 0) {
        summary.textContent = "No valid trips found.";
      }
    });
  });
});
