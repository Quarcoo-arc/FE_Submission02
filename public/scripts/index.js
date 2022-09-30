import { checkAuth, getNewToken } from "./auth.js";

//Check if there is an access token
checkAuth();

// Reduce numbers into a more readable form
const shortenNum = (num) => {
  if (num >= 100000000) {
    return `${Math.floor(num / 100000000)}B`;
  } else if (num >= 1000000) {
    return `${Math.floor(num / 1000000)}M`;
  } else if (num >= 1000) {
    return `${Math.floor(num / 1000)}K`;
  } else {
    return num;
  }
};

// Load Dashboard Information
const getDashboardInfo = async () => {
  const result = await fetch("https://freddy.codesubmit.io/dashboard", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + sessionStorage.getItem("access_token"),
    },
  });

  const data = await result.json();

  console.log(data);

  // If Token has expired, refresh it
  if (data.msg === "Token has expired") {
    const sessionRefreshed = await getNewToken();
    if (sessionRefreshed) {
      getDashboardInfo();
    } else {
      window.location.href = "./login.html";
    }

    // If Token is not expired, display dashboard with relevant info
  } else if (data.dashboard) {
    // Update Dashboard Information
    const todayTotalSpan = document.getElementById("today-total");
    const lastWeekTotalSpan = document.getElementById("last-week-total");
    const lastMonthTotalSpan = document.getElementById("last-month-total");

    const todayOrdersSpan = document.getElementById("today-orders");
    const lastWeekOrdersSpan = document.getElementById("last-week-orders");
    const lastMonthOrdersSpan = document.getElementById("last-month-orders");

    todayTotalSpan.textContent = shortenNum(
      await data.dashboard.sales_over_time_week[1].total
    );
    todayOrdersSpan.textContent = shortenNum(
      await data.dashboard.sales_over_time_week[1].orders
    );

    lastWeekTotalSpan.textContent = shortenNum(
      await data.dashboard.sales_over_time_week[7].total
    );
    lastWeekOrdersSpan.textContent = shortenNum(
      await data.dashboard.sales_over_time_week[7].orders
    );

    lastMonthTotalSpan.textContent = shortenNum(
      await data.dashboard.sales_over_time_year[2].total
    );
    lastMonthOrdersSpan.textContent = shortenNum(
      await data.dashboard.sales_over_time_year[2].orders
    );

    const data_values_week = [];
    for (const item in data.dashboard.sales_over_time_week) {
      data_values_week.push(data.dashboard.sales_over_time_week[item].total);
    }

    console.log(data_values_week);

    const data_values_year = [];
    for (const item in data.dashboard.sales_over_time_year) {
      data_values_year.push(data.dashboard.sales_over_time_year[item].total);
    }

    console.log(data_values_year);

    // Create Chart
    const labels = [
      "Today",
      "Yesterday",
      "Day 3",
      "Day 4",
      "Day 5",
      "Day 6",
      "Day 7",
    ];

    const data_set = {
      labels: labels,
      datasets: [
        {
          label: "Revenue (last 7 days)",
          backgroundColor: "rgb(255, 99, 132)",
          borderColor: "rgb(255, 99, 132)",
          data: data_values_week,
        },
      ],
    };

    const config = {
      type: "bar",
      data: data_set,
      options: {},
    };

    const myChart = new Chart(document.getElementById("myChart"), config);

    //Switch chart function
    const switchChart = (event) => {
      let showSecondChart = event.target.checked;
      const chartTitle = document.getElementById("chart-title");
      myChart.data.labels = showSecondChart
        ? [
            "This Month",
            "Last Month",
            "Month 3",
            "Month 4",
            "Month 5",
            "Month 6",
            "Month 7",
            "Month 8",
            "Month 9",
            "Month 10",
            "Month 11",
            "Month 12",
          ]
        : ["Today", "Yesterday", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
      myChart.data.datasets = [
        {
          label: showSecondChart
            ? "Revenue (last 12 months)"
            : "Revenue (last 7 days)",
          backgroundColor: "rgb(255, 99, 132)",
          borderColor: "rgb(255, 99, 132)",
          data: showSecondChart ? data_values_year : data_values_week,
        },
      ];
      myChart.update();
      chartTitle.textContent = showSecondChart
        ? "Revenue (last 12 months)"
        : "Revenue (last 7 days)";
    };

    const toggleBtn = document.getElementById("toggleBtn");

    // Update chat on toggle of toggleBtn
    toggleBtn.addEventListener("change", switchChart);

    const tableBody = document.getElementsByTagName("tbody")[0];

    let tableRows = ``;

    data.dashboard.bestsellers.forEach((item) => {
      tableRows += `
            <tr>
              <td>${item.product.name}</td>
              <td>$${item.revenue / item.units}</td>
              <td>${item.units}</td>
              <td>$${item.revenue}</td>
            </tr>`;
    });

    tableBody.innerHTML = tableRows;

    // If token is invalid, redirect to login page
  } else {
    window.location.href = "./login.html";
  }
};

getDashboardInfo();
