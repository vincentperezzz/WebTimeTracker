document.addEventListener("DOMContentLoaded", () => {
  const resetButton = document.getElementById("resetButton");
  const withTimeState = document.querySelector(".content.withTime");
  const emptyState = document.querySelector(".content.emptyState");

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

  resetButton.addEventListener("click", () => {
    chrome.storage.local.clear(() => {
      chrome.runtime.sendMessage({ type: "resetTimeTracking" }, () => {
        updateVisibility();
        console.log("Storage cleared and time tracking reset");
      });
    });
  });

  updateVisibility();

  let chartInstance = null;

  function formatTime(seconds) {
    if (seconds <= 0) return "0h 0m 0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  }

  function updatePopupDisplay(timeData) {
    const labels = [];
    const data = [];
    const topSitesList = document.getElementById("topSitesList");

    // Clear previous data
    topSitesList.innerHTML = "";

    // Filter out unwanted domains
    const filteredTimeData = Object.entries(timeData)
      .filter(([domain, seconds]) => !domain.startsWith("chrome://") && !domain.startsWith("chrome-extension://") && domain !== "newtab")
      .sort(([, timeA], [, timeB]) => timeB - timeA);

    // Populate the chart data and top sites list
    filteredTimeData.forEach(([domain, seconds]) => {
      labels.push(domain);
      data.push(seconds >= 60 ? seconds : 60);

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
              // Update the tooltip callback to correctly format hours and minutes
              label: function (context) {
                const seconds = context.raw;
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
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

  // Periodically update the chart every minute
  setInterval(() => {
    chrome.storage.local.get(null, (data) => {
      updatePopupDisplay(data);
    });
  }, 60000); // Update every minute
});
