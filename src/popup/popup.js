document.addEventListener("DOMContentLoaded", () => {
  const resetButton = document.getElementById("resetButton");
  const withTimeState = document.querySelector(".content.withTime");
  const emptyState = document.querySelector(".content.emptyState");

  //Shows the popup content based on whether there is time data available
  function updateVisibility() {
    chrome.storage.local.get(null, (data) => {
      const hasData = Object.values(data).some((time) => time > 0);
      if (hasData) {
        withTimeState.style.display = "flex";
        emptyState.style.display = "none";
        updatePopupDisplay(data);
      } else {
        withTimeState.style.display = "none";
        emptyState.style.display = "flex";
      }
    });
  }

  // Initial visibility check
  updateVisibility();

  // Reset button functionality
  resetButton.addEventListener("click", () => {
    chrome.storage.local.clear(() => {
      chrome.runtime.sendMessage({ type: "resetTimeTracking" }, () => {
        updateVisibility();
        console.log("Storage cleared and time tracking reset");
      });
    });
  });

  let chartInstance = null;

  function formatTime(seconds) {
    if (seconds <= 0) return "0h 0m 0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  }

  // Update the popup display with time datasets
  function updatePopupDisplay(timeData) {
    const labels = [];
    const data = [];
    const topSitesList = document.getElementById("topSitesList");

    // Clear previous data
    topSitesList.innerHTML = "";

    // Filter out unwanted domains
    const filteredTimeData = Object.entries(timeData)
      .filter(([domain, seconds]) => 
        !domain.startsWith("chrome://") && 
        !domain.startsWith("chrome://extensions") && 
        domain !== "newtab" && 
        seconds > 0 // Ensure only domains with time are included
      )
      .sort(([, timeA], [, timeB]) => timeB - timeA);

    // Populate the chart data and top sites list
    filteredTimeData.forEach(([domain, seconds]) => {
      labels.push(domain);
      data.push(seconds);

      const listItem = document.createElement("li");

      const siteNameSpan = document.createElement("span");
      siteNameSpan.className = "site-name";
      siteNameSpan.textContent = domain;

      const siteTimeSpan = document.createElement("span");
      siteTimeSpan.className = "site-time";
      siteTimeSpan.textContent = formatTime(seconds);

      listItem.appendChild(siteNameSpan);
      listItem.appendChild(siteTimeSpan);
      topSitesList.appendChild(listItem);
    });

    // Update or render the chart
    const ctx = document.getElementById("timeChart").getContext("2d");
    if (chartInstance) {
      chartInstance.destroy(); // Destroy the existing chart instance
    }
    chartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const seconds = context.raw;
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
          
                // Check if time is less than a minute
                if (hours === 0 && minutes === 0) {
                  return "Time: Less than a minute";
                }
          
                return `Time: ${hours}h ${minutes}m`;
              },
            },
          },
        },
      },
    });
  }

  // Periodically update the top sites list every second
  setInterval(() => {
    chrome.storage.local.get(null, (data) => {
      const topSitesList = document.getElementById("topSitesList");
      topSitesList.innerHTML = "";
      const sortedTimeData = Object.entries(data)
        .sort(([, timeA], [, timeB]) => timeB - timeA);
      sortedTimeData.forEach(([domain, seconds]) => {
        const listItem = document.createElement("li");
        const siteNameSpan = document.createElement("span");
        siteNameSpan.className = "site-name";
        siteNameSpan.textContent = domain;
        const siteTimeSpan = document.createElement("span");
        siteTimeSpan.className = "site-time";
        siteTimeSpan.textContent = formatTime(seconds);
        listItem.appendChild(siteNameSpan);
        listItem.appendChild(siteTimeSpan);
        topSitesList.appendChild(listItem);
      });
    });
  }, 1000); // Update every second

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local") {
      chrome.storage.local.get(null, (data) => {
        const hasMinuteChange = Object.values(changes).some((change) => {
          const oldSeconds = change.oldValue || 0;
          const newSeconds = change.newValue || 0;
          return Math.floor(oldSeconds / 60) !== Math.floor(newSeconds / 60);
        });
  
        if (hasMinuteChange) {
          updatePopupDisplay(data); // Update the chart only if there's a minute change
        }
      });
    }
  });
});
