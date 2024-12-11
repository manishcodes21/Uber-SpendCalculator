document.addEventListener("DOMContentLoaded", () => {
  const tripList = document.getElementById("trip-list");
  const summary = document.getElementById("summary");
  const fetchButton = document.getElementById("fetch-trips");

 
  function formatDate(dateString) {
    const dateRegex = /(\d{1,2}) (\w{3}) (\d{4})/; 
    const months = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };

  
    const dateMatch = dateString.match(dateRegex);
    if (!dateMatch) return dateString;

    const day = dateMatch[1];
    const month = months[dateMatch[2]];
    const year = dateMatch[3];

    return `${month}/${day}/${year}`; 
  }

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

     
      validTrips.forEach((trip) => {
        const listItem = document.createElement("li");
        listItem.classList.add("trip-card"); 
        listItem.innerHTML = `
          <p><strong>Trip UUID:</strong> ${trip.tripUUID}</p>
          <p><strong>Begin Time:</strong> ${formatDate(trip.beginTime)}</p>
          <p><strong>Dropoff Time:</strong> ${formatDate(trip.dropoffTime)}</p>
          <p><strong>Fare:</strong> ${trip.fare}</p>
          <p><strong>Distance:</strong> ${trip.distance}</p>
          <p><strong>Duration:</strong> ${trip.duration}</p>
          <p><strong>Starting Location:</strong> ${trip.startingLocation}</p>
          <p><strong>Drop Location:</strong> ${trip.dropLocation}</p>
          <p><strong>Status:</strong> ${trip.status}</p>;
        `;
        tripList.appendChild(listItem);
      });


      if (validTrips.length === 0) {
        summary.textContent = "No valid trips found.";
      }
    });
  });
});


