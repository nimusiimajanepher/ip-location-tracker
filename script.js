
const locateButton = document.getElementById("locateButton");
const message = document.getElementById("message");

let map = null;
let marker = null;

function createMap(latitude, longitude) {
    if (!map) {
        map = L.map("map").setView(
            [latitude, longitude],
            10
        );

        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
            {
                maxZoom: 19,
                attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, and other contributors"
            }
        ).addTo(map);

        map.on("tileerror", function () {
            message.textContent =
                "The map tiles could not load. Check your internet connection.";
        });
    } else {
        map.setView([latitude, longitude], 10);
    }

    if (marker) {
        marker.setLatLng([latitude, longitude]);
    } else {
        marker = L.marker([latitude, longitude]).addTo(map);
    }

    marker.bindPopup("Estimated IP location").openPopup();

    setTimeout(function () {
        map.invalidateSize();
    }, 300);
}
locateButton.addEventListener("click", async function () {
    const enteredIP = document.getElementById("ipAddress").value.trim();

    message.textContent = "Looking up the IP address...";
    locateButton.disabled = true;

    try {
        // An empty input asks the service to look up
        // the public IP address of this internet connection.
        const endpoint = enteredIP
            ? `https://ipapi.co/${encodeURIComponent(enteredIP)}/json/`
            : "https://ipapi.co/json/";

        const response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error("The location service could not be reached.");
        }

        const data = await response.json();

        if (data.error || data.reserved) {
            throw new Error(
                data.reason || "This IP address could not be located."
            );
        }

        const latitude = Number(data.latitude);
        const longitude = Number(data.longitude);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 || latitude > 90 ||
            longitude < -180 || longitude > 180
        ) {
            throw new Error("No valid coordinates were returned.");
        }

        document.getElementById("ip").textContent =
            data.ip || enteredIP || "Not available";

        document.getElementById("country").textContent =
            data.country_name || "Not available";

        document.getElementById("region").textContent =
            data.region || "Not available";

        document.getElementById("city").textContent =
            data.city || "Not available";

        document.getElementById("coordinates").textContent =
            `${latitude}, ${longitude}`;

        createMap(latitude, longitude);

        message.textContent =
            "Location estimate retrieved successfully.";
    } catch (error) {
        message.textContent =
            "Unable to retrieve location: " + error.message;
    } finally {
        locateButton.disabled = false;
    }
});
